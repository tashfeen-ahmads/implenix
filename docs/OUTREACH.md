# Cold outreach: setup and operations

Implenix cold outreach sends sequences through **Amazon SES**. Replies come back through SES inbound and SNS, and an **OpenAI** agent reads them and either answers or drafts an answer. The team manages contacts, campaigns and the inbox under `/admin/outreach`.

```
cron (every 10 min) ─► /api/cron/outreach ─► runOutreachTick ─► SES SendEmail (raw MIME)
SES events  ─► SNS ─► /api/outreach/ses ─► bounces/complaints → suppressions; deliveries → status
SES inbound ─► SNS ─► /api/outreach/ses ─► store reply → stop sequence → AI agent (off/draft/auto)
unsubscribe link / one-click POST ─► /api/outreach/unsubscribe ─► suppression + stop
```

Code: `lib/outreach/*`, `app/api/outreach/*`, `app/api/cron/outreach`, `app/api/admin/outreach/*`.

> **Read this first: SES and cold email.** The AWS Acceptable Use Policy
> and the SES service terms do not allow unsolicited bulk email, and AWS
> reviews or pauses accounts at **5% bounces** or **0.1% complaints**.
> Small, targeted B2B outreach to business addresses is commonly accepted
> if you:
> - verify every address (see `docs/LEAD_FINDER.md`, mailbox verifier);
> - honour unsubscribes instantly;
> - keep complaints near zero.
>
> When you request SES production access, describe the use honestly:
> B2B prospecting to verified business addresses, with low volume, an
> unsubscribe link and suppression. If AWS refuses, or you want to scale,
> move cold sending to a cold-email platform (Instantly, Smartlead) or to
> SMTP mailboxes. Keep SES for the warm mail: replies, nurture and
> booking. The pipeline, inbox and AI agent don't depend on which sender
> is used.

---

## 1. Use a separate sending domain

Send cold email from a **dedicated subdomain or domain**, for example `outreach.implenix.net` or a lookalike such as `getimplenix.com`. Do not send it from `implenix.net`.

Why:
- **Reputation isolation.** Gmail, Microsoft and Yahoo track reputation per domain (and per DKIM signing domain). Cold email draws more complaints than transactional mail. If it shares a domain with booking confirmations, a bad week can push those confirmations into spam.
- **Separate DMARC policy and reporting.** You can monitor and tighten the outreach domain on its own.
- **Easy to retire.** If the domain gets burned, you replace it without touching the main site's mail.

A subdomain keeps the brand visible and is the simplest choice. A separate root domain gives stronger isolation, because organisational-domain reputation still leaks between a subdomain and its parent. For low volumes (a few hundred a day) a subdomain is fine.

Set `OUTREACH_FROM_DOMAIN` to that domain. A campaign's `from_email` must be on that domain or one of its subdomains, and launch refuses it otherwise.

## 2. SES domain verification and authentication

In the SES console (pick one region and use it everywhere; inbound receiving needs a region that supports it, such as `us-east-1`, `us-west-2` or `eu-west-1`):

1. **Verified identities → Create identity → Domain** `outreach.implenix.net`.
   - **DKIM:** choose Easy DKIM, RSA 2048. Add the 3 CNAME records SES shows. Wait until the status is "Verified".
2. **Custom MAIL FROM domain** (this makes SPF align): set it to `bounce.outreach.implenix.net` and add:
   - `MX bounce.outreach.implenix.net 10 feedback-smtp.<region>.amazonses.com`
   - `TXT bounce.outreach.implenix.net "v=spf1 include:amazonses.com ~all"`
   - Set "Behavior on MX failure" to *Reject message*.
3. **DMARC:** add `TXT _dmarc.outreach.implenix.net "v=DMARC1; p=none; rua=mailto:dmarc@implenix.net; adkim=r; aspf=r"`. After two to four clean weeks of reports, move to `p=quarantine`. Gmail and Yahoo require a DMARC record for bulk senders, and `p=none` satisfies that.
4. **Production access:** new SES accounts are in the sandbox (200 a day, verified recipients only). Request production access under Account dashboard → Request production access. Describe the use case honestly: B2B outreach to publicly listed business contacts, low volume, warm-up plan, one-click unsubscribe, automatic suppression of bounces and complaints, a physical address in every email. Mention a target of less than 0.1% complaints and less than 2% bounces.
5. **IAM user** for the app, with a policy that allows only `ses:SendEmail` and `ses:SendRawEmail` (optionally restricted to the identity ARN). Put its keys in `AWS_SES_ACCESS_KEY_ID` / `AWS_SES_SECRET_ACCESS_KEY` and the region in `AWS_SES_REGION`.

