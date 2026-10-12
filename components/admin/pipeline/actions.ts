'use client';

import { supabaseBrowser } from '@/lib/supabase/browser';
import { STAGE_LABELS, type ClientStage } from '@/lib/db/types';

// Client-side mutations for the pipeline. RLS limits them to team members;
// each change is also written to the client's activity timeline.

async function actorId(): Promise<string | null> {
  const { data } = await supabaseBrowser().auth.getUser();
  return data.user?.id ?? null;
}

async function logActivity(clientId: string, type: string, body: string, meta: Record<string, unknown> = {}) {
  await supabaseBrowser()
    .from('activities')
    .insert({ client_id: clientId, type, body, meta, actor_id: await actorId() });
}

export async function moveStage(clientId: string, from: ClientStage, to: ClientStage) {
  if (from === to) return;
  const { error } = await supabaseBrowser().from('clients').update({ stage: to }).eq('id', clientId);
  if (error) throw error;
  await logActivity(clientId, 'stage.changed', `Moved from ${STAGE_LABELS[from]} to ${STAGE_LABELS[to]}`, { from, to });
}

export async function addNote(clientId: string, body: string) {
  await logActivity(clientId, 'note', body);
}

export async function updateClient(clientId: string, fields: Record<string, string | null>) {
  const { error } = await supabaseBrowser().from('clients').update(fields).eq('id', clientId);
  if (error) throw error;
  const keys = Object.keys(fields);
  await logActivity(
    clientId,
    'client.updated',
    keys.length === 1 && keys[0] === 'owner_id'
      ? fields.owner_id ? 'Changed the owner' : 'Removed the owner'
      : `Updated ${keys.map((k) => k.replace('_id', '').replace('_', ' ')).join(', ')}`,
  );
}

export async function setBookingStatus(clientId: string, bookingId: string, status: string) {
  const { error } = await supabaseBrowser().from('bookings').update({ status }).eq('id', bookingId);
  if (error) throw error;
  await logActivity(clientId, 'booking.status', `Marked call as ${status.replace('_', ' ')}`, { bookingId, status });
}

export async function createClient(fields: {
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  company: string | null;
  service: string;
  source: string;
}): Promise<string> {
  const { data, error } = await supabaseBrowser()
    .from('clients')
    .insert({ ...fields, email: fields.email.toLowerCase(), stage: 'new' })
    .select('id')
    .single();
  if (error) throw error;
  await logActivity(data.id, 'client.created', 'Added manually');
  return data.id as string;
}
