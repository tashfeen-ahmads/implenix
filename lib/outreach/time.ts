import 'server-only';

// Time zone helpers for send windows and daily caps (no dependencies).

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = Sunday ... 6 = Saturday
};

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function zonedParts(at: Date, timeZone: string): ZonedParts {
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
      hourCycle: 'h23',
    });
  } catch {
    // Invalid zone name in a campaign: fall back to UTC rather than crash.
    return zonedParts(at, 'UTC');
  }
  const get = (type: string) => fmt.formatToParts(at).find((p) => p.type === type)?.value ?? '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')) % 24,
    minute: Number(get('minute')),
    weekday: WEEKDAYS[get('weekday')] ?? 0,
  };
}

function offsetMs(at: Date, timeZone: string): number {
  const p = zonedParts(at, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return asUtc - Math.floor(at.getTime() / 60_000) * 60_000;
}

// The instant local midnight began today in `timeZone`.
export function startOfDay(at: Date, timeZone: string): Date {
  const p = zonedParts(at, timeZone);
  const guess = Date.UTC(p.year, p.month - 1, p.day, 0, 0);
  const first = guess - offsetMs(new Date(guess), timeZone);
  // Second pass handles DST changes between midnight and now.
  return new Date(guess - offsetMs(new Date(first), timeZone));
}

// Inside the campaign's sending window? send_days uses 0 or 7 for Sunday.
export function inSendWindow(
  at: Date,
  window: { send_timezone: string; send_hour_start: number; send_hour_end: number; send_days: number[] },
): boolean {
  const p = zonedParts(at, window.send_timezone);
  const days = new Set((window.send_days ?? []).map((d) => (d === 7 ? 0 : d)));
  if (!days.has(p.weekday)) return false;
  return p.hour >= window.send_hour_start && p.hour < window.send_hour_end;
}
