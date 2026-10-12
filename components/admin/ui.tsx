import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

// Small UI kit for the team dashboard. Dense, dark, on-brand. Every
// admin page builds from these so the dashboard reads as one system.

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl md:text-3xl text-white leading-tight">{title}</h1>
        {description ? (
          <p className="mt-1.5 font-body text-sm text-white/65 max-w-2xl">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </header>
  );
}

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-white/10 bg-white/[0.02] rounded-md ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10">
          <h2 className="font-body text-sm font-semibold text-white">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-md px-5 py-4">
      <p className="font-body text-xs font-medium text-white/60">{label}</p>
      <p className="mt-2 font-heading text-3xl text-white tabular-nums leading-none">{value}</p>
      {hint ? <p className="mt-2 font-body text-xs text-white/55">{hint}</p> : null}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary: 'bg-brand-purple text-white hover:opacity-90',
  secondary: 'border border-white/20 text-white hover:bg-white/5',
  ghost: 'text-white/75 hover:text-white hover:bg-white/5',
  danger: 'border border-red-400/40 text-red-300 hover:bg-red-500/10',
} as const;

type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function buttonClass(variant: ButtonVariant = 'primary', extra = '') {
  return `inline-flex items-center justify-center gap-1.5 min-h-9 px-3.5 rounded-sm font-body text-sm font-medium transition-[color,background-color,transform] duration-150 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan ${BUTTON_VARIANTS[variant]} ${extra}`;
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant }) {
  return <button type="button" {...props} className={buttonClass(variant, className)} />;
}

export function ButtonLink({
  href,
  variant = 'primary',
  className = '',
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

export const inputClass =
  'w-full min-h-9 bg-black border border-white/15 rounded-sm px-3 py-2 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-cyan';

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-body text-xs font-medium text-white/80">
        {label}
      </label>
      {children}
      {hint ? <p className="font-body text-xs text-white/55">{hint}</p> : null}
    </div>
  );
}

const TONES = {
  neutral: 'bg-white/10 text-white/80',
  purple: 'bg-brand-purple/20 text-[#e3a6ff]',
  cyan: 'bg-brand-cyan/15 text-brand-cyan',
  green: 'bg-emerald-500/15 text-emerald-300',
  amber: 'bg-amber-500/15 text-amber-300',
  red: 'bg-red-500/15 text-red-300',
} as const;

export function Pill({ tone = 'neutral', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm font-body text-[11px] font-medium whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-white/15 rounded-md px-6 py-12 text-center">
      <p className="font-body text-sm font-semibold text-white">{title}</p>
      {body ? <p className="mt-1.5 font-body text-sm text-white/60 max-w-md mx-auto">{body}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

// Wraps wide tables so they scroll on narrow screens and stay keyboard-reachable.
export function TableWrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={label}
      className="relative overflow-x-auto border border-white/10 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
    >
      <table className="w-full text-left font-body text-sm">{children}</table>
    </div>
  );
}

export const thClass = 'px-4 py-2.5 font-body text-xs font-medium text-white/60 border-b border-white/10 whitespace-nowrap';
export const tdClass = 'px-4 py-3 text-white/85 border-b border-white/5 align-top';

// Every time on the dashboard is shown in one timezone (the booking
// calendar's), whatever the server or browser timezone is.
export const DASHBOARD_TZ = process.env.NEXT_PUBLIC_DASHBOARD_TIMEZONE || 'America/New_York';

export function formatDateTime(iso: string, timeZone: string = DASHBOARD_TZ) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: DASHBOARD_TZ }).format(
    new Date(iso),
  );
}

// Human labels for activity types on timelines.
export function activityLabel(type: string): string {
  const map: Record<string, string> = {
    'booking.created': 'Booked',
    'booking.status': 'Call',
    'stage.changed': 'Stage',
    note: 'Note',
    'client.created': 'Added',
    'client.updated': 'Updated',
    'email.sent': 'Email',
    'email.received': 'Reply',
  };
  return map[type] ?? type.split('.')[0];
}
