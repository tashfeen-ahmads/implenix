import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { runOutreachTick } from '@/lib/outreach/send';
import { adminConfigured } from '@/lib/supabase/admin';

// Vercel Cron (vercel.json, every 10 minutes) sends
// `Authorization: Bearer ${CRON_SECRET}`.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!adminConfigured()) return NextResponse.json({ ok: true, skipped: 'Supabase not configured' });
  try {
    const result = await runOutreachTick();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[cron/outreach] tick failed', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Tick failed' }, { status: 500 });
  }
}