## 3. Bounce, complaint and delivery events

1. **SNS:** create a topic, for example `implenix-ses-events`.
2. **SES → Configuration sets → Create** `implenix-outreach`. Add an **event destination** of type SNS, pointing at the topic, with event types **Bounce, Complaint, Delivery** (Reject and Rendering failure are optional).
3. Set `SES_CONFIGURATION_SET=implenix-outreach`. Every send passes it.
4. **Allow the topic:** add its ARN to `SES_INBOUND_SNS_TOPIC_ARN` and redeploy. This is required: the endpoint rejects every SNS message (including the subscription confirmation) from a topic that isn't listed, because any AWS account can create a topic with a valid signature.
5. **Subscribe the endpoint:** SNS topic → Create subscription → HTTPS → `https://implenix.net/api/outreach/ses`. The endpoint verifies the SNS signature and confirms the subscription automatically. Check the subscription shows "Confirmed".

What happens:
- **Permanent bounce:** the address goes into `suppressions` (reason `bounced`), the contact becomes `bounced`, its sequences stop, and the message status becomes `bounced`. Transient bounces are ignored.
- **Complaint:** the same, with reason `complained`.
- **Delivery:** the message status changes from `sent` to `delivered`.

Also turn on **account-level suppression** for bounces and complaints in SES as a second safety net.

## 4. Inbound replies (receipt rule)

Replies must reach SES. Pick the address prospects reply to:

- **Simplest:** replies go to the From address. Add an MX on the sending subdomain itself: `MX outreach.implenix.net 10 inbound-smtp.<region>.amazonaws.com`.
- **Alternative:** a reply subdomain, for example `reply.outreach.implenix.net`, with the same MX. Set each campaign's `reply_to` to an address there, and verify that subdomain as an identity too.

Then:
1. SNS topic `implenix-ses-inbound`. Add its ARN to `SES_INBOUND_SNS_TOPIC_ARN` next to the events topic (comma-separated: `arn:...:implenix-ses-events,arn:...:implenix-ses-inbound`), redeploy, then subscribe it over HTTPS to the same `https://implenix.net/api/outreach/ses`.
2. **SES → Email receiving → Rule sets:** create a rule set and make it active. Add a rule:
   - Recipients: `outreach.implenix.net` (or the reply subdomain).
   - Action: **Publish to Amazon SNS topic** → `implenix-ses-inbound`, **encoding Base64** (UTF-8 also works, but Base64 is safer for 8-bit mail).
   - Turn on spam and virus scanning. Messages that SES marks as spam or virus are dropped.

The endpoint also drops mail that fails DMARC (a spoofed From), and mail whose envelope recipient isn't on `OUTREACH_FROM_DOMAIN` (or its subdomains) or the `OUTREACH_UNSUBSCRIBE_MAILTO` address.

Limits: the SNS action carries messages up to **150 KB**. Larger mail (big attachments) arrives without content and is logged and skipped. If you need those messages, add an S3 action as well.

How a reply is processed:
1. The sender is matched to a contact by email address, or by the `In-Reply-To`/`References` of one of our messages when they reply from another address.
2. Quoted history is stripped and the reply is stored as an inbound message. Duplicate SNS deliveries are ignored by Message-ID.
3. **Auto-replies and out-of-office messages are only stored.** They are detected by the `Auto-Submitted`, `X-Autoreply`, `Precedence` headers, mailer-daemon senders and common out-of-office subjects. They do not stop the sequence, and the AI never answers them.
4. A real reply sets every active enrollment for the contact to `replied`, and the contact status to `replied`. If the contact is linked to a client, an `outreach.reply` activity is added.
5. The AI agent runs according to the campaign's `ai_mode` (see section 8).

Optional mailto unsubscribe: set `OUTREACH_UNSUBSCRIBE_MAILTO=unsubscribe@outreach.implenix.net` (an address covered by the receipt rule). It is added to `List-Unsubscribe`, and mail sent to it suppresses the sender.

## 5. Unsubscribe and compliance plumbing

