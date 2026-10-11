import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Phone,
  Mic,
  Brain,
  CalendarCheck,
  Database,
  PhoneForwarded,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CodeWindow } from '@/components/common/CodeWindow';
import { Timeline } from '@/components/common/Timeline';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, articleSchema, serviceSchema } from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'How Does an AI Receptionist Work? Complete Guide | Implenix',
  description:
    'How an AI receptionist works step-by-step: voice AI, telephony, NLU, calendar booking, CRM sync, and live transfer. The full call lifecycle explained.',
  path: '/how-does-an-ai-receptionist-work',
});

const FAQS = [
  {
    question: 'How does an AI receptionist actually answer a call?',
    answer:
      'When a call lands on your business number, it routes through telephony infrastructure (typically a SIP trunk) into the voice AI. The agent picks up, plays the greeting, and starts listening. Speech-to-text converts the caller\'s words to text in real time, the language model classifies intent and extracts entities, and the response generator picks the next prompt from your defined script.',
  },
  {
    question: 'What technology does it use?',
    answer:
      'Conversational voice AI (text-to-speech and speech-to-text), natural language understanding for intent and entity extraction, telephony (SIP) for call routing, and APIs for two-way integration with your CRM and calendar. Modern systems use streaming audio so latency feels natural, under 800ms turn-taking.',
  },
  {
    question: 'How does it know what to say?',
    answer:
      'During onboarding, your team works with us to tune the call script, voice, qualification logic, and transfer rules. The agent follows that defined dialogue tree at runtime, it does not freelance answers. For questions outside the defined script, it transfers to a human or follows a fallback rule.',
  },
  {
    question: 'How does it book appointments live?',
    answer:
      'The agent makes an API call to your calendar (Google, Outlook, Calendly, or your industry PMS) during the conversation, reads back the next available slots, and writes the booking with full intake context once the caller confirms. The customer gets an SMS or email confirmation before the call ends.',
  },
  {
    question: 'How does it handle CRM sync?',
    answer:
      'Two-way API integration. During the call, the agent looks up the contact (if known) and writes the call event, transcript, recording URL, and outcome to the CRM record. After the call, follow-up tasks or pipeline stage changes happen automatically per your rules.',
  },
  {
    question: 'How does live transfer work?',
    answer:
      'Defined rules trigger transfers, VIP allow-list, urgent keywords, frustration detection (sentiment + tone), or specific intent classes. The agent says "let me get the right person" and warm-transfers the call to your team or backup human service via SIP within seconds.',
  },
  {
    question: 'What happens after the call ends?',
    answer:
      'The recording uploads to storage, the transcript finalizes, the contact and outcome write to your CRM, and any follow-up actions trigger (booking confirmation, reminder sequence, escalation queue). Reporting aggregates everything for your dashboard.',
  },
  {
    question: 'How long does setup take?',
    answer:
      '7 to 14 business days for most deployments. The work splits across script tuning, voice selection, integration setup, transfer rule definition, and a parallel-test phase before cutting over real traffic.',
  },
];

const SAMPLE_CALL = [
  { ts: '00:00', speaker: 'system' as const, text: 'Inbound · SIP routed to AI agent' },
  { ts: '00:00', speaker: 'system' as const, text: 'Audio stream opened · STT initialized' },
  { ts: '00:01', speaker: 'agent' as const, text: 'Greeting played from tuned script' },
  { ts: '00:04', speaker: 'caller' as const, text: 'I need to book a kitchen quote.' },
  { ts: '00:04', speaker: 'system' as const, text: 'Intent: book_estimate · entity: kitchen' },
  { ts: '00:07', speaker: 'agent' as const, text: 'Capturing scope, square footage, decision-maker' },
  { ts: '00:14', speaker: 'system' as const, text: 'Calendar API · 3 slots found · agent reads back' },
  { ts: '00:18', speaker: 'caller' as const, text: 'Wednesday at 10 works.' },
  { ts: '00:19', speaker: 'system' as const, text: 'Booking written · SMS confirmation sent · CRM updated' },
];

