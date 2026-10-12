# Lead finder (Dashboard > Outreach > Lead finder)

Find local businesses on Google Maps, along with emails taken from their
own websites. Review the results, then import them into an outreach
contact list for a campaign.

## How it works

1. **Start a search:** enter a business type, a location, and the maximum
   number of results. Example: "hvac contractor" in "Columbus, OH", up to
   200.
2. The search runs at the provider (DataForSEO, Apify or Outscraper) and
   takes 1-10 minutes. The search page checks for results every 15 seconds, and the
   10-minute cron picks up finished searches even if nobody has the page
   open.
3. **The email layer runs on its own** (see below). Each business shows
   an email state, and the page counts how many are **ready to email**.
4. **Review the results:** name, category, email, phone, website, rating
   and city. You can:
   - filter by "sendable email only", minimum rating, and "already
     imported";
   - tick the businesses you want.
5. **Import** them into a new contact list. The import is the same one
   CSV uploads use:
   - invalid emails are dropped;
   - duplicates are merged;
   - anyone who unsubscribed, bounced or complained is skipped;
   - only verified emails go in (see "What gets imported").

   The business name goes into `{{company}}`, the category into
   `{{industry}}`, and rating, reviews, address and Maps link into
   `{{custom.*}}`.
6. Pick that list in a campaign.

Scraped emails are usually generic business addresses (info@, office@,
contact@), not a named owner. Write step 1 for whoever reads the shared
inbox. Most templates should use `{{first_name|there}}`, because first
names are blank for scraped leads.

## The email layer

Email marketing needs an email for every lead, and Google Maps listings
don't include one. So every search goes through these steps, in order:

1. **Listing:** the provider returns name, phone, website and rating.
   DataForSEO and Apify sometimes include an email; Outscraper and Apify
   can add one for a fee when "Find emails" is ticked.
2. **Website crawl (free, built in):** for each business with a website
   and no email, the system reads:
   - the home page;
   - the contact page from the listing;
   - up to 3 linked contact/about pages.

   It finds `mailto:` links, plain-text addresses, "name [at] domain
   [dot] com" spellings and Cloudflare-protected addresses. It obeys
   robots.txt, only fetches public http(s) sites, and caps each page at
   1.5 MB and 8 seconds. Emails on the business's own domain rank first.
3. **Finder API (optional):** if the website shows no email, a paid
   finder looks up the domain:
   - **Hunter**, when `HUNTER_API_KEY` is set (it is used by default);
   - **Outscraper Emails & Contacts**, when `EMAIL_FINDER=outscraper`.

   `EMAIL_FINDER=off` turns this off.
4. **Verification:**
   - **Basic check (free, always on):**
     - syntax;
     - disposable domains;
     - addresses that must never get mail (abuse@, postmaster@,
       noreply@…);
     - the domain has mail servers (MX).
   - **Mailbox check (recommended):** with `MILLIONVERIFIER_API_KEY` or
     `ZEROBOUNCE_API_KEY`, each address is checked at the mail server. Set
     `EMAIL_VERIFIER=millionverifier|zerobounce|off` to choose when both
     keys are set.

The layer runs while the search page is open: it works through 12
businesses every few seconds and can be paused. The 10-minute cron also
finishes any search nobody is watching.

### Email states

| State | Meaning |
|---|---|
| Verified | The mailbox exists (verifier said valid). |
| Domain OK | Basic check passed; no mailbox verifier is set. |
| Catch-all | The domain accepts every address, so the mailbox can't be confirmed. |
| Unconfirmed | The verifier couldn't tell (timeout, greylisting). |
| Undeliverable | Bad syntax, disposable, blocked role, no mail servers, or the mailbox doesn't exist. |
| Searching website… | Waiting for the crawl. |
| No email on website | Crawl and finder found nothing. |
| No website | Nothing to crawl. Call these instead. |

### What gets imported and sent

- **Import** verifies any selected email that hasn't been checked yet,
  then imports Verified, Domain OK and Unconfirmed emails. Catch-all
  emails go into the list only when "Include catch-all" is ticked.
  Undeliverable emails never go in. The verdict is copied onto the
  contact.
- **Campaign launch** enrolls contacts whose verdict is sendable, plus
  contacts with no verdict (CSV uploads). Catch-all contacts are enrolled
  only when the campaign has **Send to catch-all addresses** turned on
  (off by default).
