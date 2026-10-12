# Outreach end-to-end test

```
npm run test:outreach
```

This runs the whole cold-email lifecycle without any real accounts. It
starts:

- `mock-supabase.js`, a small PostgREST/GoTrue imitation on port 54321;
- `stubs.js`, stand-ins for Amazon SES, OpenAI, Resend and DataForSEO on
  port 4010, plus fake business websites under `/site/<host>/`. Every
  request is recorded to `calls.json`.

It then runs two scripts against the real code:

- `outreach-flow.mts` exercises `lib/outreach`;
- `lead-flow.mts` exercises `lib/leads`.

DNS and the mailbox verifier are swapped for in-memory fakes through
test hooks (`setDnsForTests`, `setVerifierForTests` and
`setFinderDepsForTests`), so no network is needed. The credentials in `e2e.env` are dummies.

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
- **Send-time verification:** a contact on a dead domain is marked
  Bounced and never sent to. A catch-all contact is skipped.

`lead-flow.mts` checks:

- a DataForSEO search (task_post, then task_get) and the mapping of its
  results;
- the email layer:
  - the website crawl (mailto, `(at)`/`[at]` spellings, Cloudflare
    protected addresses, the contact page);
  - robots.txt;
  - blocking of private and metadata addresses;
  - verification verdicts (basic check and mailbox verifier).

The import route (which needs a team login) is not covered: the rule
that only sendable verdicts are imported is checked by reading the code.

The script exits non-zero if any check fails.

## Limits

Live crawling, real MX lookups and the real DataForSEO and verifier APIs
are not exercised. Before a big run, try them once with the DataForSEO
sandbox and a small list.

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