const PIPELINE_STEPS = [
  {
    title: 'Call hits your business number',
    description:
      'Your existing number forwards (or ports) to the Implenix SIP trunk. From the caller\'s side, nothing has changed, they dial the same number they always did.',
  },
  {
    title: 'Voice AI picks up within one ring',
    description:
      'The audio stream opens, speech-to-text initializes, and the agent plays the greeting from your tuned script. Latency is under 800ms turn-taking, natural conversation pace.',
  },
  {
    title: 'Caller intent gets classified',
    description:
      'Natural language understanding converts the caller\'s speech to structured intent and entities (book_appointment, request_quote, ask_pricing, emergency, etc.). Your defined script branches based on the classification.',
  },
  {
    title: 'Qualification + booking happens live',
    description:
      'The agent walks through your qualification questions, calls your calendar API live for availability, and books the appointment with full intake context once confirmed.',
  },
  {
    title: 'Transfer rules check on every turn',
    description:
      'Throughout the call, the agent evaluates transfer triggers, VIP allow-list, urgent keywords, sentiment, frustration, off-script questions. When triggered, it warm-transfers to your team or backup service.',
  },
  {
    title: 'CRM and downstream systems update',
    description:
      'Contact, call event, transcript, recording URL, and outcome write to your CRM during the call. Follow-up tasks, confirmations, and pipeline updates trigger per your rules.',
  },
];

export default function HowDoesAnAIReceptionistWorkPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: 'How Does an AI Receptionist Work? Complete Guide',
            description:
              'Step-by-step walkthrough of how an AI receptionist handles a call: voice AI, telephony, NLU, calendar, CRM, transfer rules.',
            url: '/how-does-an-ai-receptionist-work',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist',
            description:
              'AI receptionist that handles inbound calls end-to-end with voice AI and live integrations.',
            serviceType: 'AI Receptionist',
            url: '/how-does-an-ai-receptionist-work',
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
                label: 'How It Works',
                href: '/how-does-an-ai-receptionist-work',
              },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label="Guide · How it works" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
                How does an{' '}
                <span className="text-brand-purple">AI receptionist</span>{' '}
                work?
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                A complete walkthrough of the call lifecycle: how the call
                routes in, what the voice AI actually does, how booking and
                CRM sync happen live, and how transfer rules send the right
                calls to a human in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/try-it"
                  data-cta-location="how-does-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Hear it on a real number <ArrowRight size={16} />
                </Link>
                <Link
                  href="/"
                  data-cta-location="how-does-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  See the product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="At a glance"
            title="The call lifecycle, end to end"
            description="Five layers stacked between your phone line and your business systems. Every inbound call walks the stack top-to-bottom in under 2 minutes."
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-2">
              <ArchLayer
                number="01"
                title="Telephony (SIP trunk)"
                body="Your phone provider routes every inbound call to the AI's SIP endpoint. The agent picks up in under one ring."
                color="cyan"
              />
              <ArchLayer
                number="02"
                title="Voice I/O (STT + TTS)"
                body="Speech-to-text streams the caller's voice to text in real time; text-to-speech synthesizes the agent's replies back."
                color="purple"
              />
              <ArchLayer
                number="03"
                title="Intelligence (LLM + script)"
                body="A language model classifies intent and follows your tuned dialogue tree. No freelance answers, the agent walks defined branches."
                color="cyan"
              />
              <ArchLayer
                number="04"
                title="Integration (CRM + calendar + SMS)"
                body="Live API calls during the conversation, calendar lookups, CRM writes, SMS confirmations. Everything happens before the call ends."
                color="purple"
              />
              <ArchLayer
                number="05"
                title="Handoff rules"
                body="Every turn checks VIP allow-list, urgent keywords, sentiment, off-script triggers. Matches route via SIP transfer with a live context briefing."
                color="cyan"
                highlight
              />
            </div>
            <aside className="lg:col-span-5 flex flex-col gap-4">
              <div className="border border-brand-cyan/30 bg-black p-5 flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ Typical call length
                </span>
                <p className="font-heading text-3xl md:text-4xl text-brand-cyan leading-none">
                  30s - 2 min
                </p>
                <p className="font-body text-sm text-white/70 leading-relaxed">
                  For routine booking, qualification, and intake. Longer
                  for emergency triage with handoff.
                </p>
              </div>
              <div className="border border-brand-purple/30 bg-black p-5 flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-purple">
                  ▸ What lands in your CRM
                </span>
                <ul className="font-body text-sm text-white/85 flex flex-col gap-1.5 mt-1">
                  <li>· Full call recording + transcript</li>
                  <li>· Structured intake fields</li>
                  <li>· Classified intent + confidence</li>
                  <li>· Booking (if any) with time + provider</li>
                  <li>· Next-action tag for your team</li>
                </ul>
              </div>
              <div className="border-l-[3px] border-brand-cyan bg-black p-5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ Handoff SLA
                </span>
                <p className="font-body text-sm text-white/75 leading-relaxed mt-2">
                  Live SIP transfer to your team in{' '}
                  <span className="text-brand-cyan font-mono">under 8s</span>{' '}
                  when a handoff rule fires. Receiving human gets a
                  one-line context briefing so they pick up mid-
                  conversation, not from scratch.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionHeader
