import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContactStatus } from '@/lib/db/types';

// Suppression list and contact state changes shared by the unsubscribe
// link, SES bounce/complaint handling, the AI agent and the admin API.

export type SuppressionReason = 'unsubscribed' | 'bounced' | 'complained' | 'manual';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Practical address check: one @, no spaces, a dotted domain.
const EMAIL_RE = /^[^\s@<>()",;:\\[\]]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;
export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export async function isSuppressed(db: SupabaseClient, email: string): Promise<boolean> {
  const { data, error } = await db
    .from('suppressions')
    .select('email')
    .eq('email', normalizeEmail(email))
    .maybeSingle();
  if (error) {
    // Fail closed: if we can't check, we don't send.
    console.error('[outreach] suppression lookup failed', error.message);
    return true;
  }
  return Boolean(data);
}

export async function addSuppression(
  db: SupabaseClient,
  email: string,
  reason: SuppressionReason,
): Promise<void> {
  // Keep the first reason recorded (e.g. a complaint stays a complaint).
  const { error } = await db
    .from('suppressions')
    .upsert({ email: normalizeEmail(email), reason }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) console.error('[outreach] suppression insert failed', error.message);
}

export async function stopEnrollments(db: SupabaseClient, contactId: string): Promise<void> {
  const { error } = await db
    .from('campaign_enrollments')
    .update({ status: 'stopped' })
    .eq('contact_id', contactId)
    .eq('status', 'active');
  if (error) console.error('[outreach] stopping enrollments failed', error.message);
}

const STATUS_FOR_REASON: Record<Exclude<SuppressionReason, 'manual'>, ContactStatus> = {
  unsubscribed: 'unsubscribed',
  bounced: 'bounced',
  complained: 'complained',
};

// Suppress an address, set every contact row with it to the matching
// status and stop their sequences.
export async function suppressAndStop(
  db: SupabaseClient,
  email: string,
  reason: Exclude<SuppressionReason, 'manual'>,
): Promise<string[]> {
  const addr = normalizeEmail(email);
  await addSuppression(db, addr, reason);
  const { data: contacts, error } = await db.from('contacts').select('id').ilike('email', escapeLike(addr));
  if (error) {
    console.error('[outreach] contact lookup failed', error.message);
    return [];
  }
  const ids = (contacts ?? []).map((c: { id: string }) => c.id);
  for (const id of ids) {
    const { error: upErr } = await db.from('contacts').update({ status: STATUS_FOR_REASON[reason] }).eq('id', id);
    if (upErr) console.error('[outreach] contact status update failed', upErr.message);
    await stopEnrollments(db, id);
  }
  return ids;
}

// Escapes % and _ so ilike does a case-insensitive exact match.
export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}
