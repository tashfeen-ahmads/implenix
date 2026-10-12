'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Video,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { trackConversion, GA4_EVENTS } from '@/lib/analytics';
import { buildIcs, googleCalendarUrl } from '@/lib/calendarLinks';
import { SERVICES } from '@/lib/db/types';

type Slot = { startIso: string; endIso: string; label: string };

// Slot times are computed in the booking timezone; every later step must
// show them in that same zone (with its label), not the browser's.
const DEFAULT_TIMEZONE = 'America/New_York';
type BookingForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  service: string;
  notes: string;
};

const EMPTY_FORM: BookingForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  website: '',
  service: 'ai-receptionist',
  notes: '',
};

function formatSlot(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  });
}

// "America/New_York" -> "Eastern Time"
function timeZoneName(timeZone: string): string {
  try {
    const part = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longGeneric',
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

const UNAVAILABLE_MESSAGE =
  'We can’t load open times right now. Please try again in a minute, or email support@implenix.net and we’ll set up a time with you.';
const BOOKING_FAILED_MESSAGE =
  'We couldn’t confirm that booking. Please try again, or email support@implenix.net and we’ll lock in the time for you.';

type Availability = {
  date: string;
  timezone: string;
  durationMinutes: number;
  slots: Slot[];
};

type BookedResponse = {
  success: true;
  eventId: string;
  meetingUrl: string | null;
  meetingProvider: 'zoom' | 'google-meet' | null;
  start: string;
  end: string;
};

type Props = {
  ctaLocation: string;
  height?: number; // kept for API compatibility with CalendlyEmbed callers
};

type Step = 'date' | 'time' | 'form' | 'confirmed';

// Native booking widget that talks to /api/availability + /api/book.
// State machine: date → time → form → confirmed. Drop-in replacement
// for CalendlyEmbed, the ctaLocation prop is the identifier used in
// analytics conversion events.
export function BookingWidget({ ctaLocation, height }: Props) {
  const [step, setStep] = useState<Step>('date');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [booked, setBooked] = useState<BookedResponse | null>(null);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  // Moving between steps unmounts the focused control; send keyboard and
  // screen-reader focus to the new step instead of dropping it to <body>.
  const stepRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    stepRef.current?.focus();
  }, [step]);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);

  const monthDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthLabel = monthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const [rules, setRules] = useState<BookingRules>(DEFAULT_RULES);
  useEffect(() => {
    fetch('/api/booking-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg: (BookingRules & { timezone?: string }) | null) => {
        if (!cfg) return;
        setRules({ workingDays: cfg.workingDays, maxLeadDays: cfg.maxLeadDays });
        if (cfg.timezone) setTimezone(cfg.timezone);
      })
      .catch(() => {});
  }, []);
  const days = useMemo(() => buildMonthGrid(monthDate, rules), [monthDate, rules]);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlotError(null);
    setAvailability(null);
    fetch(`/api/availability?date=${selectedDate}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          // Server-side failures (missing config, Google outage) are
          // logged for us; visitors get a plain message with a way out.
          if (res.status >= 500) {
            console.error('[booking] availability failed:', data.error);
            throw new Error(UNAVAILABLE_MESSAGE);
          }
          throw new Error(data.error ?? UNAVAILABLE_MESSAGE);
        }
        return (await res.json()) as Availability;
      })
      .then((data) => {
        if (cancelled) return;
        setAvailability(data);
        if (data.timezone) setTimezone(data.timezone);
      })
      .catch((err) => {
        if (cancelled) return;
        setSlotError(err instanceof Error ? err.message : UNAVAILABLE_MESSAGE);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const submitBooking = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setBookError(null);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          website: form.website,
          service: form.service,
          notes: form.notes,
          startIso: selectedSlot.startIso,
          ctaLocation,
          page: window.location.pathname,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as
        | BookedResponse
        | { error?: string };
      if (!res.ok || !('success' in data)) {
        const detail = 'error' in data ? data.error : undefined;
        if (res.status >= 500) {
          console.error('[booking] booking failed:', detail);
          throw new Error(BOOKING_FAILED_MESSAGE);
        }
        throw new Error(detail || BOOKING_FAILED_MESSAGE);
      }
      setBooked(data);
      setStep('confirmed');
      trackConversion(GA4_EVENTS.leadDemo, {
        source: 'booking-widget',
        cta_location: ctaLocation,
      });
    } catch (err) {
      setBookError(err instanceof Error ? err.message : BOOKING_FAILED_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="bg-black border border-brand-purple/30 flex flex-col"
      style={height ? { minHeight: height } : undefined}
    >
      <div className="flex items-center justify-between border-b border-brand-purple/25 px-4 sm:px-5 py-3 bg-brand-dark">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-brand-cyan/40 bg-black flex items-center justify-center rounded-full">
            <CalendarCheck size={14} className="text-brand-cyan" aria-hidden />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-body text-white text-[13px] font-medium">
              Book with Implenix
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan/80">
              30-minute video call
            </span>
          </div>
        </div>
        {step !== 'date' && step !== 'confirmed' ? (
          <button
            type="button"
            onClick={() => {
              if (step === 'form') setStep('time');
              else if (step === 'time') setStep('date');
            }}
            className="inline-flex items-center gap-1.5 min-h-10 px-2 -mr-2 font-mono text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} aria-hidden /> Back
          </button>
        ) : null}
      </div>

      <div
        ref={stepRef}
        tabIndex={-1}
        aria-label="Booking step"
        className="p-4 sm:p-6 flex-1 flex flex-col gap-5 focus:outline-none"
      >
        {step === 'date' ? (
          <DateStep
            monthLabel={monthLabel}
            days={days}
            selectedDate={selectedDate}
            onSelect={(d) => {
              setSelectedDate(d);
              setStep('time');
            }}
            onPrev={() => setMonthOffset((n) => Math.max(0, n - 1))}
            onNext={() => setMonthOffset((n) => n + 1)}
            canGoBack={monthOffset > 0}
            maxLeadDays={rules.maxLeadDays}
          />
        ) : null}

        {step === 'time' ? (
          <TimeStep
            date={selectedDate!}
            loading={loadingSlots}
            error={slotError}
            availability={availability}
            onSelect={(slot) => {
              setSelectedSlot(slot);
              setStep('form');
            }}
          />
        ) : null}

        {step === 'form' && selectedSlot ? (
          <FormStep
            slot={selectedSlot}
            timezone={timezone}
            form={form}
            setForm={setForm}
            error={bookError}
            submitting={submitting}
            onSubmit={submitBooking}
          />
        ) : null}

        {step === 'confirmed' && booked ? (
          <ConfirmedStep booked={booked} timezone={timezone} form={form} />
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function DateStep({
  monthLabel,
  days,
  selectedDate,
  onSelect,
  onPrev,
  onNext,
  canGoBack,
  maxLeadDays,
}: {
  monthLabel: string;
  days: { iso: string; day: number; disabled: boolean; inMonth: boolean }[];
  selectedDate: string | null;
  onSelect: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canGoBack: boolean;
  maxLeadDays: number;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoBack}
          className="w-9 h-9 border border-brand-purple/30 hover:border-brand-purple disabled:opacity-30 flex items-center justify-center transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} className="text-brand-cyan" aria-hidden />
        </button>
        <span className="font-heading text-white text-lg">{monthLabel}</span>
        <button
          type="button"
          onClick={onNext}
          className="w-9 h-9 border border-brand-purple/30 hover:border-brand-purple flex items-center justify-center transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={14} className="text-brand-cyan" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span
            key={i}
            className="font-mono text-[10px] uppercase tracking-widest text-white/55 pb-2"
          >
            {d}
          </span>
        ))}
        {days.map((d) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => !d.disabled && onSelect(d.iso)}
            disabled={d.disabled}
            aria-label={dayLabel(d.iso)}
            aria-pressed={selectedDate === d.iso}
            className={`h-11 flex items-center justify-center font-body text-sm transition-colors ${
              !d.inMonth
                ? 'text-white/15'
                : d.disabled
                  ? 'text-white/25 cursor-not-allowed'
                  : selectedDate === d.iso
                    ? 'bg-brand-purple text-white'
                    : 'border border-brand-purple/20 text-white/85 hover:border-brand-purple hover:bg-brand-purple/10'
            }`}
          >
            {d.day}
          </button>
        ))}
      </div>
      <p className="font-body text-xs text-white/55 leading-relaxed">
        Pick a day to see open times. Working days only, up to {maxLeadDays}{' '}
        days ahead.
      </p>
    </>
  );
}

function TimeStep({
  date,
  loading,
  error,
  availability,
  onSelect,
}: {
  date: string;
  loading: boolean;
  error: string | null;
  availability: Availability | null;
  onSelect: (slot: Slot) => void;
}) {
  // `date` is a calendar day (YYYY-MM-DD). new Date('YYYY-MM-DD') parses
  // as UTC midnight, which is the previous evening in US time zones, so
  // build it as a local date instead.
  const [y, m, d] = date.split('-').map(Number);
  const readable = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-brand-cyan" aria-hidden />
          <span className="font-heading text-white text-base">{readable}</span>
        </div>
        {availability?.timezone ? (
          <span className="font-body text-xs text-white/55">
            Times shown in {timeZoneName(availability.timezone)}
          </span>
        ) : null}
      </div>
      {loading ? (
        <div role="status" className="flex flex-col items-center justify-center py-10 gap-2 text-white/60">
          <Loader2 className="animate-spin text-brand-cyan" size={18} aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Loading times…
          </span>
        </div>
      ) : error ? (
        <p role="alert" className="border-l-[3px] border-brand-purple bg-black p-4 text-sm text-white/80">
          {error}
        </p>
      ) : availability && availability.slots.length === 0 ? (
        <p className="font-body text-sm text-white/70">
          No open times on this day. Pick another day.
        </p>
      ) : availability ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availability.slots.map((slot) => (
            <button
              key={slot.startIso}
              type="button"
              onClick={() => onSelect(slot)}
              className="border border-brand-cyan/30 hover:border-brand-cyan hover:bg-brand-cyan/10 py-2.5 font-body text-sm text-white transition-colors"
            >
              {slot.label}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

function FormStep({
  slot,
  timezone,
  form,
  setForm,
  error,
  submitting,
  onSubmit,
}: {
  slot: Slot;
  timezone: string;
  form: BookingForm;
  setForm: (f: BookingForm) => void;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const slotLabel = formatSlot(slot.startIso, timezone);
  const inputClass =
    'w-full bg-black border border-brand-purple/30 focus:border-brand-purple text-white px-3 py-2.5 rounded-sm font-body text-base placeholder:text-white/55';
  const set = (key: keyof BookingForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm({ ...form, [key]: e.target.value });

  return (
    <form
      // Native validation: required fields and email format are checked by
      // the browser, which shows its message next to the field.
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="border-l-[3px] border-brand-cyan bg-brand-dark px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
          ▸ Booking
        </span>
        <p className="font-body text-white text-sm mt-1">{slotLabel}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" htmlFor="bk-first">
          <input
            id="bk-first"
            name="given-name"
            type="text"
            required
            autoComplete="given-name"
            className={inputClass}
            value={form.firstName}
            onChange={set('firstName')}
          />
        </Field>
        <Field label="Last name" htmlFor="bk-last">
          <input
            id="bk-last"
            name="family-name"
            type="text"
            required
            autoComplete="family-name"
            className={inputClass}
            value={form.lastName}
            onChange={set('lastName')}
          />
        </Field>
      </div>
      <Field label="Email" htmlFor="bk-email">
        <input
          id="bk-email"
          name="email"
          type="email"
          spellCheck={false}
          required
          autoComplete="email"
          placeholder="you@company.com"
          className={inputClass}
          value={form.email}
          onChange={set('email')}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone" htmlFor="bk-phone">
          <input
            id="bk-phone"
            name="tel"
            type="tel"
            required
            minLength={7}
            autoComplete="tel"
            placeholder="(555) 555-1234"
            className={inputClass}
            value={form.phone}
            onChange={set('phone')}
          />
        </Field>
        <Field label="Website (optional)" htmlFor="bk-website">
          <input
            id="bk-website"
            name="url"
            type="text"
            inputMode="url"
            spellCheck={false}
            autoComplete="url"
            placeholder="yourbusiness.com"
            className={inputClass}
            value={form.website}
            onChange={set('website')}
          />
        </Field>
      </div>
      <Field label="What do you need help with?" htmlFor="bk-service">
        <select
          id="bk-service"
          name="service"
          required
          className={inputClass}
          value={form.service}
          onChange={set('service')}
        >
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Anything we should know? (optional)" htmlFor="bk-notes">
        <textarea
          id="bk-notes"
          name="notes"
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Industry, call volume, the problem you want solved…"
          value={form.notes}
          onChange={set('notes')}
        />
      </Field>
      {error ? (
        <p role="alert" className="border-l-[3px] border-brand-purple bg-black p-3 text-sm text-white/85">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        data-cta-type="primary"
        className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden /> Booking…
          </>
        ) : (
          <>
            Book my slot <ArrowRight size={16} aria-hidden />
          </>
        )}
      </button>
      <p className="font-body text-xs text-white/55 text-center">
        You will get a confirmation email and a calendar invite. No marketing email.
      </p>
    </form>
  );
}

function ConfirmedStep({
  booked,
  timezone,
  form,
}: {
  booked: BookedResponse;
  timezone: string;
  form: BookingForm;
}) {
  const slotLabel = formatSlot(booked.start, timezone);
  const calendarEvent = {
    title: 'Implenix consultation',
    startIso: booked.start,
    endIso: booked.end,
    details: booked.meetingUrl
      ? `Join: ${booked.meetingUrl}\n\nBooked via implenix.net`
      : 'Booked via implenix.net',
    location: booked.meetingUrl,
  };
  const downloadIcs = () => {
    const blob = new Blob([buildIcs({ ...calendarEvent, uid: booked.eventId })], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'implenix-consultation.ics';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 bg-brand-cyan/20 border border-brand-cyan flex items-center justify-center">
          <Check size={18} className="text-brand-cyan" aria-hidden />
        </span>
        <div>
          <p className="font-heading text-white text-lg">You’re booked.</p>
          <p className="font-body text-sm text-white/65">
            Confirmation and calendar invite on the way to {form.email}
          </p>
        </div>
      </div>
      <div className="border border-brand-cyan/30 bg-brand-dark p-4 flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
          ▸ When
        </span>
        <p className="font-body text-white">{slotLabel}</p>
      </div>
      {booked.meetingUrl ? (
        <div className="border border-brand-purple/30 bg-black p-4 flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet">
            ▸ {booked.meetingProvider === 'zoom' ? 'Zoom meeting' : 'Google Meet'}
          </span>
          <a
            href={booked.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-purple text-white font-medium px-4 py-2.5 rounded-sm hover:opacity-90 self-start"
          >
            <Video size={14} aria-hidden /> Join meeting
          </a>
          <p className="font-body text-xs text-white/55 break-all">
            {booked.meetingUrl}
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/55">
          ▸ Add to your calendar
        </span>
        <div className="flex flex-wrap gap-3">
          <a
            href={googleCalendarUrl(calendarEvent)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-brand-cyan/70 text-brand-cyan text-sm font-medium px-4 py-2.5 rounded-sm transition-colors hover:bg-brand-cyan/10"
          >
            <CalendarCheck size={14} aria-hidden /> Google Calendar
          </a>
          <button
            type="button"
            onClick={downloadIcs}
            className="inline-flex items-center gap-2 border border-brand-cyan/70 text-brand-cyan text-sm font-medium px-4 py-2.5 rounded-sm transition-colors hover:bg-brand-cyan/10"
          >
            <Download size={14} aria-hidden /> Outlook / Apple (.ics)
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-white/65 font-mono">
        {label}
      </span>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Calendar grid helpers
// ---------------------------------------------------------------------------

type BookingRules = { workingDays: number[]; maxLeadDays: number };
const DEFAULT_RULES: BookingRules = { workingDays: [1, 2, 3, 4, 5], maxLeadDays: 30 };

function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function buildMonthGrid(monthDate: Date, rules: BookingRules) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastBookable = new Date(today);
  lastBookable.setDate(today.getDate() + rules.maxLeadDays);

  const cells: {
    iso: string;
    day: number;
    disabled: boolean;
    inMonth: boolean;
  }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const iso = toIsoDate(d);
    const inMonth = d.getMonth() === month;
    const past = d.getTime() < today.getTime();
    const tooFar = d.getTime() > lastBookable.getTime();
    const offDay = !rules.workingDays.includes(d.getDay());
    cells.push({
      iso,
      day: d.getDate(),
      disabled: past || !inMonth || tooFar || offDay,
      inMonth,
    });
  }
  return cells;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
