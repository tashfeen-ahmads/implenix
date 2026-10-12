import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientStage, Contact } from '@/lib/db/types';
import { escapeLike, normalizeEmail } from '@/lib/outreach/suppress';

// Stages an existing client can be moved out of when the same person is
// converted again from outreach. Active deals and won clients keep theirs.
const REOPENABLE: ClientStage[] = ['new', 'no_show', 'nurture', 'lost', 'unqualified'];

// Find or create the client for a contact moved into the sales pipeline.
export async function clientForContact(
  db: SupabaseClient,
  contact: Contact,
  stage: ClientStage,
  lostReason: string | null,
): Promise<{ id: string; created: boolean; stage: ClientStage } | { error: string }> {
  const email = normalizeEmail(contact.email);
  const { data: existing } = await db
    .from('clients')
    .select('id, stage')
    .ilike('email', escapeLike(email))
    .limit(1)
    .maybeSingle();
  if (existing) {
    const ex = existing as { id: string; stage: ClientStage };
    // Never pull an existing deal backwards: only pre-call or closed deals
    // take the new stage; otherwise just link the prospect.
    const move = REOPENABLE.includes(ex.stage);
    const { error } = await db
      .from('clients')
      .update({
        outreach_contact_id: contact.id,
        ...(move ? { stage, ...(stage === 'lost' ? { lost_reason: lostReason } : {}) } : {}),
      })
      .eq('id', ex.id);
    if (error) return { error: error.message };
    return { id: ex.id, created: false, stage: move ? stage : ex.stage };
  }
  const { data, error } = await db
    .from('clients')
    .insert({
      first_name: contact.first_name?.trim() || contact.company?.trim() || email.split('@')[0],
      last_name: contact.last_name,
      email,
      phone: contact.phone,
      website: contact.website,
      company: contact.company,
      service: 'ai-receptionist',
      source: 'outreach',
      stage,
      outreach_contact_id: contact.id,
      owner_id: contact.owner_id,
      ...(stage === 'lost' ? { lost_reason: lostReason } : {}),
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message ?? 'Could not create the client' };
  return { id: (data as { id: string }).id, created: true, stage };
}
