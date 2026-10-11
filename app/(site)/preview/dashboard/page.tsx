import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Phone,
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  XCircle,
  PhoneForwarded,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Inside Implenix, Dashboard Preview | Implenix',
  description:
    'Walkthrough of the Implenix dashboard. Revenue captured, cost of doing nothing, conversation replay, configurable handoff.',
  path: '/preview/dashboard',
});

// Mocked dashboard view, pure visual preview, no auth, no real data.
// Lives at /preview/dashboard so prospects can see what they get inside.
const CONVERSATIONS = [
  {
    id: 'c1',
    caller: 'Maria L.',
    summary: 'AC outage · booked for Wed 2-4 PM',
    duration: '0:42',
    when: '12 min ago',
    tag: 'booked' as const,
    value: 1480,
  },
  {
    id: 'c2',
    caller: 'Unknown',
    summary: 'Asked about pricing · qualified · awaiting follow-up',
    duration: '1:18',
    when: '38 min ago',
    tag: 'qualified' as const,
    value: 0,
  },
  {
    id: 'c3',
    caller: 'David K.',
    summary: 'Reschedule · moved to Thu 10 AM',
    duration: '0:21',
    when: '1 hr ago',
    tag: 'booked' as const,
    value: 0,
  },
  {
    id: 'c4',
    caller: '+1 (310) ***-9921',
    summary: 'Cold solicitor · routed to voicemail',
    duration: '0:08',
    when: '2 hr ago',
    tag: 'spam' as const,
    value: 0,
  },
  {
    id: 'c5',
    caller: 'Jordan A.',
    summary: 'Commercial install quote · transferred to Marcus',
    duration: '2:46',
    when: '3 hr ago',
    tag: 'transferred' as const,
    value: 12_400,
  },
];

const HANDOFF_RULES = [
  { label: 'Estimated lead value > $5,000', enabled: true },
  { label: 'Caller mentions "lawsuit" or "attorney"', enabled: true },
  { label: 'VIP phone number on allow-list', enabled: true },
  { label: 'Caller frustration detected (sentiment)', enabled: true },
  { label: 'Service request outside business area', enabled: false },
];

