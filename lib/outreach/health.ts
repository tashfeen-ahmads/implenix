import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Campaign } from '@/lib/db/types';
import { sendEmail } from '@/lib/email/resend';
import { sendingAlertEmail } from '@/lib/email/templates';
import { teamAlertRecipients } from '@/lib/email/recipients';
import { SITE_URL } from './config';

// Deliverability guard, run before every send tick. AWS reviews an SES
// account at 5% bounces or 0.1% complaints and can pause it, which would
// stop booking confirmations too. So sending stops well before that:
//
//   * Account hold: every outreach send stops until a team member clears
//     the hold. Measured over the last 7 days, from the last cleared hold.
//   * Campaign pause: one campaign with a bad list is paused with the
//     reason. Measured from when it was last resumed.
//
// Minimum samples keep one unlucky bounce in the first sends from
// tripping anything.

const WINDOW_MS = 7 * 86_400_000;
const COUNTED = ['sent', 'delivered', 'bounced', 'complained'];

export const LIMITS = {
  account: { minSent: 100, bounce: 0.04, complaintMinSent: 200, complaint: 0.001, minComplaints: 2 },
  campaign: { minSent: 40, bounce: 0.05, complaintMinSent: 100, complaint: 0.002, minComplaints: 2 },
  // Shown as a warning on the dashboard; nothing stops.
  warn: { bounce: 0.02, complaint: 0.0005 },
};

export type Rates = { sent: number; bounced: number; complained: number; bounceRate: number; complaintRate: number; since: string };
export type Hold = { id: string; reason: string; metrics: Rates | Record<string, unknown>; created_at: string };

async function rates(db: SupabaseClient, since: Date, campaignId?: string): Promise<Rates> {
  const base = () => {
    let q = db
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('direction', 'outbound')
      .gte('created_at', since.toISOString());
    if (campaignId) q = q.eq('campaign_id', campaignId);
    return q;
  };
  const [sent, bounced, complained] = await Promise.all([
    base().in('status', COUNTED),
    base().eq('status', 'bounced'),
    base().eq('status', 'complained'),
  ]);
  const err = sent.error ?? bounced.error ?? complained.error;
  if (err) throw new Error(`health query failed: ${err.message}`);
  const s = sent.count ?? 0;
  const b = bounced.count ?? 0;
  const c = complained.count ?? 0;
  return { sent: s, bounced: b, complained: c, bounceRate: s ? b / s : 0, complaintRate: s ? c / s : 0, since: since.toISOString() };
}

type Limit = (typeof LIMITS)['account'];

// Why sending should stop, or null when the numbers are fine.
export function breach(r: Rates, l: Limit): string | null {
  if (r.sent >= l.minSent && r.bounceRate >= l.bounce) {
    return `Bounce rate ${pct(r.bounceRate)} (${r.bounced} of ${r.sent} emails) is over the ${pct(l.bounce)} limit`;
  }
  if (r.sent >= l.complaintMinSent && r.complained >= l.minComplaints && r.complaintRate >= l.complaint) {
    return `Spam complaint rate ${pct(r.complaintRate, 2)} (${r.complained} of ${r.sent} emails) is over the ${pct(l.complaint, 2)} limit`;
  }
  return null;
}

export const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`;

export async function activeHold(db: SupabaseClient): Promise<Hold | null> {
  const { data, error } = await db
    .from('outreach_holds')
    .select('id, reason, metrics, created_at')
    .is('cleared_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`hold query failed: ${error.message}`);
  return (data as Hold | null) ?? null;
}

// Account rates for the dashboard (same window the guard uses).
export async function accountRates(db: SupabaseClient, now = new Date()): Promise<Rates> {
  const { data: last } = await db
    .from('outreach_holds')
    .select('cleared_at')
    .not('cleared_at', 'is', null)
    .order('cleared_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const cleared = (last as { cleared_at: string } | null)?.cleared_at;
  return rates(db, cleared && new Date(cleared) > windowStart ? new Date(cleared) : windowStart);
}

export type HealthResult = { hold: Hold | null; paused: { id: string; name: string; reason: string }[] };

// Checks the numbers and applies holds/pauses. Returns the active hold
// (sending must not happen) and campaigns paused on this run.
export async function enforceSendingHealth(db: SupabaseClient, campaigns: Campaign[], now = new Date()): Promise<HealthResult> {
  const existing = await activeHold(db);
  if (existing) return { hold: existing, paused: [] };

  const account = await accountRates(db, now);
  const why = breach(account, LIMITS.account);
  if (why) {
    const { data, error } = await db
      .from('outreach_holds')
      .insert({ reason: why, metrics: account })
      .select('id, reason, metrics, created_at')
      .single();
    // A concurrent tick may have created it first (unique index).
    const hold = (error ? await activeHold(db) : (data as Hold)) ?? { id: '', reason: why, metrics: account, created_at: now.toISOString() };
    if (!error) await alert('hold', why, account);
    return { hold, paused: [] };
  }

  const paused: HealthResult['paused'] = [];
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  for (const c of campaigns) {
    const since = c.health_since && new Date(c.health_since) > windowStart ? new Date(c.health_since) : windowStart;
    const r = await rates(db, since, c.id);
    const reason = breach(r, LIMITS.campaign);
    if (!reason) continue;
    const { data } = await db
      .from('campaigns')
      .update({ status: 'paused', paused_reason: reason })
      .eq('id', c.id)
      .eq('status', 'active')
      .select('id');
    if (data?.length) {
      paused.push({ id: c.id, name: c.name, reason });
      await alert('campaign', reason, r, c);
    }
  }
  return { hold: null, paused };
}

async function alert(kind: 'hold' | 'campaign', reason: string, r: Rates, campaign?: Campaign): Promise<void> {
  console.warn(`[outreach/health] ${kind === 'hold' ? 'sending held' : `campaign ${campaign?.id} paused`}: ${reason}`);
  const to = teamAlertRecipients();
  if (!to.length) return;
  const mail = sendingAlertEmail({
    kind,
    reason,
    campaign: campaign?.name ?? null,
    sent: r.sent,
    bounced: r.bounced,
    complained: r.complained,
    url: campaign ? `${SITE_URL}/admin/outreach/campaigns/${campaign.id}` : `${SITE_URL}/admin/outreach/campaigns`,
  });
  try {
    await sendEmail({ to, subject: mail.subject, html: mail.html, text: mail.text, tags: [{ name: 'type', value: 'sending_alert' }] });
  } catch (err) {
    console.error('[outreach/health] alert failed', err instanceof Error ? err.message : err);
  }
}
