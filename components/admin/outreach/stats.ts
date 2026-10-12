import 'server-only';
import type { supabaseServer } from '@/lib/supabase/server';
import type { ContactStatus } from '@/lib/db/types';
import { SENT_STATUSES } from './shared';

type DB = ReturnType<typeof supabaseServer>;

// Head-only count queries for campaign stats (RLS as the signed-in member).

export function countMessages(db: DB, campaignId: string, opts: { statuses?: string[]; step?: number } = {}) {
  let q = db
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('direction', 'outbound')
    .in('status', opts.statuses ?? SENT_STATUSES);
  if (opts.step !== undefined) q = q.eq('step_number', opts.step);
  return q.then((r) => r.count ?? 0);
}

export function countEnrollments(db: DB, campaignId: string, opts: { status?: string; contacted?: boolean } = {}) {
  let q = db.from('campaign_enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId);
  if (opts.status) q = q.eq('status', opts.status);
  if (opts.contacted) q = q.gte('current_step', 1);
  return q.then((r) => r.count ?? 0);
}

// Enrolled contacts of this campaign whose contact status is one of `statuses`.
export function countEnrolledContacts(db: DB, campaignId: string, statuses: ContactStatus[]) {
  return db
    .from('campaign_enrollments')
    .select('id, contacts!inner(status)', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .in('contacts.status', statuses)
    .then((r) => r.count ?? 0);
}

// Distinct contacts in this campaign who wrote back (enrollment marked replied,
// or the contact moved on to interested / booked / not interested).
export async function countReplied(db: DB, campaignId: string) {
  const [enr, contacts] = await Promise.all([
    db
      .from('campaign_enrollments')
      .select('contact_id')
      .eq('campaign_id', campaignId)
      .eq('status', 'replied'),
    db
      .from('campaign_enrollments')
      .select('contact_id, contacts!inner(status)')
      .eq('campaign_id', campaignId)
      .in('contacts.status', ['replied', 'interested', 'booked', 'not_interested']),
  ]);
  const ids = new Set<string>();
  for (const r of (enr.data ?? []) as { contact_id: string }[]) ids.add(r.contact_id);
  for (const r of (contacts.data ?? []) as { contact_id: string }[]) ids.add(r.contact_id);
  return ids.size;
}
