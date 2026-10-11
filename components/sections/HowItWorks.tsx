'use client';

import { motion } from 'framer-motion';
import { PhoneCall, ListChecks, Database, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  StepOneVisual,
  StepTwoVisual,
  StepThreeVisual,
} from '@/components/common/StepVisuals';

type Step = {
  index: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  Visual: () => JSX.Element;
};

const STEPS: Step[] = [
  {
    index: '01',
    Icon: PhoneCall,
    title: 'AI answers every call',
    description:
      'Your dedicated agent picks up every inbound call within one ring, 24 hours a day, 7 days a week, with a script tuned for your industry.',
    bullets: ['Answered in under one ring', 'Custom script per industry', 'English + Spanish'],
    Visual: StepOneVisual,
  },
  {
    index: '02',
    Icon: ListChecks,
    title: 'Qualifies and books',
    description:
      'The agent follows your custom script, qualifies the lead, and books the appointment directly into your calendar, respecting capacity and team rotation.',
    bullets: [
      'Live booking against real availability',
      'Smart routing by job type',
      'Live transfer when needed',
    ],
    Visual: StepTwoVisual,
  },
  {
    index: '03',
    Icon: Database,
    title: 'Your CRM updates itself',
    description:
      'Every call is logged, every lead is created, every follow-up is scheduled, without you touching anything. Two-way sync, every time.',
    bullets: [
      'Two-way CRM sync',
      'Recordings + transcripts archived',
      'Automated follow-up scheduled',
    ],
    Visual: StepThreeVisual,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-black border-t border-brand-purple/15"
    >
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
        <header className="max-w-3xl">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-white">
            Three steps. Zero missed calls.
          </h2>
          <p className="mt-6 font-body text-white/70 text-lg md:text-xl leading-relaxed max-w-[60ch]">
            From the first ring to the CRM update, Implenix handles the
            entire call cycle. Watch each step happen in order.
          </p>
        </header>

        <ol className="mt-16 md:mt-24 flex flex-col gap-24 md:gap-36">
          {STEPS.map((step, i) => (
            <StepRow key={step.index} step={step} reversed={i % 2 === 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepRow({ step, reversed }: { step: Step; reversed: boolean }) {
  const { Icon, Visual } = step;
  return (
    <li className="grid lg:grid-cols-12 gap-8 md:gap-10 items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className={`lg:col-span-6 flex flex-col gap-5 order-2 ${
          reversed ? 'lg:order-2' : 'lg:order-1'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 border border-brand-cyan/30 bg-black flex items-center justify-center">
            <Icon size={18} className="text-brand-cyan" aria-hidden />
          </span>
          <span className="font-heading text-5xl md:text-6xl text-brand-violet leading-none">
            {step.index}
          </span>
        </div>
        <h3 className="font-heading text-3xl md:text-4xl text-white leading-tight">
          {step.title}
        </h3>
        <p className="font-body text-white/75 text-base lg:text-lg leading-relaxed max-w-xl">
          {step.description}
        </p>
        <ul className="flex flex-col gap-2 mt-2">
          {step.bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 font-body text-white/85 text-sm"
            >
              <ArrowRight size={14} className="text-brand-cyan mt-0.5 shrink-0" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`lg:col-span-6 order-1 ${reversed ? 'lg:order-1' : 'lg:order-2'}`}
      >
        <Visual />
      </motion.div>
    </li>
  );
}
