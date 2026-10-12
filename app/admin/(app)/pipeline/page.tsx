import { supabaseServer } from '@/lib/supabase/server';
import type { Booking, Client } from '@/lib/db/types';
import { PageHeader } from '@/components/admin/ui';
import { PipelineBoard } from '@/components/admin/pipeline/PipelineBoard';
import { NewClientButton } from '@/components/admin/pipeline/NewClientButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pipeline' };

export default async function PipelinePage() {
  const db = supabaseServer();
  const [clients, bookings] = await Promise.all([
    db.from('clients').select('*').order('updated_at', { ascending: false }),
    db
      .from('bookings')
      .select('client_id, start_at, status')
      .eq('status', 'scheduled')
      .gte('start_at', new Date().toISOString())
      .order('start_at'),
  ]);
  // Next scheduled call per client.
  const nextCall: Record<string, string> = {};
  for (const b of (bookings.data ?? []) as Pick<Booking, 'client_id' | 'start_at'>[]) {
    nextCall[b.client_id] ??= b.start_at;
  }
  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Every person who booked a call or was added by the team, by stage. Drag a card or use its menu to move it."
        actions={<NewClientButton />}
      />
      <PipelineBoard clients={(clients.data ?? []) as Client[]} nextCall={nextCall} />
    </>
  );
}
