import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function adminCount() {
  const { count } = await supabaseAdmin().from('team_members').select('user_id', { count: 'exact', head: true }).eq('role', 'admin');
  return count ?? 0;
}

// Change a member's role. The last admin cannot be demoted.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const parsed = z.object({ role: z.enum(['admin', 'member']) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  const db = supabaseAdmin();
  const { data: target } = await db.from('team_members').select('role').eq('user_id', params.id).maybeSingle();
  if (!target) return NextResponse.json({ error: 'Not on the team' }, { status: 404 });
  if (target.role === 'admin' && parsed.data.role === 'member' && (await adminCount()) <= 1) {
    return NextResponse.json({ error: 'The team needs at least one admin.' }, { status: 409 });
  }
  const { error } = await db.from('team_members').update({ role: parsed.data.role }).eq('user_id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Remove someone: deletes their login, which also removes them from the
// team. Their past activity stays (actor set to null). Admins cannot remove
// themselves, so a team is never locked out.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  if (params.id === auth.member.user_id) {
    return NextResponse.json({ error: 'You cannot remove yourself. Ask another admin.' }, { status: 409 });
  }
  const db = supabaseAdmin();
  const { error } = await db.auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
