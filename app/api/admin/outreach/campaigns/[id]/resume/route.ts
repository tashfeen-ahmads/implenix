import { NextResponse } from 'next/server';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// resume: campaign status -> 'active'. Enrollments keep their place; the
// cron only sends for active campaigns. The deliverability guard measures
// this campaign afresh from now, so old bounces don't pause it again.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('campaigns')
    .update({ status: 'active', paused_reason: null, health_since: new Date().toISOString() })
    .eq('id', params.id)
    .in('status', ['paused'])
    .select('status')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) {
    const { data: current } = await db.from('campaigns').select('status').eq('id', params.id).maybeSingle();
    if (!current) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    return NextResponse.json(
      { error: `Campaign is ${(current as { status: string }).status}`, status: (current as { status: string }).status },
      { status: 409 },
    );
  }
  return NextResponse.json({ status: (data as { status: string }).status });
}
