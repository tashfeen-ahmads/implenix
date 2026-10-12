import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { LOST_REASONS, type Campaign, type ContactList } from '@/lib/db/types';
import { REPLY_LABELS } from '@/lib/pipeline/stages';
import { Card, EmptyState, PageHeader, Stat, TableWrap, buttonClass, inputClass, tdClass, thClass } from '@/components/admin/ui';
import { formatMoney } from '@/components/admin/pipeline/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Funnel · Outreach' };

// Shape of public.outreach_funnel() (supabase/migrations/20261015000000_pipeline_funnel.sql).
type Metrics = {
  contacted: number;
  emails: number;
  delivered: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  opened: number;
  clicked: number;
  replied: number;
  positive: number;
  booked: number;
  showed: number;
  proposal: number;
  won: number;
};
type Keyed = Metrics & { key: string | null };
type StepRow = {
  campaign_id: string;
  step_number: number;
  variant: 'A' | 'B';
  sent: number;
  bounced: number;
  opened: number;
  clicked: number;
  replied: number;
};
type Funnel = {
  totals: Partial<Metrics>;
  by_campaign: Keyed[];
  by_list: Keyed[];
  by_industry: Keyed[];
  by_week: Keyed[];
  by_step: StepRow[];
  labels: { key: string; count: number }[];
  lost_reasons: { key: string; count: number }[];
  revenue: { won_clients: number; setup_fees: number; monthly: number };
};

const RANGES = [
  { id: '30', label: '30 days', days: 30 },
  { id: '90', label: '90 days', days: 90 },
  { id: '365', label: '12 months', days: 365 },
  { id: 'all', label: 'All time', days: null },
] as const;

// Validated against the dark chart surface (dataviz validate_palette.js):
// single-series bars use A; the A/B comparison uses A and B.
const BAR_A = '#b14cff';
const BAR_B = '#119fb2';

const pct = (part: number, whole: number) => {
  if (!whole) return '0%';
  const p = (part / whole) * 100;
  return `${p > 0 && p < 10 ? p.toFixed(1) : Math.round(p)}%`;
};
const n = (v: number | undefined) => (v ?? 0).toLocaleString();

