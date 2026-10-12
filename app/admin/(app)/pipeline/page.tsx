import { supabaseServer } from '@/lib/supabase/server';
import { CONTACT_STAGES, type Booking, type Campaign, type Client, type TeamMember } from '@/lib/db/types';
import { getTeamMember } from '@/lib/supabase/auth';
import { PageHeader } from '@/components/admin/ui';
import { PipelineBoard } from '@/components/admin/pipeline/PipelineBoard';
import { NewClientButton } from '@/components/admin/pipeline/NewClientButton';
import { countContactsByStage, loadContactCards, type ContactCard } from '@/components/admin/pipeline/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pipeline' };

// Contact stages shown on the board ('client' cards appear as their client).
const BOARD_CONTACT_STAGES = CONTACT_STAGES.filter((s) => s !== 'client');

export default async function PipelinePage() {
  const db = supabaseServer();
  const [clients, bookings, team, me, nurture, counts, ...pages] = await Promise.all([
    db.from('clients').select('*').order('stage_changed_at', { ascending: false }),
    db
      .from('bookings')
      .select('client_id, start_at, status')
      .eq('status', 'scheduled')
      .gte('start_at', new Date().toISOString())
      .order('start_at'),
    db.from('team_members').select('*').order('full_name'),
    getTeamMember(),
    db.from('campaigns').select('id, name, status').eq('kind', 'nurture').neq('status', 'completed').order('name'),
    countContactsByStage(db, BOARD_CONTACT_STAGES),
    ...BOARD_CONTACT_STAGES.map((s) => loadContactCards(db, s, 0)),
  ]);

  // Next scheduled call per client.
  const nextCall: Record<string, string> = {};
  for (const b of (bookings.data ?? []) as Pick<Booking, 'client_id' | 'start_at'>[]) {
    nextCall[b.client_id] ??= b.start_at;
  }
  const clientRows = (clients.data ?? []) as Client[];
  // A prospect that became a client is shown once, as the client.
  const linked = new Set(clientRows.map((c) => c.outreach_contact_id).filter(Boolean));
  const contacts = (pages as ContactCard[][]).flat().filter((c) => !linked.has(c.id));

  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Every prospect and client from first email to live. Outreach columns move on their own; drag or use a card's menu to move the rest."
        actions={<NewClientButton />}
      />
      <PipelineBoard
        clients={clientRows}
        contacts={contacts}
        contactCounts={counts}
        nextCall={nextCall}
        team={(team.data ?? []) as TeamMember[]}
        meId={me?.user_id ?? null}
        nurtureCampaigns={(nurture.data ?? []) as Pick<Campaign, 'id' | 'name' | 'status'>[]}
      />
    </>
  );
}
