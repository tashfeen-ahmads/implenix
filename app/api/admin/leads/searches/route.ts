import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PROVIDERS, startSearch } from '@/lib/leads';
import type { LeadSearch } from '@/lib/leads/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  provider: z.enum(['apify', 'outscraper']),
  query: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  maxResults: z.number().int().min(1).max(2000),
  findEmails: z.boolean(),
});

// Starts a Google Maps business search at the chosen provider.
export async function POST(req: NextRequest) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const b = parsed.data;
  if (!PROVIDERS[b.provider].configured()) {
    return NextResponse.json({ error: `${PROVIDERS[b.provider].label} is not configured (API key missing).` }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: row, error } = await db
    .from('lead_searches')
    .insert({
      provider: b.provider,
      query: b.query,
      location: b.location,
      max_results: b.maxResults,
      find_emails: b.findEmails,
      created_by: auth.member.user_id,
    })
    .select('*')
    .single();
  if (error || !row) return NextResponse.json({ error: `Could not save search: ${error?.message}` }, { status: 500 });

  try {
    const started = await startSearch(b.provider, {
      query: b.query,
      location: b.location,
      maxResults: b.maxResults,
      findEmails: b.findEmails,
    });
    const { data } = await db
      .from('lead_searches')
      .update({ external_id: started.externalId, dataset_id: started.datasetId ?? null })
      .eq('id', (row as LeadSearch).id)
      .select('*')
      .single();
    return NextResponse.json({ search: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Provider error';
    await db
      .from('lead_searches')
      .update({ status: 'failed', error: message, finished_at: new Date().toISOString() })
      .eq('id', (row as LeadSearch).id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
