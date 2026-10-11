import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Cloud,
  Zap,
  Globe2,
  Database,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CodeWindow } from '@/components/common/CodeWindow';
import { ComparisonTable } from '@/components/common/ComparisonTable';
import { DividedStats } from '@/components/common/DividedStats';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, articleSchema, serviceSchema } from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Virtual AI Receptionist | Cloud-Hosted Agent | Implenix',
  description:
    'Virtual AI receptionist hosted in the cloud. No hardware, no on-prem install. Live in 72 hours, scale to peak instantly, integrate with your CRM live.',
  path: '/virtual-ai-receptionist',
});

const FAQS = [
  {
    question: 'What is a virtual AI receptionist?',
    answer:
      'A virtual AI receptionist is a cloud-hosted voice-AI agent that answers your business phone without any on-premise hardware or human staff on-site. The agent runs in our infrastructure, integrates with your phone routing via SIP, and handles inbound calls 24/7 from anywhere.',
  },
  {
    question: 'How is this different from a regular virtual assistant?',
    answer:
      'A virtual assistant is a remote human worker doing administrative work (email, calendar, research) that includes phone as a slice. A virtual AI receptionist is dedicated phone infrastructure, only handles calls, but does so 24/7 with unlimited concurrent capacity and real-time CRM integration.',
  },
  {
    question: 'Do I need to install anything on-site?',
    answer:
      'No. The agent runs entirely in the cloud. Your existing business number forwards to our SIP trunk, so you are live in 72 hours; if you want to port the number instead, porting runs in parallel through your carrier. Setup is configuration-only, no hardware installation.',
  },
  {
    question: 'Can it handle my call volume?',
    answer:
      'Yes. Concurrent capacity is unbounded. A hundred simultaneous callers all get answered in under one ring. Storm-driven spikes, tax-season surges, and holiday concurrency do not break the system.',
  },
  {
    question: 'How does it integrate with my existing tools?',
    answer:
      'Cloud-to-cloud API integration with your CRM (HubSpot, Salesforce, Zoho, GoHighLevel), calendar (Google, Outlook, Calendly), and industry PMS systems. No custom code typically required.',
  },
  {
    question: 'Is the cloud-hosted model secure?',
    answer:
      'Yes. We sign a BAA for HIPAA-regulated practices, encrypt audio and transcripts in transit and at rest, restrict access by role, and maintain audit logs. Compliance documentation is available on request.',
  },
];

const FEATURES = [
  {
    Icon: Cloud,
    label: 'Cloud-hosted',
    note: 'No on-premise hardware. Your existing business number forwards to the agent in our infrastructure.',
  },
  {
    Icon: Zap,
    label: 'Scales to peak',
    note: 'Unlimited concurrent capacity. The same agent handles one call or a hundred simultaneously.',
  },
  {
    Icon: Globe2,
    label: 'Multi-language',
    note: 'Deploy in English, Spanish, or both. Language can branch on the first turn of the call.',
  },
  {
    Icon: Database,
    label: 'Live integrations',
    note: 'Cloud-to-cloud API integration with your CRM, calendar, and dispatch tools. Two-way sync during the call.',
  },
];

