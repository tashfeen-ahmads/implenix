import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PhoneOutgoing,
  BellRing,
  Clock,
  RefreshCw,
  ListChecks,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { BookingWidget } from '@/components/common/BookingWidget';
import { RelatedContent } from '@/components/common/RelatedContent';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BentoCard } from '@/components/common/BentoCard';
import { CodeWindow } from '@/components/common/CodeWindow';
import { DividedStats } from '@/components/common/DividedStats';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { faqSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

const FEATURES = [
  {
    Icon: PhoneOutgoing,
    title: 'Outbound at the right cadence',
    description: 'Multi-step sequences that respect call windows and prior outcomes.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: BellRing,
    title: 'Reminders & confirmations',
    description: 'Reduce no-shows with timed pre-appointment outreach.',
  },
  {
    Icon: Clock,
    title: 'Time-zone aware',
    description: 'Calls go out during local business hours.',
  },
  {
    Icon: RefreshCw,
    title: 'Two-way CRM sync',
    description: 'Outcomes write back automatically.',
  },
  {
    Icon: ListChecks,
    title: 'Custom qualification logic',
    description: 'Define disqualifiers, hot triggers, and escalation rules.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Sparkles,
    title: 'Re-engagement of cold leads',
    description: 'Surface forgotten pipeline with periodic outreach.',
  },
];

const USE_CASES = [
  {
    title: 'New lead follow-up',
    body: 'Automatically call new leads within 60 seconds, qualify intent, and book a meeting.',
  },
  {
    title: 'Appointment reminder',
    body: 'Confirm upcoming appointments, reschedule conflicts, and reduce no-shows.',
  },
  {
    title: 'No-show re-engagement',
    body: 'Reach back out to no-shows the same day with a friendly path to rebook.',
  },
  {
    title: 'Estimate follow-up',
    body: 'Follow up on quotes that went cold and route warm replies to your closer.',
  },
];

const SAMPLE_TRANSCRIPT = [
  { ts: '00:00', speaker: 'system' as const, text: 'Outbound · new lead · 38s after CRM creation' },
  { ts: '00:02', speaker: 'agent' as const, text: 'Hi Sam, calling from Summit Realty about the listing on Cedar.' },
  { ts: '00:07', speaker: 'caller' as const, text: 'Yeah, is it still available?' },
  { ts: '00:09', speaker: 'agent' as const, text: 'It is. Want to book a showing this week?' },
  { ts: '00:13', speaker: 'caller' as const, text: 'Saturday morning works.' },
  { ts: '00:17', speaker: 'agent' as const, text: 'Booked, 10am Saturday. Confirmation incoming.' },
  { ts: '00:21', speaker: 'system' as const, text: 'Showing booked · agent assigned · CRM updated' },
];

const FAQS = [
  {
    question: 'How fast can the agent call a new lead?',
    answer:
      'Inside 60 seconds of the lead arriving in your CRM. Zillow, Realtor.com, and web-form data show conversion drops sharply past the 5-minute window; sub-minute callback captures leads before they dial a competitor.',
  },
  {
    question: 'Can the agent reschedule appointments live?',
    answer:
      'Yes. The agent reads real availability from your calendar (Google, Outlook, or your practice management system), offers alternative times, and writes the new booking back before the caller hangs up. No sync delay, no double-booking risk.',
  },
  {
    question: 'How do you handle TCPA and outbound compliance?',
    answer:
      'Every outbound campaign runs against a compliance layer: prior-express-written-consent verification on the target list, STOP-honor across voice and SMS, business-hours-only dialing, state-specific rules (Florida FTSA, Washington, Oklahoma), and identification as a virtual assistant on the greeting. We decline to build cold outbound to consumer mobiles from purchased lists, that scope is a TCPA class action waiting to happen.',
  },
  {
    question: 'What is the cap on outbound volume?',
    answer:
      'No practical cap on concurrency. We scale to match your funnel. Realistic ceiling is usually your compliance and consent posture, not the technology.',
  },
  {
    question: 'Do callers know they are talking to AI?',
    answer:
      'The agent identifies as a virtual assistant on the greeting. In deployments we measure, roughly 20-30% of callers realize they are speaking to AI mid-call, the disclosure preserves trust when they do. Hidden AI erodes trust when discovered, which it always eventually is.',
  },
];

export const metadata: Metadata = buildMetadata({
  title: 'AI Follow-up Calls That Close While You Work | Implenix',
  description:
    'Implenix AI follow-up calls qualify new leads, confirm appointments, and re-engage no-shows, automatically, on your CRM.',
  path: '/solutions/ai-followup',
});

export default function AIFollowupPage() {
  return (
    <>
      <SchemaOrg schema={[faqSchema(FAQS)]} />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label="Solution · AI follow-up" variant="purple" />
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[1.02]">
                AI follow-up calls that{' '}
                <span className="text-brand-cyan">close</span> while you work
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Outbound sequences, lead nurture, appointment reminders, and
                re-engagement campaigns. The Implenix follow-up agent calls
                every lead at the right moment.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/contact"
                  data-cta-location="solutions-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Book a Demo <ArrowRight size={16} />
                </Link>
                <Link
                  href="#faq"
                  data-cta-location="solutions-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  Read FAQ
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <CodeWindow
                title="summit-realty.followup.log"
                lines={SAMPLE_TRANSCRIPT}
                caption="Sample outbound · lead → showing booked in 21s"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Capabilities"
            title="What the follow-up agent does"
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
            eyebrow="Use cases"
            title="Four sequences we ship out of the box"
            badgeVariant="purple"
          />
          <div className="mt-10 grid sm:grid-cols-2 gap-5">
            {USE_CASES.map((u) => (
              <div
                key={u.title}
                className="border-l-[3px] border-brand-purple bg-black p-6"
              >
                <h3 className="font-heading text-xl text-white">{u.title}</h3>
                <p className="mt-2 font-body text-sm text-white/75 leading-relaxed">
                  {u.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Outcomes"
            title="What teams see after deployment"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '<60s', label: 'speed-to-lead on new inbound leads' },
                { number: '-29%', label: 'no-show rate on booked appointments' },
                { number: '+41%', label: 'cold pipeline re-engaged month over month' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeader
              eyebrow="Hear it"
              title="A real outbound qualification call"
              description="A real outbound qualification call routed back to a human closer."
              badgeVariant="purple"
            />
          </div>
          <AudioPlayer label="Demo: Real estate lead follow-up" />
        </div>
      </section>

      <section id="faq" className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="FAQ"
            title="Frequently asked"
          />
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {FAQS.map((f) => (
              <div key={f.question} className="border border-brand-purple/20 p-6">
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
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-2 gap-10">
          <SectionHeader
            eyebrow="Get started"
            title="Get a custom Implenix demo"
            description="We will design a follow-up sequence against your funnel and run a live test on your number."
            badgeVariant="purple"
          />
          <BookingWidget ctaLocation="solutions-ai-followup" height={620} />
        </div>
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent topic="More solutions" type="industry" />
        </div>
      </section>
    </>
  );
}