- **Every send** first checks any contact that was never verified (CSV
  uploads):
  - undeliverable → marked Bounced (label "Failed verification") and
    stopped;
  - catch-all → moved to No response (label "Catch-all skipped") and
    stopped, unless the campaign sends to catch-all addresses.

  So an unverified CSV can't burn your bounce rate.
- **CSV lists can be checked up front:** on the Contacts page, "Verify N
  unchecked emails" checks the list (or all contacts) in batches. Each
  contact then shows a badge: Verified, Domain OK, Catch-all,
  Undeliverable or Not checked.

## Setup

1. Run `supabase/migrations/20261013000000_lead_finder.sql` and
   `supabase/migrations/20261017000000_email_first_leads.sql` in order
   with the other migrations.
2. Connect at least one listings provider. With more than one, the
   search form lets you choose.
3. Strongly recommended: connect a mailbox verifier (below).
4. Check **Dashboard > Setup**. It shows which keys are set (never their
   values).

### DataForSEO (cheapest)

- Sign up at dataforseo.com. New accounts get a small trial credit.
  `sandbox.dataforseo.com` is free and returns sample data for testing.
- Copy the API login and password from the dashboard (API Access). They
  are not your site login.
- `DATAFORSEO_LOGIN=...` and `DATAFORSEO_PASSWORD=...`
- Optional:
  - `DATAFORSEO_LOCATION_CODE`: default `2840`, the United States. The
    city you type is added to the keyword.
  - `DATAFORSEO_API_BASE`: set to `https://sandbox.dataforseo.com` for
    testing.
- Uses the Google Maps SERP task API on the standard queue. At the time
  of writing it cost about $0.0006 per 100 results.
- It has no email add-on. The website crawl and the finder fill in
  emails.

### Apify (default)

- Sign up at apify.com. The free plan gives a monthly platform credit,
  enough for small test runs.
- Go to Settings > Integrations and copy your API token.
- `APIFY_TOKEN=apify_api_...`
- Optional: `APIFY_GMAPS_ACTOR` (default `compass~crawler-google-places`,
  the "Google Maps Scraper" actor).
- Billing is per event. At the time of writing it was roughly $0.004 per
  place, plus about $0.002 per place for contact (email) enrichment and a
  small fee per run. Check the actor's pricing tab before a big run.

### Mailbox verifier (recommended)

- **MillionVerifier:** millionverifier.com > API. Set
  `MILLIONVERIFIER_API_KEY`. It has the lowest price per check.
- **ZeroBounce:** zerobounce.net > API. Set `ZEROBOUNCE_API_KEY`.
- Each address is checked once. Results are kept on the lead and the
  contact.

### Email finder fallback (optional)

- **Hunter:** hunter.io > API. Set `HUNTER_API_KEY`. Only addresses with
  confidence of 50 or higher are used.
- **Outscraper Emails & Contacts:** set `EMAIL_FINDER=outscraper`. It
  uses the same `OUTSCRAPER_API_KEY`.

### Outscraper

- Sign up at outscraper.com and copy your API key from the profile page.
- `OUTSCRAPER_API_KEY=...`
- Optional: `OUTSCRAPER_REGION` (default `US`).
- Billing is pay-as-you-go. At the time of writing, the first 500
  records per service each month were free, then about $3 per 1,000.
  Email enrichment ("Emails & Contacts", `domains_service`) is billed
  separately at a similar rate.

The cost shown on the search form is a rough estimate from these rates.
It does not subtract free allowances.

## Rules worth keeping

- **Keep each search small and targeted:** one city and one trade per
  search. Results are more relevant and every email is cheaper.
- **Keep bounces under 2%.** SES reviews accounts at 5% bounces or 0.1%
  complaints. The built-in basic check catches dead domains, but only a
  mailbox verifier catches dead mailboxes. Before sending at volume, set
  `MILLIONVERIFIER_API_KEY` (about $0.0004-0.0008 per address at the
  time of writing) or `ZEROBOUNCE_API_KEY`.
- **Leave catch-all off** for the first sends. Turn it on only once your
  bounce rate is proven low.
- **Follow US anti-spam law (CAN-SPAM)** on every email:
  - an honest subject line;
  - your postal address;
  - a working unsubscribe link (the system adds these).

  Never email consumers this way. B2B outreach to business addresses
  only.
- **Respect Google's and the providers' terms.** The providers run the
  scraping on their own side, so you aren't scraping Google directly.