export default function VirtualAIReceptionistPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: 'Virtual AI Receptionist',
            description:
              'Virtual AI receptionist hosted in the cloud, no on-prem hardware, scalable, integrated with your CRM and calendar live.',
            url: '/virtual-ai-receptionist',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: 'Virtual AI Receptionist',
            description:
              'Cloud-hosted virtual AI receptionist for businesses replacing on-prem receptionist or virtual assistant.',
            serviceType: 'Virtual AI Receptionist',
            url: '/virtual-ai-receptionist',
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'AI Receptionist', href: '/' },
              { label: 'Virtual AI Receptionist', href: '/virtual-ai-receptionist' },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label="Service · Virtual" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
                <span className="text-brand-violet">Virtual AI receptionist</span>
                . Hosted in the cloud.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                No hardware, no on-prem install, no human staff on-site.
                Implenix runs as a virtual AI receptionist in our cloud,
                connects to your phone routing via SIP, and handles every
                inbound call 24/7, with live CRM and calendar
                integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="virtual-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my missed-call audit <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/try-it"
                  data-cta-location="virtual-hero"
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
            eyebrow="What it is"
            title="A cloud-hosted alternative to in-office or virtual-assistant phone handling"
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 flex flex-col gap-4 font-body text-white/80 text-base leading-relaxed">
              <p>
                The phrase "virtual receptionist" historically meant a
                remote human worker with{' '}
                <span className="text-brand-violet">limited hours,
                single-call concurrency, training overhead, turnover
                risk</span>. A virtual AI receptionist is the same idea
                taken to its logical conclusion.
              </p>
              <p>
                Implenix hosts the entire agent in our cloud. Your
                business number forwards to our SIP trunk; the call
                flows through STT → tuned dialogue model → CRM API →
                TTS, with{' '}
                <span className="text-brand-cyan">sub-800ms turn-taking</span>.
              </p>
              <p>
                Setup is <span className="text-white font-medium">configuration
                only</span>, no hardware install, no PBX changes, no
                IT project. Deployments go live in 72 hours from kickoff:
                script and integrations built, test calls signed off, then
                routed to real traffic.
              </p>
            </div>
            <div className="lg:col-span-7 border border-brand-cyan/25 bg-black p-5 md:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ Cloud call path
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                  &lt;800ms end-to-end
                </span>
              </div>
              <ol className="flex flex-col gap-2">
                <PathStep index="1" label="Caller's phone" note="Any inbound number" color="cyan" />
                <PathStep index="2" label="Your business number" note="Forwards to Implenix · porting optional" color="cyan" />
                <PathStep index="3" label="Implenix SIP trunk" note="Cloud endpoint · unlimited concurrent" color="purple" />
                <PathStep index="4" label="Speech-to-text (streaming)" note="Real-time caller audio → text" color="purple" />
                <PathStep index="5" label="Tuned dialogue model" note="Intent + your script + business context" color="cyan" />
                <PathStep index="6" label="Live CRM + calendar APIs" note="Booking, contact write, availability check" color="cyan" />
                <PathStep index="7" label="Text-to-speech" note="Agent response synthesized back" color="purple" />
                <PathStep index="8" label="Caller hears reply" note="Full round-trip in under 800ms" color="purple" last />
              </ol>
              <div className="border-t border-brand-purple/15 pt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-heading text-2xl text-brand-cyan leading-none">0</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/50 mt-1.5">Hardware</p>
                </div>
                <div>
                  <p className="font-heading text-2xl text-brand-cyan leading-none">0</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/50 mt-1.5">PBX changes</p>
                </div>
                <div>
                  <p className="font-heading text-2xl text-brand-cyan leading-none">72h</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/50 mt-1.5">Deploy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Why virtual"
            title="What you get from a cloud-hosted AI receptionist"
            badgeVariant="purple"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map((f) => (
              <article
                key={f.label}
                className="bg-black border border-brand-purple/20 p-5 flex flex-col gap-3"
              >
                <span className="w-9 h-9 border border-brand-cyan/30 bg-brand-dark flex items-center justify-center">
                  <f.Icon size={16} className="text-brand-cyan" />
                </span>
                <p className="font-heading text-white text-base">{f.label}</p>
                <p className="text-xs font-body text-white/65 leading-relaxed">
                  {f.note}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-16">
            <DividedStats
              stats={[
                { number: '72 hours', label: 'Cloud deploy time, no hardware, no on-prem install' },
                { number: '<800ms', label: 'Turn-taking latency end-to-end through the cloud' },
                { number: 'unlimited', label: 'Concurrent calls, scales instantly with peak hours' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Hear it"
            title="A virtual receptionist call, end to end"
            description="The agent runs in our cloud. Your business number forwards to the SIP trunk. The caller never knows where the agent is hosted, they just know they got an instant answer."
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <CodeWindow
                title="virtual-receptionist.log"
                lines={[
                  { ts: '10:08', speaker: 'system', text: 'Inbound · SIP trunk → cloud agent · Caller ID resolved · CRM lookup complete' },
                  { ts: '10:08', speaker: 'agent', text: 'Thanks for calling Brookside Dental, this is Ron. Are you a current patient or new with us?' },
                  { ts: '10:08', speaker: 'caller', text: "I'm a current patient, just need to reschedule my Thursday cleaning." },
                  { ts: '10:08', speaker: 'agent', text: "I see you on Dr. Patel's calendar Thursday at 2pm. What day works better?" },
                  { ts: '10:08', speaker: 'caller', text: 'Friday afternoon if possible.' },
                  { ts: '10:08', speaker: 'agent', text: "Friday at 3pm with Dr. Patel, moved. You'll get a confirmation text and the new calendar invite in a moment. Anything else?" },
                  { ts: '10:09', speaker: 'caller', text: 'Nope, thanks.' },
                  { ts: '10:09', speaker: 'system', text: 'Calendar updated · CRM note added · SMS sent · No on-prem hardware involved · 47s' },
                ]}
                caption="Cloud-to-cloud, SIP, dialogue model, calendar, CRM, all hosted, all live"
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="border border-brand-purple/25 bg-black p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ Call path
                </span>
                <p className="mt-3 font-body text-white/85 text-sm leading-relaxed">
                  Caller → your business number → SIP trunk → cloud agent →
                  STT → tuned dialogue model → calendar/CRM API → TTS → caller.
                  Every hop happens in our infrastructure with sub-800ms
                  turn-taking.
                </p>
              </div>
              <div className="border border-brand-cyan/25 bg-black p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet">
                  ▸ On-prem hardware
                </span>
                <p className="mt-3 font-heading text-3xl text-white leading-tight">
                  None
                </p>
                <p className="mt-2 font-body text-white/70 text-sm">
                  No PBX changes, no IT project, no installs. Configuration only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Compared"
            title="Virtual AI Receptionist vs Virtual Assistant"
            description="Both are remote phone-handling services. The operating models are different."
          />
          <div className="mt-12">
            <ComparisonTable
              highlightColumn={0}
              columns={['Implenix · Virtual AI', 'Virtual Assistant']}
              rows={[
                { label: '24/7 phone coverage', cells: [true, false] },
                { label: 'Concurrent call handling', cells: ['unlimited', '1 at a time'] },
                { label: 'Custom industry script', cells: [true, 'partial'] },
                { label: 'Direct calendar booking', cells: [true, true] },
                { label: 'Two-way CRM sync', cells: [true, 'partial'] },
                { label: 'Email and admin work', cells: [false, true] },
                { label: 'Training overhead', cells: ['none', '20-60 hours'] },
                { label: 'Turnover risk', cells: ['none', 'high'] },
                { label: 'Monthly cost', cells: ['Custom quote', '$1,500-$4,000'] },
              ]}
            />
          </div>
          <div className="mt-8">
            <Link
              href="/ai-receptionist-vs-virtual-assistant"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              Deep-dive: AI Receptionist vs Virtual Assistant <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Common questions" />
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
            <Badge label="Cloud-deploy in 72 hours" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              See what cloud-hosted phone handling looks like for your business.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. We estimate your missed-call cost and what
              a virtual AI receptionist would recover.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="virtual-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="virtual-bottom"
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
                href: '/ai-receptionist-vs-virtual-assistant',
                label: 'AI Receptionist vs Virtual Assistant',
              },
              { href: '/24-7-ai-receptionist', label: '24/7 AI Receptionist' },
            ]}
          />
        </div>
      </section>
    </>
  );
}

function PathStep({
  index,
  label,
  note,
  color,
  last,
}: {
  index: string;
  label: string;
  note: string;
  color: 'cyan' | 'purple';
  last?: boolean;
}) {
  const isCyan = color === 'cyan';
  return (
    <li className="relative flex items-start gap-3">
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 border ${
          isCyan
            ? 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan'
            : 'border-brand-purple/40 bg-brand-purple/10 text-brand-violet'
        }`}
      >
        {index}
      </span>
      <div
        className={`flex-1 min-w-0 flex items-center justify-between gap-3 px-3 py-2 border ${
          isCyan ? 'border-brand-cyan/20' : 'border-brand-purple/20'
        } ${last ? '' : 'mb-1'}`}
      >
        <span className="font-body text-white text-sm">{label}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 hidden sm:inline">
          {note}
        </span>
      </div>
    </li>
  );
}
