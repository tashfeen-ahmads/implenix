import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ListChecks,
  Filter,
  Users,
  CalendarCheck,
  Database,
  Megaphone,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BentoCard } from '@/components/common/BentoCard';
import { CodeWindow } from '@/components/common/CodeWindow';
import { DividedStats } from '@/components/common/DividedStats';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  faqSchema,
  serviceSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist for Agencies | RFP Qualification | Implenix',
  description:
    'AI receptionist built for agencies. Qualify RFPs, screen cold pitches, route partner inquiries, and stop dropping six-figure leads to voicemail.',
  path: '/ai-receptionist-for-agencies',
});

const FAQS = [
  {
    question: 'How is this different from a generic AI receptionist?',
    answer:
      'Agencies have an inbound mix that most templates handle badly: RFPs that need qualification before reaching a founder, cold pitches that should not reach anyone, partner and press inquiries that route differently, and existing-client questions that need fast-path handling. We tune the script for that mix specifically.',
  },
  {
    question: 'Will the agent screen out cold vendor pitches?',
    answer:
      'Yes. We define your screening rules during scoping. Common patterns ("we can do your SEO," white-label development outreach, lead-gen vendor pitches) route to a callback queue your ops team reviews weekly, never to a founder.',
  },
  {
    question: 'Can it qualify RFPs against our minimum project size?',
    answer:
      'Yes. We capture industry, budget range, timeline, decision-maker confirmation, and any anti-fit signals you define. Below-bar inquiries get a polite no-thanks; above-bar route to discovery on your founder or strategy lead\'s calendar.',
  },
  {
    question: 'How does it handle existing client calls?',
    answer:
      'Caller verification (name + project number) routes existing clients to their account team\'s line, out of the new-business queue. Routine status, billing, and scope-change questions resolve without disrupting strategy work.',
  },
  {
    question: 'Does it integrate with HubSpot, Salesforce, our agency CRM?',
    answer:
      'Yes. We support the major agency CRMs via direct integration or webhook. Calls, transcripts, and qualified-lead notes write back automatically, and we capture the source of the inquiry for attribution.',
  },
  {
    question: 'How fast can we deploy?',
    answer:
      '7 to 10 business days for most agencies. The longest part is tuning your qualification logic so the agent screens correctly on day one.',
  },
];

const FEATURES = [
  {
    Icon: ListChecks,
    title: 'RFP qualification before a founder sees it',
    description:
      'Industry, budget range, timeline, decision-makers, anti-fit signals, captured up front. Below-bar inquiries get a polite no-thanks.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Filter,
    title: 'Cold-pitch screening',
    description:
      'Pattern-matched vendor solicitations route to a callback queue your ops team reviews weekly.',
  },
  {
    Icon: Users,
    title: 'Account team routing',
    description:
      'Caller-verified existing clients route to their pod, not to the new-business queue.',
  },
  {
    Icon: CalendarCheck,
    title: 'Discovery booking on the right calendar',
    description:
      'Qualified inquiries book directly into your founder, partner, or strategy lead\'s calendar.',
  },
  {
    Icon: Database,
    title: 'Two-way CRM sync with attribution',
    description:
      'Lead source, intake, transcript, and recording write back during the call. No fact-finding on the first callback.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Megaphone,
    title: 'Press and partnership routing',
    description:
      'Media and partnership inquiries follow their own intake path and route to your comms or partnerships lead.',
  },
];

const SAMPLE_TRANSCRIPT = [
  { ts: '00:00', speaker: 'system' as const, text: 'Inbound · agency line · referred by client' },
  { ts: '00:02', speaker: 'agent' as const, text: 'Northwind Studios, thanks for calling. How can I help?' },
  { ts: '00:06', speaker: 'caller' as const, text: 'I was referred by Sam at Mercer. We need help with brand.' },
  { ts: '00:10', speaker: 'agent' as const, text: 'Great, what industry is the company, and is there a project budget in mind?' },
  { ts: '00:15', speaker: 'caller' as const, text: 'B2B SaaS, around $80K for the full identity rebuild.' },
  { ts: '00:19', speaker: 'agent' as const, text: 'That is in our range. Booking you with Marisa for a discovery call this week.' },
  { ts: '00:23', speaker: 'system' as const, text: 'Discovery booked · CRM updated · Marisa notified' },
];

export default function AIReceptionistForAgenciesPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist for Agencies',
            description:
              'AI receptionist tuned for agency inbound, RFP qualification, cold-pitch screening, account-team routing.',
            serviceType: 'AI Receptionist',
            url: '/ai-receptionist-for-agencies',
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'AI Receptionist', href: '/' },
              { label: 'For Agencies', href: '/ai-receptionist-for-agencies' },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label="Built for · Agencies" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                AI receptionist for{' '}
                <span className="text-brand-purple">agencies</span>.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Real RFPs land in your discovery calendar. Cold pitches don't.
                Implenix qualifies inbound against your minimum-project rules,
                routes existing clients to the right pod, and protects your
                founder hours from vendor solicitation noise.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="agencies-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my free missed-call audit <ArrowRight size={16} />
                </Link>
                <Link
                  href="/try-it"
                  data-cta-location="agencies-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  Test Ron now
                </Link>
              </div>
            </div>
            <aside className="lg:col-span-5">
              <div className="border border-brand-cyan/30 bg-black p-8">
                <span className="text-xs uppercase tracking-widest text-white/55 font-mono">
                  ▸ Snapshot
                </span>
                <p className="font-heading text-5xl md:text-6xl text-brand-cyan mt-3 leading-none">
                  +62%
                </p>
                <p className="mt-3 font-body text-white/80 max-w-xs">
                  qualified discovery calls booked, with cold-pitch noise to
                  leadership down 89%.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <SectionHeader
              eyebrow="The agency phone problem"
              title="Most inbound is either a six-figure RFP or someone trying to sell you SEO"
            />
            <div className="mt-8 flex flex-col gap-5 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              <p>
                Agencies have a uniquely asymmetric phone problem. The cost of
                mis-routing inbound calls is severe in both directions: a
                great-fit RFP hitting voicemail loses a $250K retainer, and a
                cold pitch reaching your founder costs strategy hours that
                cannot be recovered. Most agencies handle this by routing
                everything to a junior account person, which means real RFPs
                get a generic intake or sit in a queue for two days. By then,
                the prospect has talked to three other agencies.
              </p>
              <p>
                Implenix is the AI receptionist tuned for that asymmetry. We
                define your minimum-project rules, your accepted-industry
                list, and your anti-fit signals during scoping. Inbound calls
                are qualified against those rules in real time. Below-bar
                inquiries get a respectful no-thanks. Above-bar inquiries book
                discovery directly into your founder, partner, or strategy
                lead's calendar with full intake context. Cold pitches and
                vendor solicitations route to a callback queue your ops team
                reviews weekly, never to leadership.
              </p>
              <p>
                Existing clients get caller-verified fast-path. A name and
                project number lookup pulls them out of the new-business queue
                and into their pod's account-management line. Routine
                status-check, scope-change, and billing questions resolve
                without disrupting strategy work. Press and partnership
                inquiries follow their own intake path and route to comms or
                partnerships. Every call writes back to your CRM with the lead
                source attached, so business development opens the morning
                with a clean briefing, not a 20-minute fact-finding call.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Capabilities"
            title="What it does for an agency, end to end"
            description="Qualify, screen, route, book, sync. Your founder hours stay protected."
            badgeVariant="purple"
          />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <BentoCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Badge label="A real referral call" variant="cyan" />
            <h2 className="font-heading text-3xl md:text-5xl leading-[1.05]">
              Qualified, booked, attributed in 23 seconds.
            </h2>
            <p className="font-body text-white/75 leading-relaxed max-w-xl">
              Caller introduces themselves, the agent confirms industry and
              budget against the minimum-project rules, books discovery
              directly into the strategy lead's calendar, and writes the
              referral source to the CRM.
            </p>
          </div>
          <div className="lg:col-span-5">
            <CodeWindow
              title="northwind-studios.call.log"
              lines={SAMPLE_TRANSCRIPT}
              caption="Sample referral RFP · qualified + booked in 23s"
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="What changes after deployment"
            title="What agency teams actually see"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '+62%', label: 'qualified discovery calls booked' },
                { number: '-89%', label: 'cold-pitch noise to leadership' },
                { number: '<2 min', label: 'response time on inbound' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Agency types we deploy for"
            title="Tuned for the way each agency type takes inbound"
            description="Different agency models have different inbound patterns. We tune the script per model, and ship a deeper-dive page for marketing agencies specifically."
            badgeVariant="purple"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AgencyTypeCard
              type="Marketing & growth"
              note="RFP qualification, retainer-fit screening"
              href="/ai-receptionist-for-marketing-agencies"
              hasDeepDive
            />
            <AgencyTypeCard
              type="Creative & brand"
              note="Discovery intake by industry, scope range"
            />
            <AgencyTypeCard
              type="Web & development"
              note="Spec capture, technical-fit qualification"
            />
            <AgencyTypeCard
              type="Design & UX"
              note="Project type, decision-maker confirmation"
            />
            <AgencyTypeCard
              type="Strategy & consulting"
              note="Industry, scope, decision-cycle posture"
            />
            <AgencyTypeCard
              type="Boutique / specialist"
              note="Anti-fit screening, partner referrals"
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="FAQ"
            title="Agency-specific questions"
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

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <Badge label="Protect your founder hours" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Find out what your agency is losing to bad inbound routing.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. Industry-grade estimate of your lost pipeline,
              then a deployment plan tuned for an agency call profile.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="agencies-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my audit <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="agencies-bottom"
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
              {
                href: '/ai-receptionist-for-marketing-agencies',
                label: 'Deep-dive: AI Receptionist for Marketing Agencies',
              },
              {
                href: '/ai-receptionist-vs-virtual-assistant',
                label: 'AI Receptionist vs Virtual Assistant',
              },
              { href: '/pricing', label: 'AI Receptionist pricing' },
            ]}
          />
        </div>
      </section>
    </>
  );
}

function AgencyTypeCard({
  type,
  note,
  href,
  hasDeepDive,
}: {
  type: string;
  note: string;
  href?: string;
  hasDeepDive?: boolean;
}) {
  const inner = (
    <div className="bg-black border border-brand-purple/20 hover:border-brand-purple p-5 flex flex-col gap-2 transition-colors">
      <div className="flex items-center gap-2">
        <ShieldCheck size={14} className="text-brand-cyan" />
        <p className="font-heading text-white text-base">{type}</p>
      </div>
      <p className="text-xs font-body text-white/65 leading-relaxed">{note}</p>
      {hasDeepDive ? (
        <span className="mt-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
          Deep dive <ArrowRight size={10} />
        </span>
      ) : null}
    </div>
  );
  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
