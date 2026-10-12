import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resendConfigured, sendEmail } from '@/lib/email/resend';
import { reminderEmail } from '@/lib/email/templates';
import { googleCalendarUrl } from '@/lib/calendarLinks';
import { formatWhen } from '@/lib/booking';
import type { Booking, Client } from '@/lib/db/types';

// Reminder emails before booked calls, run by the 10-minute cron. A booking
// gets the 24h reminder when the call is 22-25 hours away, and the 1h
// reminder when it is 40-80 minutes away. Each is claimed with a conditional
// update before sending, so overlapping cron runs never double-send.

type Row = Booking & {
  reminder_24h_sent_at: string | null;
  reminder_1h_sent_at: string | null;
  clients: Pick<Client, 'first_name' | 'email'> | null;
};

const WINDOWS = {
  '24h': { from: 22 * 3600e3, to: 25 * 3600e3, column: 'reminder_24h_sent_at' },
  '1h': { from: 40 * 60e3, to: 80 * 60e3, column: 'reminder_1h_sent_at' },
} as const;

export async function sendDueReminders(db: SupabaseClient): Promise<{ sent: number; skipped: number }> {
  if (!resendConfigured()) return { sent: 0, skipped: 0 };
  let sent = 0;
  let skipped = 0;
  const now = Date.now();
  for (const lead of ['24h', '1h'] as const) {
    const w = WINDOWS[lead];
    const { data, error } = await db
      .from('bookings')
      .select('*, clients(first_name, email)')
      .eq('status', 'scheduled')
      .is(w.column, null)
      .gte('start_at', new Date(now + w.from).toISOString())
      .lte('start_at', new Date(now + w.to).toISOString())
      .limit(50);
    if (error) {
      console.error('[reminders] query failed', error.message);
      continue;
    }
    for (const b of (data ?? []) as Row[]) {
      // A call booked less than 25 hours out only gets the 1h reminder: the
      // confirmation email it just received already covers "tomorrow".
      if (lead === '24h' && new Date(b.start_at).getTime() - new Date(b.created_at).getTime() < 25 * 3600e3) {
        await db.from('bookings').update({ [w.column]: new Date().toISOString() }).eq('id', b.id).is(w.column, null);
        skipped++;
        continue;
      }
      const { data: claimed } = await db
        .from('bookings')
        .update({ [w.column]: new Date().toISOString() })
        .eq('id', b.id)
        .is(w.column, null)
        .select('id')
        .maybeSingle();
      if (!claimed || !b.clients?.email) {
        skipped++;
        continue;
      }
      const whenLabel = formatWhen(b.start_at);
      const mail = reminderEmail({
        firstName: b.clients.first_name,
        whenLabel,
        lead,
        meetingUrl: b.meeting_url,
        meetingProvider: b.meeting_provider,
        googleCalendarUrl: googleCalendarUrl({
          title: 'Implenix call with a lead specialist',
          startIso: b.start_at,
          endIso: b.end_at,
          details: b.meeting_url ? `Join: ${b.meeting_url}` : 'Implenix consultation',
          location: b.meeting_url,
        }),
      });
      try {
        await sendEmail({
          to: b.clients.email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          tags: [{ name: 'type', value: `reminder_${lead}` }],
        });
        sent++;
      } catch (err) {
        // Release the claim so the next run retries.
        await db.from('bookings').update({ [w.column]: null }).eq('id', b.id);
        console.error('[reminders] send failed', err instanceof Error ? err.message : err);
      }
    }
  }
  return { sent, skipped };
}
