import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Campaign, CampaignStep, Contact, ContactStage } from '@/lib/db/types';
import { DAY_MS, SEQUENCE_STAGES } from '@/lib/pipeline/stages';

// Automatic pipeline moves for outreach contacts, shared by the send
// engine, SES events, inbound replies and the AI agent.

// Set a contact's stage. `onlyFrom` limits the move to contacts currently
// in one of those stages, so an automatic move never overrides a later
// outcome (a send can't pull a replied contact back to "Follow-up 2").
export async function setContactStage(
  db: SupabaseClient,
  contactId: string,
  stage: ContactStage,
  opts: { onlyFrom?: ContactStage[]; extra?: Record<string, unknown> } = {},
): Promise<void> {
  let q = db.from('contacts').update({ stage, ...(opts.extra ?? {}) }).eq('id', contactId);
  if (opts.onlyFrom) q = q.in('stage', opts.onlyFrom);
  const { error } = await q;
  if (error) console.error('[outreach/stage] update failed', error.message);
}

// Stages an automatic outreach move may overwrite.
export const AUTO_FROM: ContactStage[] = [...SEQUENCE_STAGES, 'nurture'];

// Stages a reply moves out of into "Replied".
export const REPLY_FROM: ContactStage[] = [...SEQUENCE_STAGES, 'nurture', 'replied', 'interested', 'not_interested'];

export type NurtureResult = { enrolled: boolean; campaignId: string | null; reason?: string };

const BLOCKED_STATUSES = new Set(['unsubscribed', 'bounced', 'complained']);

// Move a contact into nurture: stop their other sequences, set the stage
// and a check-back date, and enroll them in a nurture campaign when one is
// configured. `campaignId` picks the nurture campaign; otherwise the
// source campaign's nurture_campaign_id is used.
export async function moveToNurture(
  db: SupabaseClient,
  contact: Pick<Contact, 'id' | 'status' | 'email'>,
  opts: {
    campaignId?: string | null;
    fromCampaign?: Pick<Campaign, 'id' | 'nurture_campaign_id'> | null;
    revisitAt?: Date | null;
    // A person chose this, so a "not interested" contact may be nurtured.
    manual?: boolean;
  } = {},
): Promise<NurtureResult> {
  if (BLOCKED_STATUSES.has(contact.status)) {
    return { enrolled: false, campaignId: null, reason: 'This address has opted out or bounced.' };
  }
  if (!opts.manual && contact.status === 'not_interested') {
    return { enrolled: false, campaignId: null, reason: 'Not interested contacts are not nurtured automatically.' };
  }

  await db
    .from('campaign_enrollments')
    .update({ status: 'stopped' })
    .eq('contact_id', contact.id)
    .eq('status', 'active');

  const revisit = opts.revisitAt ?? new Date(Date.now() + 60 * DAY_MS);
  const targetId = opts.campaignId ?? opts.fromCampaign?.nurture_campaign_id ?? null;

  let enrolled = false;
  let reason: string | undefined;
  if (targetId) {
    const { data: target } = await db
      .from('campaigns')
      .select('id, kind, status')
      .eq('id', targetId)
      .maybeSingle();
    const t = target as Pick<Campaign, 'id' | 'kind' | 'status'> | null;
    if (!t || t.kind !== 'nurture') {
      reason = 'The nurture campaign no longer exists.';
    } else if (t.status === 'completed') {
      reason = 'The nurture campaign is completed.';
    } else {
      const { data: first } = await db
        .from('campaign_steps')
        .select('delay_days')
        .eq('campaign_id', t.id)
        .eq('step_number', 1)
        .maybeSingle();
      const delay = Math.max(1, (first as Pick<CampaignStep, 'delay_days'> | null)?.delay_days ?? 30);
      const { error } = await db.from('campaign_enrollments').upsert(
        {
          campaign_id: t.id,
          contact_id: contact.id,
          current_step: 0,
          next_send_at: new Date(Date.now() + delay * DAY_MS).toISOString(),
          status: 'active',
        },
        { onConflict: 'campaign_id,contact_id' },
      );
      if (error) reason = `Enrollment failed: ${error.message}`;
      else enrolled = true;
      if (t.status !== 'active' && enrolled) reason = 'Enrolled, but the nurture campaign is not active yet, so nothing sends until it is.';
    }
  } else {
    reason = 'No nurture campaign set, so only the check-back date was saved.';
  }

  const { error } = await db
    .from('contacts')
    .update({
      stage: 'nurture',
      revisit_at: revisit.toISOString(),
      // Nurture emails only go to active contacts.
      ...(enrolled ? { status: 'active' } : {}),
    })
    .eq('id', contact.id);
  if (error) console.error('[outreach/stage] nurture update failed', error.message);
  return { enrolled, campaignId: targetId, reason };
}

// Free mailbox providers: a reply from one gmail.com user says nothing
// about other gmail.com users.
const FREE_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'aol.com', 'icloud.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com', 'zoho.com',
  'comcast.net', 'att.net', 'sbcglobal.net', 'verizon.net', 'bellsouth.net', 'cox.net', 'charter.net',
]);

export function companyDomain(email: string): string | null {
  const d = email.split('@')[1]?.trim().toLowerCase();
  if (!d || FREE_DOMAINS.has(d)) return null;
  return d;
}

// When one person at a company replies, stop the running sequences of
// their colleagues (same email domain) so the company isn't emailed twice.
export async function stopCompanySequences(db: SupabaseClient, contact: Pick<Contact, 'id' | 'email'>): Promise<number> {
  const domain = companyDomain(contact.email);
  if (!domain) return 0;
  const { data: colleagues } = await db
    .from('contacts')
    .select('id')
    .ilike('email', `%@${domain.replace(/[\\%_]/g, (c) => `\\${c}`)}`)
    .neq('id', contact.id)
    .limit(200);
  const ids = ((colleagues ?? []) as { id: string }[]).map((c) => c.id);
  if (!ids.length) return 0;
  const { data: stopped } = await db
    .from('campaign_enrollments')
    .update({ status: 'stopped' })
    .in('contact_id', ids)
    .eq('status', 'active')
    .select('contact_id');
  return (stopped ?? []).length;
}

// Push a contact's running sequences out by `days` (never earlier).
export async function pauseSequences(db: SupabaseClient, contactId: string, days: number, until?: Date): Promise<void> {
  const target = until ?? new Date(Date.now() + days * 86_400_000);
  const { data } = await db
    .from('campaign_enrollments')
    .select('id, next_send_at')
    .eq('contact_id', contactId)
    .eq('status', 'active');
  for (const e of (data ?? []) as { id: string; next_send_at: string }[]) {
    if (new Date(e.next_send_at) >= target) continue;
    await db.from('campaign_enrollments').update({ next_send_at: target.toISOString() }).eq('id', e.id);
  }
}
