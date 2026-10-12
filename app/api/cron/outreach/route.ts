import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { runOutreachTick } from '@/lib/outreach/send';
import { adminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { syncRunningSearches } from '@/lib/leads';
import { sendDueReminders } from '@/lib/reminders';

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
  // Three independent jobs: one failing never blocks the others.
  const log = (job: string) => (err: unknown) => {
    console.error(`[cron] ${job} failed`, err instanceof Error ? err.message : err);
    return null;
  };
  const db = supabaseAdmin();
  const [outreach, leadSearches, reminders] = await Promise.all([
    runOutreachTick().catch(log('outreach')),
    syncRunningSearches(db).catch(log('lead sync')),
    sendDueReminders(db).catch(log('reminders')),
    // SNS redelivery window is hours, not weeks: prune old dedupe ids.
    db
      .from('processed_sns_messages')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 86_400_000).toISOString())
      .then(({ error }) => error && log('sns prune')(error)),
  ]);
  const ok = outreach !== null && leadSearches !== null && reminders !== null;
  return NextResponse.json({ ok, outreach, leadSearches, reminders }, { status: ok ? 200 : 500 });
}
