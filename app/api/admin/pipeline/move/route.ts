import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { LOST_REASONS, STAGE_LABELS, type Client, type ClientStage, type Contact } from '@/lib/db/types';
import { COLUMN_BY_ID, canMoveTo, contactStageLabel } from '@/lib/pipeline/stages';
import { moveToNurture } from '@/lib/outreach/stage';
import { escapeLike, normalizeEmail, stopEnrollments, suppressAndStop } from '@/lib/outreach/suppress';
import { clientForContact } from '@/lib/pipeline/convert';

// Moves a card on the pipeline board. Every move goes through here so the
// side effects stay consistent: stopping sequences, suppression, nurture
// enrollment, converting a prospect into a client, and the activity log.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOST = LOST_REASONS.map((r) => r.value) as [string, ...string[]];

const Body = z.object({
  kind: z.enum(['contact', 'client']),
  id: z.string().uuid(),
  to: z.string().min(1).max(40),
  lostReason: z.enum(LOST).optional(),
  // Nurture options.
  nurtureCampaignId: z.string().uuid().nullable().optional(),
  revisitAt: z.string().datetime().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
  const { kind, id, to, lostReason, nurtureCampaignId, revisitAt } = parsed.data;
  const column = COLUMN_BY_ID.get(to);
  if (!column || !canMoveTo(kind, column)) {
    return NextResponse.json({ error: 'That stage is set automatically and cannot be chosen by hand.' }, { status: 400 });
  }
  if (column.clientStage === 'lost' && !lostReason) {
    return NextResponse.json({ error: 'Pick a reason for losing the deal.' }, { status: 400 });
  }
  const db = supabaseAdmin();
  const actor = auth.member.user_id;
  const revisit = revisitAt ? new Date(revisitAt) : null;

  const log = (clientId: string, type: string, body: string, meta: Record<string, unknown> = {}) =>
    db.from('activities').insert({ client_id: clientId, type, body, meta, actor_id: actor });

  // ── Client cards ────────────────────────────────────────────────
  if (kind === 'client') {
    const { data } = await db.from('clients').select('*').eq('id', id).maybeSingle();
    const client = data as Client | null;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    const stage = column.clientStage as ClientStage;
    if (client.stage === stage) return NextResponse.json({ ok: true, unchanged: true });

    const patch: Partial<Client> = { stage };
    if (stage === 'lost') patch.lost_reason = lostReason as Client['lost_reason'];
    else if (client.stage === 'lost') patch.lost_reason = null;
    if (stage === 'nurture') {
      patch.next_step = client.next_step || 'Check back in';
      patch.next_step_at = (revisit ?? new Date(Date.now() + 60 * 86_400_000)).toISOString();
    }
    const { error } = await db.from('clients').update(patch).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const reasonLabel = stage === 'lost' ? LOST_REASONS.find((r) => r.value === lostReason)?.label : null;
    await log(
      id,
      'stage.changed',
      `Moved from ${STAGE_LABELS[client.stage]} to ${STAGE_LABELS[stage]}${reasonLabel ? ` (${reasonLabel})` : ''}`,
      { from: client.stage, to: stage, lost_reason: lostReason ?? null },
    );

    // Nurture emails for a client: enroll their outreach contact (created
    // from the client record if needed) in the chosen nurture campaign.
    let nurture: { enrolled: boolean; reason?: string } | null = null;
    if (stage === 'nurture' && nurtureCampaignId) {
      const contact = await contactForClient(db, client);
      if (!contact) nurture = { enrolled: false, reason: 'Could not create an outreach contact for this client.' };
      else nurture = await moveToNurture(db, contact, { campaignId: nurtureCampaignId, revisitAt: revisit, manual: true });
    }
    return NextResponse.json({ ok: true, nurture });
  }

  // ── Contact cards ───────────────────────────────────────────────
  const { data } = await db.from('contacts').select('*').eq('id', id).maybeSingle();
  const contact = data as Contact | null;
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  // Into the sales pipeline: the prospect becomes a client.
  if (column.clientStage && column.id !== 'nurture') {
    const stage = column.clientStage;
    const client = await clientForContact(db, contact, stage, lostReason ?? null);
    if ('error' in client) return NextResponse.json({ error: client.error }, { status: 500 });
    await stopEnrollments(db, contact.id);
    await db
      .from('contacts')
      .update({ stage: 'client', ...(['active', 'replied'].includes(contact.status) ? { status: 'interested' } : {}) })
      .eq('id', contact.id);
    await log(client.id, 'client.created', `Moved from outreach (${contactStageLabel(contact.stage)}) to ${STAGE_LABELS[stage]}`, {
      contact_id: contact.id,
      created: client.created,
    });
    return NextResponse.json({ ok: true, clientId: client.id });
  }

  const stage = column.contactStage!;
  if (contact.stage === stage) return NextResponse.json({ ok: true, unchanged: true });

  if (stage === 'nurture') {
    const res = await moveToNurture(db, contact, { campaignId: nurtureCampaignId ?? null, revisitAt: revisit, manual: true });
    if (res.reason && !res.enrolled && /opted out|bounced/.test(res.reason)) {
      return NextResponse.json({ error: res.reason }, { status: 409 });
    }
    return NextResponse.json({ ok: true, nurture: res });
  }
  if (stage === 'unsubscribed') {
    await suppressAndStop(db, contact.email, 'unsubscribed');
    return NextResponse.json({ ok: true });
  }

  // replied / interested / not_interested / no_response
  const status =
    stage === 'interested' ? 'interested' : stage === 'not_interested' ? 'not_interested' : stage === 'replied' ? 'replied' : contact.status;
  if (['unsubscribed', 'bounced', 'complained'].includes(contact.status)) {
    return NextResponse.json({ error: 'This address has opted out or bounced and stays closed.' }, { status: 409 });
  }
  await stopEnrollments(db, contact.id);
  const { error } = await db.from('contacts').update({ stage, status }).eq('id', contact.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

type DB = ReturnType<typeof supabaseAdmin>;

// The outreach contact behind a client, created when missing so the client
// can receive nurture emails.
async function contactForClient(db: DB, client: Client): Promise<Contact | null> {
  if (client.outreach_contact_id) {
    const { data } = await db.from('contacts').select('*').eq('id', client.outreach_contact_id).maybeSingle();
    if (data) return data as Contact;
  }
  const email = normalizeEmail(client.email);
  const { data: byEmail } = await db.from('contacts').select('*').ilike('email', escapeLike(email)).limit(1).maybeSingle();
  let contact = byEmail as Contact | null;
  if (!contact) {
    const { data, error } = await db
      .from('contacts')
      .insert({
        email,
        first_name: client.first_name,
        last_name: client.last_name,
        company: client.company,
        website: client.website,
        phone: client.phone,
        status: 'active',
        stage: 'nurture',
      })
      .select('*')
      .single();
    if (error) {
      console.error('[pipeline/move] contact create failed', error.message);
      return null;
    }
    contact = data as Contact;
  }
  await db.from('clients').update({ outreach_contact_id: contact.id }).eq('id', client.id);
  return contact;
}
