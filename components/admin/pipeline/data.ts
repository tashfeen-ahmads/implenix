// Card data for the pipeline board. Plain module: the server page and the
// browser ("Load more") run the same queries with their own client.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Contact, ContactStage } from '@/lib/db/types';

export const CONTACT_CARD_FIELDS =
  'id, email, first_name, last_name, company, website, phone, industry, city, state, custom, status, stage, stage_changed_at, reply_label, revisit_at, last_contacted_at, owner_id';

export type ContactCard = Pick<
  Contact,
  | 'id'
  | 'email'
  | 'first_name'
  | 'last_name'
  | 'company'
  | 'website'
  | 'phone'
  | 'custom'
  | 'industry'
  | 'city'
  | 'state'
  | 'status'
  | 'stage'
  | 'stage_changed_at'
  | 'reply_label'
  | 'revisit_at'
  | 'last_contacted_at'
  | 'owner_id'
> & {
  sequence: { campaignId: string; name: string; step: number; steps: number; kind: 'sequence' | 'nurture' } | null;
  opens: number;
  clicks: number;
};

export const PAGE_SIZE = 30;

type EnrollmentRow = {
  contact_id: string;
  campaign_id: string;
  current_step: number;
  status: string;
  created_at: string;
  campaigns: { name: string; kind: 'sequence' | 'nurture' } | null;
};

// One page of contacts in a stage, newest move first, with the sequence
// each is in (the active enrollment, else the latest one).
export async function loadContactCards(db: SupabaseClient, stage: ContactStage, from: number): Promise<ContactCard[]> {
  const { data } = await db
    .from('contacts')
    .select(CONTACT_CARD_FIELDS)
    .eq('stage', stage)
    .order('stage_changed_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  const contacts = (data ?? []) as Omit<ContactCard, 'sequence' | 'opens' | 'clicks'>[];
  if (!contacts.length) return [];

  const { data: enr } = await db
    .from('campaign_enrollments')
    .select('contact_id, campaign_id, current_step, status, created_at, campaigns(name, kind)')
    .in('contact_id', contacts.map((c) => c.id))
    .order('created_at', { ascending: false });
  const rows = (enr ?? []) as unknown as EnrollmentRow[];
  const pick = new Map<string, EnrollmentRow>();
  for (const r of rows) {
    const prev = pick.get(r.contact_id);
    if (!prev || (r.status === 'active' && prev.status !== 'active')) pick.set(r.contact_id, r);
  }

  // Engagement for the lead score (only non-zero when tracking is on).
  const engagement = new Map<string, { opens: number; clicks: number }>();
  const { data: eng } = await db
    .from('messages')
    .select('contact_id, open_count, click_count')
    .in('contact_id', contacts.map((c) => c.id))
    .eq('direction', 'outbound')
    .or('open_count.gt.0,click_count.gt.0');
  for (const m of (eng ?? []) as { contact_id: string; open_count: number; click_count: number }[]) {
    const e = engagement.get(m.contact_id) ?? { opens: 0, clicks: 0 };
    e.opens += m.open_count ?? 0;
    e.clicks += m.click_count ?? 0;
    engagement.set(m.contact_id, e);
  }

  const campaignIds = [...new Set([...pick.values()].map((r) => r.campaign_id))];
  const stepCounts = new Map<string, number>();
  if (campaignIds.length) {
    const { data: steps } = await db.from('campaign_steps').select('campaign_id, step_number').in('campaign_id', campaignIds);
    for (const s of (steps ?? []) as { campaign_id: string; step_number: number }[]) {
      stepCounts.set(s.campaign_id, Math.max(stepCounts.get(s.campaign_id) ?? 0, s.step_number));
    }
  }

  return contacts.map((c) => {
    const e = pick.get(c.id);
    return {
      ...c,
      opens: engagement.get(c.id)?.opens ?? 0,
      clicks: engagement.get(c.id)?.clicks ?? 0,
      sequence: e
        ? {
            campaignId: e.campaign_id,
            name: e.campaigns?.name ?? 'Campaign',
            step: e.current_step,
            steps: stepCounts.get(e.campaign_id) ?? 0,
            kind: e.campaigns?.kind ?? 'sequence',
          }
        : null,
    };
  });
}

export async function countContactsByStage(db: SupabaseClient, stages: readonly ContactStage[]): Promise<Record<string, number>> {
  const counts = await Promise.all(
    stages.map((s) =>
      db
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('stage', s)
        .then((r) => [s, r.count ?? 0] as const),
    ),
  );
  return Object.fromEntries(counts);
}

// First-year value of a deal: setup fee plus twelve months.
export function firstYearValue(c: { setup_fee: number | null; monthly_value: number | null }): number {
  return Number(c.setup_fee ?? 0) + Number(c.monthly_value ?? 0) * 12;
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const formatMoney = (n: number) => money.format(n);
// Hand-rolled compact format: Intl's compact notation differs between
// Node and browsers ("$4.0K" vs "$4K"), which breaks hydration.
export function formatMoneyShort(n: number): string {
  const trim = (v: number) => (Math.round(v * 10) / 10).toString();
  if (n >= 1_000_000) return `$${trim(n / 1_000_000)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `$${trim(n / 1000)}k`;
  return `$${Math.round(n)}`;
}

export function dealLabel(c: { setup_fee: number | null; monthly_value: number | null }): string | null {
  const parts = [
    c.setup_fee ? `${formatMoney(Number(c.setup_fee))} setup` : '',
    c.monthly_value ? `${formatMoney(Number(c.monthly_value))}/mo` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' + ') : null;
}

export function daysSince(iso: string | null | undefined, now = Date.now()): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000));
}
