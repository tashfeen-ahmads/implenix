import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Phone,
  Clock,
  CalendarCheck,
  Database,
  ShieldCheck,
  Briefcase,
  Wrench,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BentoCard } from '@/components/common/BentoCard';
import { CodeWindow } from '@/components/common/CodeWindow';
import { DividedStats } from '@/components/common/DividedStats';
import { ComparisonTable } from '@/components/common/ComparisonTable';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, serviceSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist for Small Business | 24/7 Pickup | Implenix',
  description:
    'AI receptionist for small business owners. Answer every call while you work, book appointments 24/7, sync your CRM. Less than the cost of a part-time hire.',
  path: '/ai-receptionist-for-small-business',
});

const FAQS = [
  {
    question: 'Is an AI receptionist worth it for a small business?',
    answer:
      'For any small business where missed calls cost real revenue, yes. A typical local-services SMB loses $5,000-$30,000 a month in unanswered calls. Implenix recovers most of that at a fixed monthly cost lower than a part-time hire.',
  },
  {
    question: 'How is this cheaper than hiring a receptionist?',
    answer:
      'A part-time receptionist runs $1,800-$2,400/month for 20 hours of coverage. A full-time hire runs $3,500-$5,000/month for 40 hours. Implenix starts at $297/month and covers all 168 hours in a week with no sick days, vacation, or turnover.',
  },
  {
    question: 'Will it work for my industry?',
    answer:
      'We have shipped tuned playbooks for 25 industries, HVAC, plumbing, dental, real estate, law firms, salons, contractors, accountants, and more. Each one ships with industry-specific intake, transfer rules, and integrations.',
  },
  {
    question: 'I am a solo operator. Will this work for me?',
    answer:
      'Yes. Solo operators are one of our most-served customer profiles, owners who are on a roof, in a chair, in a meeting, or otherwise unable to pick up. The Solo Operator plan starts at $297/month and includes 24/7 coverage and CRM sync.',
  },
  {
    question: 'How long does deployment take?',
    answer:
      '7 to 14 business days for most small businesses. We tune your script, voice, and integrations during onboarding, then run a parallel test period before cutting over real traffic.',
  },
  {
    question: 'Will my customers know they are talking to an AI?',
    answer:
      'For routine booking, qualification, and intake calls, most callers do not realize. For sensitive or emotionally complex calls, our live-transfer rules route to your phone in real time.',
  },
  {
    question: 'Can it handle after-hours calls?',
    answer:
      'Yes. After-hours coverage is included at the same fixed monthly cost. Most of our deployments see 30-50% of bookings come in outside business hours after the agent goes live.',
  },
];

const FEATURES = [
  {
    Icon: Phone,
    title: '24/7 answering at fixed cost',
    description:
      'Inbound calls answered within one ring, every hour of every day, at the same monthly price.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: CalendarCheck,
    title: 'Books while you work',
    description:
      'Live calendar booking against your real availability. The agent books while you are on a job site, with a customer, or asleep.',
  },
  {
    Icon: Clock,
    title: 'After-hours capture',
    description:
      'No premium upcharge for evenings and weekends. Most SMBs see 30-50% of bookings happen outside business hours.',
  },
  {
    Icon: Database,
    title: 'Two-way CRM sync',
    description:
      'Lead, booking, recording, and outcome write back live. No "I forgot to log that call" loss.',
  },
  {
    Icon: ShieldCheck,
    title: 'Live transfer to your phone',
    description:
      'Defined rules send urgent calls, VIPs, and complex cases straight to your mobile in real time.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Briefcase,
    title: 'No HR overhead',
    description:
      'No interview, training, sick days, vacation, or turnover. The agent shows up and never leaves.',
  },
];

const SAMPLE_TRANSCRIPT = [
  { ts: '00:00', speaker: 'system' as const, text: 'Inbound · owner on a job site · 4:42 PM' },
  { ts: '00:02', speaker: 'agent' as const, text: 'Greenleaf Plumbing, thanks for calling. How can I help?' },
  { ts: '00:06', speaker: 'caller' as const, text: 'My water heater stopped working. Can someone come tomorrow?' },
  { ts: '00:10', speaker: 'agent' as const, text: 'Yes, what is the address, and what time window works?' },
  { ts: '00:14', speaker: 'caller' as const, text: '882 Pine St, anytime morning works.' },
  { ts: '00:18', speaker: 'agent' as const, text: 'Booked you for 9-11 AM tomorrow. Confirmation by text now.' },
  { ts: '00:22', speaker: 'system' as const, text: 'Job created · CRM updated · owner notified' },
];

export default function AIReceptionistForSmallBusinessPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist for Small Business',
            description:
              'AI receptionist for small business owners and local service operators. 24/7 call answering, live booking, CRM sync.',
            serviceType: 'AI Receptionist',
            url: '/ai-receptionist-for-small-business',
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'AI Receptionist', href: '/' },
              { label: 'For Small Business', href: '/ai-receptionist-for-small-business' },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label="Built for · Small Business" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                AI receptionist for{' '}
                <span className="text-brand-purple">small business</span>{' '}
                owners.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                You can't be on a job and on the phone at the same time.
                Implenix answers every inbound call inside one ring, books
                appointments live, and syncs your CRM, so you keep working
                while your phone keeps closing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="smb-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my free missed-call audit <ArrowRight size={16} />
                </Link>
                <Link
                  href="/try-it"
                  data-cta-location="smb-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  Test Ron now
                </Link>
              </div>
              <dl className="grid grid-cols-3 max-w-lg pt-8 border-t border-brand-purple/15">
                <Stat label="Coverage" value="24 / 7" />
                <Stat label="From" value="$297/mo" />
                <Stat label="vs hire" value="$3,500+" />
              </dl>
            </div>
            <aside className="lg:col-span-5">
              <div className="border border-brand-cyan/30 bg-black p-8">
                <span className="text-xs uppercase tracking-widest text-white/55 font-mono">
                  ▸ The math
                </span>
                <p className="font-heading text-5xl md:text-6xl text-brand-cyan mt-3 leading-none">
                  ~$30K
                </p>
                <p className="mt-3 font-body text-white/80 max-w-xs">
                  monthly pipeline a typical local-services SMB loses to
                  unanswered calls, recoverable in 14 days.
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
              eyebrow="The small-business phone problem"
              title="You can't be on a roof, in a chair, and on the phone, at once"
            />
            <div className="mt-8 flex flex-col gap-5 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              <p>
                Most small businesses are run by owners doing the actual work.
                A plumber is in a basement. A salon owner is mid-color. A
                contractor is on a roof. A solo accountant is in a client
                meeting. The phone rings during exactly the hours the owner
                cannot pick up, and the next caller goes to the next business
                on Google. Studies put the local-services missed-call rate at
                40-60% during business hours, and after hours it climbs near
                100%. Voicemail looks free; in practice it costs most SMBs
                $5,000-$30,000 a month in pipeline silently vanishing into
                voicemail boxes.
              </p>
              <p>
                Hiring a receptionist solves part of the problem at significant
                expense. A part-time receptionist runs $1,800-$2,400/month for
                20 hours of coverage. A full-time hire runs $3,500-$5,000/month
                for 40 hours. Both leave nights, weekends, and concurrent calls
                uncovered. Both come with HR overhead, training, sick days, and
                turnover. The math rarely works for an SMB until call volume
                is so high that the owner is already losing real revenue to
                the gaps.
              </p>
              <p>
                Implenix is the AI receptionist for small business owners.
                It picks up within one ring, follows the script you tune
                during onboarding, books appointments directly into your
                calendar, and writes everything back to your CRM in real
                time. Coverage is 24/7. Concurrent capacity is unlimited.
                Cost is fixed at $297-$997/month regardless of call volume.
                For a solo operator running a service business on a phone
                that never quits, this is the most leveraged $300 on your
                P&L.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="What it does"
            title="A working receptionist that costs less than part-time"
            description="Booking, qualification, after-hours coverage, CRM sync, urgent transfer, all included."
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
            <Badge label="A real owner-out-on-a-job call" variant="cyan" />
            <h2 className="font-heading text-3xl md:text-5xl leading-[1.05]">
              The owner is on a job. The job still gets booked.
            </h2>
            <p className="font-body text-white/75 leading-relaxed max-w-xl">
              Customer calls about a broken water heater at 4:42 PM while
              the owner is finishing a kitchen remodel. The agent triages,
              books a 9-11 AM window for the next day, sends a confirmation
              text, and notifies the owner, without interrupting the work.
            </p>
          </div>
          <div className="lg:col-span-5">
            <CodeWindow
              title="greenleaf-plumbing.call.log"
              lines={SAMPLE_TRANSCRIPT}
              caption="Owner-on-a-job call · booked + notified in 22s"
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The cost of doing nothing"
            title="What missed calls actually cost a small business"
            description="Conservative across local-services portfolio. Run the audit to see your numbers."
            badgeVariant="purple"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '40-60%', label: 'of inbound calls go unanswered during business hours' },
                { number: '~$30K', label: 'typical monthly lost pipeline for an SMB' },
                { number: '<14 d', label: 'to recover most of it after Implenix go-live' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="vs the alternatives"
            title="Implenix vs the other ways small businesses handle calls"
            description="Hiring is expensive. Voicemail loses leads. Generic IVR cannot pick up a phone. Implenix replaces all three."
          />
          <div className="mt-12">
            <ComparisonTable
              highlightColumn={0}
              columns={['Implenix', 'Part-time hire', 'Voicemail', 'Generic IVR']}
              rows={[
                { label: '24/7 coverage', cells: [true, false, true, true] },
                { label: 'Live calendar booking', cells: [true, true, false, false] },
                { label: 'Two-way CRM sync', cells: [true, 'partial', false, false] },
                { label: 'Concurrent calls', cells: ['unlimited', '1', 'n/a', '1+'] },
                {
                  label: 'Industry-specific script',
                  cells: [true, 'partial', false, false],
                },
                { label: 'No HR overhead', cells: [true, false, true, true] },
                {
                  label: 'Monthly cost',
                  cells: ['from $297', '$1,800-$2,400', '$0', '$30-$200'],
                },
              ]}
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ai-receptionist-vs-voicemail"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              vs Voicemail <ArrowRight size={14} />
            </Link>
            <Link
              href="/ai-receptionist-vs-answering-service"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              vs Answering Service <ArrowRight size={14} />
            </Link>
            <Link
              href="/ai-receptionist-vs-ivr-system"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              vs IVR <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Best fits"
            title="Small businesses we ship tuned playbooks for"
            description="Each industry below ships with deep-dive industry intake, transfer rules, and integrations."
            badgeVariant="purple"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <BizTypeCard label="Local services" examples="HVAC, plumbing, electrical, roofing, contractors" Icon={Wrench} />
            <BizTypeCard label="Owner-operator" examples="Solo operators across home services and trades" Icon={Briefcase} />
            <BizTypeCard label="Multi-location" examples="2-10 locations across services and retail" Icon={Users} />
            <BizTypeCard label="Health & wellness" examples="Dental, chiropractors, therapists, vets, med spas" Icon={ShieldCheck} />
            <BizTypeCard label="Professional services" examples="Law firms, accountants, brokers, agents" Icon={Briefcase} />
            <BizTypeCard label="Beauty & lifestyle" examples="Salons, spas, personal trainers, studios" Icon={ShieldCheck} />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="FAQ"
            title="What small business owners ask"
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
            <Badge label="Stop missing calls" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Find out what your business is losing every week.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. Industry-grade estimate of your lost pipeline,
              then a deployment plan to recover it.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="smb-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="smb-bottom"
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
              { href: '/ai-receptionist-vs-voicemail', label: 'AI Receptionist vs Voicemail' },
              { href: '/pricing', label: 'AI Receptionist pricing' },
            ]}
          />
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-1">
      <dt className="text-xs uppercase tracking-widest text-white/50 font-mono">
        {label}
      </dt>
      <dd className="mt-1 font-heading text-xl text-white">{value}</dd>
    </div>
  );
}

function BizTypeCard({
  label,
  examples,
  Icon,
}: {
  label: string;
  examples: string;
  Icon: typeof Briefcase;
}) {
  return (
    <div className="bg-black border border-brand-purple/20 p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-brand-cyan" />
        <p className="font-heading text-white text-base">{label}</p>
      </div>
      <p className="text-xs font-body text-white/65 leading-relaxed">
        {examples}
      </p>
    </div>
  );
}
