import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Phone,
  Clock,
  CalendarCheck,
  Database,
  PhoneForwarded,
  TrendingUp,
  Shield,
  Globe2,
  Users,
  DollarSign,
  Zap,
  Heart,
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
  title: '12 Benefits of AI Receptionist (Real Numbers) | Implenix',
  description:
    '12 measurable benefits of an AI receptionist, cost savings, capture rate, after-hours coverage, real ROI math, with backing numbers from deployments.',
  path: '/benefits-of-ai-receptionist',
});

const FAQS = [
  {
    question: 'What is the biggest benefit of an AI receptionist?',
    answer:
      'For most local businesses, it is recovered missed-call pipeline. The typical SMB loses $5,000-$30,000/month to unanswered calls; the AI captures most of that at fixed cost. The cost reduction vs hiring is also substantial but secondary to the lost-revenue recovery.',
  },
  {
    question: 'Is the ROI actually measurable?',
    answer:
      'Yes. Booking volume, after-hours capture rate, response time, no-show rate, and revenue attribution all flow back through your CRM and reporting. Most businesses see net-positive ROI within 30 days of go-live.',
  },
  {
    question: 'Can a small business benefit from this?',
    answer:
      'Especially small businesses. Solo operators and small teams gain the most because their bottleneck is their own phone time. The AI runs the routine work so the owner can do the actual job.',
  },
  {
    question: 'What about the human element, does that get lost?',
    answer:
      'Live transfer rules route the calls that genuinely need human warmth to a real person in real time. The AI handles the 80-90% of routine inbound where speed and consistency matter more than empathy.',
  },
  {
    question: 'How do these benefits compare across industries?',
    answer:
      'The shape is consistent: lost-pipeline recovery, after-hours capture, reduced labor on phone, faster response time. The magnitude varies, high-ticket industries (law, mortgage, real estate) see larger dollar gains; high-volume industries (HVAC, dental, salons) see larger time savings.',
  },
];

const BENEFITS = [
  {
    Icon: TrendingUp,
    headline: '+38% qualified bookings inside 30 days',
    title: 'Recover the missed-call pipeline',
    description:
      'The typical SMB misses 40-60% of inbound calls during business hours. The AI captures that recovered demand and books it directly into your calendar.',
  },
  {
    Icon: Clock,
    headline: '24/7 coverage at no premium',
    title: 'Answer every after-hours call',
    description:
      'No upcharge for nights, weekends, or holidays. Most deployments see 30-50% of bookings come from outside business hours within the first quarter.',
  },
  {
    Icon: DollarSign,
    headline: '$40K+ annualized savings vs hiring',
    title: 'Skip the receptionist hire',
    description:
      'A full-time receptionist runs $50K-$82K/year fully loaded. An AI receptionist runs $3,564-$11,964/year at a fixed price. The annualized gap pays for the rest of your tech stack.',
  },
  {
    Icon: Zap,
    headline: '<1 ring pickup time',
    title: 'Answer faster than a human can',
    description:
      'Speed-to-answer is the single highest-leverage variable in inbound conversion. The AI picks up before voicemail engages, on every call, every time.',
  },
  {
    Icon: Phone,
    headline: 'Unlimited concurrent calls',
    title: 'Stop losing calls during peak hours',
    description:
      'A human handles one call at a time. The AI handles a hundred simultaneously. Storm-driven spikes, tax-season surges, and lunch-rush concurrency stop killing capture rate.',
  },
  {
    Icon: CalendarCheck,
    headline: '-29% no-show rate (typical)',
    title: 'Reduce no-shows with confirmation calls',
    description:
      'Outbound confirmation 24 hours before an appointment plus an SMS reminder cuts no-show rates by a quarter to a third on most deployments.',
  },
  {
    Icon: Database,
    headline: 'Real-time two-way sync',
    title: 'Stop losing call data to memory',
    description:
      'Lead, transcript, recording, and outcome write to your CRM during the call. No "I forgot to log that one" loss, no fact-finding on the callback.',
  },
  {
    Icon: PhoneForwarded,
    headline: 'Live transfer in seconds',
    title: 'Route the right calls to a real person',
    description:
      'Configurable rules, VIP allow-list, urgent keywords, sentiment, off-script questions, trigger SIP-based warm transfers with context briefing for the human picking up.',
  },
  {
    Icon: Globe2,
    headline: 'EN + ES out of the box',
    title: 'Serve callers in their language',
    description:
      'Multi-language support is configurable per agent. Call routing can branch by detected language at the start of the call.',
  },
  {
    Icon: Users,
    headline: '15-22 hrs reclaimed / week / FTE',
    title: 'Free your team from routine phone work',
    description:
      'Front-desk, dispatchers, and owners reclaim a full day per week of routine phone time on most deployments. That time goes back into the business.',
  },
  {
    Icon: Shield,
    headline: 'HIPAA + recording + audit logs',
    title: 'Compliance without extra work',
    description:
      'BAA on request, encryption in transit and at rest, role-based access, full call recordings with transcripts. Compliant by default for medical, legal, and financial deployments.',
  },
  {
    Icon: Heart,
    headline: 'No turnover, no ramp, no sick days',
    title: 'Stop the hiring/training cycle',
    description:
      'No interview, training, performance reviews, vacation, or replacement when someone leaves. The agent shows up consistently from day one and never resigns.',
  },
];

export default function BenefitsOfAIReceptionistPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: '12 Benefits of an AI Receptionist',
            description:
              'The 12 measurable benefits of an AI receptionist with real numbers, capture rate, savings, after-hours coverage, no-show reduction.',
            url: '/benefits-of-ai-receptionist',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist',
            description:
              'AI receptionist that answers, qualifies, and books calls 24/7 with measurable ROI.',
            serviceType: 'AI Receptionist',
            url: '/benefits-of-ai-receptionist',
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'AI Receptionist', href: '/' },
              {
                label: 'Benefits',
                href: '/benefits-of-ai-receptionist',
              },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label="Guide · Benefits" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
                12 benefits of an{' '}
                <span className="text-brand-purple">AI receptionist</span>, with real numbers.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Generic "save time" copy is not useful. This is the
                measurable list, recovered pipeline, capture rate,
                annualized savings, no-show reduction, hours reclaimed, with real magnitudes that hold up across the deployments we
                ship.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="benefits-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my numbers <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  data-cta-location="benefits-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="The summary"
            title="What an AI receptionist actually moves on the P&L"
            description="Four buckets, three of them show up in dollars, one shows up in ops quality. The numbers below are conservative across the Implenix portfolio."
          />
          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <div className="border-l-[3px] border-brand-cyan bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                ▸ Bucket 1 · Recovered pipeline
              </span>
              <p className="font-heading text-4xl md:text-5xl text-brand-cyan leading-none">
                $5-30k
              </p>
              <p className="font-body text-sm text-white/80 leading-relaxed">
                Per month, per typical local SMB. This is the biggest
                dollar number on the page, missed-call cost that
                returns to the business inside the first month of go-live.
              </p>
            </div>
            <div className="border-l-[3px] border-brand-purple bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-purple">
                ▸ Bucket 2 · Labor recovered
              </span>
              <p className="font-heading text-4xl md:text-5xl text-brand-purple leading-none">
                15-22 hrs
              </p>
              <p className="font-body text-sm text-white/80 leading-relaxed">
                Per week, per FTE, front-desk, dispatcher, and owner
                hours that stop being spent on routine phone work and go
                back into the business.
              </p>
            </div>
            <div className="border-l-[3px] border-brand-cyan bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                ▸ Bucket 3 · Net-new capability
              </span>
              <p className="font-heading text-4xl md:text-5xl text-brand-cyan leading-none">
                24/7
              </p>
              <p className="font-body text-sm text-white/80 leading-relaxed">
                Coverage. Plus unlimited concurrent calls, multi-language,
                real-time CRM sync, configurable handoff. Operating
                capacity you did not have before.
              </p>
            </div>
            <div className="border-l-[3px] border-brand-purple bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-purple">
                ▸ Bucket 4 · Consistency + compliance
              </span>
              <p className="font-heading text-4xl md:text-5xl text-brand-purple leading-none">
                100%
              </p>
              <p className="font-body text-sm text-white/80 leading-relaxed">
                Of calls recorded, transcribed, and logged. Zero operator
                drift between shifts, zero training overhead, HIPAA-ready
                for regulated verticals.
              </p>
            </div>
          </div>
          <p className="mt-8 font-body text-sm text-white/60 leading-relaxed max-w-2xl">
            Magnitudes vary by industry; the direction does not. Run the
            audit at the bottom of the page to see your specific numbers.
          </p>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Hear it"
            title="What three of those benefits look like in one call"
            description="Captured pipeline, after-hours coverage, and live calendar booking, all firing on the same 58-second call."
            badgeVariant="purple"
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <CodeWindow
                title="benefits.log"
                lines={[
                  { ts: '20:33', speaker: 'system', text: 'Inbound · Wednesday 8:33pm · After-hours window · Answered in 0 rings' },
                  { ts: '20:33', speaker: 'agent', text: 'Thanks for calling Cedar Park Roofing, this is Ron. What can I help with?' },
                  { ts: '20:33', speaker: 'caller', text: 'Need a quote on a roof replacement, asphalt shingle, single-story.' },
                  { ts: '20:33', speaker: 'agent', text: "Great. Three quick questions: city, ballpark square footage, and is this insurance-driven or out of pocket?" },
                  { ts: '20:34', speaker: 'caller', text: 'Cedar Park, around 2,200 square feet, insurance.' },
                  { ts: '20:34', speaker: 'agent', text: "Cedar Park is in our service zone. I have an inspector available Thursday at 2pm or Friday at 10am for the on-site quote. Which works?" },
                  { ts: '20:34', speaker: 'caller', text: 'Thursday 2pm.' },
                  { ts: '20:34', speaker: 'agent', text: "Booked. You'll get a confirmation text and a pre-inspection checklist by email. Insurance carrier on file?" },
                  { ts: '20:34', speaker: 'caller', text: 'Allstate.' },
                  { ts: '20:34', speaker: 'agent', text: "Logged. We'll bring documentation formatted for Allstate. See you Thursday." },
                  { ts: '20:35', speaker: 'system', text: 'Lead captured · Inspection booked · CRM enriched · 58s · This call would have been voicemail before' },
                ]}
                caption="One call, three benefits firing at once: recovered pipeline + 24/7 capture + live calendar booking"
              />
            </div>
            <aside className="lg:col-span-4 flex flex-col gap-4">
              <div className="border border-brand-purple/25 bg-brand-dark p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ What this call delivered
                </span>
                <ul className="mt-3 flex flex-col gap-2 font-body text-white/85 text-sm leading-relaxed">
                  <li>· $12k-$25k pipeline lead, captured in 58s</li>
                  <li>· 8:33pm answer time vs voicemail before</li>
                  <li>· Inspection booked live, not "we'll call back"</li>
                  <li>· Carrier logged, doc prep auto-routed</li>
                </ul>
              </div>
              <div className="border border-brand-cyan/25 bg-black p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-purple">
                  ▸ Net effect
                </span>
                <p className="mt-3 font-heading text-3xl text-white leading-tight">
                  +1 booking
                </p>
                <p className="mt-2 font-body text-white/70 text-sm">
                  That otherwise would not have existed. Multiply across 200+ inbound calls/month.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The list"
            title="12 benefits, with the number that backs each one"
            description="Numbered for the People Also Ask boxes. Real magnitudes from the deployment portfolio."
            badgeVariant="purple"
          />
          <ol className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {BENEFITS.map((b, i) => (
              <li
                key={b.title}
                className="bg-black border border-brand-purple/20 hover:border-brand-purple p-6 flex gap-5 transition-colors"
              >
                <span className="font-heading text-3xl text-brand-purple leading-none shrink-0 w-12">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <b.Icon size={14} className="text-brand-cyan" />
                    <p className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                      {b.headline}
                    </p>
                  </div>
                  <h3 className="font-heading text-lg text-white">{b.title}</h3>
                  <p className="font-body text-sm text-white/70 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="At a glance"
            title="The three benefits that move the most P&L"
            description="If you take only three numbers from the list, take these."
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '~$30K', label: 'monthly missed-call pipeline recovered (typical SMB)' },
                { number: '+38%', label: 'qualified bookings inside the first 30 days' },
                { number: '$40K+', label: 'annualized savings vs a full-time receptionist' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="FAQ"
            title="Common questions about the benefits"
          />
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
            <Badge label="See your specific numbers" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              The numbers above are the average. Find out yours.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. Industry-grade estimate of your missed-call
              cost, recoverable pipeline, and annualized ROI based on your
              business profile.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="benefits-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} />
            </Link>
            <Link
              href="/ai-receptionist-cost-comparison"
              data-cta-location="benefits-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Cost comparison
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent
            topic="Keep reading"
            type="resource"
            links={[
              { href: '/what-is-an-ai-receptionist', label: 'What is an AI receptionist?' },
              { href: '/how-does-an-ai-receptionist-work', label: 'How does it work?' },
              {
                href: '/ai-receptionist-vs-human-receptionist',
                label: 'AI Receptionist vs Human Receptionist',
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
