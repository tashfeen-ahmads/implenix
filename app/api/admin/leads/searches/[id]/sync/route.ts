import { NextResponse } from 'next/server';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { syncSearch } from '@/lib/leads';
import type { LeadSearch } from '@/lib/leads/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Polled by the search page while a search is running.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const db = supabaseAdmin();
  const { data } = await db.from('lead_searches').select('*').eq('id', params.id).maybeSingle();
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const search = await syncSearch(db, data as LeadSearch);
  return NextResponse.json({ search });
}