export default async function FunnelPage({ searchParams }: { searchParams: { range?: string; campaign?: string } }) {
  const range = RANGES.find((r) => r.id === searchParams.range) ?? RANGES[1];
  const since = range.days ? new Date(Date.now() - range.days * 86_400_000).toISOString() : null;
  const db = supabaseServer();
  const [campaignsRes, listsRes] = await Promise.all([
    db.from('campaigns').select('id, name, kind, track_opens').order('created_at', { ascending: false }),
    db.from('contact_lists').select('id, name'),
  ]);
  const campaigns = (campaignsRes.data ?? []) as Pick<Campaign, 'id' | 'name' | 'kind' | 'track_opens'>[];
  const campaignId = campaigns.some((c) => c.id === searchParams.campaign) ? searchParams.campaign! : null;
  const { data, error } = await db.rpc('outreach_funnel', { p_since: since, p_campaign: campaignId });
  const f = data as Funnel | null;

  const campaignName = new Map(campaigns.map((c) => [c.id, c.name]));
  const listName = new Map(((listsRes.data ?? []) as Pick<ContactList, 'id' | 'name'>[]).map((l) => [l.id, l.name]));
  const tracking = campaigns.some((c) => c.track_opens && (!campaignId || c.id === campaignId));

  const header = (
    <PageHeader
      title="Funnel"
      description="Each prospect counts once per campaign, from first email to won deal. Use it to see where leads drop and which campaigns, lists and email variants earn replies."
    />
  );
  const filters = (
    <form method="get" className="mb-6 flex flex-col sm:flex-row sm:items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-range" className="font-body text-xs font-medium text-white/80">Period</label>
        <select id="f-range" name="range" defaultValue={range.id} className={`${inputClass} sm:w-40`}>
          {RANGES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-campaign" className="font-body text-xs font-medium text-white/80">Campaign</label>
        <select id="f-campaign" name="campaign" defaultValue={campaignId ?? ''} className={`${inputClass} sm:w-72`}>
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.kind === 'nurture' ? ' (nurture)' : ''}</option>
          ))}
        </select>
      </div>
      <button type="submit" className={buttonClass('secondary', 'sm:self-end')}>Apply</button>
    </form>
  );

  if (error || !f) {
    return (
      <>
        {header}
        {filters}
        <p role="alert" className="font-body text-sm text-red-300">
          Could not load the funnel{error ? `: ${error.message}` : ''}. Check that migration 20261015000000_pipeline_funnel.sql has been applied.
        </p>
      </>
    );
  }

  const t = { contacted: 0, emails: 0, delivered: 0, bounced: 0, complained: 0, unsubscribed: 0, opened: 0, clicked: 0, replied: 0, positive: 0, booked: 0, showed: 0, proposal: 0, won: 0, ...f.totals };
  if (!t.contacted) {
    return (
      <>
        {header}
        {filters}
        <EmptyState title="No emails sent in this period" body="Launch a campaign or pick a longer period. The funnel fills in as emails go out and people reply." />
      </>
    );
  }

  const stages: { key: keyof Metrics; label: string; hint: string; hide?: boolean }[] = [
    { key: 'contacted', label: 'Contacted', hint: 'Got at least one email' },
    { key: 'delivered', label: 'Delivered', hint: 'Did not bounce' },
    { key: 'opened', label: 'Opened', hint: 'Tracked campaigns only; Apple Mail inflates this', hide: !tracking },
    { key: 'replied', label: 'Replied', hint: 'Wrote back (auto-replies excluded)' },
    { key: 'positive', label: 'Positive', hint: 'Interested, asked for times, or booked' },
    { key: 'booked', label: 'Booked a call', hint: 'Has a booking on the calendar' },
    { key: 'showed', label: 'Showed up', hint: 'Call marked completed' },
    { key: 'proposal', label: 'Proposal', hint: 'Reached Proposal sent or later' },
    { key: 'won', label: 'Won', hint: 'Onboarding, building or live' },
  ];
  const shown = stages.filter((s) => !s.hide);

  // Health, against common cold-email thresholds.
  const bounceRate = t.bounced / t.contacted;
  const complaintRate = t.complained / t.contacted;
  const health = [
    { label: 'Bounce rate', value: pct(t.bounced, t.contacted), bad: bounceRate > 0.02, rule: 'Keep under 2%. Verify lists before importing.' },
    { label: 'Complaint rate', value: pct(t.complained, t.contacted), bad: complaintRate > 0.001, rule: 'Keep under 0.1%. Above 0.3% SES may pause sending.' },
    { label: 'Unsubscribe rate', value: pct(t.unsubscribed, t.contacted), bad: t.unsubscribed / t.contacted > 0.02, rule: 'Above 2% usually means the list or message is off-target.' },
  ];

  const rowsFor = (rows: Keyed[], name: (k: string | null) => string) =>
    [...rows].sort((a, b) => b.contacted - a.contacted).map((r) => ({ ...r, name: name(r.key) }));

  // A/B: compare reply rate per step when the step has both variants.
  const steps = new Map<string, { campaign_id: string; step_number: number; A?: StepRow; B?: StepRow }>();
  for (const r of f.by_step) {
    const k = `${r.campaign_id}:${r.step_number}`;
    const e = steps.get(k) ?? { campaign_id: r.campaign_id, step_number: r.step_number };
    e[r.variant] = r;
    steps.set(k, e);
  }
  const stepRows = [...steps.values()].sort(
    (a, b) => (campaignName.get(a.campaign_id) ?? '').localeCompare(campaignName.get(b.campaign_id) ?? '') || a.step_number - b.step_number,
  );

  return (
    <>
      {header}
      {filters}

      <section aria-label="Headline numbers" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Prospects contacted" value={n(t.contacted)} hint={`${n(t.emails)} emails sent`} />
        <Stat label="Reply rate" value={pct(t.replied, t.contacted)} hint={`${n(t.replied)} replied, ${pct(t.positive, t.replied)} of them positive`} />
        <Stat label="Calls booked" value={n(t.booked)} hint={`${pct(t.booked, t.contacted)} of contacted, ${n(t.showed)} showed`} />
        <Stat
          label="Won from outreach"
          value={n(f.revenue.won_clients)}
          hint={`${formatMoney(Number(f.revenue.setup_fees))} setup + ${formatMoney(Number(f.revenue.monthly))}/mo`}
        />
      </section>

      <div className="grid gap-6 grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card title="Funnel">
          <ol className="flex flex-col gap-3">
            {shown.map((s, i) => {
              const v = t[s.key];
              const prev = i ? t[shown[i - 1].key] : v;
              const width = t.contacted ? Math.max(v ? 0.6 : 0, (v / t.contacted) * 100) : 0;
              return (
                <li key={s.key} className="grid grid-cols-[7.5rem_minmax(0,1fr)_4.5rem] sm:grid-cols-[9rem_minmax(0,1fr)_6rem] items-center gap-3">
                  <span className="font-body text-sm text-white/85" title={s.hint}>{s.label}</span>
                  <span className="relative h-5" title={`${s.label}: ${n(v)} (${pct(v, t.contacted)} of contacted)`}>
                    <span
                      className="absolute inset-y-0 left-0 rounded-r-[4px]"
                      style={{ width: `${width}%`, background: BAR_A }}
                      aria-hidden
                    />
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-sm text-white tabular-nums">{n(v)}</span>
                    <span className="block font-body text-[11px] text-white/55 tabular-nums">{i ? `${pct(v, prev)} of prev` : '100%'}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 font-body text-xs text-white/55">
            Bar length is the share of everyone contacted. The small figure is conversion from the step above, so the biggest drop is where to work next.
            {!tracking ? ' Opens are hidden because no campaign in view tracks them.' : ''}
          </p>
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="List health">
            <ul className="flex flex-col gap-3">
              {health.map((h) => (
                <li key={h.label} className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-body text-sm text-white/85">{h.label}</span>
                    <span className="block font-body text-xs text-white/55">{h.rule}</span>
                  </span>
                  <span className={`shrink-0 font-mono text-sm tabular-nums ${h.bad ? 'text-amber-300' : 'text-white'}`}>
                    {h.value}
                    {h.bad ? <span className="block font-body text-[11px] text-amber-300">Too high</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="What replies said">
            <Breakdown
              rows={f.labels.map((l) => ({ label: l.key === 'unlabelled' ? 'Not classified' : REPLY_LABELS[l.key] ?? l.key, count: l.count }))}
              empty="No replies in this period."
            />
          </Card>
          <Card title="Why deals were lost">
            <Breakdown
              rows={f.lost_reasons.map((l) => ({
                label: l.key === 'not_set' ? 'No reason given' : LOST_REASONS.find((r) => r.value === l.key)?.label ?? l.key,
                count: l.count,
              }))}
              empty="No lost deals in this period."
            />
          </Card>
        </div>
      </div>

      {!campaignId ? (
        <BreakdownTable
          title="By campaign"
          rows={rowsFor(f.by_campaign, (k) => (k ? campaignName.get(k) ?? 'Deleted campaign' : 'Unknown'))}
          link={(k) => (k ? `/admin/outreach/funnel?range=${range.id}&campaign=${k}` : null)}
        />
      ) : null}

      <Card title="Sequence steps and A/B tests" className="mt-6">
        {stepRows.length === 0 ? (
          <EmptyState title="No sequence emails in this period" />
        ) : (
          <TableWrap label="Results per step and variant">
            <thead>
              <tr>
                <th scope="col" className={thClass}>Step</th>
                <th scope="col" className={thClass}>Variant</th>
                <th scope="col" className={`${thClass} text-right`}>Sent</th>
                {tracking ? <th scope="col" className={`${thClass} text-right`}>Opened</th> : null}
                <th scope="col" className={`${thClass} text-right`}>Replies</th>
                <th scope="col" className={thClass}>Reply rate</th>
                <th scope="col" className={thClass}>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {stepRows.map((s) => {
                const variants = (['A', 'B'] as const).filter((v) => s[v]);
                const maxRate = Math.max(...variants.map((v) => (s[v]!.sent ? s[v]!.replied / s[v]!.sent : 0)), 0.0001);
                const verdict = abVerdict(s.A, s.B);
                return variants.map((v, i) => {
                  const r = s[v]!;
                  const rate = r.sent ? r.replied / r.sent : 0;
                  return (
                    <tr key={`${s.campaign_id}:${s.step_number}:${v}`}>
                      {i === 0 ? (
                        <td className={tdClass} rowSpan={variants.length}>
                          <span className="text-white">Step {s.step_number}</span>
                          {!campaignId ? <div className="text-xs text-white/55 truncate max-w-[14rem]">{campaignName.get(s.campaign_id) ?? ''}</div> : null}
                        </td>
                      ) : null}
                      <td className={tdClass}>
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-[2px]" style={{ background: v === 'A' ? BAR_A : BAR_B }} aria-hidden />
                          {variants.length > 1 ? `Variant ${v}` : 'Single'}
                        </span>
                      </td>
                      <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(r.sent)}</td>
                      {tracking ? <td className={`${tdClass} text-right font-mono tabular-nums`}>{pct(r.opened, r.sent)}</td> : null}
                      <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(r.replied)}</td>
                      <td className={`${tdClass} min-w-[10rem]`}>
                        <span className="flex items-center gap-2" title={`${pct(r.replied, r.sent)} reply rate`}>
                          <span className="font-mono text-xs tabular-nums w-10 shrink-0">{pct(r.replied, r.sent)}</span>
                          <span className="relative h-3 flex-1">
                            <span
                              className="absolute inset-y-0 left-0 rounded-r-[4px]"
                              style={{ width: `${(rate / maxRate) * 100}%`, background: v === 'A' ? BAR_A : BAR_B }}
                              aria-hidden
                            />
                          </span>
                        </span>
                      </td>
                      {i === 0 ? (
                        <td className={`${tdClass} text-xs text-white/70`} rowSpan={variants.length}>{verdict}</td>
                      ) : null}
                    </tr>
                  );
                });
              })}
            </tbody>
          </TableWrap>
        )}
        <p className="mt-3 font-body text-xs text-white/55">
          A reply counts toward the last step the person received before replying. Variants are compared on reply rate, never opens.
        </p>
      </Card>

      <div className="grid gap-6 grid-cols-[minmax(0,1fr)] xl:grid-cols-2 mt-6">
        <BreakdownTable title="By contact list" rows={rowsFor(f.by_list, (k) => (k ? listName.get(k) ?? 'Deleted list' : 'No list'))} compact />
        <BreakdownTable title="By industry" rows={rowsFor(f.by_industry, (k) => k ?? 'Unknown')} compact />
      </div>

      <Card title="By week of first email" className="mt-6">
        <TableWrap label="Weekly cohorts">
          <thead>
            <tr>
              <th scope="col" className={thClass}>Week of</th>
              <th scope="col" className={`${thClass} text-right`}>Contacted</th>
              <th scope="col" className={`${thClass} text-right`}>Replied</th>
              <th scope="col" className={`${thClass} text-right`}>Positive</th>
              <th scope="col" className={`${thClass} text-right`}>Booked</th>
              <th scope="col" className={`${thClass} text-right`}>Won</th>
            </tr>
          </thead>
          <tbody>
            {[...f.by_week].reverse().map((w) => (
              <tr key={w.key ?? 'none'}>
                <td className={`${tdClass} whitespace-nowrap`}>
                  {w.key ? new Date(`${w.key}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </td>
                <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(w.contacted)}</td>
                <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(w.replied)} <span className="text-white/50">{pct(w.replied, w.contacted)}</span></td>
                <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(w.positive)}</td>
                <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(w.booked)}</td>
                <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(w.won)}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <p className="mt-3 font-body text-xs text-white/55">Recent weeks fill in as follow-ups go out, so compare weeks that are at least three weeks old.</p>
      </Card>
    </>
  );
}

// Plain-language A/B verdict. Small samples get "too early" rather than a
// false winner.
function abVerdict(a?: StepRow, b?: StepRow): string {
  if (!a || !b) return '';
  const MIN = 50;
  if (a.sent < MIN || b.sent < MIN) return `Too early: wait for ${MIN} sends of each variant.`;
  const ra = a.replied / a.sent;
  const rb = b.replied / b.sent;
  if (ra === rb) return 'No difference yet.';
  const [hi, lo, name] = ra > rb ? [ra, rb, 'A'] : [rb, ra, 'B'];
  const lift = lo ? (hi - lo) / lo : 1;
  if (lift >= 0.3 && a.replied + b.replied >= 10) return `${name} leads by ${Math.round(lift * 100)}%. Consider making it the only version.`;
  return `${name} is slightly ahead; not conclusive yet.`;
}

function Breakdown({ rows, empty }: { rows: { label: string; count: number }[]; empty: string }) {
  if (!rows.length) return <p className="font-body text-sm text-white/55">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2.5rem] items-center gap-3" title={`${r.label}: ${r.count}`}>
          <span className="font-body text-sm text-white/80 truncate">{r.label}</span>
          <span className="relative h-3">
            <span className="absolute inset-y-0 left-0 rounded-r-[4px]" style={{ width: `${(r.count / max) * 100}%`, background: BAR_A }} aria-hidden />
          </span>
          <span className="text-right font-mono text-sm text-white tabular-nums">{r.count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

function BreakdownTable({
  title,
  rows,
  link,
  compact,
}: {
  title: string;
  rows: (Keyed & { name: string })[];
  link?: (k: string | null) => string | null;
  compact?: boolean;
}) {
  return (
    <Card title={title} className={compact ? '' : 'mt-6'}>
      {rows.length === 0 ? (
        <p className="font-body text-sm text-white/55">Nothing in this period.</p>
      ) : (
        <TableWrap label={title}>
          <thead>
            <tr>
              <th scope="col" className={thClass}>Name</th>
              <th scope="col" className={`${thClass} text-right`}>Contacted</th>
              <th scope="col" className={`${thClass} text-right`}>Reply</th>
              <th scope="col" className={`${thClass} text-right`}>Positive</th>
              <th scope="col" className={`${thClass} text-right`}>Booked</th>
              {compact ? null : <th scope="col" className={`${thClass} text-right`}>Won</th>}
              {compact ? null : <th scope="col" className={`${thClass} text-right`}>Bounced</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const href = link?.(r.key);
              return (
                <tr key={r.key ?? 'none'}>
                  <td className={`${tdClass} max-w-[16rem]`}>
                    {href ? (
                      <Link href={href} className="text-white hover:underline">{r.name}</Link>
                    ) : (
                      <span className="text-white">{r.name}</span>
                    )}
                  </td>
                  <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(r.contacted)}</td>
                  <td className={`${tdClass} text-right font-mono tabular-nums`}>{pct(r.replied, r.contacted)}</td>
                  <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(r.positive)}</td>
                  <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(r.booked)}</td>
                  {compact ? null : <td className={`${tdClass} text-right font-mono tabular-nums`}>{n(r.won)}</td>}
                  {compact ? null : (
                    <td className={`${tdClass} text-right font-mono tabular-nums ${r.contacted && r.bounced / r.contacted > 0.02 ? 'text-amber-300' : ''}`}>
                      {pct(r.bounced, r.contacted)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </Card>
  );
}
