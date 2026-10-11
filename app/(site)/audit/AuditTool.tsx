'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  INDUSTRY_PROFILES,
  formatUsd,
  runAudit,
  type IndustryKey,
} from '@/lib/audit';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { trackConversion, submitWebhook, GA4_EVENTS } from '@/lib/analytics';

const inputSchema = z.object({
  phone: z
    .string()
    .min(7, 'Enter a phone number')
    .regex(/^[+\d\s()-]+$/, 'Numbers and dashes only'),
  industry: z.string().min(1, 'Pick an industry'),
  averageClientValue: z
    .string()
    .min(1, 'Enter your average client value')
    .regex(/^\d+$/, 'Numbers only'),
  // Optional: blank falls back to the industry median.
  weeklyCalls: z
    .string()
    .regex(/^\d*$/, 'Numbers only')
    .refine((v) => v === '' || (Number(v) >= 1 && Number(v) <= 5000), 'Between 1 and 5,000'),
});
type InputValues = z.infer<typeof inputSchema>;

const inputClass =
  'w-full bg-black border border-brand-purple/30 focus:border-brand-purple text-white px-3 py-2.5 rounded-sm font-body text-base placeholder:text-white/55';

type Stage = 'input' | 'result';

export function AuditTool() {
  const [stage, setStage] = useState<Stage>('input');
  const [snapshot, setSnapshot] = useState<{
    phone: string;
    industry: IndustryKey;
    averageClientValue: number;
    weeklyCalls?: number;
  } | null>(null);

  const form = useForm<InputValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: { phone: '', industry: '', averageClientValue: '', weeklyCalls: '' },
  });
  const selectedIndustry = form.watch('industry');

  const onSubmit = (values: InputValues) => {
    setSnapshot({
      phone: values.phone,
      industry: values.industry as IndustryKey,
      averageClientValue: Number(values.averageClientValue),
      weeklyCalls: values.weeklyCalls ? Number(values.weeklyCalls) : undefined,
    });
    setStage('result');
    trackConversion(GA4_EVENTS.auditRun, {
      industry: values.industry,
      averageClientValue: Number(values.averageClientValue),
    });
    void submitWebhook(
      {
        phone: values.phone,
        industry: values.industry,
        averageClientValue: Number(values.averageClientValue),
        weeklyCalls: values.weeklyCalls ? Number(values.weeklyCalls) : undefined,
      },
      'audit',
    );
  };

  const result = useMemo(() => {
    if (!snapshot) return null;
    return runAudit({
      industry: snapshot.industry,
      averageClientValue: snapshot.averageClientValue,
      weeklyCallVolume: snapshot.weeklyCalls,
    });
  }, [snapshot]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-stretch">
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-black border border-brand-purple/30 p-6 md:p-8 flex flex-col gap-5"
      >
        <header className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
            ▸ Step 1 · Tell us about your business
          </span>
        </header>
        <Field
          label="Business phone number"
          htmlFor="audit-phone"
          error={form.formState.errors.phone?.message}
        >
          <input
            id="audit-phone"
            type="tel"
            placeholder="(415) 555-0184"
            autoComplete="tel"
            className={inputClass}
            {...form.register('phone')}
          />
        </Field>
        <Field
          label="Industry"
          htmlFor="audit-industry"
          error={form.formState.errors.industry?.message}
        >
          <select
            id="audit-industry"
            defaultValue=""
            className={inputClass}
            {...form.register('industry')}
          >
            <option value="" disabled>
              Pick the closest match…
            </option>
            {Object.entries(INDUSTRY_PROFILES).map(([key, p]) => (
              <option key={key} value={key}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Average client value (USD)"
          htmlFor="audit-value"
          error={form.formState.errors.averageClientValue?.message}
        >
          <div className="flex items-center gap-2 bg-black border border-brand-purple/30 px-3">
            <span className="text-white/55 font-mono">$</span>
            <input
              id="audit-value"
              inputMode="numeric"
              placeholder="1500"
              className="flex-1 bg-transparent py-2.5 text-white font-mono text-base focus:outline-none"
              {...form.register('averageClientValue')}
            />
          </div>
        </Field>
        <Field
          label="Inbound calls per week (optional)"
          htmlFor="audit-calls"
          error={form.formState.errors.weeklyCalls?.message}
        >
          <input
            id="audit-calls"
            inputMode="numeric"
            placeholder={
              selectedIndustry && selectedIndustry in INDUSTRY_PROFILES
                ? `Industry median: ${INDUSTRY_PROFILES[selectedIndustry as IndustryKey].weeklyCalls}`
                : 'Leave blank to use the industry median'
            }
            className={inputClass}
            {...form.register('weeklyCalls')}
          />
        </Field>
        <button
          type="submit"
          data-cta-location="audit-input"
          data-cta-type="primary"
          className="mt-2 inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
        >
          Run my audit <ArrowRight size={16} aria-hidden />
        </button>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/55">
          <ShieldCheck size={12} className="text-brand-cyan" aria-hidden />
          We only use this number to follow up on your audit. No spam, no sharing.
        </div>
      </form>

      <AnimatePresence mode="wait">
        {stage === 'input' || !result ? (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-brand-purple/15 bg-black p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[420px]"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/55">
              ▸ Your report appears here
            </span>
            <p className="font-heading text-2xl text-white/60 max-w-sm">
              Run the audit to see what you’re losing.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-black border-l-[3px] border-brand-cyan p-6 md:p-8 flex flex-col gap-5"
          >
            <header className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-brand-cyan border border-brand-cyan/40 px-2 py-1">
                <AlertTriangle size={11} aria-hidden /> Your audit · {result.industryLabel}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/55">
                {snapshot?.phone}
              </span>
            </header>

            <div>
              <p className="text-xs uppercase tracking-widest text-white/55 font-mono">
                ▸ Estimated lost revenue · last 30 days
              </p>
              <p className="font-heading text-5xl md:text-6xl text-brand-cyan mt-3 leading-none">
                {formatUsd(result.monthlyLostRevenue)}
              </p>
              <p className="text-sm font-body text-white/70 mt-2">
                Based on ~{result.weeklyMissed} missed calls per week at{' '}
                {formatUsd(result.effectiveClientValue)} client value.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm font-body">
              <Stat label="Missed / week" value={`${result.weeklyMissed}`} />
              <Stat
                label="Lost / week"
                value={formatUsd(result.weeklyLostRevenue)}
              />
            </div>

            <div className="border border-brand-cyan/30 bg-brand-dark p-5 flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
                ▸ Full breakdown
              </span>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm font-body">
                <span className="text-white/65">Annual lost</span>
                <span className="text-white font-mono text-right">
                  {formatUsd(result.annualLostRevenue)}
                </span>
                <span className="text-white/65">Recoverable / mo</span>
                <span className="text-brand-cyan font-mono text-right">
                  {formatUsd(result.monthlyRecoverableRevenue)}
                </span>
                <span className="text-white/65">Recoverable / yr</span>
                <span className="text-brand-cyan font-mono text-right">
                  {formatUsd(result.annualRecoverableRevenue)}
                </span>
              </div>
            </div>

            <div className="border border-brand-purple/30 bg-black p-5 flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
                ▸ Step 2 · Save these numbers, get on a call
              </span>
              <p className="font-body text-sm text-white/80 leading-relaxed">
                Talk to Ron to hear the playbook live, or book a
                30-minute slot with the team, no email, no form.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <TestRonCTA
                  ctaLocation="audit-result-ron"
                  variant="primary"
                  className="flex-1"
                />
                <a
                  href="/contact"
                  data-cta-location="audit-result-calendar"
                  data-cta-type="calendar"
                  onClick={() =>
                    trackConversion(GA4_EVENTS.auditBookClicked, {
                      industry: snapshot?.industry,
                    })
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-5 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  <CalendarCheck size={16} aria-hidden /> Book a 30-min call
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="text-[10px] uppercase tracking-widest text-white/65 font-mono"
      >
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? <p className="text-brand-violet text-xs mt-1">{error}</p> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-brand-purple/15 p-3">
      <p className="text-[10px] uppercase tracking-widest text-white/55 font-mono">
        {label}
      </p>
      <p className="font-mono text-base text-white mt-1">{value}</p>
    </div>
  );
}
