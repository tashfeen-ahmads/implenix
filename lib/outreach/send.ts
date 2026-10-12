import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Campaign, CampaignStep, Contact, Enrollment } from '@/lib/db/types';
import { MAX_SENDS_PER_TICK, globalDailyLimit, outreachTimezone, sesConfigured } from './config';
import { buildOutreachEmail, replySubject, senderVars } from './render';
import { SesSendError, sendOutreachEmail } from './ses';
import { isSuppressed, normalizeEmail } from './suppress';
import { verifyEmail } from '@/lib/leads/verify';
import { blockedVerdict, saveContactVerdict } from './sendable';
import { inSendWindow, startOfDay } from './time';
import { AUTO_FROM, moveToNurture, setContactStage } from './stage';
import { createHash } from 'node:crypto';
import { enforceSendingHealth } from './health';
import { SEQUENCE_STAGES, stageForStep } from '@/lib/pipeline/stages';

// The cron-driven sequence sender. Each tick picks due enrollments of
// active campaigns inside their send windows, honours per-campaign and
// global daily caps, and sends the next step.

const DAY_MS = 86_400_000;
// How far a claimed enrollment is pushed forward while we work on it. If
// the tick dies mid-send, the enrollment becomes due again after this.
const CLAIM_MS = 20 * 60_000;
// Wall-clock budget for one tick (serverless functions get ~60s+).
const TICK_BUDGET_MS = 45_000;
const COUNTED_STATUSES = ['sent', 'delivered', 'bounced', 'complained'];

