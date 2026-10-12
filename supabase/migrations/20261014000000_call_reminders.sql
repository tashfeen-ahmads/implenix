-- Call reminder emails (24 hours and 1 hour before a booked call).
-- Each column is set when that reminder is claimed, so it is sent once.
alter table public.bookings
  add column reminder_24h_sent_at timestamptz,
  add column reminder_1h_sent_at timestamptz;

create index bookings_reminder_idx on public.bookings (status, start_at)
  where reminder_24h_sent_at is null or reminder_1h_sent_at is null;
