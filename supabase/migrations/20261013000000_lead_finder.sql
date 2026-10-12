-- Lead finder: Google Maps business searches through Apify or Outscraper.
-- A search runs at the provider; results are pulled into lead_results for
-- review, then imported into an outreach contact list.

create table public.lead_searches (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('apify', 'outscraper')),
  query text not null,           -- e.g. "hvac contractor"
  location text not null,        -- e.g. "Columbus, OH"
  max_results int not null check (max_results between 1 and 2000),
  find_emails boolean not null default true,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  external_id text,              -- Apify run id / Outscraper request id
  dataset_id text,               -- Apify dataset id
  result_count int not null default 0,
  with_email_count int not null default 0,
  error text,
  created_by uuid references public.team_members (user_id) on delete set null,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index lead_searches_status_idx on public.lead_searches (status, created_at desc);

create table public.lead_results (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null references public.lead_searches (id) on delete cascade,
  name text not null,
  category text,
  email text,
  emails text[] not null default '{}',
  phone text,
  website text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  rating numeric(2, 1),
  reviews_count int,
  place_id text,
  maps_url text,
  imported_contact_id uuid references public.contacts (id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index lead_results_search_idx on public.lead_results (search_id);
create unique index lead_results_place_key on public.lead_results (search_id, place_id) where place_id is not null;

alter table public.lead_searches enable row level security;
alter table public.lead_results enable row level security;
create policy team_all on public.lead_searches for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());
create policy team_all on public.lead_results for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());
