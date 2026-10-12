-- Deliverability guard. AWS reviews an SES account at 5% bounces or 0.1%
-- complaints, so sending stops on its own well before that:
--   * a hold stops ALL outreach sending until a team member clears it;
--   * a campaign with a bad list is paused on its own, with the reason.

create table public.outreach_holds (
  id uuid primary key default gen_random_uuid(),
  reason text not null,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  cleared_at timestamptz,
  cleared_by uuid references public.team_members (user_id) on delete set null
);
-- At most one active hold.
create unique index outreach_holds_active_idx on public.outreach_holds ((true)) where cleared_at is null;
create index outreach_holds_cleared_idx on public.outreach_holds (cleared_at desc);

alter table public.outreach_holds enable row level security;
create policy team_read on public.outreach_holds for select to authenticated
  using (public.is_team_member());
create policy team_clear on public.outreach_holds for update to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

alter table public.campaigns
  add column paused_reason text,
  -- Rates for the auto-pause are measured from here (set on resume, so a
  -- fixed campaign isn't paused again for its old bounces).
  add column health_since timestamptz,
  -- Catch-all domains accept every address, so the mailbox can't be
  -- confirmed. Off by default: such contacts are skipped at launch and send.
  add column include_risky boolean not null default false;
