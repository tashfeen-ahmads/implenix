import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Moon,
  Sun,
  AlertTriangle,
  Clock,
  Phone,
  CalendarCheck,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CodeWindow } from '@/components/common/CodeWindow';
import { DividedStats } from '@/components/common/DividedStats';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, articleSchema, serviceSchema } from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '24/7 AI Receptionist | Round-the-Clock Coverage | Implenix',
  description:
    '24/7 AI receptionist that answers, qualifies, and books every call, nights, weekends, holidays. No premium for after-hours coverage.',
  path: '/24-7-ai-receptionist',
});

const FAQS = [
  {
    question: 'What is a 24/7 AI receptionist?',
    answer:
      'A 24/7 AI receptionist answers your inbound business calls continuously, every hour, every day, including nights, weekends, and holidays. It does not sleep, take breaks, or charge a premium for after-hours coverage.',
  },
  {
    question: 'Why does 24/7 coverage matter?',
    answer:
      'Most local-business inbound happens during peak hours when staff cannot pick up, and 30-50% of bookings actually come from outside business hours. After-hours emergencies (HVAC outages, plumbing leaks, vet emergencies) cannot wait for the next business day, the first business to answer wins.',
  },
  {
    question: 'Is there a premium for after-hours coverage?',
    answer:
      'No. Implenix is a fixed monthly cost regardless of when calls come in. Traditional answering services charge premium rates (often 2-3x) for after-hours coverage. The AI runs continuously at the same price.',
  },
  {
    question: 'Can it handle emergency calls overnight?',
    answer:
      'Yes. We define your urgent-criteria rules during onboarding. Emergency calls trigger live transfer to your on-call line, dispatch software, or escalation path within seconds, even at 2 AM.',
  },
  {
    question: 'Will customers know it is AI rather than a human at midnight?',
    answer:
      'For routine bookings and qualification calls, most customers do not realize. Late-night callers often appreciate getting an answer at all rather than voicemail.',
  },
  {
    question: 'Does it slow down at peak hours?',
    answer:
      'No. Concurrent capacity is unbounded, a hundred simultaneous callers all get answered in under one ring. Storm-driven spikes, lunch-rush concurrency, and holiday surges do not break the system.',
  },
];

const COVERAGE_BLOCKS = [
  {
    Icon: Sun,
    label: 'Business hours',
    note: 'Concurrent capacity for peak hours so the front desk stops dropping calls during lunch rushes and storm seasons.',
  },
  {
    Icon: Moon,
    label: 'After hours',
    note: '30-50% of typical SMB bookings happen outside business hours. The AI captures all of them at no premium upcharge.',
  },
  {
    Icon: AlertTriangle,
    label: 'Overnight emergencies',
    note: 'Urgent-criteria rules trigger live transfer to your on-call line within seconds. No "leave a message and we will call back" voicemail.',
  },
  {
    Icon: Clock,
    label: 'Weekends and holidays',
    note: 'Saturdays, Sundays, and holidays are continuous coverage at the same fixed price. No double-time rates.',
  },
];

export default function TwentyFourSevenAIReceptionistPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: '24/7 AI Receptionist',
            description:
              '24/7 AI receptionist for round-the-clock inbound call coverage with no after-hours premium.',
            url: '/24-7-ai-receptionist',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: '24/7 AI Receptionist',
            description:
              'Round-the-clock AI receptionist coverage at fixed monthly cost.',
            serviceType: '24/7 AI Receptionist',
            url: '/24-7-ai-receptionist',
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'AI Receptionist', href: '/' },
              { label: '24/7 Coverage', href: '/24-7-ai-receptionist' },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label="24/7 · Round the clock" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
                <span className="text-brand-violet">24/7 AI receptionist</span>{' '}
