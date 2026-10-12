import { NextResponse } from 'next/server';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Clears the deliverability hold so outreach sends again. Rates are then
// measured from this moment, so the old bounces can't trip it right away;
// new bounces still can.
export async function DELETE() {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('outreach_holds')
    .update({ cleared_at: new Date().toISOString(), cleared_by: auth.member.user_id })
    .is('cleared_at', null)
    .select('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cleared: data?.length ?? 0 });
}
