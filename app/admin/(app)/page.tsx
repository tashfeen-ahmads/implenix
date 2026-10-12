import Link from 'next/link';
import { Video } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import { BOOKING_CONFIG } from '@/lib/googleCalendar';
import {
  CONTACT_STAGES,
  serviceLabel,
  type Activity,
  type Booking,
  type Client,
  type Contact,
} from '@/lib/db/types';
import { COLUMNS, PHASES } from '@/lib/pipeline/stages';
import { countContactsByStage } from '@/components/admin/pipeline/data';
import { Card, EmptyState, PageHeader, Pill, Stat, formatDateTime, activityLabel } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Overview' };

type UpcomingRow = Booking & { clients: Pick<Client, 'id' | 'first_name' | 'last_name' | 'service' | 'website'> | null };
type ActivityRow = Activity & { clients: Pick<Client, 'id' | 'first_name' | 'last_name'> | null };

export default async function OverviewPage() {
  const db = supabaseServer();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const weekAhead = new Date(now.getTime() + 7 * 86_400_000).toISOString();

  const [clients, upcoming, activity, sent7, replies7, drafts, contactCounts, revisits] = await Promise.all([
    db.from('clients').select('id, first_name, last_name, company, stage, created_at, next_step, next_step_at'),
    db
      .from('bookings')
      .select('*, clients(id, first_name, last_name, service, website)')
      .eq('status', 'scheduled')
      .gte('start_at', now.toISOString())
      .lte('start_at', weekAhead)
      .order('start_at')
      .limit(8),
    db
      .from('activities')
      .select('*, clients(id, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(12),
    db.from('messages').select('id', { count: 'exact', head: true }).eq('direction', 'outbound').neq('status', 'draft').gte('created_at', weekAgo),
    db.from('messages').select('id', { count: 'exact', head: true }).eq('direction', 'inbound').gte('created_at', weekAgo),
    db.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    countContactsByStage(db, CONTACT_STAGES.filter((s) => s !== 'client')),
    db
      .from('contacts')
      .select('id, company, first_name, last_name, email, revisit_at')
      .eq('stage', 'nurture')
      .lte('revisit_at', now.toISOString())
      .order('revisit_at')
      .limit(8),
  ]);

  type ClientRow = Pick<Client, 'id' | 'first_name' | 'last_name' | 'company' | 'stage' | 'created_at' | 'next_step' | 'next_step_at'>;
  const rows = (clients.data ?? []) as ClientRow[];
  const newThisWeek = rows.filter((r) => r.created_at >= weekAgo).length;
  const OPEN = new Set(['new', 'call_booked', 'no_show', 'discovery_done', 'proposal_sent', 'negotiation']);
  const open = rows.filter((r) => OPEN.has(r.stage)).length;
  const liveCount = rows.filter((r) => r.stage === 'live').length;

  // Cards per board column: contacts by stage plus clients by stage.
  const perColumn = new Map(
    COLUMNS.map((c) => [
      c.id,
      (c.contactStage ? contactCounts[c.contactStage] ?? 0 : 0) + (c.clientStage ? rows.filter((r) => r.stage === c.clientStage).length : 0),
    ]),
  );

  const endOfToday = new Date(now.getTime() + 86_400_000).toISOString();
  type Due = { key: string; href: string; name: string; what: string; at: string };
  const due: Due[] = [
    ...rows
      .filter((r) => r.next_step_at && r.next_step_at <= endOfToday && !['lost', 'unqualified', 'live'].includes(r.stage))
      .map((r) => ({
        key: `d${r.id}`,
        href: `/admin/clients/${r.id}`,
        name: [r.first_name, r.last_name].filter(Boolean).join(' '),
        what: r.next_step || 'Follow up',
        at: r.next_step_at!,
      })),
    ...((revisits.data ?? []) as Pick<Contact, 'id' | 'company' | 'first_name' | 'last_name' | 'email' | 'revisit_at'>[]).map((c) => ({
      key: `c${c.id}`,
      href: `/admin/outreach/inbox?tab=all&contact=${c.id}`,
      name: c.company || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email,
      what: 'Nurture check-back',
      at: c.revisit_at!,
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));
  const upcomingRows = (upcoming.data ?? []) as UpcomingRow[];

  return (
    <>
      <PageHeader title="Overview" description="Leads, calls and outreach at a glance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="New leads · 7 days" value={newThisWeek} />
        <Stat label="Calls · next 7 days" value={upcomingRows.length} />
        <Stat label="Open pipeline" value={open} hint={`${liveCount} live clients`} />
        <Stat
          label="Outreach replies · 7 days"
          value={replies7.count ?? 0}
          hint={`${sent7.count ?? 0} sent · ${drafts.count ?? 0} AI drafts to review`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card
          title="Upcoming calls"
          className="xl:col-span-2"
          action={<Link href="/admin/calendar" className="font-body text-xs text-brand-cyan hover:underline">Calendar</Link>}
        >
          {upcomingRows.length === 0 ? (
            <EmptyState title="No calls in the next 7 days" body="Bookings from the website calendar and the outreach agent show up here." />
          ) : (
            <ul className="divide-y divide-white/5 -my-2">
              {upcomingRows.map((b) => (
                <li key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-56 shrink-0 font-mono text-xs text-white/75">
                    {formatDateTime(b.start_at, BOOKING_CONFIG.timezone)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {b.clients ? (
                      <Link href={`/admin/clients/${b.clients.id}`} className="font-body text-sm text-white hover:underline">
                        {[b.clients.first_name, b.clients.last_name].filter(Boolean).join(' ')}
                      </Link>
                    ) : null}
                    <p className="font-body text-xs text-white/55 truncate">
                      {b.clients ? serviceLabel(b.clients.service) : ''}
                      {b.clients?.website ? ` · ${b.clients.website}` : ''}
                    </p>
                  </div>
                  {b.meeting_url ? (
                    <a
                      href={b.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-body text-xs text-brand-cyan hover:underline"
                    >
                      <Video size={14} aria-hidden /> Join
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Pipeline"
          action={<Link href="/admin/pipeline" className="font-body text-xs text-brand-cyan hover:underline">Open board</Link>}
        >
          <ul className="flex flex-col gap-4">
            {PHASES.map((p) => {
              const cols = COLUMNS.filter((c) => c.phase === p.id);
              const total = cols.reduce((n, c) => n + (perColumn.get(c.id) ?? 0), 0);
              return (
                <li key={p.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-body text-sm font-medium text-white">{p.label}</span>
                    <span className="font-mono text-sm text-white tabular-nums">{total.toLocaleString()}</span>
                  </div>
                  <p className="mt-0.5 font-body text-xs text-white/55 leading-relaxed">
                    {cols
                      .filter((c) => (perColumn.get(c.id) ?? 0) > 0)
                      .map((c) => `${c.label}: ${(perColumn.get(c.id) ?? 0).toLocaleString()}`)
                      .join(', ') || 'Empty'}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Follow-ups due" action={<span className="font-mono text-xs text-white/60 tabular-nums">{due.length}</span>}>
          {due.length === 0 ? (
            <EmptyState title="Nothing due" body="Next steps on deals and nurture check-back dates land here when they come due." />
          ) : (
            <ul className="divide-y divide-white/5 -my-2">
              {due.slice(0, 10).map((d) => (
                <li key={d.key} className="py-2.5">
                  <Link href={d.href} className="font-body text-sm text-white hover:underline">{d.name}</Link>
                  <p className="font-body text-xs text-white/60">
                    {d.what}, <span className={d.at < now.toISOString() ? 'text-amber-300' : ''}>{formatDateTime(d.at)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent activity" className="xl:col-span-2">
          {(activity.data ?? []).length === 0 ? (
            <EmptyState title="Nothing yet" body="Bookings, stage changes and notes appear here." />
          ) : (
            <ul className="divide-y divide-white/5 -my-2">
              {((activity.data ?? []) as ActivityRow[]).map((a) => (
                <li key={a.id} className="py-2.5 flex flex-col items-start sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="sm:w-40 shrink-0 font-mono text-[11px] text-white/55">
                    {formatDateTime(a.created_at)}
                  </span>
                  <Pill tone={a.type.startsWith('booking') ? 'cyan' : a.type === 'note' ? 'neutral' : 'purple'}>
                    {activityLabel(a.type)}
                  </Pill>
                  <span className="font-body text-sm text-white/85 min-w-0">
                    {a.clients ? (
                      <Link href={`/admin/clients/${a.clients.id}`} className="text-white hover:underline">
                        {[a.clients.first_name, a.clients.last_name].filter(Boolean).join(' ')}
                      </Link>
                    ) : null}
                    {a.clients ? ' · ' : ''}
                    {a.body}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <p className="mt-6 font-body text-xs text-white/55">
        Times shown in {BOOKING_CONFIG.timezone.replace('_', ' ')}.
      </p>
    </>
  );
}