export type TickResult = {
  ok: boolean;
  skipped?: string;
  sent: number;
  failed: number;
  stopped: number;
  completed: number;
  campaigns: number;
  globalRemaining: number;
  errors: string[];
  held?: string;
  pausedForHealth?: string[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function countOutbound(db: SupabaseClient, since: Date, campaignId?: string): Promise<number> {
  let q = db
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('direction', 'outbound')
    .in('status', COUNTED_STATUSES)
    .gte('created_at', since.toISOString());
  if (campaignId) q = q.eq('campaign_id', campaignId);
  const { count, error } = await q;
  if (error) throw new Error(`count failed: ${error.message}`);
  return count ?? 0;
}

type Queue = {
  campaign: Campaign;
  steps: Map<number, CampaignStep>;
  remaining: number;
  due: Enrollment[];
};

export async function runOutreachTick(now = new Date()): Promise<TickResult> {
  const result: TickResult = {
    ok: true,
    sent: 0,
    failed: 0,
    stopped: 0,
    completed: 0,
    campaigns: 0,
    globalRemaining: 0,
    errors: [],
  };
  if (!sesConfigured()) return { ...result, skipped: 'SES not configured' };
  const started = Date.now();
  const db = supabaseAdmin();

  const sentToday = await countOutbound(db, startOfDay(now, outreachTimezone()));
  let globalRemaining = Math.max(0, globalDailyLimit() - sentToday);
  result.globalRemaining = globalRemaining;
  if (globalRemaining === 0) return { ...result, skipped: 'global daily limit reached' };

  const { data: campaignRows, error: cErr } = await db.from('campaigns').select('*').eq('status', 'active');
  if (cErr) throw new Error(`campaigns query failed: ${cErr.message}`);
  let campaigns = (campaignRows ?? []) as Campaign[];

  // Deliverability guard: stop everything on an account hold, and pause
  // single campaigns whose bounces or complaints are too high.
  const health = await enforceSendingHealth(db, campaigns, now);
  if (health.hold) return { ...result, skipped: 'sending on hold', held: health.hold.reason };
  if (health.paused.length) {
    const paused = new Set(health.paused.map((p) => p.id));
    campaigns = campaigns.filter((c) => !paused.has(c.id));
    result.pausedForHealth = health.paused.map((p) => `${p.name}: ${p.reason}`);
  }

  let budget = Math.min(MAX_SENDS_PER_TICK, globalRemaining);
  const queues: Queue[] = [];
  for (const campaign of campaigns) {
    // Finish campaigns with nobody left in the sequence.
    const { count: activeCount } = await db
      .from('campaign_enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaign.id)
      .eq('status', 'active');
    // Nurture campaigns are evergreen: leads keep arriving, so they never
    // complete on their own.
    if (activeCount === 0 && campaign.kind !== 'nurture') {
      await db.from('campaigns').update({ status: 'completed' }).eq('id', campaign.id).eq('status', 'active');
      continue;
    }
    if (!inSendWindow(now, campaign)) continue;
    const campaignSent = await countOutbound(db, startOfDay(now, campaign.send_timezone), campaign.id);
    const remaining = Math.max(0, campaign.daily_limit - campaignSent);
    if (remaining === 0) continue;

    const { data: stepRows } = await db.from('campaign_steps').select('*').eq('campaign_id', campaign.id);
    const steps = new Map(((stepRows ?? []) as CampaignStep[]).map((s) => [s.step_number, s]));
    if (steps.size === 0) continue;

    const { data: due, error: dErr } = await db
      .from('campaign_enrollments')
      .select('*')
      .eq('campaign_id', campaign.id)
      .eq('status', 'active')
      .lte('next_send_at', now.toISOString())
      .order('next_send_at', { ascending: true })
      .limit(Math.min(remaining, budget));
    if (dErr) {
      result.errors.push(`enrollments query failed for ${campaign.id}`);
      continue;
    }
    if (due?.length) queues.push({ campaign, steps, remaining, due: due as Enrollment[] });
  }
  result.campaigns = queues.length;

  // Round-robin across campaigns so one big campaign can't starve the rest.
  const order: { q: Queue; e: Enrollment }[] = [];
  for (let i = 0; queues.some((q) => i < q.due.length); i++) {
    for (const q of queues) if (i < q.due.length) order.push({ q, e: q.due[i] });
  }

  for (const { q, e } of order) {
    if (budget <= 0 || globalRemaining <= 0) break;
    if (q.remaining <= 0) continue;
    if (Date.now() - started > TICK_BUDGET_MS) break;
    try {
      const outcome = await processEnrollment(db, q, e, now);
      if (outcome === 'sent') {
        result.sent++;
        budget--;
        globalRemaining--;
        q.remaining--;
        // Small jitter so sends don't go out in a machine-gun burst.
        await sleep(400 + Math.floor(Math.random() * 900));
      } else if (outcome === 'stopped') result.stopped++;
      else if (outcome === 'completed') result.completed++;
      else if (outcome === 'failed') result.failed++;
    } catch (err) {
      if (err instanceof SesSendError && err.fatal) {
        result.ok = false;
        result.errors.push(`SES ${err.code}: run stopped`);
        break;
      }
      result.failed++;
      result.errors.push(err instanceof Error ? err.message.slice(0, 200) : 'unknown error');
    }
  }
  result.globalRemaining = globalRemaining;
  return result;
}

type Outcome = 'sent' | 'stopped' | 'completed' | 'failed' | 'skipped';

async function processEnrollment(db: SupabaseClient, q: Queue, e: Enrollment, now: Date): Promise<Outcome> {
  // Claim: move next_send_at forward only if nobody else did. A second
  // overlapping tick sees 0 rows and skips this enrollment.
  const claimUntil = new Date(now.getTime() + CLAIM_MS).toISOString();
  const { data: claimed, error: claimErr } = await db
    .from('campaign_enrollments')
    .update({ next_send_at: claimUntil })
    .eq('id', e.id)
    .eq('status', 'active')
    .eq('next_send_at', e.next_send_at)
    .select('id');
  if (claimErr) throw new Error(`claim failed: ${claimErr.message}`);
  if (!claimed?.length) return 'skipped';

  const setEnrollment = async (patch: Partial<Enrollment>) => {
    const { error } = await db.from('campaign_enrollments').update(patch).eq('id', e.id);
    if (error) console.error('[outreach/tick] enrollment update failed', error.message);
  };

  const { data: contactRow } = await db.from('contacts').select('*').eq('id', e.contact_id).maybeSingle();
  const contact = contactRow as Contact | null;
  if (!contact || contact.status !== 'active' || (await isSuppressed(db, contact.email))) {
    await setEnrollment({ status: 'stopped' });
    return 'stopped';
  }

  // Email-first: an address nobody has verified yet (e.g. a CSV import)
  // is checked before its first email. Undeliverable addresses, and
  // catch-all ones unless the campaign allows them, are skipped so they
  // never count against the bounce rate.
  let verdict = contact.email_verdict;
  if (!contact.verified_at) {
    const v = await verifyEmail(contact.email);
    await saveContactVerdict(db, contact, v);
    verdict = v.verdict;
  }
  const blocked = blockedVerdict(verdict, q.campaign.include_risky);
  if (blocked) {
    if (blocked === 'risky') {
      await db.from('contacts').update({ stage: 'no_response', reply_label: 'catch_all_skipped' }).eq('id', contact.id);
    }
    await setEnrollment({ status: 'stopped' });
    return 'stopped';
  }

  const stepNumber = e.current_step + 1;
  const step = q.steps.get(stepNumber);
  if (!step) {
    // Sequence finished and the grace period after the last email passed
    // without a reply.
    await setEnrollment({ status: 'completed' });
    if (q.campaign.kind === 'nurture') {
      // End of the nurture drip: they stay In nurture with their
      // check-back date so a person decides what happens next.
      return 'completed';
    }
    if (q.campaign.nurture_campaign_id) {
      const res = await moveToNurture(db, contact, { fromCampaign: q.campaign });
      if (res.enrolled) return 'completed';
    }
    await setContactStage(db, contact.id, 'no_response', { onlyFrom: SEQUENCE_STAGES });
    return 'completed';
  }

  // A/B test: a step with a B body splits contacts 50/50. The split is
  // stable per contact and step, so a retry sends the same variant.
  const variant: 'A' | 'B' = step.body_b?.trim() ? pickVariant(contact.id, q.campaign.id, stepNumber) : 'A';
  const stepSubject = variant === 'B' && step.subject_b?.trim() ? step.subject_b : step.subject;
  const stepBody = variant === 'B' ? step.body_b! : step.body;

  // A blank step subject means "follow up in the same thread": reuse the
  // previous step's subject as "Re: ..." and set threading headers.
  let subjectTemplate = stepSubject;
  let inReplyTo: string | null = null;
  const references: string[] = [];
  if (!stepSubject.trim()) {
    const { data: prev } = await db
      .from('messages')
      .select('subject, message_id')
      .eq('contact_id', contact.id)
      .eq('campaign_id', q.campaign.id)
      .eq('direction', 'outbound')
      .in('status', COUNTED_STATUSES)
      .order('created_at', { ascending: true });
    const prevRows = (prev ?? []) as { subject: string | null; message_id: string | null }[];
    const first = prevRows[0];
    const last = prevRows[prevRows.length - 1];
    subjectTemplate = replySubject(first?.subject ?? '');
    inReplyTo = last?.message_id ?? null;
    prevRows.forEach((r) => r.message_id && references.push(r.message_id));
    if (!first) subjectTemplate = q.steps.get(1)?.subject ?? 'Quick question';
  }

  const email = buildOutreachEmail({ subject: subjectTemplate, body: stepBody, contact, vars: senderVars(q.campaign.from_name) });
  let sent: { sesMessageId: string; messageId: string };
  try {
    sent = await sendOutreachEmail({
      fromName: q.campaign.from_name,
      fromEmail: q.campaign.from_email,
      to: normalizeEmail(contact.email),
      replyTo: q.campaign.reply_to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      unsubscribeUrl: email.unsubscribeUrl,
      inReplyTo,
      references,
      tags: { campaign_id: q.campaign.id, step: String(stepNumber), kind: q.campaign.kind, variant },
      track: q.campaign.track_opens,
    });
  } catch (err) {
    const code = err instanceof SesSendError ? err.code : 'Error';
    const permanent = err instanceof SesSendError && err.permanent;
    await db.from('messages').insert({
      contact_id: contact.id,
      campaign_id: q.campaign.id,
      step_number: stepNumber,
      direction: 'outbound',
      from_email: q.campaign.from_email,
      to_email: contact.email,
      subject: email.subject,
      body_text: email.body,
      variant,
      status: 'failed',
      ai_meta: { error: code, message: err instanceof Error ? err.message.slice(0, 300) : '' },
    });
    // Permanent problems end the sequence for this contact; transient ones
    // retry once the claim expires.
    if (permanent) await setEnrollment({ status: 'failed' });
    if (err instanceof SesSendError && err.fatal) throw err;
    return 'failed';
  }

  const { error: msgErr } = await db.from('messages').insert({
    contact_id: contact.id,
    campaign_id: q.campaign.id,
    step_number: stepNumber,
    direction: 'outbound',
    from_email: q.campaign.from_email,
    to_email: contact.email,
    subject: email.subject,
    body_text: email.body,
    body_html: email.html,
    message_id: sent.messageId,
    in_reply_to: inReplyTo,
    ses_message_id: sent.sesMessageId,
    variant,
    status: 'sent',
  });
  if (msgErr) console.error('[outreach/tick] message insert failed (email was sent)', msgErr.message);

  // After the last step the enrollment stays active for the grace period,
  // so a late reply still counts as a reply to this sequence; the next
  // tick after that marks it no-response (or hands it to nurture).
  const next = q.steps.get(stepNumber + 1);
  const waitDays = next ? Math.max(0, next.delay_days) : Math.max(0, q.campaign.no_reply_grace_days ?? 4);
  await setEnrollment({
    current_step: stepNumber,
    next_send_at: new Date(Date.now() + waitDays * DAY_MS).toISOString(),
  });
  await db.from('contacts').update({ last_contacted_at: new Date().toISOString() }).eq('id', contact.id);
  if (q.campaign.kind === 'sequence') {
    await setContactStage(db, contact.id, stageForStep(stepNumber), { onlyFrom: AUTO_FROM });
  }
  return 'sent';
}

function pickVariant(contactId: string, campaignId: string, step: number): 'A' | 'B' {
  const h = createHash('sha256').update(`${campaignId}:${contactId}:${step}`).digest();
  return h[0] % 2 === 0 ? 'A' : 'B';
}