compact
              eyebrow="The pipeline"
              title="What happens on every call, step by step"
              badgeVariant="purple"
            />
            <p className="mt-6 font-body text-white/75 leading-relaxed">
              From the caller's side, this is a normal phone call. From the
              system's side, six things are happening in parallel.
            </p>
          </div>
          <div className="lg:col-span-7">
            <Timeline steps={PIPELINE_STEPS} />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Badge label="Behind the scenes" variant="cyan" />
            <h2 className="font-heading text-3xl md:text-5xl leading-[1.05]">
              The system events behind a single call
            </h2>
            <p className="font-body text-white/75 leading-relaxed max-w-xl">
              An annotated transcript showing what the voice layer, NLU,
              calendar API, and CRM writer are each doing during a 19-second
              booking call.
            </p>
          </div>
          <div className="lg:col-span-5">
            <CodeWindow
              title="agent-call-pipeline.log"
              lines={SAMPLE_CALL}
              caption="Annotated · system events alongside dialogue"
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The technology stack"
            title="Six components working together"
            description="Each plays a specific role in the call. The integration is what makes the whole agent practical."
            badgeVariant="purple"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <StackCard
              Icon={Phone}
              label="Telephony (SIP)"
              note="Routes the call from your business number to the agent. Standard infrastructure most phone providers support natively."
            />
            <StackCard
              Icon={Mic}
              label="Voice layer"
              note="Streaming speech-to-text + text-to-speech with sub-800ms turn-taking. Tuned per industry for tone."
            />
            <StackCard
              Icon={Brain}
              label="Natural language understanding"
              note="Classifies intent (book, quote, emergency, transfer) and extracts entities (address, scope, contact)."
            />
            <StackCard
              Icon={CalendarCheck}
              label="Calendar integration"
              note="Reads availability and writes bookings during the call. Supports Google, Outlook, Calendly, industry PMS."
            />
            <StackCard
              Icon={Database}
              label="CRM integration"
              note="Two-way: contact lookup at start, write-back during call. HubSpot, Salesforce, Zoho, GoHighLevel native."
            />
            <StackCard
              Icon={PhoneForwarded}
              label="Transfer router"
              note="Evaluates rules every turn. SIP-based warm transfers with context briefing for the human picking up."
            />
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
            <Badge label="Try it on a real call" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              The fastest way to understand it is to talk to it.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              Ron, our demo agent, runs in your browser as a sample HVAC
              receptionist. Try emergencies, quotes, reschedules, see how
              the pipeline above handles each one in real time.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/try-it"
              data-cta-location="how-does-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Test Ron now <ArrowRight size={16} />
            </Link>
            <Link
              href="/audit"
              data-cta-location="how-does-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Get my audit
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent
            topic="Keep reading"
            type="resource"
            links={[
              { href: '/what-is-an-ai-receptionist', label: 'What is an AI receptionist?' },
              { href: '/', label: 'AI Receptionist, main pillar' },
              { href: '/preview/dashboard', label: 'Inside the Implenix dashboard' },
            ]}
          />
        </div>
      </section>
    </>
  );
}

function StackCard({
  Icon,
  label,
  note,
}: {
  Icon: typeof Phone;
  label: string;
  note: string;
}) {
  return (
    <article className="bg-black border border-brand-purple/20 p-5 flex flex-col gap-3">
      <span className="w-9 h-9 border border-brand-cyan/30 bg-brand-dark flex items-center justify-center">
        <Icon size={16} className="text-brand-cyan" />
      </span>
      <p className="font-heading text-white text-base">{label}</p>
      <p className="text-xs font-body text-white/65 leading-relaxed">{note}</p>
    </article>
  );
}

function ArchLayer({
  number,
  title,
  body,
  color,
  highlight,
}: {
  number: string;
  title: string;
  body: string;
  color: 'cyan' | 'purple';
  highlight?: boolean;
}) {
  const isCyan = color === 'cyan';
  return (
    <div
      className={`relative flex items-start gap-4 p-4 md:p-5 border ${
        highlight
          ? 'border-brand-cyan ring-1 ring-brand-cyan/25'
          : isCyan
            ? 'border-brand-cyan/25 bg-brand-cyan/[0.04]'
            : 'border-brand-purple/25 bg-brand-purple/[0.04]'
      }`}
    >
      <span
        className={`font-heading text-3xl md:text-4xl leading-none shrink-0 ${
          isCyan ? 'text-brand-cyan' : 'text-brand-purple'
        }`}
      >
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-heading text-white text-base md:text-lg leading-snug">
          {title}
        </p>
        <p className="font-body text-sm text-white/70 leading-relaxed mt-1.5">
          {body}
        </p>
      </div>
    </div>
  );
}
