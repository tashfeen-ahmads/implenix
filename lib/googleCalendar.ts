// Google Calendar + Meet integration via direct REST API calls.
// Avoids the 10MB `googleapis` npm package by talking directly to
// Google's HTTP endpoints. Access tokens are refreshed on demand
// using the long-lived refresh token stored in the env.

import { NextResponse } from 'next/server';

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
].join(' ');

// ---------------------------------------------------------------------------
// Config (env-driven, safe defaults)
// ---------------------------------------------------------------------------

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const BOOKING_CONFIG = {
  calendarId: optionalEnv('GOOGLE_CALENDAR_ID', 'primary'),
  hostEmail: optionalEnv('GOOGLE_BOOKING_HOST_EMAIL', ''),
  durationMinutes: Number(
    optionalEnv('GOOGLE_BOOKING_DURATION_MINUTES', '30'),
  ),
  timezone: optionalEnv('GOOGLE_BOOKING_TIMEZONE', 'America/New_York'),
  workingHoursStart: Number(
    optionalEnv('GOOGLE_BOOKING_WORKING_HOURS_START', '9'),
  ),
  workingHoursEnd: Number(
    optionalEnv('GOOGLE_BOOKING_WORKING_HOURS_END', '18'),
  ),
  // 0=Sun, 1=Mon... 6=Sat. Default: Mon-Fri.
  workingDays: optionalEnv('GOOGLE_BOOKING_WORKING_DAYS', '1,2,3,4,5')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => n >= 0 && n <= 6),
  minLeadHours: Number(optionalEnv('GOOGLE_BOOKING_MIN_LEAD_HOURS', '4')),
  maxLeadDays: Number(optionalEnv('GOOGLE_BOOKING_MAX_LEAD_DAYS', '30')),
};

// ---------------------------------------------------------------------------
// OAuth flow, start URL + callback code exchange
// ---------------------------------------------------------------------------

export function redirectUri(): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://implenix.net';
  return `${siteUrl}/api/auth/google/callback`;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv('GOOGLE_CLIENT_ID'),
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export async function exchangeCodeForTokens(
  code: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: requireEnv('GOOGLE_CLIENT_ID'),
    client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
    redirect_uri: redirectUri(),
    grant_type: 'authorization_code',
  });
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} · ${err}`);
  }
  return (await res.json()) as TokenResponse;
}

// ---------------------------------------------------------------------------
// Access token refresh (used server-side on every API request)
// ---------------------------------------------------------------------------

type CachedToken = { token: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const body = new URLSearchParams({
    client_id: requireEnv('GOOGLE_CLIENT_ID'),
    client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
    refresh_token: requireEnv('GOOGLE_REFRESH_TOKEN'),
    grant_type: 'refresh_token',
  });
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Access token refresh failed: ${res.status} · ${err}`);
  }
  const data = (await res.json()) as TokenResponse;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

// ---------------------------------------------------------------------------
// Calendar API, freeBusy + create event
// ---------------------------------------------------------------------------

type BusyRange = { start: string; end: string };

