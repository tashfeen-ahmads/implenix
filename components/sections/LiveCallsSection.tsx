'use client';

import { useState } from 'react';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AnimatedCallTranscript } from '@/components/common/AnimatedCallTranscript';
import {
  ALL_TRANSCRIPTS,
  type AnimatedTranscript,
} from '@/lib/animatedTranscripts';

const TABS: Array<{ id: AnimatedTranscript['id']; label: string; sub: string }> = [
  { id: 'home-improvement-es', label: 'Spanish · Windows', sub: 'Florida Green Improvement' },
  { id: 'roofing', label: 'English · Roof', sub: 'Emore FL Construction' },
  { id: 'glass-door', label: 'Address correction', sub: 'Green Innovation' },
  { id: 'real-estate-cash', label: 'Real estate · Cash', sub: 'Columbus Property' },
];

export function LiveCallsSection() {
  const [active, setActive] =
    useState<AnimatedTranscript['id']>('home-improvement-es');
  const transcript =
    ALL_TRANSCRIPTS.find((t) => t.id === active) ?? ALL_TRANSCRIPTS[0];

  return (
    <section className="bg-black border-t border-brand-purple/15">
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
        <SectionHeader
          eyebrow="Live · real calls"
          title="Watch the AI take a real call"
          description="Four real conversations from live deployments. Pick one and watch it play out."
          badgeVariant="purple"
        />
        <div className="mt-12 md:mt-16 flex flex-wrap gap-3">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`px-5 py-4 text-left font-body text-sm transition-colors border ${
                  isActive
                    ? 'bg-brand-purple text-white border-brand-purple'
                    : 'border-brand-purple/30 text-white/80 hover:border-brand-purple'
                }`}
              >
                <span className="block font-medium">{tab.label}</span>
                <span
                  className={`block text-[11px] font-mono uppercase tracking-widest mt-1 ${
                    isActive ? 'text-white/80' : 'text-white/45'
                  }`}
                >
                  {tab.sub}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-10 md:mt-12 grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8">
            <AnimatedCallTranscript
              key={transcript.id}
              title={transcript.title}
              caption={transcript.caption}
              lines={transcript.lines}
            />
          </div>
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="border border-brand-purple/25 bg-brand-dark p-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                ▸ Every call is real
              </span>
              <p className="mt-3 font-body text-white/85 text-sm leading-relaxed">
                These transcripts come from production traffic across our
                deployment portfolio. Names and addresses are redacted in
                public-facing copy, but the conversation flow, qualification
                logic, and booking handoff are exactly what shipped.
              </p>
            </div>
            <div className="border border-brand-cyan/25 bg-black p-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-purple">
                ▸ Languages live today
              </span>
              <p className="mt-3 font-heading text-3xl text-white leading-tight">
                EN + ES
              </p>
              <p className="mt-2 font-body text-white/70 text-sm">
                Language can branch on the first turn, caller-led, not
                menu-driven.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
