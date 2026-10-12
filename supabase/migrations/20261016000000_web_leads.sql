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
