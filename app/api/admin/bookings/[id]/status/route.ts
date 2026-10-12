import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Booking, Client, ClientStage } from '@/lib/db/types';
import { STAGE_LABELS } from '@/lib/db/types';
import { formatWhen } from '@/lib/booking';
import { sendEmail } from '@/lib/email/resend';
import { rebookEmail } from '@/lib/email/templates';
import { SITE_URL } from '@/lib/seo';

// Call outcome from the client page. Moves the deal along with it:
// no-show → "No-show" (optionally emailing a rebook link), completed →
// "Discovery done". Later stages are never pulled back.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  sendRebook: z.boolean().optional(),
});

const NEXT_STAGE: Partial<Record<Booking['status'], { from: ClientStage[]; to: ClientStage }>> = {
  no_show: { from: ['new', 'call_booked'], to: 'no_show' },
  completed: { from: ['new', 'call_booked', 'no_show'], to: 'discovery_done' },
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  const { status, sendRebook } = parsed.data;
  const db = supabaseAdmin();

  const { data: row } = await db.from('bookings').select('*, clients(*)').eq('id', params.id).maybeSingle();
  const booking = row as (Booking & { clients: Client | null }) | null;
  if (!booking || !booking.clients) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  const client = booking.clients;

  const { error } = await db.from('bookings').update({ status }).eq('id', booking.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const actor = auth.member.user_id;
  await db.from('activities').insert({
    client_id: client.id,
    type: 'booking.status',
    body: `Marked call as ${status.replace('_', ' ')}`,
    meta: { bookingId: booking.id, status },
    actor_id: actor,
  });

  let stage: ClientStage | null = null;
  const rule = NEXT_STAGE[status];
  if (rule && rule.from.includes(client.stage)) {
    stage = rule.to;
    await db.from('clients').update({ stage }).eq('id', client.id);
    await db.from('activities').insert({
      client_id: client.id,
      type: 'stage.changed',
      body: `Moved from ${STAGE_LABELS[client.stage]} to ${STAGE_LABELS[stage]}`,
      meta: { from: client.stage, to: stage, automatic: true },
      actor_id: actor,
    });
  }

  let rebook: 'sent' | 'failed' | 'not_configured' | null = null;
  if (status === 'no_show' && sendRebook) {
    const mail = rebookEmail({
      firstName: client.first_name,
      whenLabel: formatWhen(booking.start_at),
      bookingUrl: `${SITE_URL}/contact#book`,
    });
    try {
      const sent = await sendEmail({
        to: client.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        tags: [{ name: 'type', value: 'rebook' }],
      });
      rebook = sent ? 'sent' : 'not_configured';
      if (sent) await db.from('activities').insert({
        client_id: client.id,
        type: 'email.sent',
        body: 'Sent a rebook email after the no-show',
        meta: { kind: 'rebook' },
        actor_id: actor,
      });
    } catch (err) {
      console.error('[bookings/status] rebook email failed', err instanceof Error ? err.message : err);
      rebook = 'failed';
    }
  }
  return NextResponse.json({ ok: true, stage, rebook });
}
