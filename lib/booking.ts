import 'server-only';
import {
  BOOKING_CONFIG,
  bookingDayBounds,
  computeSlots,
  createBookingEvent,
  getBusyRanges,
  type Slot,
} from '@/lib/googleCalendar';
import { createZoomMeeting, deleteZoomMeeting, zoomConfigured, type ZoomMeeting } from '@/lib/zoom';
import { buildCrmEvent, sendToCrm } from '@/lib/crm';
import { buildIcs, googleCalendarUrl } from '@/lib/calendarLinks';
import { sendEmail } from '@/lib/email/resend';
import { clientConfirmationEmail, teamAlertEmail } from '@/lib/email/templates';
import { adminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { serviceLabel } from '@/lib/db/types';
import { SITE_URL } from '@/lib/seo';

// One booking flow for every entry point: the website calendar and the
// AI outreach agent both call createBooking().

export type BookingInput = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  website?: string;
  service: string;
  notes?: string;
  startIso: string;
  source: string; // CTA location, or 'outreach-ai'
  page?: string;
};

export type BookingResult =
  | {
      ok: true;
      eventId: string;
      meetingUrl: string | null;
      meetingProvider: string | null;
      start: string;
      end: string;
      clientId: string | null;
    }
  | { ok: false; status: number; error: string };

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: BOOKING_CONFIG.timezone,
    timeZoneName: 'short',
  }).format(new Date(iso));
}

