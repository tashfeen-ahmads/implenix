import 'server-only';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Contact } from '@/lib/db/types';
import { isValidEmail, normalizeEmail } from '@/lib/outreach/suppress';

// Shared contact import: CSV uploads and the lead finder both land here.
// Validates, lowercases and de-duplicates emails, skips suppressed
// addresses, creates the list (or reuses listId) and upserts contacts.
// Existing contacts move to the new list and only get empty fields filled.

const opt = z
  .string()
  .max(500)
  .optional()
  .nullable()
  .transform((v) => (v ?? '').trim() || null);

export const ImportRow = z.object({
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
export type ImportRowInput = z.input<typeof ImportRow>;

export class ImportError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export type ImportResult = {
  listId: string;
  inserted: number;
  updated: number;
  skippedInvalid: number;
  skippedSuppressed: number;
};

const FIELDS = ['first_name', 'last_name', 'company', 'website', 'phone', 'industry', 'city', 'state'] as const;
const CHUNK = 500;

function chunks<T>(a: T[], n = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
  return out;
}

export async function importContacts(
  db: SupabaseClient,
  input: {
    listName: string;
    listId?: string | null;
    sourceFile?: string | null;
    rows: z.infer<typeof ImportRow>[];
    createdBy: string | null;
  },
): Promise<ImportResult> {
  const { listName, listId: givenListId, sourceFile, rows } = input;

  let skippedInvalid = 0;
  const byEmail = new Map<string, z.infer<typeof ImportRow> & { email: string }>();
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
    if (error) throw new ImportError(`Suppression check failed: ${error.message}`, 500);
    (data ?? []).forEach((s: { email: string }) => suppressed.add(s.email.toLowerCase()));
  }
  const candidates = emails.filter((e) => !suppressed.has(e));

  const existing = new Map<string, Contact>();
  for (const part of chunks(candidates)) {
    const { data, error } = await db.from('contacts').select('*').in('email', part);
    if (error) throw new ImportError(`Contact lookup failed: ${error.message}`, 500);
    ((data ?? []) as Contact[]).forEach((c) => existing.set(c.email.toLowerCase(), c));
  }

  let listId: string;
  if (givenListId) {
    const { data: found, error: findErr } = await db
      .from('contact_lists')
      .select('id')
      .eq('id', givenListId)
      .maybeSingle();
    if (findErr) throw new ImportError(`List lookup failed: ${findErr.message}`, 500);
    if (!found) throw new ImportError('listId does not exist', 404);
    listId = givenListId;
  } else {
    const { data: list, error: listErr } = await db
      .from('contact_lists')
      .insert({ name: listName, source_file: sourceFile?.trim() || null, created_by: input.createdBy })
      .select('id')
      .single();
    if (listErr || !list) {
      throw new ImportError(`Could not create list: ${listErr?.message}`, 500);
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
      throw new ImportError(`Insert failed after ${inserted} rows: ${error.message}`, 500);
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

  return {
    listId,
    inserted,
    updated,
    skippedInvalid,
    skippedSuppressed: emails.length - candidates.length,
  };
}
