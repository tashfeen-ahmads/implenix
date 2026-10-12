import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Campaign, Contact, Message } from '@/lib/db/types';
import { executeBooking, type PendingBooking } from '@/lib/outreach/agent';
import { SesSendError } from '@/lib/outreach/ses';
import { ThreadError, sendThreadReply } from '@/lib/outreach/thread';

// Sends an AI draft (optionally edited). If the agent proposed a booking,
// it is made first; a failed booking blocks the send so the reply never
// confirms a meeting that doesn't exist.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Body = z.object({
  subject: z.string().max(300).optional().nullable(),
  body: z.string().max(20_000).optional().nullable(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse((await req.json().catch(() => ({}))) ?? {});
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const db = supabaseAdmin();

  // Claim the draft so a double click can't send twice.
  const { data: claimed, error: claimErr } = await db
    .from('messages')
    .update({ status: 'queued' })
    .eq('id', params.id)
    .eq('status', 'draft')
    .eq('direction', 'outbound')
    .select('*')
    .maybeSingle();
  if (claimErr) return NextResponse.json({ error: claimErr.message }, { status: 500 });
  const draft = claimed as Message | null;
  if (!draft) return NextResponse.json({ error: 'Draft not found or already sent' }, { status: 409 });
  const release = () => db.from('messages').update({ status: 'draft' }).eq('id', draft.id);

  if (!draft.contact_id) {
    await release();
    return NextResponse.json({ error: 'Draft has no contact' }, { status: 400 });
  }
  const { data: contactRow } = await db.from('contacts').select('*').eq('id', draft.contact_id).maybeSingle();
  const contact = contactRow as Contact | null;
  if (!contact) {
    await release();
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
  }
  let campaign: Campaign | null = null;
  if (draft.campaign_id) {
    const { data } = await db.from('campaigns').select('*').eq('id', draft.campaign_id).maybeSingle();
    campaign = data as Campaign | null;
  }

  const meta = { ...draft.ai_meta } as Record<string, unknown>;
  const pending = meta.pending_booking as PendingBooking | null | undefined;
  if (pending && !meta.booked) {
    const res = await executeBooking(pending);
    if (!res.ok) {
      await release();
      return NextResponse.json(
        { error: `Booking failed: ${res.error} Edit the reply to offer other times.` },
        { status: 409 },
      );
    }
    meta.booked = { startIso: pending.startIso, meetingUrl: res.meetingUrl };
    meta.pending_booking = null;
    await db.from('messages').update({ ai_meta: meta }).eq('id', draft.id);
  }

  const subject = parsed.data.subject?.trim() || draft.subject;
  const body = parsed.data.body?.trim() || draft.body_text || '';
  if (!body) {
    await release();
    return NextResponse.json({ error: 'Reply body is empty' }, { status: 400 });
  }
  const edited = body !== (draft.body_text ?? '') || subject !== draft.subject;

  try {
    await sendThreadReply(db, {
      contact,
      campaign,
      subject,
      body,
      aiGenerated: true,
      aiMeta: { ...meta, approved_by: auth.member.user_id, edited },
      sentBy: auth.member.user_id,
      draftId: draft.id,
    });
  } catch (err) {
    await release();
    if (err instanceof ThreadError) return NextResponse.json({ error: err.message }, { status: err.status });
    const message = err instanceof SesSendError ? `${err.code}: ${err.message}` : 'Send failed';
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
