import type { Metadata } from 'next';
import { AudioLines, CalendarCheck, Clock, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { CodeWindow } from '@/components/common/CodeWindow';
import { BookingWidget } from '@/components/common/BookingWidget';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import {
  contactPageSchema,
  breadcrumbListSchema,
  speakableSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Book Implenix, Talk to Ron or Pick a Slot',
  description:
    'Talk to Ron, our AI receptionist, in your browser, or book a 30-minute slot with the team on the calendar. No sales form.',
  path: '/contact',
});

const SAMPLE_LOG = [
  { ts: '00:00', speaker: 'system' as const, text: 'Browser session · Ron joins instantly' },
  { ts: '00:02', speaker: 'agent' as const, text: 'Hi, I’m Ron from Implenix. What kind of business are you running?' },
  { ts: '00:06', speaker: 'caller' as const, text: 'HVAC, 5 trucks, missing too many after-hours calls.' },
  { ts: '00:10', speaker: 'agent' as const, text: 'Got it. Three quick questions and I can scope a deployment. Roughly how many inbound calls a month?' },
  { ts: '00:16', speaker: 'caller' as const, text: 'About 400.' },
  { ts: '00:20', speaker: 'agent' as const, text: 'Perfect, that profile fits our HVAC playbook. I can book you a 30-minute call with the team Tuesday at 10am or Wednesday at 2pm. Which works?' },
  { ts: '00:26', speaker: 'system' as const, text: '30-min call booked · calendar invite sent · no form filled' },
];

export default function ContactPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          contactPageSchema({
            url: '/contact',
          }),
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'Contact', href: '/contact' },
          ]),
          speakableSchema(),
        ]}
      />
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label="Skip the form" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                Two ways to start.{' '}
                <span className="text-brand-violet">No sales form.</span>
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Talk to Ron, our AI receptionist, right here in your
                browser and hear him run a real qualification
                conversation, or book a 30-minute call with the team on
                the calendar below.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <TestRonCTA ctaLocation="contact-hero" variant="primary" />
                <a
                  href="#book"
                  data-cta-location="contact-hero-scroll"
                  data-cta-type="calendar"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  <CalendarCheck size={16} aria-hidden /> Book a 30-min call
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-brand-cyan pt-2">
                <Clock size={14} aria-hidden />
                <span>
                  Ron is live 24/7 · Calendar slots open 14 days out
                </span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <CodeWindow
                title="implenix-inbound.log"
                lines={SAMPLE_LOG}
                caption="Sample conversation with Ron · scope + booking in one call"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="book"
        className="bg-black border-t border-brand-purple/15 scroll-mt-24"
      >
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-[2fr_1fr] gap-10 items-start">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-cyan font-mono">
              ▸ Pick a slot
            </span>
            <h2 className="font-heading text-2xl md:text-3xl text-white mt-3 mb-8">
              Book a 30-minute call with the team.
            </h2>
            <BookingWidget ctaLocation="contact-calendar" height={760} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="border border-brand-cyan/40 bg-black p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 border border-brand-cyan/40 bg-brand-dark flex items-center justify-center">
                  <AudioLines size={16} className="text-brand-cyan" aria-hidden />
                </span>
                <h3 className="font-heading text-lg text-white">Talk to Ron</h3>
              </div>
              <p className="text-sm font-body text-white/70 leading-relaxed">
                The fastest way to evaluate Implenix is to hear Ron run a
                live conversation. Same script, same routing, same booking
                logic that ships in production.
              </p>
              <TestRonCTA ctaLocation="contact-sidebar-ron" variant="primary" />
            </div>
            <div className="border border-brand-purple/30 bg-black p-5 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 border border-brand-purple/30 bg-brand-dark flex items-center justify-center">
                  <MessageSquare size={16} className="text-brand-violet" aria-hidden />
                </span>
                <h3 className="font-heading text-lg text-white">
                  What happens on the call
                </h3>
              </div>
              <ul className="mt-2 text-sm font-body text-white/70 leading-relaxed list-disc list-inside space-y-1">
                <li>We map your inbound profile</li>
                <li>Quote a deployment timeline</li>
                <li>Show real customer recordings</li>
                <li>You get a written scope after</li>
              </ul>
            </div>
            <div className="border-l-[3px] border-brand-cyan bg-black p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                ▸ Privacy
              </p>
              <p className="mt-2 text-xs text-white/65 font-body leading-relaxed">
                No newsletters or marketing lists. A calendar booking
                captures only your name, email, phone, website, the service
                you pick and any notes you add, so we can send the invite and
                prepare for the call.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
