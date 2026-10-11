import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Phone,
  Clock,
  CalendarCheck,
  Database,
  PhoneForwarded,
  Globe2,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BentoCard } from '@/components/common/BentoCard';
import { CodeWindow } from '@/components/common/CodeWindow';
import { ComparisonTable } from '@/components/common/ComparisonTable';
import { DividedStats } from '@/components/common/DividedStats';
import { LogoMarquee } from '@/components/common/LogoMarquee';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, serviceSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI Phone Answering Service | 24/7 at Fixed Cost | Implenix',
  description:
    'AI phone answering service that answers, qualifies, and books every call 24/7. Fixed monthly cost vs per-minute. Real CRM and calendar integration.',
  path: '/ai-phone-answering-service',
});

const FAQS = [
  {
    question: 'What is an AI phone answering service?',
    answer:
      'An AI phone answering service is a voice-AI agent that answers your business calls in real time, follows your custom script, qualifies callers, books appointments, and writes the outcome to your CRM. It replaces the role traditionally filled by a live answering service or in-house receptionist.',
  },
  {
    question: 'How is this different from a traditional answering service?',
    answer:
      'Traditional answering services use human operators who follow a script and bill per call or per minute. Implenix is AI-first, billed at a fixed monthly rate, with unlimited concurrent capacity, real-time CRM and calendar integration, and 24/7 coverage at no premium upcharge.',
  },
  {
    question: 'How much does an AI phone answering service cost?',
    answer:
      'Implenix starts at $297/month for solo operators and $597/month for growing teams, billed at a fixed rate. A traditional human answering service runs $300-$1,500/month at typical SMB volumes and rises with usage.',
  },
  {
    question: 'Can the AI book appointments live?',
    answer:
      'Yes. The agent reads your real availability from Google Calendar, Outlook, Calendly, or your industry PMS during the call and books the appointment in real time, not later via a human team member.',
  },
  {
    question: 'What about after-hours and weekend calls?',
    answer:
      '24/7 coverage is included at the same fixed monthly cost. There is no premium upcharge for evenings, weekends, or holidays. Most deployments see 30-50% of bookings happen outside business hours.',
  },
  {
    question: 'Will my callers know they are talking to AI?',
    answer:
      'For routine booking, qualification, and intake calls, most callers do not realize. The voice is tuned for natural pacing and warmth. We disclose AI use where required by jurisdiction.',
  },
  {
    question: 'Can it transfer calls to a human when needed?',
    answer:
      'Yes. We define your transfer rules during onboarding, VIP allow-lists, urgent-criteria triggers, frustration detection, specific keywords. Flagged calls route to your team, on-call line, or backup human service in real time.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'Most deployments go live in 7 to 14 business days. Faster than hiring; slower than a self-serve free tier elsewhere, because we tune the script and integrations to your business before going live.',
  },
];

const FEATURES = [
  {
    Icon: Phone,
    title: '24/7 inbound at fixed monthly cost',
    description:
      'Every call answered within one ring. No per-minute billing. No after-hours upcharge.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: CalendarCheck,
    title: 'Live appointment booking',
    description:
      'Reads your real calendar in real time and books with full intake context.',
  },
  {
    Icon: Database,
    title: 'Two-way CRM sync',
    description:
      'Lead, transcript, recording, outcome, written back during the call.',
  },
  {
    Icon: PhoneForwarded,
    title: 'Live transfer to humans',
    description:
      'Allow-listed VIPs, urgent-criteria triggers, and complex cases route to a real person in seconds.',
  },
  {
    Icon: Globe2,
    title: 'Multi-language',
    description:
      'Deploy in English, Spanish, or both. Tone and pacing tuned per audience.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Shield,
    title: 'Recording + compliance',
    description:
      'Every call recorded and transcribed. HIPAA-ready data handling for medical and legal practices.',
  },
];