Every outreach email (sequence steps, AI replies and manual replies) has:
- a footer that says why the recipient got the email, has an unsubscribe link, and shows `OUTREACH_POSTAL_ADDRESS`
- `List-Unsubscribe: <https://…/api/outreach/unsubscribe?c=…&t=…>` (plus the optional mailto)
- `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058). Gmail and Yahoo POST to the URL, and the endpoint unsubscribes and returns 200.

Links are signed with HMAC-SHA256 over contact id + email using `OUTREACH_UNSUBSCRIBE_SECRET`, and checked in constant time. Opening the link (GET) unsubscribes immediately and shows a confirmation page. Because of that, an aggressive corporate link scanner can occasionally unsubscribe someone, which errs on the safe side. Do not rotate the secret, because that breaks the links in mail already sent.

Suppressions are checked before every send, including AI replies, manual replies and test sends, and are checked again inside each cron run. A suppressed address can't be re-imported or re-activated.

## 6. Cron, caps and warm-up

`vercel.json` runs `GET /api/cron/outreach` every 10 minutes. Set `CRON_SECRET` in Vercel; Vercel sends it as a bearer token. Cron jobs this frequent need a Vercel **Pro** plan, because Hobby only runs daily.

Each run:
- skips campaigns outside their window (`send_timezone`, `send_hour_start` ≤ hour < `send_hour_end`, `send_days` with 1 = Monday, 0 or 7 = Sunday)
- respects `daily_limit` per campaign (counted in the campaign timezone) and `OUTREACH_GLOBAL_DAILY_LIMIT` across all campaigns (counted in `OUTREACH_TIMEZONE`)
- sends at most 40 emails per run, round-robin across campaigns, with a 0.4 to 1.3 second jitter, within about 45 seconds
- claims each enrollment with a conditional update before sending, so overlapping runs never double-send
- marks a campaign `completed` when it has no active enrollments left

Sequence rules: step N+1 goes out `delay_days` after step N. **A step with a blank subject is sent as a follow-up in the same thread**: it uses "Re: <step 1 subject>" with `In-Reply-To`/`References` headers. Use real subjects only for steps that should start a new thread. Never put a fake "Re:" in a subject.

**Warm-up schedule** (new domain, per day, total across campaigns). Raise `OUTREACH_GLOBAL_DAILY_LIMIT` only while bounces stay under 2% and complaints under 0.1%:

| Week | Global daily cap |
|------|------------------|
| 1 | 20 to 30 |
| 2 | 50 |
| 3 | 100 |
| 4 | 150 to 200 |
| 5+ | +25% a week, up to what replies justify |

Also: verify lists before importing (bounces destroy reputation fastest), keep each mailbox under about 50 to 100 a day, and keep emails plain text with at most one link.

### Deliverability guard (automatic)

AWS reviews an SES account at 5% bounces or 0.1% complaints, and a paused account also stops booking confirmations. So every cron run checks the numbers before sending (`lib/outreach/health.ts`):

| What | Measured over | Stops when | Effect |
|---|---|---|---|
| Whole account | Last 7 days, or since the last hold was cleared | Bounces ≥ 4% (at least 100 sent), or complaints ≥ 0.1% (at least 2 complaints in 200+ sent) | **Hold:** no outreach email goes out until someone clicks **Resume sending** (Campaigns page). |
| One campaign | Last 7 days, or since it was last resumed | Bounces ≥ 5% (at least 40 sent), or complaints ≥ 0.2% (at least 2) | **That campaign pauses** with the reason. Others keep sending. |

- The team gets an email (`OUTREACH_ALERT_EMAILS`) each time either one trips.
- The Campaigns page always shows the last 7 days' sent count, bounce rate and complaint rate.
- The Overview shows it only when something is wrong.
- Before resuming, find the list the bounces came from. Verify it (Contacts > "Verify unchecked emails") or remove it, then resume.
- Rates are measured afresh from the moment of resuming, so old bounces don't trip it again; new ones do.

Booking confirmations and AI or manual replies are not held, because they go out through other paths.

## 7. Gmail / Yahoo bulk-sender requirements and CAN-SPAM

Gmail/Yahoo (for anyone sending 5,000 or more a day to them, and good practice below that):
- [x] SPF and DKIM pass and align with the From domain (custom MAIL FROM + Easy DKIM)
- [x] DMARC record published (`p=none` minimum)
- [x] One-click unsubscribe (RFC 8058 headers) and unsubscribes honoured within 2 days (ours are immediate)
- [x] Visible unsubscribe link in the body
- [ ] Spam rate in Google Postmaster Tools below 0.1%, and never 0.3% or higher. **Register the sending domain in Google Postmaster Tools.**
- [x] Valid forward and reverse DNS (SES handles this)
- [x] TLS for transmission (SES)

CAN-SPAM checklist:
- [x] Accurate From, To, Reply-To and routing information
- [x] Subject lines that aren't deceptive (write honest ones, with no fake "Re:" or "Fwd:")
- [ ] The message is identifiable as an advertisement/solicitation (keep it clear you're offering a service)
- [x] A valid physical postal address (`OUTREACH_POSTAL_ADDRESS`; a PO box or registered CMRA address is fine)
- [x] A clear way to opt out, working for at least 30 days after sending (the links don't expire)
- [x] Opt-outs honoured within 10 business days (ours are immediate), with no fee or login required
- [ ] You remain responsible for anyone sending on your behalf

Outside the US (Canada's CASL, the EU and UK GDPR and PECR), cold email has stricter consent rules. Keep imported lists to US businesses unless you have checked the local rules.

## 8. AI reply agent

Each campaign has an `ai_mode`:

| Mode | Behaviour |
|------|-----------|
| `off` | The reply is stored and the sequence stops. A person answers from the inbox. |
| `draft` (default) | The agent writes a reply and saves it as a `draft` message, with `ai_meta` (intent, summary, actions, handoff reason, proposed booking). A team member edits or approves it in the inbox (`POST /api/admin/outreach/messages/:id/approve`). **Bookings are made only when the draft is approved.** If the slot was taken in the meantime, approval fails and nothing is sent. |
| `auto` | The agent sends the reply right away, threaded, stored as `ai_generated`. If it hands off (pricing, anything sensitive or uncertain), the reply is saved as a draft instead. |

Tools the agent can use: `get_open_slots` (Google Calendar via `lib/booking.ts`), `book_meeting`, `mark_not_interested`, `unsubscribe` and `handoff_to_human`.

`book_meeting` only works when the requested time was actually offered in this thread, and when the words the prospect used to agree appear in their latest message. Bookings use `source: 'outreach-ai'`, with service `ai-receptionist` unless the thread says otherwise. They go through the same `createBooking()` as the website, so the pipeline, the calendar invite and the team alerts all happen.

Hard rules in the prompt:
- Never quote prices: pricing is custom and set on a call with a lead specialist.
- Setup is live in 72 hours.
- Never invent facts, clients or statistics.
- Keep replies brief and human, signed with the campaign's `from_name`.
- Include the booking page link (`/contact#book`) when offering times.

