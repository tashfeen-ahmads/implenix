# Pipeline and outreach funnel

The pipeline board at `/admin/pipeline` shows every prospect and client in
one place, from their first cold email to a live deployment. The funnel
report at `/admin/outreach/funnel` shows where leads drop out.

The stage model follows what the main outreach and CRM tools do:
Instantly, Smartlead, lemlist, Reply.io, Woodpecker, Apollo, Close,
Pipedrive, HubSpot and GoHighLevel.

- Delivery and reply states change automatically.
- What a reply means is classified by the AI, and a person can override it.
- Deal stages after the call are moved by the team.
- Closed states carry a reason.

Requires migration `supabase/migrations/20261015000000_pipeline_funnel.sql`.

## Stages

| Phase | Column | Holds | How cards get there |
|---|---|---|---|
| Outreach | Not contacted | Contacts | Imported or found by the lead finder, not in a sequence yet. Collapsed by default. |
| | Queued | Contacts | Enrolled when a campaign launches. |
| | Email sent | Contacts | Step 1 sent. |
| | Follow-up 1 / 2 / 3+ | Contacts | Steps 2, 3, and 4 or later sent. |
| | Replied · review | Contacts | Any real reply. It stays here when the AI is off, or when the AI is less than 60% sure what the reply means. |
| | Interested | Contacts | AI read the reply as interested, asking for times, or asking about pricing. |
| Nurture | In nurture | Both | Contacts: a "not now" reply, or a sequence that ended with no reply and has a nurture campaign set. Clients: moved by hand. Each card shows a check-back date. |
| Sales | New lead | Clients | Added by hand, or a prospect moved into Sales. |
| | Call booked | Clients | Any booking, from the website calendar or the AI agent. A booking also reopens No-show, Nurture, Lost and Unqualified deals. |
| | No-show | Clients | The call is marked No-show on the client page. You can email a rebook link. |
| | Discovery done | Clients | The call is marked Completed. |
| | Proposal sent / Negotiation | Clients | Moved by the team. |
| Delivery | Won · onboarding / Building / Live | Clients | Moved by the team. |
| Closed | Lost | Clients | Moved by the team. A reason is required. |
| | Unqualified | Clients | Moved by the team. |
| | Not interested | Contacts | The AI agent, or moved by the team. |
| | No response | Contacts | Sequence ended with no reply and no nurture campaign set. |
| | Unsubscribed | Contacts | Unsubscribe link or mailto, a "remove me" reply, a complaint, or moved by the team. Permanent. |
| | Bounced | Contacts | SES hard bounce. Permanent. |

A prospect that becomes a client appears once, as the client. Contact
stage is `client`.

### Allowed moves

**By drag and drop or the card menu:**
- Outreach columns that the engine sets (Queued, Email sent, the follow-ups,
  Bounced) can't be dropped into. The menu only lists columns you're allowed
  to pick.
- Moving a prospect into a Sales or Delivery column turns them into a
  client and stops their sequences.
- Moving to Lost asks for a reason.
- Moving to In nurture asks which nurture campaign to use (if any) and the
  check-back date.
- Moving to Unsubscribed asks for confirmation, because it is permanent.

Every move runs through `POST /api/admin/pipeline/move`. That way the
side effects are always the same:
- stopping sequences;
- suppression;
- nurture enrollment;
- conversion to a client;
- the activity log.

## Automation details

- **Grace period:** after the last step, an enrollment stays open for the
  campaign's "Wait after the last email" days. A late reply still counts
  as a reply. After that the contact moves to No response, or into the
  campaign's nurture campaign.
- **Out of office:**
  - An auto-reply with an `Auto-Submitted` or similar header doesn't end
    the sequence; it pushes the next email back 7 days.
  - A hand-written away message that the AI recognises does the same, but
    resumes the day after the return date if one is given.
  - Either way, the contact goes back to its previous column.
- **Not now:** the AI writes a short, friendly reply. The contact moves to
  nurture with a check-back date taken from what they said, or 60 days if
  they gave none.
- **Company stop:** when one person replies, colleagues at the same email
  domain stop getting that outreach. Gmail and other free mailboxes are
  never grouped. You can turn this off per campaign.
- **Low-confidence replies:** the AI's label is saved and shown on the
  card, but the card stays in Replied · review for a person to decide.

## Nurture campaigns

A campaign with type **Nurture** is a long-gap drip: check-ins a month or
more apart, with a case study or a seasonal hook.
- Leads arrive from:
  - sequences that name it under "When the sequence ends without a reply";
  - "not now" replies;
  - the pipeline board.
- A contact list is optional.
- Step 1's wait counts from the day the lead is moved in.
- Nurture campaigns never complete on their own.
- Any reply takes the lead back to Replied · review, where the AI handles
  it like any other reply.
- Opted-out, bounced and not-interested contacts are never nurtured
  automatically.

## A/B tests

Each sequence step can have a variant B: its own subject (optional) and
body.
- Contacts are split 50/50. The split is stable per person and step, so a
  retry sends the same variant.
- The funnel report compares variants on **reply rate**, not opens.
- It calls a winner only after 50 sends per variant, 10 replies, and a
  lead of at least 30%. Before that it says "too early".

## Open and click tracking

Tracking is off by default, because tracking pixels and rewritten links
hurt cold-email inbox placement. Apple Mail also preloads images, which
inflates opens. To turn it on:

