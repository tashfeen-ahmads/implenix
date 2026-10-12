import Link from 'next/link';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import { BOOKING_CONFIG, zonedTime } from '@/lib/googleCalendar';
import { serviceLabel, type Booking, type Client } from '@/lib/db/types';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendar' };

type Row = Booking & { clients: Pick<Client, 'id' | 'first_name' | 'last_name' | 'service'> | null };

const TZ = BOOKING_CONFIG.timezone;
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }); // YYYY-MM-DD
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseMonth(param: string | undefined): { y: number; m: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(param ?? '');
  if (match) return { y: Number(match[1]), m: Number(match[2]) };
  const [y, m] = dayKey.format(new Date()).split('-').map(Number);
  return { y, m };
}

const monthParam = (y: number, m: number) => {
  const d = new Date(Date.UTC(y, m - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export default async function CalendarPage({ searchParams }: { searchParams: { month?: string } }) {
  const { y, m } = parseMonth(searchParams.month);
  const start = zonedTime(y, m, 1, 0, TZ);
  const next = new Date(Date.UTC(y, m, 1));
  const end = zonedTime(next.getUTCFullYear(), next.getUTCMonth() + 1, 1, 0, TZ);

  const { data } = await supabaseServer()
    .from('bookings')
    .select('*, clients(id, first_name, last_name, service)')
    .gte('start_at', start.toISOString())
    .lt('start_at', end.toISOString())
    .neq('status', 'cancelled')
    .order('start_at');
  const rows = (data ?? []) as Row[];

  const byDay = new Map<string, Row[]>();
  for (const r of rows) {
    const k = dayKey.format(new Date(r.start_at));
    byDay.set(k, [...(byDay.get(k) ?? []), r]);
  }

  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const today = dayKey.format(new Date());
  const cells: (string | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${y}-${String(m).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`),
  ];
  while (cells.length % 7) cells.push(null);

  const title = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
  const upcoming = rows.filter((r) => r.start_at >= new Date().toISOString() && r.status === 'scheduled');
  const name = (r: Row) => (r.clients ? [r.clients.first_name, r.clients.last_name].filter(Boolean).join(' ') : 'Unknown');

  return (
    <>
      <PageHeader
        title="Calendar"
        description={`Calls booked through the website and the outreach agent. Times in ${TZ.replace('_', ' ')}.`}
        actions={
          <nav aria-label="Month" className="flex items-center gap-2">
            <Link href={`/admin/calendar?month=${monthParam(y, m - 1)}`} className={buttonClass('secondary')} aria-label="Previous month">
              <ChevronLeft size={16} aria-hidden />
            </Link>
            <span className="min-w-36 text-center font-body text-sm font-semibold">{title}</span>
            <Link href={`/admin/calendar?month=${monthParam(y, m + 1)}`} className={buttonClass('secondary')} aria-label="Next month">
              <ChevronRight size={16} aria-hidden />
            </Link>
            <Link href="/admin/calendar" className={buttonClass('ghost')}>Today</Link>
          </nav>
        }
      />

      {/* Month grid, from md up. Phones get the agenda list only. */}
      <div className="hidden md:block border border-white/10 rounded-md overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/10">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 font-mono text-[11px] uppercase tracking-widest text-white/55">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((k, i) => {
            const events = k ? byDay.get(k) ?? [] : [];
            return (
              <div
                key={k ?? `pad-${i}`}
                className={`min-h-28 border-b border-r border-white/5 p-1.5 ${k ? '' : 'bg-white/[0.015]'}`}
              >
                {k ? (
                  <p
                    className={`mb-1 w-6 h-6 flex items-center justify-center rounded-full font-mono text-xs ${
                      k === today ? 'bg-brand-purple text-white' : 'text-white/60'
                    }`}
                  >
                    {Number(k.slice(-2))}
                  </p>
                ) : null}
                <ul className="flex flex-col gap-1">
                  {events.slice(0, 4).map((r) => (
                    <li key={r.id}>
                      <Link
                        href={r.clients ? `/admin/clients/${r.clients.id}` : '#'}
                        className={`block truncate rounded-sm px-1.5 py-1 font-body text-[11px] leading-tight hover:opacity-90 ${
                          r.status === 'scheduled' ? 'bg-brand-purple/25 text-white' : 'bg-white/5 text-white/60 line-through'
                        }`}
                      >
                        {timeFmt.format(new Date(r.start_at))} {name(r)}
                      </Link>
                    </li>
                  ))}
                  {events.length > 4 ? (
                    <li className="px-1.5 font-body text-[11px] text-white/55">+{events.length - 4} more</li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <Card title={`Upcoming this month (${upcoming.length})`} className="mt-6">
        {upcoming.length === 0 ? (
          <EmptyState title="No upcoming calls this month" />
        ) : (
          <ol className="flex flex-col gap-5">
            {[...new Set(upcoming.map((r) => dayKey.format(new Date(r.start_at))))].map((k) => (
              <li key={k}>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/60">
                  {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
                    new Date(`${k}T12:00:00Z`),
                  )}
                </h3>
                <ul className="mt-2 divide-y divide-white/5">
                  {upcoming
                    .filter((r) => dayKey.format(new Date(r.start_at)) === k)
                    .map((r) => (
                      <li key={r.id} className="py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="w-20 font-mono text-xs text-white">{timeFmt.format(new Date(r.start_at))}</span>
                        <span className="flex-1 min-w-40">
                          {r.clients ? (
                            <Link href={`/admin/clients/${r.clients.id}`} className="font-body text-sm text-white hover:underline">
                              {name(r)}
                            </Link>
                          ) : name(r)}
                          <span className="font-body text-xs text-white/55">
                            {r.clients ? ` · ${serviceLabel(r.clients.service)}` : ''}
                          </span>
                        </span>
                        {r.meeting_url ? (
                          <a href={r.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-body text-xs text-brand-cyan hover:underline">
                            <Video size={14} aria-hidden /> Join
                          </a>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}
