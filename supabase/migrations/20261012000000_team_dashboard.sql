-- Implenix team dashboard: onboarding pipeline, bookings, outreach.
-- Apply with `supabase db push` or paste into the Supabase SQL editor.
--
-- Access model: only people listed in public.team_members can read or
-- write anything here (RLS). Server code that runs without a signed-in
-- user (booking API, SES webhooks, cron) uses the service-role key,
-- which bypasses RLS, and never ships to the browser.

create extension if not exists pgcrypto;

-- ── Team ────────────────────────────────────────────────────────────
create table public.team_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create or replace function public.is_team_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.team_members where user_id = auth.uid());
$$;

-- ── Clients pipeline (one row per person who booked or was added) ──
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text not null,
  phone text,
  website text,
  company text,
  service text not null default 'ai-receptionist',
  stage text not null default 'new' check (stage in (
    'new', 'call_booked', 'discovery_done', 'proposal_sent',
    'onboarding', 'live', 'lost'
  )),
  source text,
  notes text,
  owner_id uuid references public.team_members (user_id) on delete set null,
  outreach_contact_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index clients_email_key on public.clients (lower(email));
create index clients_stage_idx on public.clients (stage);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null,
  meeting_provider text,
  meeting_url text,
  zoom_meeting_id bigint,
  calendar_event_id text,
  status text not null default 'scheduled' check (status in (
    'scheduled', 'completed', 'cancelled', 'no_show'
  )),
  -- Everything the visitor typed into the onboarding form, as submitted.
  form_data jsonb not null default '{}'::jsonb,
  source text,
  page text,
  created_at timestamptz not null default now()
);
create index bookings_start_idx on public.bookings (start_at);
create index bookings_client_idx on public.bookings (client_id);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete cascade,
  type text not null, -- booking.created, stage.changed, note, email.sent, ...
  body text,
  meta jsonb not null default '{}'::jsonb,
  actor_id uuid references public.team_members (user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index activities_client_idx on public.activities (client_id, created_at desc);

-- ── Outreach ───────────────────────────────────────────────────────
create table public.contact_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_file text,
  created_by uuid references public.team_members (user_id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.contact_lists (id) on delete set null,
  email text not null,
  first_name text,
  last_name text,
  company text,
  website text,
  phone text,
  industry text,
  city text,
  state text,
  -- Any extra CSV columns, usable as {{custom.key}} in templates.
  custom jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in (
    'active', 'replied', 'interested', 'booked', 'not_interested',
    'unsubscribed', 'bounced', 'complained'
  )),
  last_contacted_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index contacts_email_key on public.contacts (lower(email));
create index contacts_list_idx on public.contacts (list_id);

alter table public.clients
  add constraint clients_outreach_contact_fk
  foreign key (outreach_contact_id) references public.contacts (id) on delete set null;

-- Addresses we must never email again (unsubscribes, hard bounces,
-- complaints). Checked before every send, independent of contacts.
create table public.suppressions (
  email text primary key,
  reason text not null check (reason in ('unsubscribed', 'bounced', 'complained', 'manual')),
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  list_id uuid references public.contact_lists (id) on delete set null,
  from_name text not null default 'Implenix',
  from_email text not null,
  reply_to text,
  daily_limit int not null default 50 check (daily_limit between 1 and 2000),
  -- Sending window in the campaign timezone, e.g. 9 to 17 on weekdays.
  send_timezone text not null default 'America/New_York',
  send_hour_start int not null default 9 check (send_hour_start between 0 and 23),
  send_hour_end int not null default 17 check (send_hour_end between 1 and 24),
  send_days int[] not null default '{1,2,3,4,5}',
  -- AI reply agent: off, draft (team approves), auto (sends itself).
  ai_mode text not null default 'draft' check (ai_mode in ('off', 'draft', 'auto')),
  ai_instructions text,
  created_by uuid references public.team_members (user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_steps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  step_number int not null check (step_number >= 1),
  delay_days int not null default 0 check (delay_days >= 0),
  subject text not null,
  body text not null,
  unique (campaign_id, step_number)
);

create table public.campaign_enrollments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  current_step int not null default 0, -- last step sent; 0 = none yet
  next_send_at timestamptz not null default now(),
  status text not null default 'active' check (status in (
    'active', 'completed', 'replied', 'stopped', 'failed'
  )),
  created_at timestamptz not null default now(),
  unique (campaign_id, contact_id)
);
create index enrollments_due_idx on public.campaign_enrollments (status, next_send_at);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  step_number int,
  direction text not null check (direction in ('outbound', 'inbound')),
  from_email text not null,
  to_email text not null,
  subject text,
  body_text text,
  body_html text,
  -- RFC 5322 Message-ID, used for In-Reply-To threading.
  message_id text,
  in_reply_to text,
  ses_message_id text,
  status text not null default 'sent' check (status in (
    'queued', 'sent', 'delivered', 'bounced', 'complained', 'received',
    'draft', 'failed'
  )),
  ai_generated boolean not null default false,
  -- For AI drafts: why the agent proposed this (intent, actions taken).
  ai_meta jsonb not null default '{}'::jsonb,
  sent_by uuid references public.team_members (user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index messages_contact_idx on public.messages (contact_id, created_at);
create index messages_ses_idx on public.messages (ses_message_id);
create index messages_msgid_idx on public.messages (message_id);

-- ── updated_at triggers ────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();
create trigger campaigns_touch before update on public.campaigns
  for each row execute function public.touch_updated_at();

-- ── Row level security: team members only ──────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'clients', 'bookings', 'activities', 'contact_lists', 'contacts',
    'suppressions', 'campaigns', 'campaign_steps', 'campaign_enrollments',
    'messages'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy team_all on public.%I for all to authenticated
         using (public.is_team_member()) with check (public.is_team_member())',
      t
    );
  end loop;
end $$;

alter table public.team_members enable row level security;
create policy team_read on public.team_members for select to authenticated
  using (public.is_team_member());

-- Add the first admin after they sign up once (Auth > Users):
--   insert into public.team_members (user_id, email, full_name, role)
--   select id, email, 'Your Name', 'admin' from auth.users where email = 'you@implenix.net';