every call, every hour.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Most after-hours calls go to voicemail and never call back.
                Implenix answers them all, overnight emergencies, weekend
                bookings, holiday inquiries, at the same fixed monthly cost
                as business-hours coverage.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="247-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my missed-call audit <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/try-it"
                  data-cta-location="247-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  Test Ron now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="Why 24/7 matters"
            title="The hours your business does not cover are the hours pipeline disappears"
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <CoverageDial />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-4 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              <p>
                A typical local business covers{' '}
                <span className="text-brand-cyan">40-50 hours</span> of
                phone time a week with staff or owner. The other{' '}
                <span className="text-brand-violet">118-128 hours</span>{' '}
                go to voicemail or get screened by an answering service
                that charges premium rates for after-hours work.
              </p>
              <p>
                The economics never quite work, voicemail loses callers
                outright, and after-hours premium billing makes a{' '}
                $300/month service feel like $900/month by month-end.
              </p>
              <p>
                A 24/7 AI receptionist runs continuously at{' '}
                <span className="text-white font-medium">fixed monthly
                cost</span>. Same agent handles a 9 AM booking, a
                Saturday quote, an 11 PM emergency dispatch, a Sunday
                morning reschedule, no time-of-day surcharge. For HVAC,
                plumbing, electrical, roofing, and vet operators where
                after-hours dominates the profile, 24/7 stops being
                nice-to-have and becomes the entire reason to deploy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Hear it"
            title="A 2:14 AM call that would have been voicemail"
            description="Tuesday overnight, HVAC line. The agent picks up before voicemail engages, qualifies the urgency, and dispatches the on-call tech in under a minute."
            badgeVariant="purple"
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <CodeWindow
                title="overnight-call.log"
                lines={[
                  { ts: '02:14', speaker: 'system', text: 'Inbound · Tuesday 2:14am · After-hours · Answered in 0 rings' },
                  { ts: '02:14', speaker: 'agent', text: "Northside HVAC, this is Ron. Are you having a heating or cooling problem right now?" },
                  { ts: '02:14', speaker: 'caller', text: "Furnace stopped, kids' bedroom is freezing." },
                  { ts: '02:14', speaker: 'agent', text: "I'm sorry, that's exactly what we cover for after-hours emergency. I'll dispatch our on-call tech. Address?" },
                  { ts: '02:14', speaker: 'caller', text: '4412 Maple, Northside.' },
                  { ts: '02:15', speaker: 'agent', text: "Got it. Mike is on call and en route, ETA about 45 minutes. I've sent you a confirmation text. Anything else right now?" },
                  { ts: '02:15', speaker: 'caller', text: 'No, thanks for picking up.' },
                  { ts: '02:15', speaker: 'system', text: 'Call ended · 53s · Tech dispatched · CRM updated · No after-hours premium charged' },
                ]}
                caption="2:14am dispatch · On voicemail this caller would have called the next HVAC company on Google"
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="border border-brand-purple/25 bg-brand-dark p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ The hours your business does not cover
                </span>
                <p className="mt-3 font-body text-white/85 text-sm leading-relaxed">
                  A typical local business covers 40-50 phone hours a week.
                  The other 118-128 hours go to voicemail. The AI runs the
                  same script at 2pm, 2am, Sunday brunch, and Christmas
                  morning at the same fixed price.
                </p>
              </div>
              <div className="border border-brand-cyan/25 bg-black p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet">
                  ▸ After-hours premium
                </span>
                <p className="mt-3 font-heading text-3xl text-white leading-tight">
                  $0
                </p>
                <p className="mt-2 font-body text-white/70 text-sm">
                  No 2x or 3x upcharge for nights, weekends, or holidays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Coverage profile"
            title="The four hour bands an AI receptionist actually covers"
            description="All four are continuous, all four are billed the same."
            badgeVariant="purple"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {COVERAGE_BLOCKS.map((b) => (
              <article
                key={b.label}
                className="bg-black border border-brand-purple/20 p-5 flex flex-col gap-3"
              >
                <span className="w-9 h-9 border border-brand-cyan/30 bg-brand-dark flex items-center justify-center">
                  <b.Icon size={16} className="text-brand-cyan" />
                </span>
                <p className="font-heading text-white text-base">{b.label}</p>
                <p className="text-xs font-body text-white/65 leading-relaxed">
                  {b.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="What 24/7 actually moves"
            title="Numbers from the deployment portfolio"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '30-50%', label: 'of bookings happen outside business hours' },
                { number: '92%', label: 'after-hours emergency capture rate (HVAC / plumbing)' },
                { number: '$0', label: 'after-hours premium with Implenix' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="24/7 coverage questions" />
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {FAQS.map((f) => (
              <div
                key={f.question}
                className="border border-brand-purple/20 bg-black p-6"
              >
                <p className="font-heading text-white text-lg">{f.question}</p>
                <p className="mt-3 font-body text-sm text-white/75 leading-relaxed">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <Badge label="Stop missing 11 PM emergencies" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              See what your after-hours pipeline is worth.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. We estimate your specific after-hours
              capture opportunity based on industry call patterns.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="247-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="247-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              See pricing
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent
            topic="Keep reading"
            type="resource"
            links={[
              { href: '/', label: 'How Implenix answers your calls' },
              {
                href: '/ai-receptionist-vs-answering-service',
                label: 'AI Receptionist vs Answering Service',
              },
              {
                href: '/ai-receptionist-for-hvac-companies',
                label: 'For HVAC: 24/7 emergency dispatch',
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}

// Coverage dial, SVG donut showing the 40 vs 128 hour split (typical
// SMB covered hours vs uncovered hours in a week). Cyan slice = covered
// by staff, purple slice = uncovered by staff (where AI takes over).
function CoverageDial() {
  const covered = 45;
  const total = 168;
  const uncovered = total - covered;
  const coveredPct = (covered / total) * 100;
  const uncoveredPct = (uncovered / total) * 100;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const coveredDash = (coveredPct / 100) * circumference;
  const uncoveredDash = (uncoveredPct / 100) * circumference;

  return (
    <div className="relative w-full max-w-[300px] aspect-square">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="24"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#3dfaff"
          strokeWidth="24"
          strokeDasharray={`${coveredDash} ${circumference}`}
          strokeLinecap="butt"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#bb00ff"
          strokeWidth="24"
          strokeDasharray={`${uncoveredDash} ${circumference}`}
          strokeDashoffset={-coveredDash}
          strokeLinecap="butt"
          opacity="0.75"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
          Hours per week
        </span>
        <span className="font-heading text-5xl text-white leading-none">
          168
        </span>
      </div>
      <div className="absolute -bottom-2 left-0 right-0 flex justify-between gap-3 font-mono text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-brand-cyan" />
          <span className="text-brand-cyan">45 hrs staff</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-brand-purple opacity-75" />
          <span className="text-brand-violet">123 hrs AI</span>
        </div>
      </div>
    </div>
  );
}
