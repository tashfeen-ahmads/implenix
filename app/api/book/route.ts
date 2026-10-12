import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '@/lib/googleCalendar';
import { createBooking } from '@/lib/booking';
import { SERVICES } from '@/lib/db/types';

export const runtime = 'nodejs';

const SERVICE_VALUES = SERVICES.map((s) => s.value) as [string, ...string[]];

const bookingSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Valid email required').max(200),
  phone: z.string().trim().min(7, 'Phone number is required').max(40),
  website: z.string().trim().max(300).optional(),
  service: z.enum(SERVICE_VALUES),
  notes: z.string().max(2000).optional(),
  startIso: z.string(),
  ctaLocation: z.string().max(120).optional(),
  page: z.string().max(500).optional(),
});

// POST /api/book
// The onboarding form on the booking calendar. Creates the Zoom meeting
// and Google Calendar invite, saves the client to the team pipeline,
// emails a confirmation from update@implenix.net, alerts the team, and
// sends the CRM webhook. See lib/booking.ts.
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
  const d = parsed.data;
  const result = await createBooking({
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
    phone: d.phone,
    website: d.website || undefined,
    service: d.service,
    notes: d.notes,
    startIso: d.startIso,
    source: d.ctaLocation ?? 'booking-widget',
    page: d.page,
  });
  if (!result.ok) return apiError(result.error, result.status);
  return NextResponse.json({
    success: true,
    eventId: result.eventId,
    meetingUrl: result.meetingUrl,
    meetingProvider: result.meetingProvider,
    start: result.start,
    end: result.end,
  });
}
