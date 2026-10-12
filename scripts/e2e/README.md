# Outreach end-to-end test

```
npm run test:outreach
```

This runs the whole cold-email lifecycle without any real accounts. It
starts:

- `mock-supabase.js`, a small PostgREST/GoTrue imitation on port 54321;
- `stubs.js`, stand-ins for Amazon SES, OpenAI and Resend on port 4010,
  which record every request to `calls.json`.

It then runs `outreach-flow.mts` against the real engine code in
`lib/outreach`. The credentials in `e2e.env` are dummies.

## What it checks

- **Sending:** step sends, the A/B variant split, and the stage moving
  from Email sent to Follow-up 1.
- **SES events:** open and click events.
- **Reply handling:**
  - interested → Interested;
  - a hand-written out-of-office → the sequence resumes the day after the
    return date;
  - not now → nurture campaign plus a check-back date;
  - a low-confidence reply stays in review;
  - a reply stops colleagues at the same company;
  - a header auto-reply pauses the sequence for 7 days.
- **No reply:** the end of the sequence hands off to nurture.

The script exits non-zero if any check fails.

## Limits

The mock only imitates the PostgREST calls the app makes. It does not run
the SQL migrations or RLS, and it ignores some column defaults.

The migrations and `outreach_funnel()` were checked separately on real
Postgres (PGlite). Before going live, run the flow against a Supabase
staging project.

`fixtures.js` seeds sample dashboard data, so you can also point
`npm run dev` at the mock for visual checks:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=anon
```