const SAMPLE_TRANSCRIPT = [
  { ts: '00:00', speaker: 'system' as const, text: 'Inbound · after-hours · 9:14 PM' },
  { ts: '00:02', speaker: 'agent' as const, text: 'Riverstone Plumbing, thanks for calling. How can I help?' },
  { ts: '00:06', speaker: 'caller' as const, text: 'I have a leak. Is this an emergency line?' },
  { ts: '00:09', speaker: 'agent' as const, text: 'Yes, describe the leak and tell me the address.' },
  { ts: '00:14', speaker: 'caller' as const, text: 'Active drip from a ceiling on the second floor. 47 Birch Ave.' },
  { ts: '00:19', speaker: 'agent' as const, text: 'Dispatching the on-call tech. ETA 35 minutes. Confirmation by text.' },
  { ts: '00:24', speaker: 'system' as const, text: 'Tech notified · CRM updated · job created' },
];

const INTEGRATIONS = [
  'GoHighLevel',
  'HubSpot',
  'Salesforce',
  'Zoho',
  'Google Calendar',
  'Outlook',
  'Calendly',
  'Twilio',
  'Zapier',
  'Make',
];

export default function AIPhoneAnsweringServicePage() {
  return (
    <>
      <SchemaOrg
        schema={[
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Phone Answering Service',
            description:
              'AI phone answering service for businesses, 24/7 coverage, fixed monthly cost, live booking, real CRM integration.',
            serviceType: 'AI Phone Answering Service',
            url: '/ai-phone-answering-service',
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'AI Phone Answering Service', href: '/ai-phone-answering-service' },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label="AI Phone Answering Service" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                AI phone answering service.{' '}
                <span className="text-brand-violet">24/7. Fixed cost.</span>
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Implenix is the AI phone answering service for local businesses
                and professional firms. Every call answered within one ring,
                qualified against your script, booked into your calendar, and
                synced to your CRM, at a fixed monthly cost regardless of call
                volume.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="answering-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my free missed-call audit <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/try-it"
                  data-cta-location="answering-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  Test Ron now
                </Link>
              </div>
              <dl className="grid grid-cols-3 max-w-lg pt-8 border-t border-brand-purple/15">
                <Stat label="Pickup" value="<1 ring" />
                <Stat label="Coverage" value="24 / 7" />
                <Stat label="Billing" value="fixed" />
              </dl>
            </div>
            <div className="lg:col-span-5">
              <div className="border border-brand-cyan/30 bg-black p-8">
                <span className="text-xs uppercase tracking-widest text-white/55 font-mono">
                  ▸ vs traditional
                </span>
                <p className="font-heading text-5xl md:text-6xl text-brand-cyan mt-3 leading-none">
                  -$700/mo
                </p>
                <p className="mt-3 font-body text-white/80 max-w-xs">
                  typical savings vs a per-minute live answering service at
                  moderate SMB volumes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="What it actually is"
            title="A 24/7 voice agent that replaces your answering service"
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 flex flex-col gap-4 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              <p>
                An AI phone answering service is a voice agent that
                answers your inbound business calls in real time, follows
                your script, and writes the outcome to your business
                systems. Traditional answering services bill{' '}
                <span className="text-brand-violet">per call or per
                minute</span>. AI phone answering runs continuously at{' '}
                <span className="text-brand-cyan">fixed cost</span>,
                handles unlimited concurrent calls, and integrates
                directly with your CRM instead of emailing a summary the
                next morning.
              </p>
              <p>
                The trade-off is real: human operators handle nuanced,
                emotionally complex calls in ways AI does not, yet.
                Most deployments solve this with{' '}
                <span className="text-white">live-transfer rules</span>:
                the AI handles 80-90% of routine inbound at fixed cost,
                and a smaller live team takes the remaining calls
                flagged for human handling.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                ▸ Same volume · different math
              </span>
              <div className="border border-brand-purple/25 bg-black flex flex-col divide-y divide-brand-purple/15">
                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-heading text-sm text-white">
                      Live answering service
                    </p>
                    <p className="font-body text-[11px] text-white/55 mt-0.5">
                      400 calls/mo · per-minute billing
                    </p>
                  </div>
                  <span className="font-mono text-lg text-white/50 line-through decoration-white/30">
                    $600-1,500
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between gap-4 bg-brand-cyan/8">
                  <div>
                    <p className="font-heading text-sm text-brand-cyan">
                      Implenix AI answering
                    </p>
                    <p className="font-body text-[11px] text-white/60 mt-0.5">
                      Same 400 calls/mo · fixed price
                    </p>
                  </div>
                  <span className="font-mono text-lg text-brand-cyan">
                    $297-597
                  </span>
                </div>
              </div>
              <div className="border-l-[3px] border-brand-purple bg-black p-4 mt-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet">
                  ▸ Coverage
                </span>
                <p className="font-heading text-lg text-white mt-1 leading-tight">
                  80-90% AI · 10-20% live human
                </p>
                <p className="font-body text-xs text-white/60 mt-1.5 leading-relaxed">
                  Routine inbound stays with AI. Sensitive / complex
                  calls route to your team via live transfer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Capabilities"
            title="What an AI phone answering service should do"
            description="Beyond just picking up the phone."
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
            <Badge label="An after-hours emergency call" variant="cyan" />
            <h2 className="font-heading text-3xl md:text-5xl leading-[1.05]">
              9:14 PM. Active leak. Tech dispatched in 24 seconds.
            </h2>
            <p className="font-body text-white/75 leading-relaxed max-w-xl">
              Most answering services charge a premium for after-hours
              coverage, and the operator still needs to call you to
              dispatch. Implenix takes the call, runs the urgent-criteria
              rules you defined, and notifies your on-call tech directly.
              No premium, no callback delay.
            </p>
          </div>
          <div className="lg:col-span-5">
            <CodeWindow
              title="riverstone-plumbing.after-hours.log"
              lines={SAMPLE_TRANSCRIPT}
              caption="Sample after-hours call · dispatched in 24s"
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The pricing math"
            title="Why fixed-cost wins as call volume grows"
            description="A live answering service at 200 calls/month: $400-$700. At 800 calls: $1,200-$2,400. Implenix stays at $297-$597 either way."
            badgeVariant="purple"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '$0', label: 'per-minute / per-call billing on Implenix' },
                { number: '$700+', label: 'typical monthly difference at moderate volume' },
                { number: '24/7', label: 'continuous coverage with no premium upcharge' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="vs traditional"
            title="AI Phone Answering Service vs Live Answering Service"
            description="Where each option lands on the dimensions that drive a real buying decision."
          />
          <div className="mt-12">
            <ComparisonTable
              highlightColumn={0}
              columns={[
                'Implenix · AI',
                'Live Answering Service',
                'Voicemail',
              ]}
              rows={[
                { label: 'Pricing model', cells: ['fixed monthly', 'per-minute / per-call', 'free'] },
                { label: '24/7 coverage', cells: [true, 'partial', true] },
                { label: 'Concurrent calls', cells: ['unlimited', 'staff-bound', 'n/a'] },
                { label: 'Live calendar booking', cells: [true, 'partial', false] },
                { label: 'Two-way CRM sync', cells: [true, 'partial', false] },
                { label: 'Live transfer to human', cells: [true, true, false] },
                { label: 'Recording + transcript', cells: [true, 'partial', 'partial'] },
                { label: 'Multi-language', cells: [true, 'partial', false] },
                { label: 'Typical SMB cost', cells: ['$297-$597', '$300-$1,500', '$0'] },
              ]}
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ai-receptionist-vs-answering-service"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              Deep-dive: vs Answering Service <ArrowRight size={14} aria-hidden />
            </Link>
            <Link
              href="/ai-receptionist-vs-call-center"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              vs Call Center <ArrowRight size={14} aria-hidden />
            </Link>
            <Link
              href="/ai-receptionist-vs-voicemail"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              vs Voicemail <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-black border-y border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-14 flex flex-col gap-8 items-center">
          <p className="text-xs uppercase tracking-widest text-white/55 font-mono text-center">
            ▸ Native two-way integrations
          </p>
          <div className="w-full">
            <LogoMarquee names={INTEGRATIONS} />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Frequently asked" />
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
            <Badge label="Stop overpaying for per-minute billing" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              See your real numbers before you switch.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. Industry-grade estimate of your missed-call
              cost and a side-by-side with what an AI phone answering service
              would recover.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="answering-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="answering-bottom"
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
              { href: '/smith-ai-alternative', label: 'Smith.ai alternative' },
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
