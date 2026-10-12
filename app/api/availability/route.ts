import { NextRequest, NextResponse } from 'next/server';
import {
  BOOKING_CONFIG,
  bookingDayBounds,
  computeSlots,
  getBusyRanges,
  apiError,
} from '@/lib/googleCalendar';

export const runtime = 'nodejs';

// GET /api/availability?date=2026-08-14
// Returns the available booking slots for the given date, honoring
// working hours + working days + existing calendar events.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return apiError('Invalid or missing `date` parameter (YYYY-MM-DD)', 400);
  }

  const now = new Date();
  const bounds = bookingDayBounds(dateParam);
  if (!bounds) return apiError('Invalid date', 400);
  const maxAllowed = now.getTime() + BOOKING_CONFIG.maxLeadDays * 24 * 60 * 60_000;
  if (bounds.start.getTime() > maxAllowed || bounds.end.getTime() < now.getTime()) {
    return NextResponse.json({ date: dateParam, slots: [] });
  }

  try {
    const busy = await getBusyRanges(bounds.start.toISOString(), bounds.end.toISOString());
    const slots = computeSlots(dateParam, busy, now);
    return NextResponse.json({
      date: dateParam,
      timezone: BOOKING_CONFIG.timezone,
      durationMinutes: BOOKING_CONFIG.durationMinutes,
      slots,
    });
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : 'Failed to fetch availability',
      500,
    );
  }
}
