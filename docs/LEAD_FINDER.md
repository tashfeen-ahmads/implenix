# Lead finder (Dashboard > Outreach > Lead finder)

Find local businesses on Google Maps, along with emails taken from their
own websites. Review the results, then import them into an outreach
contact list for a campaign.

## How it works

1. **Start a search:** enter a business type, a location, and the maximum
   number of results. Example: "hvac contractor" in "Columbus, OH", up to
   200.
2. The search runs at the provider (Apify or Outscraper) and takes 2-10
   minutes. The search page checks for results every 15 seconds, and the
   10-minute cron picks up finished searches even if nobody has the page
   open.
3. **Review the results:** name, category, email, phone, website, rating
   and city. You can:
   - filter by "has email", minimum rating, and "already imported";
   - tick the businesses you want.
4. **Import** them into a new contact list. The import is the same one
   CSV uploads use:
   - invalid emails are dropped;
   - duplicates are merged;
   - anyone who unsubscribed, bounced or complained is skipped.

   The business name goes into `{{company}}`, the category into
   `{{industry}}`, and rating, reviews, address and Maps link into
   `{{custom.*}}`.
5. Pick that list in a campaign.

Scraped emails are usually generic business addresses (info@, office@,
contact@), not a named owner. Write step 1 for whoever reads the shared
inbox. Most templates should use `{{first_name|there}}`, because first
names are blank for scraped leads.

## Setup

1. Run `supabase/migrations/20261013000000_lead_finder.sql` after the
   first migration.
2. Connect one provider, or both. With both connected, the search form
   lets you choose.

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
- **Verify emails before a large send.** Scraped lists carry dead
  addresses, and bounces above roughly 2% hurt SES reputation. Outscraper
  sells email validation; NeverBounce and ZeroBounce are alternatives.
  Run the list through one, then import only the valid addresses.
- **Follow US anti-spam law (CAN-SPAM)** on every email:
  - an honest subject line;
  - your postal address;
  - a working unsubscribe link (the system adds these).

  Never email consumers this way. B2B outreach to business addresses
  only.
- **Respect Google's and the providers' terms.** Both providers run the
  scraping on their own side, so you aren't scraping Google directly.
