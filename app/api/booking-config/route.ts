import { NextResponse } from 'next/server';
import { BOOKING_CONFIG } from '@/lib/googleCalendar';

// Public, non-secret booking rules so the calendar can grey out days that
// can never have slots (weekends, past the booking window).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      timezone: BOOKING_CONFIG.timezone,
      durationMinutes: BOOKING_CONFIG.durationMinutes,
      workingDays: BOOKING_CONFIG.workingDays,
      maxLeadDays: BOOKING_CONFIG.maxLeadDays,
    },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
