import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  BOOKING_CONFIG,
  apiError,
  createBookingEvent,
  getBusyRanges,
} from '@/lib/googleCalendar';
import { buildCrmEvent, sendToCrm } from '@/lib/crm';
import {
  createZoomMeeting,
  deleteZoomMeeting,
  zoomConfigured,
  type ZoomMeeting,
} from '@/lib/zoom';

export const runtime = 'nodejs';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  notes: z.string().max(2000).optional(),
  startIso: z.string(),
  ctaLocation: z.string().max(120).optional(),
  page: z.string().max(500).optional(),
});

// POST /api/book
// Body: { name, email, phone?, notes?, startIso }
// Creates a Zoom meeting (or Google Meet when Zoom isn't configured),
// puts it on the calendar invite Google emails the visitor, returns
// confirmation. Re-validates availability at booking time to prevent
// a race where two people book the same slot.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }
  const { name, email, phone, notes, startIso, ctaLocation, page } = parsed.data;

  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return apiError('Invalid startIso', 400);
  }
  const end = new Date(
    start.getTime() + BOOKING_CONFIG.durationMinutes * 60_000,
  );

  // Re-check availability at booking time
  try {
    const busy = await getBusyRanges(start.toISOString(), end.toISOString());
    const conflict = busy.some((r) => {
      const bs = new Date(r.start).getTime();
      const be = new Date(r.end).getTime();
      return start.getTime() < be && end.getTime() > bs;
    });
    if (conflict) {
      return apiError(
        'That slot was just booked by someone else. Pick another time.',
        409,
      );
    }
  } catch (err) {
    return apiError(
      err instanceof Error
        ? `Availability check failed: ${err.message}`
        : 'Availability check failed',
      500,
    );
  }

  // Zoom first when configured. A Zoom outage must not block the
  // booking, so we fall back to Google Meet and log it.
  let zoom: ZoomMeeting | null = null;
  if (zoomConfigured()) {
    try {
      zoom = await createZoomMeeting({
        topic: `Implenix consultation · ${name}`,
        startIso: start.toISOString(),
        durationMinutes: BOOKING_CONFIG.durationMinutes,
        timezone: BOOKING_CONFIG.timezone,
        agenda: notes,
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
      attendeeEmail: email,
      attendeePhone: phone,
      notes,
      zoom: zoom ?? undefined,
    });
  } catch (err) {
    if (zoom) await deleteZoomMeeting(zoom.id);
    return apiError(
      err instanceof Error
        ? `Booking failed: ${err.message}`
        : 'Booking failed',
      500,
    );
  }

  // The booking is already on the calendar; a CRM outage must not
  // turn it into an error for the visitor. sendToCrm logs failures.
  await sendToCrm(
    buildCrmEvent('booking.created', {
      source: ctaLocation ?? 'booking-widget',
      page,
      contact: { name, email, phone },
      details: {
        start: start.toISOString(),
        end: end.toISOString(),
        timezone: BOOKING_CONFIG.timezone,
        notes,
        meeting_provider: event.meetingProvider,
        meeting_url: event.meetingUrl,
        zoom_meeting_id: zoom?.id,
        calendar_event_id: event.id,
      },
    }),
  );
  return NextResponse.json({
    success: true,
    eventId: event.id,
    meetingUrl: event.meetingUrl,
    meetingProvider: event.meetingProvider,
    start: start.toISOString(),
    end: end.toISOString(),
  });
}
