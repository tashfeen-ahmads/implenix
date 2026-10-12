import type { SupabaseClient } from '@supabase/supabase-js';
import type { Contact } from '@/lib/db/types';
import type { VerifyResult } from '@/lib/leads/verify';

// One rule for who may be emailed, used at launch, at send time and in
// the eligible count: never undeliverable, and catch-all ("risky") only
// when the campaign allows it. Contacts nobody verified yet (CSV uploads)
// are allowed in and checked just before their first email.

export const sendableVerdicts = (includeRisky: boolean) =>
  includeRisky ? ['deliverable', 'unknown', 'risky'] : ['deliverable', 'unknown'];

// PostgREST or() filter for contacts queries.
export const sendableFilter = (includeRisky: boolean) =>
  `email_verdict.is.null,email_verdict.in.(${sendableVerdicts(includeRisky).join(',')})`;

export function blockedVerdict(verdict: string | null | undefined, includeRisky: boolean): 'undeliverable' | 'risky' | null {
  if (verdict === 'undeliverable') return 'undeliverable';
  if (verdict === 'risky' && !includeRisky) return 'risky';
  return null;
}

// Saves a verification result on the contact. An undeliverable address is
// marked bounced (never emailed again) and its sequences stop.
export async function saveContactVerdict(
  db: SupabaseClient,
  contact: Pick<Contact, 'id'>,
  v: VerifyResult & { checkedBy: string },
): Promise<void> {
  const verdict = { email_verdict: v.verdict, email_verdict_reason: `${v.reason} (${v.checkedBy})`, verified_at: new Date().toISOString() };
  if (v.verdict !== 'undeliverable') {
    await db.from('contacts').update(verdict).eq('id', contact.id);
    return;
  }
  await db
    .from('contacts')
    .update({ ...verdict, status: 'bounced', stage: 'bounced', reply_label: 'failed_verification' })
    .eq('id', contact.id);
  await db.from('campaign_enrollments').update({ status: 'stopped' }).eq('contact_id', contact.id).eq('status', 'active');
}
