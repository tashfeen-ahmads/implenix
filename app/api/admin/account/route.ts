import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Update your own display name. (Passwords change in the browser through
// supabase.auth.updateUser, which needs the signed-in session.)
export async function PATCH(req: NextRequest) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = z.object({ fullName: z.string().trim().min(1).max(120) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter your name.' }, { status: 400 });
  const { error } = await supabaseAdmin()
    .from('team_members')
    .update({ full_name: parsed.data.fullName })
    .eq('user_id', auth.member.user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
