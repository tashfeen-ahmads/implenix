import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Users, MapPin, Phone, Briefcase } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { MetricGrid } from '@/components/common/MetricGrid';
import { Timeline } from '@/components/common/Timeline';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import {
  aboutPageSchema,
  breadcrumbListSchema,
  speakableSchema,
  organizationSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About Implenix, AI Voice Agents for Local Business',
  description:
    'Implenix designs and deploys AI voice agents for local business. Why we exist, how we work, and the four disciplines behind every deployment.',
  path: '/about',
});

const PRINCIPLES = [
  {
    title: 'Verified numbers only',
    description:
      'Every result, capture rate, and payback window we publish is drawn from actual deployments in our portfolio. If we can\'t defend a number, we don\'t publish it.',
  },
  {
    title: 'Honest scope',
    description:
      'We tell operators when AI is the wrong tool for their call profile. Crisis intake, complex sales negotiation, and sensitive conversations belong with humans.',
  },
  {
    title: 'AI-first, not AI-only',
    description:
      'Every deployment ships with live-transfer rules to a human team. AI handles routine; humans handle judgment. The mix is the operational architecture.',
  },
  {
    title: 'Owned infrastructure',
    description:
      'Two-way CRM sync, live calendar booking, real recordings, and full transcripts, not next-morning email summaries. Integration depth is the product.',
  },
];

const TEAM_DISCIPLINES = [
  {
    title: 'Voice AI engineering',
    description:
      'Engineers tuning dialogue models, latency budgets, turn-taking, and barge-in handling on every deployment.',
  },
  {
    title: 'Implementation',
    description:
      'Specialists who scope, build, and ship the agent, CRM, calendar, phone routing, integrations, transfer rules.',
  },
  {
    title: 'Customer success',
    description:
      'Owners of post-launch tuning, call recordings reviewed, scripts refined, edge cases handled, monthly reports delivered.',
  },
  {
    title: 'Operations',
    description:
      'Infrastructure, monitoring, compliance, on-call rotation, the team that keeps every deployment running 24/7.',
  },
];

const TIMELINE = [
  {
    title: 'Discovery',
    description:
      'We map your current call flow, top intents, and CRM stack in a 30-minute working session.',
  },
  {
    title: 'Agent build',
    description:
      'We assemble your call script, voice, qualification logic, and transfer rules.',
  },
  {
    title: 'Integration',
    description:
      'We connect to your CRM, calendar, and phone routing, and run live tests against your business.',
  },
  {
    title: 'Go-live',
    description:
      'We route real traffic, monitor the first week, and tune scripts based on outcomes.',
  },
];

