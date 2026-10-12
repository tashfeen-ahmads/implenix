-- Leads from website forms (today: the missed-call audit tool) so they
-- reach the team dashboard even when no external CRM webhook is set.

create table public.web_leads (
  id uuid primary key default gen_random_uuid(),
  source text not null,                -- form / CTA location, e.g. "audit"
  page text,
  name text,
  email text,
  phone text,
  company text,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'dismissed')),
  client_id uuid references public.clients (id) on delete set null,
  handled_by uuid references public.team_members (user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index web_leads_status_idx on public.web_leads (status, created_at desc);

create trigger web_leads_touch before update on public.web_leads
  for each row execute function public.touch_updated_at();

alter table public.web_leads enable row level security;
create policy team_all on public.web_leads for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

-- ── Outreach event hygiene ─────────────────────────────────────────
-- SNS delivers at least once: remember processed notification ids so a
-- redelivered bounce/open/reply is handled only once. Service role only.
create table public.processed_sns_messages (
  message_id text primary key,
  created_at timestamptz not null default now()
);
alter table public.processed_sns_messages enable row level security;

-- Atomic open/click counters (two events at once must both count).
create or replace function public.record_message_engagement(p_ses_message_id text, p_kind text, p_at timestamptz)
returns boolean
language sql
security invoker
set search_path = public
as $$
  update public.messages
  set
    open_count = open_count + case when p_kind = 'open' then 1 else 0 end,
    click_count = click_count + case when p_kind = 'click' then 1 else 0 end,
    -- A click implies the email was opened.
    opened_at = coalesce(opened_at, p_at),
    clicked_at = case when p_kind = 'click' then coalesce(clicked_at, p_at) else clicked_at end
  where ses_message_id = p_ses_message_id
  returning true;
$$;
revoke execute on function public.record_message_engagement(text, text, timestamptz) from public, anon, authenticated;