export default function DashboardPreviewPage() {
  return (
    <>
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="max-w-3xl flex flex-col gap-5">
            <Badge label="Inside the product · preview" variant="cyan" />
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
              What you see when you log in.
            </h1>
            <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
              No vanity metrics. No noise. The first thing you see is
              revenue. Then the calls that drove it. Then the rules you
              control.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-12 md:py-16">
          <div className="border border-brand-purple/30 bg-brand-dark">
            <header className="flex items-center justify-between px-5 py-3 border-b border-brand-purple/25">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 bg-brand-purple rounded-full shrink-0" />
                <span className="w-2.5 h-2.5 bg-brand-cyan rounded-full" />
                <span className="w-2.5 h-2.5 bg-white/40 rounded-full" />
                <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-white/55 truncate">
                  app.implenix.net · northwind hvac
                </span>
              </div>
              <span className="hidden md:inline text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
                ▸ Current cycle · live
              </span>
            </header>

            <div className="p-5 md:p-8 grid grid-cols-1 gap-5 min-w-0">
              <RevenueHeroCard />

              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3">
                <SecondaryStat
                  Icon={Phone}
                  label="Calls handled"
                  value="412"
                  delta="+38 vs last month"
                />
                <SecondaryStat
                  Icon={CalendarCheck}
                  label="Appointments booked"
                  value="118"
                  delta="+14 vs last month"
                />
                <SecondaryStat
                  Icon={Clock}
                  label="Hours saved"
                  value="46.3"
                  delta="vs answering yourself"
                />
                <SecondaryStat
                  Icon={PhoneForwarded}
                  label="Live transfers"
                  value="9"
                  delta="all routed correctly"
                />
              </div>

              <CostOfNothingCard />

              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 [&>*]:min-w-0">
                <ConversationsCard />
                <HandoffCard />
              </div>

              <UpsellRow />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-16 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <Badge label="See yours next" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              The numbers above are mock. Yours can be live in 7-14 days.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              Run the audit to see what missed calls cost you, then ship a
              real Implenix deployment against your business.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="dashboard-preview-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="dashboard-preview-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function RevenueHeroCard() {
  return (
    <div className="border-l-[3px] border-brand-cyan bg-black p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
      <div className="min-w-0">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
          ▸ Revenue captured · this month
        </span>
        <p className="font-heading text-[2rem] sm:text-6xl md:text-7xl text-white mt-3 leading-none tabular-nums">
          $147,250
        </p>
        <p className="text-sm font-body text-white/65 mt-3 max-w-md">
          118 appointments × $1,250 average client value · synced to your
          CRM, calendar, and dispatch.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-right shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/55">
          ▸ Trend
        </span>
        <span className="font-heading text-2xl text-brand-cyan">+22.4%</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/45">
          vs last month
        </span>
      </div>
    </div>
  );
}

function SecondaryStat({
  Icon,
  label,
  value,
  delta,
}: {
  Icon: typeof Phone;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="bg-black border border-brand-purple/20 p-4 flex flex-col gap-2">
      <span className="w-8 h-8 border border-brand-cyan/30 bg-brand-dark flex items-center justify-center">
        <Icon size={14} className="text-brand-cyan" />
      </span>
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/55">
        {label}
      </p>
      <p className="font-heading text-2xl text-white leading-none">{value}</p>
      <p className="text-[11px] font-body text-white/55">{delta}</p>
    </div>
  );
}

function CostOfNothingCard() {
  return (
    <div className="border border-white/10 bg-black p-6 grid md:grid-cols-2 gap-6">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/65 border border-white/15 px-2 py-1">
          <AlertTriangle size={11} /> Without Implenix · estimated
        </span>
        <p className="mt-4 font-heading text-3xl md:text-4xl text-white/85 leading-tight">
          You would have missed 184 calls this month
        </p>
        <p className="mt-2 font-body text-white/55 text-sm">
          Costing approximately
        </p>
        <p className="font-heading text-4xl md:text-5xl text-white mt-2 leading-none">
          $58,420
        </p>
        <p className="text-xs font-body text-white/45 mt-2">
          Going to whoever answered first.
        </p>
      </div>
      <div className="border-l border-brand-purple/15 pl-6 flex flex-col gap-3 justify-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
          ▸ Net Implenix impact
        </span>
        <p className="font-heading text-xl text-white leading-snug">
          You captured $147,250 instead of losing $58,420.
        </p>
        <p className="font-body text-sm text-white/65 leading-relaxed">
          Net pickup: <span className="text-brand-cyan font-mono">+$205,670</span> in
          recovered pipeline this month, before counting the hours saved.
        </p>
      </div>
    </div>
  );
}

function ConversationsCard() {
  return (
    <div className="bg-black border border-brand-purple/25">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 border-b border-brand-purple/20">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
          ▸ Conversations · today
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/45">
          5 of 412 · click to replay
        </span>
      </header>
      <ul className="divide-y divide-brand-purple/15">
        {CONVERSATIONS.map((c) => (
          <li
            key={c.id}
            className="px-5 py-3 flex items-start gap-3 hover:bg-brand-dark/40 cursor-pointer transition-colors"
          >
            <TagIcon tag={c.tag} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-body text-sm text-white truncate">
                  {c.caller}
                </p>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/45 shrink-0">
                  {c.when}
                </span>
              </div>
              <p className="text-xs font-body text-white/65 truncate mt-0.5">
                {c.summary}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono uppercase tracking-widest text-white/45">
                <span>{c.duration}</span>
                {c.value > 0 ? (
                  <span className="text-brand-cyan">
                    ▸ {`$${c.value.toLocaleString()}`} attributed
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TagIcon({ tag }: { tag: 'booked' | 'qualified' | 'spam' | 'transferred' }) {
  if (tag === 'booked')
    return <CheckCircle2 size={16} className="text-brand-cyan mt-0.5 shrink-0" />;
  if (tag === 'qualified')
    return <CircleDot size={16} className="text-brand-purple mt-0.5 shrink-0" />;
  if (tag === 'transferred')
    return <PhoneForwarded size={16} className="text-brand-cyan mt-0.5 shrink-0" />;
  return <XCircle size={16} className="text-white/30 mt-0.5 shrink-0" />;
}

function HandoffCard() {
  return (
    <div className="bg-black border border-brand-purple/25">
      <header className="flex items-center justify-between px-5 py-3 border-b border-brand-purple/20">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
          <ShieldCheck size={11} /> Handoff to human
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/45">
          rules · {HANDOFF_RULES.filter((r) => r.enabled).length}/
          {HANDOFF_RULES.length}
        </span>
      </header>
      <ul className="px-5 py-4 flex flex-col gap-3">
        {HANDOFF_RULES.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between gap-3 text-sm font-body"
          >
            <span className={r.enabled ? 'text-white' : 'text-white/45'}>
              {r.label}
            </span>
            <span
              className={`text-[10px] font-mono uppercase tracking-widest border px-2 py-0.5 ${
                r.enabled
                  ? 'border-brand-cyan/40 text-brand-cyan'
                  : 'border-white/15 text-white/45'
              }`}
            >
              {r.enabled ? 'On' : 'Off'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpsellRow() {
  const items = [
    {
      title: 'Outbound follow-up calls',
      body: '23 unbooked leads sitting · enable outbound to recover them.',
      cta: 'Add Outbound · +$197/mo',
    },
    {
      title: 'SMS follow-up sequences',
      body: 'Queue text reminders before, during, and after appointments.',
      cta: 'Add SMS · +$99/mo',
    },
    {
      title: 'Branded voice cloning',
      body: 'Replace Ron with your own voice · premium tier.',
      cta: 'Upgrade · contact sales',
    },
  ];
  return (
    <div className="border border-brand-purple/15 bg-black">
      <header className="flex items-center justify-between px-5 py-3 border-b border-brand-purple/15">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
          ▸ Add to your plan
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/45">
          surfaced based on usage
        </span>
      </header>
      <ul className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-brand-purple/15">
        {items.map((it) => (
          <li key={it.title} className="p-5 flex flex-col gap-3">
            <p className="font-heading text-white text-sm">{it.title}</p>
            <p className="text-xs font-body text-white/65 leading-relaxed flex-1">
              {it.body}
            </p>
            <span className="self-start text-[10px] font-mono uppercase tracking-widest text-brand-cyan border border-brand-cyan/40 px-2 py-1">
              {it.cta}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
