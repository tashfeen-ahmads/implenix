'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  demoFormSchema,
  type DemoFormValues,
  gateFormSchema,
  type GateFormValues,
  newsletterFormSchema,
  type NewsletterFormValues,
  lpFormSchema,
  type LpFormValues,
  BUSINESS_TYPES,
} from '@/lib/forms';
import { trackLead, submitWebhook, GA4_EVENTS } from '@/lib/analytics';

type Variant = 'demo' | 'gate' | 'newsletter' | 'lp';

type Props = {
  variant: Variant;
  ctaLocation: string;
  onSuccess?: () => void;
};

const inputClass =
  'w-full bg-black border border-brand-purple/30 focus:border-brand-purple text-white px-4 py-3 rounded-sm font-body text-sm placeholder:text-white/40 transition-colors';

const labelClass = 'text-xs uppercase tracking-widest text-white/70 font-body';

const errorClass = 'text-brand-purple text-xs mt-1';

export function LeadForm({ variant, ctaLocation, onSuccess }: Props) {
  const [submitted, setSubmitted] = useState(false);

  if (variant === 'demo') {
    return (
      <DemoForm
        ctaLocation={ctaLocation}
        submitted={submitted}
        setSubmitted={setSubmitted}
        onSuccess={onSuccess}
      />
    );
  }
  if (variant === 'gate') {
    return (
      <GateForm
        ctaLocation={ctaLocation}
        submitted={submitted}
        setSubmitted={setSubmitted}
        onSuccess={onSuccess}
      />
    );
  }
  if (variant === 'newsletter') {
    return (
      <NewsletterForm
        ctaLocation={ctaLocation}
        submitted={submitted}
        setSubmitted={setSubmitted}
        onSuccess={onSuccess}
      />
    );
  }
  return (
    <LpForm
      ctaLocation={ctaLocation}
      submitted={submitted}
      setSubmitted={setSubmitted}
      onSuccess={onSuccess}
    />
  );
}

type SubProps = {
  ctaLocation: string;
  submitted: boolean;
  setSubmitted: (v: boolean) => void;
  onSuccess?: () => void;
};

