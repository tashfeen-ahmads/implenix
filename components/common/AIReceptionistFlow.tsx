'use client';

import { motion } from 'framer-motion';
import {
  Phone,
  MessageCircle,
  CalendarCheck,
  Database,
  ArrowRight,
} from 'lucide-react';

const STEPS = [
  {
    Icon: Phone,
    label: 'Call rings in',
    detail: '<1 ring pickup',
    color: 'cyan',
  },
  {
    Icon: MessageCircle,
    label: 'Agent qualifies',
    detail: 'Industry-tuned script',
    color: 'purple',
  },
  {
    Icon: CalendarCheck,
    label: 'Books the slot',
    detail: 'Live calendar sync',
    color: 'cyan',
  },
  {
    Icon: Database,
    label: 'Writes to CRM',
    detail: 'Two-way, real-time',
    color: 'purple',
  },
] as const;

// Visual concept diagram of the AI receptionist workflow. Renders a
// vertical (mobile) or horizontal (desktop) flow with icons, arrows,
// and stat callouts. Used on the homepage Answer block so the
// "What is an AI receptionist?" question gets a visual answer,
// not just a paragraph.
export function AIReceptionistFlow() {
  return (
    <div className="relative bg-black border border-brand-purple/25 p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
          <span className="relative flex h-2 w-2">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan" />
          </span>
          Live workflow
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">
          Every inbound call
        </span>
      </div>

      <ol className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-2">
        {STEPS.map((step, i) => {
          const isCyan = step.color === 'cyan';
          return (
            <li key={step.label} className="flex flex-col md:flex-row md:flex-1 items-stretch gap-3 md:gap-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className={`flex-1 flex md:flex-col items-center md:items-start gap-3 p-3 md:p-4 border ${
                  isCyan
                    ? 'border-brand-cyan/30 bg-brand-cyan/5'
                    : 'border-brand-purple/30 bg-brand-purple/5'
                }`}
              >
                <span
                  className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border shrink-0 ${
                    isCyan
                      ? 'border-brand-cyan/40 bg-black text-brand-cyan'
                      : 'border-brand-purple/40 bg-black text-brand-purple'
                  }`}
                >
                  <step.Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/50">
                    Step {i + 1}
                  </p>
                  <p className="font-heading text-white text-sm md:text-base leading-tight mt-1">
                    {step.label}
                  </p>
                  <p
                    className={`text-[11px] font-body mt-1 leading-tight ${
                      isCyan ? 'text-brand-cyan' : 'text-brand-purple'
                    }`}
                  >
                    {step.detail}
                  </p>
                </div>
              </motion.div>
              {i < STEPS.length - 1 ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: i * 0.15 + 0.15, duration: 0.3 }}
                  aria-hidden
                  className="self-center flex items-center justify-center text-white/40 shrink-0"
                >
                  <span className="flex rotate-90 md:rotate-0">
                    <ArrowRight size={16} />
                  </span>
                </motion.span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 pt-5 border-t border-brand-purple/15 grid grid-cols-3 gap-3">
        <Stat number="24/7" label="Coverage" />
        <Stat number="<1 ring" label="Pickup" />
        <Stat number="$0/min" label="Per-minute cost" />
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="font-heading text-xl md:text-2xl text-brand-cyan leading-none">
        {number}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/55 mt-1.5">
        {label}
      </p>
    </div>
  );
}
