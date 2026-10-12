import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { resendConfigured, sendEmail } from '@/lib/email/resend';
import { teamInviteEmail } from '@/lib/email/templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().min(1).max(120),
  role: z.enum(['admin', 'member']),
});

// Creates the login, adds them to the team, and emails a branded invite
// (Resend). Without Resend the link is returned for the admin to share.
export async function POST(req: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a name and a valid email.' }, { status: 400 });
  const { email, fullName, role } = parsed.data;
  const db = supabaseAdmin();

  const { data: existing } = await db.from('team_members').select('user_id').eq('email', email).maybeSingle();
  if (existing) return NextResponse.json({ error: 'That person is already on the team.' }, { status: 409 });

  // Existing login (e.g. removed earlier): a magic link; otherwise an invite.
  let link = await db.auth.admin.generateLink({ type: 'invite', email, options: { data: { full_name: fullName } } });
  if (link.error && /already|registered|exists/i.test(link.error.message)) {
    link = await db.auth.admin.generateLink({ type: 'magiclink', email });
  }
  if (link.error || !link.data.user) {
    return NextResponse.json({ error: `Could not create the invite: ${link.error?.message ?? 'unknown error'}` }, { status: 502 });
  }
  const { user, properties } = link.data;
  const verifyType = properties.verification_type === 'magiclink' ? 'magiclink' : 'invite';
  const url = `${req.nextUrl.origin}/admin/auth/confirm?token_hash=${encodeURIComponent(properties.hashed_token)}&type=${verifyType}&next=${encodeURIComponent('/admin/account?welcome=1')}`;

  const { error: memberErr } = await db
    .from('team_members')
    .upsert({ user_id: user.id, email, full_name: fullName, role }, { onConflict: 'user_id' });
  if (memberErr) return NextResponse.json({ error: `Could not add to team: ${memberErr.message}` }, { status: 500 });

  let emailed = false;
  if (resendConfigured()) {
    const mail = teamInviteEmail({ name: fullName, invitedBy: auth.member.full_name ?? auth.member.email, url });
    try {
      await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text, tags: [{ name: 'type', value: 'team_invite' }] });
      emailed = true;
    } catch (err) {
      console.error('[team] invite email failed', err instanceof Error ? err.message : err);
    }
  }
  // The link is single-use and expires (Supabase default 24h). Only shown
  // back to the admin when it could not be emailed.
  return NextResponse.json({ ok: true, emailed, link: emailed ? undefined : url });
}