function DemoForm({ ctaLocation, submitted, setSubmitted, onSuccess }: SubProps) {
  const form = useForm<DemoFormValues>({ resolver: zodResolver(demoFormSchema) });
  const onSubmit = async (data: DemoFormValues) => {
    await submitWebhook(data, ctaLocation);
    trackLead(ctaLocation, GA4_EVENTS.leadDemo);
    setSubmitted(true);
    onSuccess?.();
    // <!-- CONNECT TO CALENDLY OR CRM ENDPOINT -->
  };
  if (submitted) {
    return <SuccessMessage message="A member of the Implenix team will call you within 24 hours." />;
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <Field label="First Name" htmlFor="firstName" error={form.formState.errors.firstName?.message}>
        <input id="firstName" className={inputClass} {...form.register('firstName')} />
      </Field>
      <Field label="Business Type" htmlFor="businessType" error={form.formState.errors.businessType?.message}>
        <select id="businessType" className={inputClass} defaultValue="" {...form.register('businessType')}>
          <option value="" disabled>Select...</option>
          {BUSINESS_TYPES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Phone" htmlFor="phone" error={form.formState.errors.phone?.message}>
        <input id="phone" type="tel" className={inputClass} {...form.register('phone')} />
      </Field>
      <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
        <input id="email" type="email" className={inputClass} {...form.register('email')} />
      </Field>
      <Field
        label="Monthly Call Volume"
        htmlFor="callVolume"
        error={form.formState.errors.callVolume?.message}
        full
      >
        <select id="callVolume" className={inputClass} defaultValue="" {...form.register('callVolume')}>
          <option value="" disabled>Select...</option>
          <option value="under-100">Under 100</option>
          <option value="100-500">100-500</option>
          <option value="500-plus">500+</option>
        </select>
      </Field>
      <button
        type="submit"
        data-cta-location={ctaLocation}
        data-cta-type="demo"
        disabled={form.formState.isSubmitting}
        className="md:col-span-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90 disabled:opacity-50"
      >
        Book My Demo
      </button>
    </form>
  );
}

function GateForm({ ctaLocation, submitted, setSubmitted, onSuccess }: SubProps) {
  const form = useForm<GateFormValues>({ resolver: zodResolver(gateFormSchema) });
  const onSubmit = async (data: GateFormValues) => {
    await submitWebhook(data, ctaLocation);
    trackLead(ctaLocation, GA4_EVENTS.leadAudit);
    setSubmitted(true);
    onSuccess?.();
    // <!-- CONNECT FORM SUBMISSION TO CRM ENDPOINT HERE -->
  };
  if (submitted) {
    return <SuccessMessage message="Unlocked. Your full breakdown is ready." />;
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <Field label="Name" htmlFor="gate-name" error={form.formState.errors.name?.message}>
        <input id="gate-name" className={inputClass} {...form.register('name')} />
      </Field>
      <Field label="Email" htmlFor="gate-email" error={form.formState.errors.email?.message}>
        <input id="gate-email" type="email" className={inputClass} {...form.register('email')} />
      </Field>
      <button
        type="submit"
        data-cta-location={ctaLocation}
        data-cta-type="gate"
        disabled={form.formState.isSubmitting}
        className="sm:col-span-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90 disabled:opacity-50"
      >
        Get the full breakdown
      </button>
    </form>
  );
}

function NewsletterForm({ ctaLocation, submitted, setSubmitted, onSuccess }: SubProps) {
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
  });
  const onSubmit = async (data: NewsletterFormValues) => {
    await submitWebhook(data, ctaLocation);
    trackLead(ctaLocation, GA4_EVENTS.leadNewsletter);
    setSubmitted(true);
    onSuccess?.();
  };
  if (submitted) {
    return <SuccessMessage message="Subscribed. Check your inbox." />;
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row gap-3"
    >
      <input
        type="email"
        placeholder="you@business.com"
        className={`${inputClass} flex-1`}
        {...form.register('email')}
      />
      <button
        type="submit"
        data-cta-location={ctaLocation}
        data-cta-type="primary"
        className="bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
      >
        Subscribe
      </button>
      {form.formState.errors.email && (
        <p className={errorClass}>{form.formState.errors.email.message}</p>
      )}
    </form>
  );
}

function LpForm({ ctaLocation, submitted, setSubmitted, onSuccess }: SubProps) {
  const form = useForm<LpFormValues>({ resolver: zodResolver(lpFormSchema) });
  const onSubmit = async (data: LpFormValues) => {
    await submitWebhook(data, ctaLocation);
    trackLead(ctaLocation, GA4_EVENTS.leadDemo, { variant: 'lp' });
    setSubmitted(true);
    onSuccess?.();
  };
  if (submitted) {
    return <SuccessMessage message="We will call you back within one business hour." />;
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-3"
    >
      <Field label="Name" htmlFor="lp-name" error={form.formState.errors.name?.message}>
        <input id="lp-name" className={inputClass} {...form.register('name')} />
      </Field>
      <Field label="Phone" htmlFor="lp-phone" error={form.formState.errors.phone?.message}>
        <input id="lp-phone" type="tel" className={inputClass} {...form.register('phone')} />
      </Field>
      <Field label="Business Type" htmlFor="lp-business" error={form.formState.errors.businessType?.message}>
        <select
          id="lp-business"
          className={inputClass}
          defaultValue=""
          {...form.register('businessType')}
        >
          <option value="" disabled>Select...</option>
          {BUSINESS_TYPES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </Field>
      <button
        type="submit"
        data-cta-location={ctaLocation}
        data-cta-type="primary"
        disabled={form.formState.isSubmitting}
        className="bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90 disabled:opacity-50"
      >
        Get My Free Audit
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'md:col-span-2' : undefined}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? <p className={errorClass}>{error}</p> : null}
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="border-l-[3px] border-brand-cyan bg-black p-6">
      <p className="font-heading text-brand-cyan text-lg">Thank you.</p>
      <p className="mt-2 text-white/80 font-body text-sm">{message}</p>
    </div>
  );
}
