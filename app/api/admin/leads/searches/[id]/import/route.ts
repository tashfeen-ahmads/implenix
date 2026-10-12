import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ImportError, importContacts } from '@/lib/outreach/importContacts';
import type { LeadResult } from '@/lib/leads/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Body = z.object({
  resultIds: z.array(z.string().uuid()).min(1).max(2000),
  listName: z.string().trim().min(1).max(200),
});

// Imports selected results that have an email into a new contact list,
// through the same import as CSV uploads (dedupe, suppression check).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Pick at least one business.' }, { status: 400 });

  const db = supabaseAdmin();
  const results: LeadResult[] = [];
  for (let i = 0; i < parsed.data.resultIds.length; i += 500) {
    const { data, error } = await db
      .from('lead_results')
      .select('*')
      .eq('search_id', params.id)
      .in('id', parsed.data.resultIds.slice(i, i + 500));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    results.push(...((data ?? []) as LeadResult[]));
  }
  const withEmail = results.filter((r) => r.email);
  if (withEmail.length === 0) {
    return NextResponse.json({ error: 'None of the selected businesses has an email address.' }, { status: 400 });
  }

  const { data: search } = await db.from('lead_searches').select('query, location').eq('id', params.id).maybeSingle();
  try {
    const out = await importContacts(db, {
      listName: parsed.data.listName,
      sourceFile: search ? `Lead finder: ${search.query} in ${search.location}` : 'Lead finder',
      createdBy: auth.member.user_id,
      rows: withEmail.map((r) => ({
        email: r.email!,
        first_name: null,
        last_name: null,
        company: r.name,
        website: r.website,
        phone: r.phone,
        industry: r.category,
        city: r.city,
        state: r.state,
        custom: Object.fromEntries(
          Object.entries({
            rating: r.rating != null ? String(r.rating) : '',
            reviews: r.reviews_count != null ? String(r.reviews_count) : '',
            address: r.address ?? '',
            maps_url: r.maps_url ?? '',
          }).filter(([, v]) => v),
        ),
      })),
    });

    // Link results to the contacts they became.
    const emails = withEmail.map((r) => r.email!.toLowerCase());
    const { data: contacts } = await db.from('contacts').select('id, email').in('email', emails);
    const byEmail = new Map((contacts ?? []).map((c: { id: string; email: string }) => [c.email.toLowerCase(), c.id]));
    await Promise.all(
      withEmail
        .filter((r) => byEmail.has(r.email!.toLowerCase()))
        .map((r) => db.from('lead_results').update({ imported_contact_id: byEmail.get(r.email!.toLowerCase()) }).eq('id', r.id)),
    );
    return NextResponse.json({ ...out, skippedNoEmail: results.length - withEmail.length });
  } catch (err) {
    if (err instanceof ImportError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