Add campaign-specific guidance in `ai_instructions`; it can't override the hard rules.

The agent never replies to auto-replies, or to unsubscribed, bounced or complained contacts. Set `OPENAI_API_KEY` and `OPENAI_MODEL` (default `gpt-5.5`; confirm the model ID on your account). The agent loops over tool calls at most 5 times per reply.

Start every new campaign in `draft` mode, and read a few dozen drafts before switching to `auto`.

### Delivery guarantees

SNS can deliver the same notification more than once. Each notification
id is recorded in `processed_sns_messages`, so a repeat delivery is
acknowledged without being handled twice. The cron prunes ids older than
30 days. Open and click counts are incremented atomically in SQL.

### Funnel automation

Pipeline stages, nurture campaigns, out-of-office handling, A/B variants, open/click tracking and the funnel report are described in `docs/PIPELINE.md`.

## 9. Environment variables

See the "Outreach (Amazon SES + OpenAI)" block in `.env.example`: `AWS_SES_REGION`, `AWS_SES_ACCESS_KEY_ID`, `AWS_SES_SECRET_ACCESS_KEY`, `SES_CONFIGURATION_SET`, `SES_TRACKING_CONFIGURATION_SET` (optional, see `docs/PIPELINE.md`), `OUTREACH_FROM_DOMAIN`, `OUTREACH_POSTAL_ADDRESS`, `OUTREACH_GLOBAL_DAILY_LIMIT`, `OUTREACH_TIMEZONE`, `OUTREACH_UNSUBSCRIBE_SECRET`, `OUTREACH_UNSUBSCRIBE_MAILTO`, `SES_INBOUND_SNS_TOPIC_ARN`, `CRON_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`. The Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are also required.

## 10. Go-live checklist

1. Apply the Supabase migration and add the team members.
2. Verify the SES domain (DKIM, MAIL FROM, DMARC) and get production access.
3. Set up the configuration set and the events topic, add both topic ARNs to `SES_INBOUND_SNS_TOPIC_ARN`, then add the HTTPS subscription (Confirmed).
4. Set up the MX, the receipt rule, the inbound topic and the subscription (Confirmed). Send a test reply and check it appears in the inbox.
5. Set all the env vars in Vercel and redeploy. Make sure the cron appears under Project → Cron Jobs.
6. Create a campaign in `draft` AI mode and send test emails to Gmail and Outlook. Check that "Show original" reports SPF, DKIM and DMARC as PASS, and that the unsubscribe button appears.
7. Set a mailbox verifier key (`MILLIONVERIFIER_API_KEY` or `ZEROBOUNCE_API_KEY`) and check **Dashboard > Setup** shows nothing required missing.
8. Import a small verified list (50 contacts), launch the campaign, and watch the bounce and complaint numbers for a week before raising the caps.
