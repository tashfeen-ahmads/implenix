'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, CalendarCheck } from 'lucide-react';
import { TestRonCTA } from '@/components/ron/TestRonCTA';

export function ROICalculator() {
  const [callVolume, setCallVolume] = useState(400);
  const [answerRate, setAnswerRate] = useState(45);
  const [jobValue, setJobValue] = useState(420);
  // Gate stays in place, only path to the full breakdown is the
  // phone CTA or the calendar booking below.
  const unlocked = false;

  const missedPerMonth = useMemo(
    () => Math.max(0, Math.round(callVolume * (1 - answerRate / 100))),
    [callVolume, answerRate],
  );
  const lostRevenue = missedPerMonth * jobValue;
  const annualLost = lostRevenue * 12;
  const recoverable = Math.round(lostRevenue * 0.6);

  return (
    <div className="bg-black border border-brand-purple/30 p-6 md:p-10 grid lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <NumberInput
          label="Monthly inbound call volume"
          value={callVolume}
          onChange={setCallVolume}
          min={0}
        />
        <SliderInput
          label="Current answer rate"
          value={answerRate}
          onChange={setAnswerRate}
          suffix="%"
        />
        <NumberInput
          label="Average job value"
          value={jobValue}
          onChange={setJobValue}
          prefix="$"
          min={0}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="border-l-[3px] border-brand-cyan bg-brand-dark p-6">
          <span className="text-xs uppercase tracking-widest text-white/60">
            Estimated monthly loss
          </span>
          <p className="font-heading text-4xl md:text-5xl text-brand-cyan mt-2">
            ${lostRevenue.toLocaleString()}
          </p>
          <p className="mt-2 text-white/80 font-body text-sm">
            You are losing approximately ${lostRevenue.toLocaleString()} per
            month in unanswered calls.
          </p>
        </div>

        <div className="relative">
          <div
            className={`bg-brand-dark border border-brand-purple/30 p-6 space-y-3 ${
              unlocked ? '' : 'select-none pointer-events-none opacity-50'
            }`}
            aria-hidden={!unlocked}
          >
            <Breakdown
              label="Missed calls per month"
              value={`${missedPerMonth.toLocaleString()}`}
            />
            <Breakdown
              label="Annual lost revenue"
              value={`$${annualLost.toLocaleString()}`}
            />
            <Breakdown
              label="Recoverable with Implenix (60%)"
              value={`$${recoverable.toLocaleString()} / mo`}
            />
            <Breakdown
              label="Annualized recovery"
              value={`$${(recoverable * 12).toLocaleString()}`}
            />
          </div>

          {!unlocked && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-4 p-6 border border-brand-purple/40">
              <div className="flex items-center gap-2 text-brand-cyan">
                <Lock size={16} />
                <span className="text-xs uppercase tracking-widest">
                  Get on a call
                </span>
              </div>
              <p className="text-white text-center font-body text-sm max-w-sm">
                Talk to Ron about your numbers, or book a 30-minute slot on the calendar. No form.
              </p>
              <div className="w-full flex flex-col sm:flex-row gap-2 max-w-sm">
                <TestRonCTA
                  ctaLocation="roi-calculator-ron"
                  variant="primary"
                  className="flex-1"
                />
                <Link
                  href="/contact"
                  data-cta-location="roi-calculator-calendar"
                  data-cta-type="calendar"
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-5 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  <CalendarCheck size={14} /> Book slot
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  min,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-white/70">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-2 bg-black border border-brand-purple/30 px-3">
        {prefix ? <span className="text-white/60">{prefix}</span> : null}
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          onChange={(e) => onChange(Number(e.target.value || 0))}
          className="flex-1 bg-transparent py-3 text-white font-mono text-lg focus:outline-none"
        />
      </div>
    </label>
  );
}

function SliderInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-white/70">
          {label}
        </span>
        <span className="font-mono text-brand-cyan text-lg">
          {value}
          {suffix ?? ''}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-brand-purple"
      />
    </label>
  );
}

function Breakdown({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brand-purple/15 pb-2 last:border-b-0 last:pb-0">
      <span className="text-white/70 text-sm font-body">{label}</span>
      <span className="text-brand-cyan font-mono text-base">{value}</span>
    </div>
  );
}