export default function AboutPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          aboutPageSchema({
            name: 'About Implenix',
            description:
              'Implenix designs and deploys AI voice agents for local business. The team, principles, and operator commitment.',
            url: '/about',
          }),
          organizationSchema(),
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
          ]),
          speakableSchema(),
        ]}
      />
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-24">
          <div className="max-w-4xl flex flex-col gap-6">
            <Badge label="About Implenix" variant="purple" />
            <h1
              className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]"
              data-speakable
            >
              The team building the{' '}
              <span className="text-brand-cyan">AI calling infrastructure</span>{' '}
              for local business.
            </h1>
            <p
              className="font-body text-white/80 text-lg max-w-3xl leading-relaxed"
              data-speakable
            >
              Implenix exists because local businesses lose deals every day to
              a missed phone call. We design, deploy, and operate the AI
              voice infrastructure that answers, qualifies, and books, every call, every hour, without exception.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/contact"
                data-cta-location="about-hero"
                data-cta-type="primary"
                className="inline-flex items-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
              >
                Talk to the team <ArrowRight size={16} />
              </Link>
              <Link
                href="/case-studies"
                data-cta-location="about-hero"
                data-cta-type="secondary"
                className="inline-flex items-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
              >
                See what we have shipped
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="By the numbers"
            title="A small team. A focused stack."
          />
          <div className="mt-12">
            <MetricGrid
              metrics={[
                {
                  Icon: Users,
                  number: '4',
                  label: 'disciplines',
                  description:
                    'Voice AI engineering, implementation, customer success, operations.',
                },
                {
                  Icon: Phone,
                  number: '24/7',
                  label: 'coverage',
                  description:
                    'Continuous call answering across every deployment.',
                },
                {
                  Icon: MapPin,
                  number: '25',
                  label: 'industries',
                  description: 'Verticals with shipped, tuned playbooks.',
                },
                {
                  Icon: Briefcase,
                  number: '7–14d',
                  label: 'deploy cycle',
                  description: 'From kickoff to live traffic in two weeks.',
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <SectionHeader
compact
              eyebrow="Mission"
              title="Build the voice infrastructure local business runs on."
              badgeVariant="purple"
            />
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="border-l-[3px] border-brand-cyan bg-black p-4 flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-cyan">
                  ▸ The problem
                </span>
                <p className="font-heading text-2xl text-white leading-none">
                  40-60%
                </p>
                <p className="font-body text-xs text-white/65 leading-relaxed">
                  of inbound calls missed at typical local SMBs before
                  deployment
                </p>
              </div>
              <div className="border-l-[3px] border-brand-purple bg-black p-4 flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-purple">
                  ▸ What we do
                </span>
                <p className="font-heading text-2xl text-white leading-none">
                  Deploy
                </p>
                <p className="font-body text-xs text-white/65 leading-relaxed">
                  industry-tuned voice agents on real phone lines with
                  live CRM sync
                </p>
              </div>
              <div className="border-l-[3px] border-brand-cyan bg-black p-4 flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-cyan">
                  ▸ What we don't
                </span>
                <p className="font-heading text-2xl text-white leading-none">
                  Platform
                </p>
                <p className="font-body text-xs text-white/65 leading-relaxed">
                  We do one thing well. Not a marketplace, not horizontal
                  SaaS.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 font-body text-white/80 leading-relaxed text-base">
              <p>
                Local businesses are the backbone of the call economy.
                They run on phones, and most of them quietly lose deals
                every single day to a missed inbound. <span className="text-brand-cyan">That is the problem worth solving.</span>
              </p>
              <p>
                Implenix is the team that solves it. We design industry-
                specific voice agents, deploy them on real phone lines,
                and integrate them into your CRM, calendar, and dispatch.
                <span className="text-white font-medium"> We deploy. We tune. We ship.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <aside
              data-answer
              data-speakable
              className="lg:col-span-7 border-l-[3px] border-brand-cyan bg-brand-dark rounded-r-sm p-6 md:p-8 flex flex-col gap-3"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                ▸ Origin
              </span>
              <p className="font-heading text-white text-xl md:text-2xl leading-snug">
                Why Implenix exists
              </p>
              <p className="font-body text-white/85 leading-relaxed text-base">
                The Implenix team spent years watching local operators, contractors, dentists, brokers, agencies, lose the
                majority of their inbound to voicemail, understaffed
                front desks, and per-minute answering services that
                couldn't keep up. In 2024 the underlying voice AI became
                genuinely deployable in production. In early 2026 we
                launched Implenix to ship it specifically to the
                local-business operators who need it most.
              </p>
              <p className="font-body text-white/70 leading-relaxed text-sm">
                Every deployment we ship follows the same operator
                philosophy: <span className="text-white">verified
                numbers only, honest scope, AI-first but human-supervised,
                and integration depth</span> that keeps every call in
                your CRM and every booking on your real calendar.
              </p>
            </aside>
            <ol className="lg:col-span-5 flex flex-col gap-3">
              <TimelineItem
                year="2019-2023"
                title="The problem"
                body="Local operators losing 40-60% of inbound to voicemail and per-minute answering services."
                color="purple"
              />
              <TimelineItem
                year="2024"
                title="The tipping point"
                body="Voice AI latency drops under 800ms. Turn-taking becomes indistinguishable from human."
                color="cyan"
              />
              <TimelineItem
                year="Early 2026"
                title="Implenix launches"
                body="Team ships production-ready deployments across 25 industries with fixed monthly pricing."
                color="purple"
                highlight
              />
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <SectionHeader
compact
              eyebrow="How we work"
              title="Four phases. Two weeks. Live traffic."
            />
          </div>
          <div className="lg:col-span-7">
            <Timeline steps={TIMELINE} />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The team"
            title="One small team. Four disciplines."
            description="We do not list individual team members publicly, every Implenix deployment is built and operated by the same collective team. Here is what they ship."
            badgeVariant="purple"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM_DISCIPLINES.map((d) => (
              <article
                key={d.title}
                className="bg-black border border-brand-purple/20 hover:border-brand-purple transition-colors p-6 flex flex-col gap-3"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ Discipline
                </span>
                <p className="font-heading text-white text-lg leading-snug">
                  {d.title}
                </p>
                <p className="font-body text-sm text-white/65 leading-relaxed">
                  {d.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="How we operate"
            title="Four principles every deployment respects"
            description="These aren't marketing slogans. They're the rules we scope every project against and the ones we tell prospects when we recommend they NOT deploy Implenix."
            badgeVariant="purple"
          />
          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {PRINCIPLES.map((p) => (
              <article
                key={p.title}
                className="bg-black border-l-[3px] border-brand-cyan p-6 flex flex-col gap-3"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ Principle
                </span>
                <p className="font-heading text-white text-lg leading-snug">
                  {p.title}
                </p>
                <p className="font-body text-sm text-white/70 leading-relaxed">
                  {p.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <SectionHeader
compact
              eyebrow="What you can expect"
              title="Our operator commitment to every caller and customer"
            />
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4 font-body text-white/80 leading-relaxed text-base">
            <ul className="flex flex-col gap-3 list-none pl-0">
              <li className="flex items-start gap-3 border-l-[3px] border-brand-purple bg-black p-4">
                <span>
                  <strong>We identify AI as AI.</strong> Every Implenix
                  voice agent opens with a clear identification. We do not
                  pretend to be human when asked.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-[3px] border-brand-purple bg-black p-4">
                <span>
                  <strong>We honor opt-outs immediately and
                  permanently.</strong> Any caller who asks to speak with a
                  human is transferred without friction. Any recipient who
                  asks to be removed from outbound is flagged permanently.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-[3px] border-brand-purple bg-black p-4">
                <span>
                  <strong>We route sensitive calls to humans.</strong>{' '}
                  Crisis, distress, and vulnerable-caller signals trigger
                  live transfer within 30 seconds, always.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-[3px] border-brand-purple bg-black p-4">
                <span>
                  <strong>We audit for bias.</strong> Every quarter we
                  sample calls across demographic categories and address
                  any differential handling we find.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-[3px] border-brand-purple bg-black p-4">
                <span>
                  <strong>We say when AI isn't the right tool.</strong> If
                  your call profile doesn't fit, we tell you during
                  discovery. We do not sell deployments that shouldn't
                  ship.
                </span>
              </li>
            </ul>
            <p className="mt-3">
              For the full framework, see our{' '}
              <Link
                href="/blog/ethical-considerations-ai-agents"
                className="text-brand-cyan hover:underline"
              >
                seven-point ethical framework for AI agents
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Badge label="Work with us" variant="cyan" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Want Implenix on your phones?
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              Book a 30-minute call. We will quote a deployment timeline and
              run a live audit on your current inbound flow.
            </p>
          </div>
          <div className="lg:col-span-5 flex lg:justify-end">
            <Link
              href="/contact"
              data-cta-location="about-bottom"
              data-cta-type="primary"
              className="inline-flex items-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Book a Demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function TimelineItem({
  year,
  title,
  body,
  color,
  highlight,
}: {
  year: string;
  title: string;
  body: string;
  color: 'cyan' | 'purple';
  highlight?: boolean;
}) {
  const isCyan = color === 'cyan';
  return (
    <li
      className={`relative bg-black p-5 flex flex-col gap-2 border ${
        highlight
          ? 'border-brand-cyan ring-1 ring-brand-cyan/30'
          : isCyan
            ? 'border-brand-cyan/25'
            : 'border-brand-purple/25'
      }`}
    >
      <span
        className={`font-mono text-[10px] uppercase tracking-widest ${
          isCyan ? 'text-brand-cyan' : 'text-brand-purple'
        }`}
      >
        ▸ {year}
      </span>
      <p className="font-heading text-white text-base md:text-lg leading-snug">
        {title}
      </p>
      <p className="font-body text-sm text-white/70 leading-relaxed">{body}</p>
      {highlight ? (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-brand-cyan">
          <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
          Live
        </span>
      ) : null}
    </li>
  );
}
