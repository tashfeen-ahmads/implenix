-- Email-first lead finding: DataForSEO as a provider, an email
-- enrichment layer for businesses the provider returned without an
-- email, and verification before anything is imported or sent.

-- DataForSEO joins Apify and Outscraper.
alter table public.lead_searches drop constraint if exists lead_searches_provider_check;
alter table public.lead_searches add constraint lead_searches_provider_check
  check (provider in ('apify', 'outscraper', 'dataforseo'));

-- Per result: where the email came from and whether it is safe to send to.
alter table public.lead_results
  -- pending: has a website, not searched yet; found / not_found after the
  -- website crawl (and Hunter, when configured); no_website: nothing to search.
  add column email_status text not null default 'pending' check (email_status in ('pending', 'found', 'not_found', 'no_website')),
  -- provider | website | hunter
  add column email_source text,
  -- deliverable | risky | undeliverable | unknown (null = not verified yet)
  add column email_verdict text check (email_verdict is null or email_verdict in ('deliverable', 'risky', 'undeliverable', 'unknown')),
  -- Verifier's own wording, e.g. "catch_all", "no_mx", "disposable".
  add column email_verdict_reason text,
  add column enriched_at timestamptz,
  add column verified_at timestamptz;

-- Rows that already came with an email (or without a website) are settled.
update public.lead_results set email_status = 'found', email_source = 'provider' where email is not null;
update public.lead_results set email_status = 'no_website' where email is null and coalesce(website, '') = '';

create index lead_results_email_status_idx on public.lead_results (search_id, email_status);

-- The same verdict on outreach contacts (CSV imports included), so a
-- campaign never emails an address known to be undeliverable.
alter table public.contacts
  add column email_verdict text check (email_verdict is null or email_verdict in ('deliverable', 'risky', 'undeliverable', 'unknown')),
  add column email_verdict_reason text,
  add column verified_at timestamptz;
