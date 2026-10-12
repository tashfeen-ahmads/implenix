import { NextResponse } from 'next/server';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enrichSearch, progress } from '@/lib/leads/enrich';
import { emailFinderProvider } from '@/lib/leads/emailProviders';
import { verifierName } from '@/lib/leads/verify';

// One batch of the email layer for a search: find missing emails on
// business websites, then verify. The search page calls this in a loop
// while it's open; the cron continues when it isn't.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  if (!UUID_RE.test(params.id)) return NextResponse.json({ error: 'Search not found' }, { status: 404 });
  const db = supabaseAdmin();
  const peek = new URL(req.url).searchParams.get('peek') === '1';
  const p = peek ? await progress(db, params.id) : await enrichSearch(db, params.id, { limit: 10, budgetMs: 45_000 });
  return NextResponse.json({ progress: p, finder: emailFinderProvider(), verifier: verifierName() });
}
