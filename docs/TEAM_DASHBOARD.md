# Team dashboard, onboarding form and booking emails

What it does:

- **Onboarding form** on every booking calendar: first name, last name,
  email, phone, website (optional), service, notes. The service list is
  in `lib/db/types.ts` (`SERVICES`).
- When someone books, `lib/booking.ts` handles every step:
  1. Creates the Zoom meeting, or Google Meet if Zoom isn't set up.
  2. Creates the Google Calendar invite.
  3. Saves the client and booking to Supabase.
  4. Emails a branded confirmation from `update@implenix.net` through
     Resend, with an `.ics` invite attached.
  5. Emails a team alert.
  6. Sends the CRM webhook.

  If any step after the calendar invite fails, the error is logged and
  the visitor still gets their booking.
- **Team dashboard at `/admin`**, behind a team login:
  - **Overview:** new leads, upcoming calls, pipeline counts, outreach
    replies, recent activity.
  - **Pipeline:** a board with columns for New lead, Call booked,
    Discovery done, Proposal sent, Onboarding, Live and Lost. Drag
    cards between columns, or use each card's menu. You can also add
    clients by hand.
  - **Client page:** the onboarding form as submitted, contact details,
    every call with its status (completed / no-show / cancelled), notes
    and a full activity timeline.
  - **Calendar:** a month view plus an agenda of upcoming calls with
    join links.
  - **Lead finder:** Google Maps business search with website emails.
    See `docs/LEAD_FINDER.md`.
  - **Outreach:** contacts, campaigns and inbox. See
    `docs/OUTREACH.md`.

## 1. Supabase (database + team logins)

1. Create a project at supabase.com. The free tier is fine to start.
2. Run the migrations in order: open SQL Editor and paste in each
   file in `supabase/migrations/` (`20261012000000_team_dashboard.sql`,
   then `20261013000000_lead_finder.sql`), or run `supabase db push`
   if you use the Supabase CLI.
3. Authentication > Providers: keep Email on. Turn off "Allow new users
   to sign up", so only people you invite can get in.
4. Authentication > URL Configuration:
   - Set Site URL to `https://implenix.net`.
   - Add `https://implenix.net/admin/auth/callback` to the redirect URLs.
5. Authentication > Users > Invite user, once for each team member.
6. Make each person a team member. Without this, RLS shows them
   nothing. In the SQL editor:

   ```sql
   insert into public.team_members (user_id, email, full_name, role)
   select id, email, 'Full Name', 'admin' from auth.users
   where email = 'name@implenix.net';
   ```
7. Set these on your hosting provider:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...       # Settings > API > anon / publishable key
   SUPABASE_SERVICE_ROLE_KEY=...           # Settings > API > service_role. Server only; never expose it.
   ```

## 2. Resend (confirmation emails from update@implenix.net)

1. Resend > Domains: add `implenix.net`, or a subdomain such as
   `mail.implenix.net`. Add the DNS records it shows you (DKIM, SPF via
   the `send` subdomain, and a DMARC record if you don't have one).
2. Create an API key with sending access.
3. Set:

   ```
   RESEND_API_KEY=re_...
   RESEND_FROM="Implenix <update@implenix.net>"
   RESEND_REPLY_TO=support@implenix.net
   BOOKING_TEAM_EMAILS=you@implenix.net,sales@implenix.net   # who gets the "new booking" alert
   ```

Resend is for transactional email only: confirmations, alerts and
updates. Its terms forbid cold email to purchased or scraped lists, so
outreach goes through Amazon SES on its own domain (see `OUTREACH.md`).
Keeping them apart also means an outreach complaint can't hurt
delivery of your booking confirmations.

## 3. Testing it

1. Book a slot on `/contact` with your own email.
2. You should get:
   - the Google Calendar invite, with the Zoom link if Zoom is set up;
   - the Resend confirmation, with an `invite.ics` attachment;
   - the team alert.
3. Open `/admin`. The booking shows under Upcoming calls, the person
   appears in Pipeline > Call booked, and their client page shows the
   form exactly as submitted.

## Notes

- Times on the dashboard use `GOOGLE_BOOKING_TIMEZONE`.
- Open slots are worked out in that timezone too. Before this change
  they used the server's timezone, which on most hosts is UTC, so a
  9:00-18:00 day showed as 5am-2pm New York time.
- If someone who books is already an outreach contact, they're linked
  to their client record, marked "booked", and their email sequences
  stop.
- `/admin` is `noindex`, blocked in `robots.txt`, and excluded from the
  sitemap.
