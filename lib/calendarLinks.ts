// "Add to calendar" helpers for the booking confirmation. Pure functions,
// safe on client and server.

type CalendarEvent = {
  title: string;
  startIso: string;
  endIso: string;
  details: string;
  location?: string | null;
};

// 2026-10-14T14:00:00.000Z -> 20261014T140000Z
const compact = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function googleCalendarUrl(e: CalendarEvent): string {
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', e.title);
  url.searchParams.set('dates', `${compact(e.startIso)}/${compact(e.endIso)}`);
  url.searchParams.set('details', e.details);
  if (e.location) url.searchParams.set('location', e.location);
  return url.toString();
}

// RFC 5545 text escaping, then fold lines at 75 octets.
const esc = (v: string) =>
  v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

const fold = (line: string) => {
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 73) parts.push(line.slice(i, i + 73));
  return parts.join('\r\n ');
};

export function buildIcs(e: CalendarEvent & { uid: string }): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Implenix//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.uid}@implenix.net`,
    `DTSTAMP:${compact(new Date().toISOString())}`,
    `DTSTART:${compact(e.startIso)}`,
    `DTEND:${compact(e.endIso)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.details)}`,
    ...(e.location ? [`LOCATION:${esc(e.location)}`, `URL:${e.location}`] : []),
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Implenix call in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
