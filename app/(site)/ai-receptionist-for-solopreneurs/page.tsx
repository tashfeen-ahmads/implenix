import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Phone,
  Clock,
  CalendarCheck,
  Database,
  PhoneForwarded,
  Briefcase,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BentoCard } from '@/components/common/BentoCard';
import { DividedStats } from '@/components/common/DividedStats';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, articleSchema, serviceSchema } from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist for Solopreneurs | Implenix',
  description:
    'AI receptionist for solo operators. Answer every call while you work the job. Book appointments, sync your CRM, transfer urgent calls, for $297/mo.',
  path: '/ai-receptionist-for-solopreneurs',
});

const FAQS = [
  {
    question: 'Is an AI receptionist worth it for a solo business?',
    answer:
      'Especially for solo operators. The bottleneck for any solo business is your own phone time. A typical solo operator loses 8-15 inbound calls a week to "I was on the job and couldn\'t pick up", and at average client values of $400-$3,000, that math justifies the AI inside the first few weeks.',
  },
  {
    question: 'How does this work when I\'m the only person in the business?',
    answer:
      'The AI is your virtual front desk. It picks up while you\'re on a job, books appointments against your calendar, captures leads to your CRM, and transfers urgent calls to your mobile per your defined rules. You stay on the work; the phone keeps closing.',
  },
  {
    question: 'Can I afford this as a solo operator?',
    answer:
      'The Solo Operator plan is $297/month, typically less than the lost pipeline from a single missed booking call per month. For most solo trades, this is the most leveraged subscription on the P&L.',
  },
  {
    question: 'Will it know how to handle my specific business?',
    answer:
      'Yes. We tune the script for your industry during onboarding. Plumbers, electricians, photographers, personal trainers, consultants, lawyers, therapists, each gets industry-specific intake, transfer rules, and integrations.',
  },
  {
    question: 'How do I set this up alone, I don\'t have IT?',
    answer:
      'You don\'t need IT. We handle the technical setup during onboarding. You provide your phone number routing, calendar access, CRM access (if any), and approve the script. Live in 7-14 business days.',
  },
  {
    question: 'What happens when I\'m on vacation?',
    answer:
      'The agent runs continuously regardless. Every call gets answered, qualified, and either booked or held in a callback queue per your defined rules. You come back to a clean pipeline, not 47 voicemails.',
  },
];

const FEATURES = [
  {
    Icon: Phone,
    title: 'Picks up while you work',
    description:
      'You\'re on a job, in a session, in a meeting. The AI is on the phone running your intake, booking the appointment, syncing your CRM.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Clock,
    title: '24/7 coverage at $297/mo',
    description:
      'Nights, weekends, vacations. The phone never goes to voicemail again, no premium for after-hours.',
  },
  {
    Icon: CalendarCheck,
    title: 'Books to your calendar',
    description:
      'Live availability lookup. Books your next opening with full intake context and sends customer confirmation.',
  },
  {
    Icon: PhoneForwarded,
    title: 'Sends urgent calls to your mobile',
    description:
      'You set the rules, which calls justify interrupting your work. The AI obeys them and routes the rest.',
  },
  {
    Icon: Database,
    title: 'Single source of truth',
    description:
      'Every call logged, recorded, transcribed. Your CRM, calendar, and call history all stay in sync without you touching anything.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Briefcase,
    title: 'No hiring, no admin overhead',
    description:
      'No interview, training, payroll, taxes, or HR. The agent shows up consistently from day one and never resigns.',
  },
];

export default function AIReceptionistForSolopreneursPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: 'AI Receptionist for Solopreneurs',
            description:
              'AI receptionist for solo operators answering calls while they work the job.',
            url: '/ai-receptionist-for-solopreneurs',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist for Solopreneurs',
            description:
              'AI receptionist purpose-built for solo operators where the owner is the only person in the business.',
            serviceType: 'AI Receptionist',
            url: '/ai-receptionist-for-solopreneurs',
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
                label: 'For Solopreneurs',
                href: '/ai-receptionist-for-solopreneurs',
              },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label="Built for · Solopreneurs" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
                AI receptionist for{' '}
                <span className="text-brand-violet">solopreneurs</span>.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                You're the technician, the salesperson, and the front desk
usually all at once. Implenix is the AI receptionist
                purpose-built for solo operators: picks up every call
                while you work, books appointments, syncs your CRM, and
                only interrupts you for the calls that actually matter.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="solopreneurs-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my missed-call audit <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  data-cta-location="solopreneurs-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  See solo plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <SectionHeader
              eyebrow="The solo phone problem"
              title="You can't be on a job and on the phone, every solo operator loses to this"
            />
            <div className="mt-8 flex flex-col gap-5 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              <p>
                The defining constraint of any solo business is your own
                time. You're a one-person operation where every hour you
                spend on the phone is an hour you're not delivering work.
                Customers call when they need you, which is exactly when
                you're delivering work for someone else. The result is
                a familiar pattern: 8-15 missed calls a week, voicemail
                that costs more leads than it saves, and the constant
                guilt of calling people back two days late.
              </p>
              <p>
                Hiring a receptionist solves the phone problem at the
                exact wrong cost. A part-time hire is $1,800-$2,400/month
more than the average solo operator's monthly software
                stack, for 20 hours of coverage. Even if the math worked,
                a one-person business doesn't have the bandwidth to manage
                a part-time employee on top of everything else.
              </p>
              <p>
                Implenix is built for exactly this profile. It sits as
                your virtual front desk: picks up every inbound call
                within one ring, runs your tuned intake script, books
                appointments against your calendar, captures leads to
                your CRM, and transfers calls to your mobile only when
                your rules say to interrupt. Coverage is 24/7. Cost is
                $297/month flat. Setup takes 7-14 days and requires no
                technical work on your end. For most solo operators,
                this is the highest-leverage subscription you'll add to
                the business.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="What it does"
            title="Your virtual front desk, end to end"
            description="The work a receptionist would do if you could afford one."
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
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The math"
            title="Why this works for a one-person business"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '$297', label: 'monthly cost, less than 1 missed booking' },
                { number: '8-15', label: 'calls per week typical solo operator misses' },
                { number: '24/7', label: 'coverage at no premium upcharge' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Solo operator questions" />
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
            <Badge label="Stop calling people back two days late" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Find out what your phone is costing you.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. Industry-grade estimate of your missed-call
              cost and what an AI receptionist would recover.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="solopreneurs-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/try-it"
              data-cta-location="solopreneurs-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Test Ron now
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent
            topic="Keep reading"
            type="resource"
            links={[
              {
                href: '/ai-receptionist-for-small-business',
                label: 'AI Receptionist for Small Business',
              },
              {
                href: '/ai-receptionist-vs-voicemail',
                label: 'AI Receptionist vs Voicemail',
              },
              { href: '/pricing', label: 'AI Receptionist pricing' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