// Open slots over the next `days` days, soonest first. Used by the AI
// agent to offer times in an email.
export async function listOpenSlots(days = 7, limit = 12): Promise<Slot[]> {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: BOOKING_CONFIG.timezone });
  const out: Slot[] = [];
  for (let i = 0; i <= Math.min(days, BOOKING_CONFIG.maxLeadDays) && out.length < limit; i++) {
    const dateStr = fmt.format(new Date(now.getTime() + i * 86_400_000));
    const bounds = bookingDayBounds(dateStr);
    if (!bounds) continue;
    const busy = await getBusyRanges(bounds.start.toISOString(), bounds.end.toISOString());
    out.push(...computeSlots(dateStr, busy, now));
  }
  return out.slice(0, limit);
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const start = new Date(input.startIso);
  if (Number.isNaN(start.getTime())) return { ok: false, status: 400, error: 'Invalid start time' };
  const end = new Date(start.getTime() + BOOKING_CONFIG.durationMinutes * 60_000);
  const name = [input.firstName, input.lastName].filter(Boolean).join(' ');

  // Re-check availability at booking time so two people can't take one slot.
  try {
    const busy = await getBusyRanges(start.toISOString(), end.toISOString());
    const conflict = busy.some(
      (r) => start.getTime() < new Date(r.end).getTime() && end.getTime() > new Date(r.start).getTime(),
    );
    if (conflict) {
      return { ok: false, status: 409, error: 'That slot was just booked by someone else. Pick another time.' };
    }
  } catch (err) {
    return {
      ok: false,
      status: 500,
      error: err instanceof Error ? `Availability check failed: ${err.message}` : 'Availability check failed',
    };
  }

  const notesForInvite = [
    `Service: ${serviceLabel(input.service)}`,
    input.website ? `Website: ${input.website}` : null,
    input.notes ? `Notes: ${input.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  // Zoom first when configured; a Zoom outage falls back to Google Meet.
  let zoom: ZoomMeeting | null = null;
  if (zoomConfigured()) {
    try {
      zoom = await createZoomMeeting({
        topic: `Implenix consultation · ${name}`,
        startIso: start.toISOString(),
        durationMinutes: BOOKING_CONFIG.durationMinutes,
        timezone: BOOKING_CONFIG.timezone,
        agenda: notesForInvite,
      });
    } catch (err) {
      console.error('[zoom] meeting creation failed, using Google Meet', err);
    }
  }

  let event: Awaited<ReturnType<typeof createBookingEvent>>;
  try {
    event = await createBookingEvent({
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      attendeeName: name,
      attendeeEmail: input.email,
      attendeePhone: input.phone,
      notes: notesForInvite,
      zoom: zoom ?? undefined,
    });
  } catch (err) {
    if (zoom) await deleteZoomMeeting(zoom.id);
    return {
      ok: false,
      status: 500,
      error: err instanceof Error ? `Booking failed: ${err.message}` : 'Booking failed',
    };
  }

  // Everything below is best-effort: the meeting exists, so a database,
  // email or CRM outage must not turn it into an error for the visitor.
  const clientId = await saveToPipeline(input, {
    start,
    end,
    meetingUrl: event.meetingUrl,
    meetingProvider: event.meetingProvider,
    zoomMeetingId: zoom?.id,
    calendarEventId: event.id,
  }).catch((err) => {
    console.error('[booking] pipeline save failed', err);
    return null;
  });

  await sendBookingEmails(input, {
    start,
    end,
    meetingUrl: event.meetingUrl,
    meetingProvider: event.meetingProvider,
    eventId: event.id,
    clientId,
  }).catch((err) => console.error('[booking] email failed', err));

  await sendToCrm(
    buildCrmEvent('booking.created', {
      source: input.source,
      page: input.page,
      contact: { name, email: input.email, phone: input.phone },
      details: {
        first_name: input.firstName,
        last_name: input.lastName,
        website: input.website,
        service: input.service,
        start: start.toISOString(),
        end: end.toISOString(),
        timezone: BOOKING_CONFIG.timezone,
        notes: input.notes,
        meeting_provider: event.meetingProvider,
        meeting_url: event.meetingUrl,
        zoom_meeting_id: zoom?.id,
        calendar_event_id: event.id,
      },
    }),
  );

  return {
    ok: true,
    eventId: event.id,
    meetingUrl: event.meetingUrl,
    meetingProvider: event.meetingProvider,
    start: start.toISOString(),
    end: end.toISOString(),
    clientId,
  };
}

type Saved = {
  start: Date;
  end: Date;
  meetingUrl: string | null;
  meetingProvider: string | null;
  zoomMeetingId?: number;
  calendarEventId: string;
};

async function saveToPipeline(input: BookingInput, b: Saved): Promise<string | null> {
  if (!adminConfigured()) return null;
  const db = supabaseAdmin();
  const email = input.email.trim().toLowerCase();

  // An outreach contact who books is linked to the client and marked
  // booked, and their sequences stop.
  const { data: contact } = await db.from('contacts').select('id').ilike('email', email).maybeSingle();
  if (contact) {
    await db.from('contacts').update({ status: 'booked' }).eq('id', contact.id);
    await db
      .from('campaign_enrollments')
      .update({ status: 'stopped' })
      .eq('contact_id', contact.id)
      .eq('status', 'active');
  }

  const { data: existing } = await db
    .from('clients')
    .select('id, stage, first_name, last_name, phone, website, service, source, outreach_contact_id')
    .ilike('email', email)
    .maybeSingle();
  const fields = {
    first_name: input.firstName,
    last_name: input.lastName || null,
    email,
    phone: input.phone || null,
    website: input.website || null,
    service: input.service,
    source: input.source,
    ...(contact ? { outreach_contact_id: contact.id } : {}),
  };
  let clientId: string;
  if (existing) {
    clientId = existing.id;
    const stage = existing.stage === 'new' || existing.stage === 'lost' ? 'call_booked' : existing.stage;
    // The booking form is public, so it only fills blanks on a known
    // client. What the team has on file wins; the full submission is
    // still saved on the booking's form_data.
    const blanks = Object.fromEntries(
      Object.entries(fields).filter(([k]) => k !== 'email' && !(existing as Record<string, unknown>)[k]),
    );
    await db.from('clients').update({ ...blanks, stage }).eq('id', clientId);
  } else {
    const { data, error } = await db
      .from('clients')
      .insert({ ...fields, stage: 'call_booked' })
      .select('id')
      .single();
    if (error) throw error;
    clientId = data.id;
  }

  const { error: bookingError } = await db.from('bookings').insert({
    client_id: clientId,
    start_at: b.start.toISOString(),
    end_at: b.end.toISOString(),
    timezone: BOOKING_CONFIG.timezone,
    meeting_provider: b.meetingProvider,
    meeting_url: b.meetingUrl,
    zoom_meeting_id: b.zoomMeetingId ?? null,
    calendar_event_id: b.calendarEventId,
    source: input.source,
    page: input.page ?? null,
    form_data: {
      first_name: input.firstName,
      last_name: input.lastName,
      email,
      phone: input.phone,
      website: input.website,
      service: input.service,
      notes: input.notes,
    },
  });
  if (bookingError) throw bookingError;

  await db.from('activities').insert({
    client_id: clientId,
    type: 'booking.created',
    body: `Booked a call for ${formatWhen(b.start.toISOString())} (${serviceLabel(input.service)})`,
    meta: { source: input.source, meeting_url: b.meetingUrl },
  });
  return clientId;
}

async function sendBookingEmails(
  input: BookingInput,
  b: Omit<Saved, 'calendarEventId' | 'zoomMeetingId'> & { eventId: string; clientId: string | null },
) {
  const whenLabel = formatWhen(b.start.toISOString());
  const title = 'Implenix call with a lead specialist';
  const details = `Your Implenix consultation about ${serviceLabel(input.service)}.${
    b.meetingUrl ? `\nJoin: ${b.meetingUrl}` : ''
  }`;
  const data = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    website: input.website,
    serviceLabel: serviceLabel(input.service),
    notes: input.notes,
    whenLabel,
    meetingUrl: b.meetingUrl,
    meetingProvider: b.meetingProvider,
    googleCalendarUrl: googleCalendarUrl({
      title,
      startIso: b.start.toISOString(),
      endIso: b.end.toISOString(),
      details,
      location: b.meetingUrl,
    }),
  };

  const client = clientConfirmationEmail(data);
  const ics = buildIcs({
    uid: b.eventId,
    title,
    startIso: b.start.toISOString(),
    endIso: b.end.toISOString(),
    details,
    location: b.meetingUrl,
  });
  const jobs: Promise<unknown>[] = [
    sendEmail({
      to: input.email,
      subject: client.subject,
      html: client.html,
      text: client.text,
      attachments: [{ filename: 'invite.ics', content: ics, contentType: 'text/calendar' }],
      tags: [{ name: 'type', value: 'booking_confirmation' }],
    }),
  ];

  const team = (process.env.BOOKING_TEAM_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (team.length) {
    const alert = teamAlertEmail({
      ...data,
      source: input.source,
      page: input.page,
      dashboardUrl: b.clientId ? `${SITE_URL}/admin/clients/${b.clientId}` : undefined,
    });
    jobs.push(
      sendEmail({
        to: team,
        subject: alert.subject,
        html: alert.html,
        text: alert.text,
        replyTo: input.email,
        tags: [{ name: 'type', value: 'team_booking_alert' }],
      }),
    );
  }
  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('[booking] email send failed', r.reason);
  });
}
