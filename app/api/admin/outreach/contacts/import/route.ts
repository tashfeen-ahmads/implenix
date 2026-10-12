import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Contact } from '@/lib/db/types';
import { isValidEmail, normalizeEmail } from '@/lib/outreach/suppress';

// CSV import (already parsed in the browser). Validates, lowercases and
// de-duplicates emails, skips suppressed addresses, creates the list and
// upserts contacts. Existing contacts move to the new list and only get
// fields filled in that were empty. Large files arrive in batches: the
// first creates the list, later batches pass its listId.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const opt = z
  .string()
  .max(500)
  .optional()
  .nullable()
  .transform((v) => (v ?? '').trim() || null);

const Row = z.object({
  email: z.string().max(320),
  first_name: opt,
  last_name: opt,
  company: opt,
  website: opt,
  phone: opt,
  industry: opt,
  city: opt,
  state: opt,
  custom: z.record(z.string().max(100), z.string().max(2000)).optional().nullable(),
});
const Body = z.object({
  listName: z.string().trim().min(1).max(200),
  // Batches 2+ of one import reuse the list created by batch 1.
  listId: z.string().uuid().optional().nullable(),
  sourceFile: z.string().max(300).optional().nullable(),
  rows: z.array(Row).max(50_000),
});

const FIELDS = ['first_name', 'last_name', 'company', 'website', 'phone', 'industry', 'city', 'state'] as const;
const CHUNK = 500;

function chunks<T>(a: T[], n = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
  return out;
}

export async function POST(req: NextRequest) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  const { listName, listId: givenListId, sourceFile, rows } = parsed.data;
  const db = supabaseAdmin();

  let skippedInvalid = 0;
  const byEmail = new Map<string, z.infer<typeof Row> & { email: string }>();
  for (const r of rows) {
    const email = normalizeEmail(r.email);
    if (!isValidEmail(email)) {
      skippedInvalid++;
      continue;
    }
    if (!byEmail.has(email)) {
      const custom: Record<string, string> = {};
      for (const [k, v] of Object.entries(r.custom ?? {})) {
        const key = k.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
        if (key && v.trim()) custom[key] = v.trim();
      }
      byEmail.set(email, { ...r, email, custom });
    }
  }
  const emails = [...byEmail.keys()];

  // Suppressed addresses never come back in.
  const suppressed = new Set<string>();
  for (const part of chunks(emails)) {
    const { data, error } = await db.from('suppressions').select('email').in('email', part);
    if (error) return NextResponse.json({ error: `Suppression check failed: ${error.message}` }, { status: 500 });
    (data ?? []).forEach((s: { email: string }) => suppressed.add(s.email.toLowerCase()));
  }
  const candidates = emails.filter((e) => !suppressed.has(e));

  const existing = new Map<string, Contact>();
  for (const part of chunks(candidates)) {
    const { data, error } = await db.from('contacts').select('*').in('email', part);
    if (error) return NextResponse.json({ error: `Contact lookup failed: ${error.message}` }, { status: 500 });
    ((data ?? []) as Contact[]).forEach((c) => existing.set(c.email.toLowerCase(), c));
  }

  let listId: string;
  if (givenListId) {
    const { data: found, error: findErr } = await db
      .from('contact_lists')
      .select('id')
      .eq('id', givenListId)
      .maybeSingle();
    if (findErr) return NextResponse.json({ error: `List lookup failed: ${findErr.message}` }, { status: 500 });
    if (!found) return NextResponse.json({ error: 'listId does not exist' }, { status: 404 });
    listId = givenListId;
  } else {
    const { data: list, error: listErr } = await db
      .from('contact_lists')
      .insert({ name: listName, source_file: sourceFile?.trim() || null, created_by: auth.member.user_id })
      .select('id')
      .single();
    if (listErr || !list) {
      return NextResponse.json({ error: `Could not create list: ${listErr?.message}` }, { status: 500 });
    }
    listId = (list as { id: string }).id;
  }

  const toInsert: Record<string, unknown>[] = [];
  const toUpdate: { id: string; patch: Record<string, unknown> }[] = [];
  for (const email of candidates) {
    const r = byEmail.get(email)!;
    const ex = existing.get(email);
    if (!ex) {
      toInsert.push({
        list_id: listId,
        email,
        ...Object.fromEntries(FIELDS.map((f) => [f, r[f]])),
        custom: r.custom ?? {},
      });
      continue;
    }
    const patch: Record<string, unknown> = { list_id: listId };
    for (const f of FIELDS) if (!ex[f] && r[f]) patch[f] = r[f];
    const mergedCustom = { ...(r.custom ?? {}), ...(ex.custom ?? {}) };
    if (Object.keys(mergedCustom).length !== Object.keys(ex.custom ?? {}).length) patch.custom = mergedCustom;
    toUpdate.push({ id: ex.id, patch });
  }

  let inserted = 0;
  for (const part of chunks(toInsert)) {
    const { error, count } = await db.from('contacts').insert(part, { count: 'exact' });
    if (error?.code === '23505') {
      // A mixed-case duplicate already exists: fall back to one-by-one and
      // leave those rows alone.
      for (const row of part) {
        const { error: rowErr } = await db.from('contacts').insert(row);
        if (!rowErr) inserted++;
        else if (rowErr.code !== '23505') console.error('[outreach/import] row insert failed', rowErr.message);
      }
      continue;
    }
    if (error) {
      return NextResponse.json(
        { error: `Insert failed after ${inserted} rows: ${error.message}`, listId, inserted },
        { status: 500 },
      );
    }
    inserted += count ?? part.length;
  }

  let updated = 0;
  for (const part of chunks(toUpdate, 25)) {
    const results = await Promise.all(part.map((u) => db.from('contacts').update(u.patch).eq('id', u.id)));
    results.forEach((r) => {
      if (r.error) console.error('[outreach/import] update failed', r.error.message);
      else updated++;
    });
  }

  return NextResponse.json({
    listId,
    inserted,
    updated,
    skippedInvalid,
    skippedSuppressed: emails.length - candidates.length,
  });
}
