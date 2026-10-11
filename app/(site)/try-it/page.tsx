import type { Metadata } from 'next';
import Link from 'next/link';
import { AudioLines, ArrowRight, Mic, Clock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { CodeWindow } from '@/components/common/CodeWindow';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import {
  serviceSchema,
  breadcrumbListSchema,
  speakableSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { TestRonCTA } from '@/components/ron/TestRonCTA';

export const metadata: Metadata = buildMetadata({
  title: 'Test Ron Live, Talk to Our AI Receptionist | Implenix',
  description:
    'Skip the video demo. Talk to Ron, the Implenix AI receptionist, right in your browser. He is set up as a sample HVAC front desk. No phone, no signup.',
  path: '/try-it',
});

const SAMPLE_TRANSCRIPT = [
  { ts: '00:00', speaker: 'system' as const, text: 'Browser demo · Northwind HVAC' },
  { ts: '00:02', speaker: 'agent' as const, text: 'Northwind HVAC, this is Ron. How can I help?' },
  { ts: '00:05', speaker: 'caller' as const, text: 'Hi, I want to test how you handle a real call.' },
  { ts: '00:09', speaker: 'agent' as const, text: 'Happy to demo. Try giving me a real-world request, like an emergency, a quote, or a reschedule.' },
  { ts: '00:14', speaker: 'caller' as const, text: 'My AC is out, can you book someone today?' },
  { ts: '00:18', speaker: 'agent' as const, text: 'Yes, what is the address, and what time window works?' },
];

const STEPS = [
  {
    Icon: AudioLines,
    title: '1 · Tap Test Ron now',
    body: 'No app, no phone, no signup. It runs in your browser.',
  },
  {
    Icon: Mic,
    title: '2 · Talk to Ron',
    body: 'Ron is set up as Northwind HVAC. Try emergencies, quotes, reschedules.',
  },
  {
    Icon: Clock,
    title: '3 · Hear it for yourself',
    body: 'Most people decide in under two minutes. Then book your real demo.',
  },
];

export default function TryItPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          serviceSchema({
            name: 'Implenix AI Receptionist, Live Demo',
            description:
              'Live in-browser demo of Ron, the Implenix AI receptionist, set up as a sample HVAC front desk. No signup, just talk.',
            serviceType: 'AI Receptionist',
            url: '/try-it',
          }),
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'Test Ron now', href: '/try-it' },
          ]),
          speakableSchema(),
        ]}
      />
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label="Live demo · no signup" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                Skip the video.{' '}
                <span className="text-brand-violet">Talk to Ron</span>{' '}
                yourself.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Ron is the Implenix AI receptionist. Talk to him right here
                in your browser, set up as the front desk of a sample HVAC
                company. No form. No signup. Just talk.
              </p>

              <div className="mt-2 flex flex-col gap-3 self-start">
                <TestRonCTA
                  ctaLocation="try-it-hero"
                  size="lg"
                />
                <p className="text-[11px] font-mono uppercase tracking-widest text-white/55">
                  ▸ Uses your microphone · works on desktop and mobile
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-6 border-t border-brand-purple/15">
                {STEPS.map(({ Icon, title, body }) => (
                  <div
                    key={title}
                    className="bg-black border border-brand-purple/20 p-4 flex flex-col gap-2"
                  >
                    <span className="w-8 h-8 border border-brand-cyan/30 bg-brand-dark flex items-center justify-center">
                      <Icon size={14} className="text-brand-cyan" aria-hidden />
                    </span>
                    <p className="font-heading text-white text-sm">{title}</p>
                    <p className="text-xs font-body text-white/65 leading-relaxed">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-5">
              <CodeWindow
                title="northwind-hvac.demo"
                lines={SAMPLE_TRANSCRIPT}
                caption="Sample of a recent demo conversation · 18 seconds in"
              />
              <div className="border border-brand-cyan/30 bg-black p-5 flex flex-col gap-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
                  <ShieldCheck size={11} aria-hidden /> Ron knows
                </span>
                <ul className="text-sm font-body text-white/85 grid grid-cols-2 gap-y-2 gap-x-4">
                  <li>· HVAC pricing</li>
                  <li>· Service area</li>
                  <li>· Emergency triage</li>
                  <li>· Tech availability</li>
                  <li>· Booking rules</li>
                  <li>· Transfer logic</li>
                </ul>
              </div>
              <div className="border-l-[3px] border-brand-purple bg-black p-5 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-violet">
                  ▸ What to try
                </span>
                <ul className="text-sm font-body text-white/85 flex flex-col gap-1.5 mt-1">
                  <li>· "My AC just died and I have kids at home."</li>
                  <li>· "Can I get a quote for a full system replacement?"</li>
                  <li>· "I need to reschedule tomorrow's appointment."</li>
                  <li>· "Do you service commercial properties?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-16 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <Badge label="Heard enough?" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Now book the real demo for your business.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              We will configure an Implenix agent against your industry, run
              it on a test number, and walk you through what we built.
            </p>
          </div>
          <div className="lg:col-span-5 flex lg:justify-end">
            <Link
              href="/contact"
              data-cta-location="try-it-bottom"
              data-cta-type="primary"
              className="inline-flex items-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Book a 30-min call <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