1. Create a second SES configuration set, for example
   `implenix-outreach-tracking`. Give it the same Bounce, Complaint and
   Delivery event destination plus **Open** and **Click**. A custom
   tracking domain on the outreach subdomain is strongly recommended.
2. Set `SES_TRACKING_CONFIGURATION_SET` to its name.
3. Tick "Track opens and clicks" on each campaign that should use it.

Open and click events arrive at the same `/api/outreach/ses` endpoint.
They fill `messages.opened_at` / `open_count` / `clicked_at` /
`click_count`.

## Hot-lead alerts and follow-ups

- When the AI reads a reply as interested, as asking for times or as a
  pricing question, it emails the team once per lead.
  - The email goes to `OUTREACH_ALERT_EMAILS`, or to `BOOKING_TEAM_EMAILS`
    if that isn't set.
  - It contains the reply, the AI's summary and a link to the
    conversation.
- On the board and under "Follow-ups due" on the overview, two kinds of
  card are flagged:
  - replies waiting more than a day for review;
  - interested leads with no call booked after two days.

## Lead score

Each prospect card shows a 0-100 score (`lib/pipeline/score.ts`). Hover it
to see exactly where the points came from.

**Fit (up to 40):**

| Signal | Points |
|---|---|
| Has a website | +10 |
| Has a phone number | +5 |
| Google reviews from the lead finder | +5 to +15 |
| Rating of 4 or more | +5 |
| Named contact | +5 |

**Engagement (up to 60):**

| Signal | Points |
|---|---|
| Positive reply | +40 |
| Asked a question | +25 |
| Replied | +15 |
| Said not now | +10 |
| Clicked a link | +10 |
| Opened an email | +5 |

**Bands:** hot is 60 or more, warm is 30-59, cold is under 30. Opted-out,
bounced and not-interested contacts score 0.

On the board, "Highest lead score" sorts each outreach column by score.

## Correcting the AI

In the inbox, the "Reply label" menu on a conversation overrides the AI's
label, and the pipeline follows:

| Label | Result |
|---|---|
| Interested, Meeting request, Pricing | Interested, sequences stop |
| Not interested | Not interested |
| Not now | Nurture, using the sequence's nurture campaign |
| Unsubscribe | Suppressed |
| Out of office | No change |
| Anything else | Replied · review |

## Bulk actions

In the board's list view:

1. Tick the rows you want.
2. **Move to…** moves them all. Lost, Nurture and Unsubscribed ask once,
   for all of them.
3. **Assign owner** sets the owner on all of them.

The move list only offers stages that every selected row is allowed to
move to.

## Campaign templates

**New campaign** offers a blank campaign or a starting template:
- cold sequences for home services, dental, law firms, med spas, auto
  repair and real estate;
- a three-email nurture drip.

The templates use plain text and one question per email. They contain no
prices and no statistics. Follow-ups are threaded, and the last email is
a polite close. Edit the wording before launch.

`{{sender_first_name}}` and `{{sender_name}}` print the campaign's from
name. "Alex at Implenix" becomes "Alex".

## Deal value and forecast

Each client has:
- a setup fee and a monthly value, both internal and never shown to
  clients;
- a next step with a due date;
- a lost reason.

The board shows first-year value (setup plus 12 months) per column, plus a
weighted forecast that uses these stage probabilities:

| Stage | Probability |
|---|---|
| New lead | 5% |
| Call booked | 10% |
| No-show | 5% |
| Discovery done | 30% |
| Proposal sent | 50% |
| Negotiation | 75% |
| Won and later | 100% |

These live in `lib/pipeline/stages.ts`.

Cards flag deals that have stalled. Thresholds (`STALL_DAYS`):

| Stage | Flagged after |
|---|---|
| New lead | 3 days |
| No-show | 2 days |
| Discovery done | 5 days |
| Proposal sent | 5 days |
| Negotiation | 7 days |

Overdue next steps and nurture check-backs are listed under "Follow-ups
due" on the overview.

## Funnel report

`/admin/outreach/funnel` calls the SQL function `public.outreach_funnel`.
It is a security invoker function, so RLS applies.

**How people are counted:** each person counts once per campaign, in
this order: contacted, delivered, opened (tracked campaigns only),
replied, positive, booked, showed, proposal, won.

**Breakdowns:**
- by campaign;
- by sequence step and A/B variant;
- by contact list;
- by industry;
- by week of first email.

**Also shown:**
- list health: bounce under 2%, complaints under 0.1%, unsubscribes under
  2%;
- reply labels;
- lost reasons;
- revenue won from outreach.

A reply is credited to the last step the person received before
replying.

## Code map

| What | Where |
|---|---|
| Stage definitions, phases, allowed moves, probabilities | `lib/pipeline/stages.ts` |
| Automatic contact moves, nurture enrollment, company stop, pause | `lib/outreach/stage.ts` |
| Send tick (variants, grace period, nurture handoff) | `lib/outreach/send.ts` |
| Reply handling (stage, auto-reply pause) | `lib/outreach/inbound.ts` |
| AI classification to pipeline | `lib/outreach/agent.ts` (`applyClassification`) |
| Board UI | `components/admin/pipeline/` |
| Moves API | `app/api/admin/pipeline/move/route.ts` |
| Call outcome API (no-show, completed, rebook email) | `app/api/admin/bookings/[id]/status/route.ts` |
| Funnel page | `app/admin/(app)/outreach/funnel/page.tsx` |