export async function getBusyRanges(
  timeMinIso: string,
  timeMaxIso: string,
): Promise<BusyRange[]> {
  const token = await getAccessToken();
  const res = await fetch(`${CALENDAR_API_BASE}/freeBusy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: timeMinIso,
      timeMax: timeMaxIso,
      timeZone: BOOKING_CONFIG.timezone,
      items: [{ id: BOOKING_CONFIG.calendarId }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`freeBusy failed: ${res.status} · ${err}`);
  }
  const data = (await res.json()) as {
    calendars: Record<string, { busy?: BusyRange[] }>;
  };
  return data.calendars[BOOKING_CONFIG.calendarId]?.busy ?? [];
}

type CreateEventInput = {
  startIso: string;
  endIso: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  notes?: string;
  // When set, the invite carries this Zoom meeting instead of Google Meet.
  zoom?: { joinUrl: string; id: number; password?: string };
};

type CreatedEvent = {
  id: string;
  htmlLink: string;
  meetingUrl: string | null;
  meetingProvider: 'zoom' | 'google-meet' | null;
};

export async function createBookingEvent(
  input: CreateEventInput,
): Promise<CreatedEvent> {
  const token = await getAccessToken();
  const summary = `Implenix consultation · ${input.attendeeName}`;
  const zoom = input.zoom;
  const description = [
    zoom ? `Join Zoom meeting: ${zoom.joinUrl}` : null,
    zoom ? `Meeting ID: ${String(zoom.id).replace(/(\d{3})(\d{4})(\d+)/, '$1 $2 $3')}` : null,
    zoom?.password ? `Passcode: ${zoom.password}` : null,
    zoom ? '' : null,
    `Booked via implenix.net`,
    `Attendee: ${input.attendeeName} (${input.attendeeEmail})`,
    input.attendeePhone ? `Phone: ${input.attendeePhone}` : null,
    '',
    input.notes ? `Notes:\n${input.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const requestId = `implenix-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  const body = {
    summary,
    description,
    start: { dateTime: input.startIso, timeZone: BOOKING_CONFIG.timezone },
    end: { dateTime: input.endIso, timeZone: BOOKING_CONFIG.timezone },
    // Calendar apps turn a URL location into a one-click join button.
    ...(zoom ? { location: zoom.joinUrl } : {}),
    attendees: [
      { email: input.attendeeEmail, displayName: input.attendeeName }, ...(BOOKING_CONFIG.hostEmail
        ? [{ email: BOOKING_CONFIG.hostEmail, organizer: true }]
        : []),
    ],
    ...(zoom
      ? {}
      : {
          conferenceData: {
            createRequest: {
              requestId,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
    guestsCanModify: false,
    guestsCanSeeOtherGuests: false,
  };

  const url = new URL(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(
      BOOKING_CONFIG.calendarId,
    )}/events`,
  );
  url.searchParams.set('conferenceDataVersion', '1');
  url.searchParams.set('sendUpdates', 'all');

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`createEvent failed: ${res.status} · ${err}`);
  }
  const data = (await res.json()) as {
    id: string;
    htmlLink: string;
    hangoutLink?: string;
    conferenceData?: {
      entryPoints?: { entryPointType: string; uri: string }[];
    };
  };
  if (zoom) {
    return {
      id: data.id,
      htmlLink: data.htmlLink,
      meetingUrl: zoom.joinUrl,
      meetingProvider: 'zoom',
    };
  }
  const meetLink =
    data.hangoutLink ??
    data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === 'video',
    )?.uri ??
    null;
  return {
    id: data.id,
    htmlLink: data.htmlLink,
    meetingUrl: meetLink,
    meetingProvider: meetLink ? 'google-meet' : null,
  };
}

// ---------------------------------------------------------------------------
// Slot computation, pure function, no network calls
// ---------------------------------------------------------------------------

export type Slot = { startIso: string; endIso: string; label: string };

function isWorkingDay(date: Date): boolean {
  return BOOKING_CONFIG.workingDays.includes(date.getDay());
}

function overlaps(
  slotStart: Date,
  slotEnd: Date,
  ranges: BusyRange[],
): boolean {
  return ranges.some((r) => {
    const bs = new Date(r.start).getTime();
    const be = new Date(r.end).getTime();
    return slotStart.getTime() < be && slotEnd.getTime() > bs;
  });
}

export function computeSlots(
  dayStart: Date,
  busy: BusyRange[],
  now: Date = new Date(),
): Slot[] {
  const slots: Slot[] = [];
  const durationMs = BOOKING_CONFIG.durationMinutes * 60_000;
  const earliestStart = new Date(
    now.getTime() + BOOKING_CONFIG.minLeadHours * 60 * 60_000,
  );

  if (!isWorkingDay(dayStart)) return slots;

  const dayStartHour = new Date(dayStart);
  dayStartHour.setHours(BOOKING_CONFIG.workingHoursStart, 0, 0, 0);
  const dayEndHour = new Date(dayStart);
  dayEndHour.setHours(BOOKING_CONFIG.workingHoursEnd, 0, 0, 0);

  for (
    let t = dayStartHour.getTime();
    t + durationMs <= dayEndHour.getTime();
    t += durationMs
  ) {
    const start = new Date(t);
    const end = new Date(t + durationMs);
    if (start < earliestStart) continue;
    if (overlaps(start, end, busy)) continue;
    const label = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: BOOKING_CONFIG.timezone,
    });
    slots.push({ startIso: start.toISOString(), endIso: end.toISOString(), label });
  }
  return slots;
}

// ---------------------------------------------------------------------------
// JSON error helper for API routes
// ---------------------------------------------------------------------------

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
