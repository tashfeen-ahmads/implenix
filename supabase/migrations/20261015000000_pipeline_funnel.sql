-- Full-funnel pipeline: outreach stages on contacts, more sales and
-- delivery stages on clients, nurture campaigns, A/B variants, open/click
-- tracking and the funnel report.
--
-- Stage model (see docs/PIPELINE.md):
--   Outreach  (contacts, automatic): new, queued, email_sent, follow_up_1,
--             follow_up_2, follow_up_3 (3 or more), replied, interested
--   Nurture   (contacts and clients): nurture
--   Sales     (clients): new, call_booked, no_show, discovery_done,
--             proposal_sent, negotiation
--   Delivery  (clients): onboarding (won), building, live
--   Closed    contacts: not_interested, no_response, unsubscribed, bounced
--             clients: lost (with a reason), unqualified
-- A contact that becomes a client moves to stage 'client' and is shown on
-- the board as that client.

-- ── Contacts: outreach stage ───────────────────────────────────────
alter table public.contacts
  add column stage text not null default 'new' check (stage in (
    'new', 'queued', 'email_sent', 'follow_up_1', 'follow_up_2', 'follow_up_3',
    'replied', 'interested', 'nurture', 'client',
    'not_interested', 'no_response', 'unsubscribed', 'bounced'
  )),
  add column stage_changed_at timestamptz not null default now(),
  -- Latest reply classification from the AI agent (or a person).
  add column reply_label text,
  -- Nurture: when someone should look at this lead again.
  add column revisit_at timestamptz,
  add column owner_id uuid references public.team_members (user_id) on delete set null;

-- Backfill from the existing status and sequence progress.
update public.contacts c
set stage = case
  when c.status = 'booked' then 'client'
  when c.status = 'interested' then 'interested'
  when c.status = 'replied' then 'replied'
  when c.status = 'not_interested' then 'not_interested'
  when c.status in ('unsubscribed', 'complained') then 'unsubscribed'
  when c.status = 'bounced' then 'bounced'
  else coalesce(
    (
      select case
        when e.status = 'active' and e.current_step = 0 then 'queued'
        when e.status = 'active' and e.current_step = 1 then 'email_sent'
        when e.status = 'active' and e.current_step = 2 then 'follow_up_1'
        when e.status = 'active' and e.current_step = 3 then 'follow_up_2'
        when e.status = 'active' then 'follow_up_3'
        when e.status = 'completed' then 'no_response'
        else null
      end
      from public.campaign_enrollments e
      where e.contact_id = c.id
      order by (e.status = 'active') desc, e.created_at desc
      limit 1
    ),
    'new'
  )
end;

create index contacts_stage_idx on public.contacts (stage, stage_changed_at desc);
create index contacts_revisit_idx on public.contacts (revisit_at) where revisit_at is not null;

-- ── Clients: more stages and deal fields ───────────────────────────
alter table public.clients drop constraint if exists clients_stage_check;
alter table public.clients add constraint clients_stage_check check (stage in (
  'new', 'call_booked', 'no_show', 'discovery_done', 'proposal_sent', 'negotiation',
  'onboarding', 'building', 'live', 'nurture', 'lost', 'unqualified'
));
alter table public.clients
  add column stage_changed_at timestamptz not null default now(),
  -- Deal value: one-off setup fee and monthly recurring, tracked apart.
  add column setup_fee numeric(12, 2) check (setup_fee is null or setup_fee >= 0),
  add column monthly_value numeric(12, 2) check (monthly_value is null or monthly_value >= 0),
  add column lost_reason text check (lost_reason is null or lost_reason in (
    'price', 'timing', 'competitor', 'no_budget', 'no_response', 'not_a_fit', 'other'
  )),
  add column next_step text,
  add column next_step_at timestamptz;
create index clients_next_step_idx on public.clients (next_step_at) where next_step_at is not null;

-- stage_changed_at follows every stage change, whoever makes it.
create or replace function public.touch_stage_changed()
returns trigger language plpgsql as $$
begin
  if new.stage is distinct from old.stage then
    new.stage_changed_at = now();
  end if;
  return new;
end;
$$;
create trigger clients_stage_touch before update of stage on public.clients
  for each row execute function public.touch_stage_changed();
create trigger contacts_stage_touch before update of stage on public.contacts
  for each row execute function public.touch_stage_changed();

-- ── Campaigns: nurture, tracking, company pause ────────────────────
alter table public.campaigns
  -- 'nurture' campaigns are long-gap drips that leads are moved into.
  add column kind text not null default 'sequence' check (kind in ('sequence', 'nurture')),
  -- Where leads go when this sequence ends without a reply, or when they
  -- answer "not now".
  add column nurture_campaign_id uuid references public.campaigns (id) on delete set null,
  -- Days to wait after the last step before calling it "no response".
  add column no_reply_grace_days int not null default 4 check (no_reply_grace_days between 0 and 30),
  -- Open/click tracking (SES tracking configuration set). Off by default:
  -- tracking pixels and rewritten links hurt cold-email deliverability.
  add column track_opens boolean not null default false,
  -- A reply from one person stops the sequence for colleagues at the same
  -- company domain.
  add column stop_company_on_reply boolean not null default true,
  add constraint campaigns_nurture_not_self check (nurture_campaign_id is null or nurture_campaign_id <> id);

-- ── A/B variants per step ──────────────────────────────────────────
alter table public.campaign_steps
  add column subject_b text,
  add column body_b text;

-- ── Messages: variant and engagement ───────────────────────────────
alter table public.messages
  add column variant text check (variant is null or variant in ('A', 'B')),
  add column opened_at timestamptz,
  add column open_count int not null default 0,
  add column clicked_at timestamptz,
  add column click_count int not null default 0;
create index messages_campaign_idx on public.messages (campaign_id, direction, created_at);

-- ── Funnel report ──────────────────────────────────────────────────
-- One JSON document with the whole outreach funnel, per contact (a person
-- counts once per campaign however many emails they got):
--   contacted → delivered → opened → clicked → replied → positive →
--   booked → showed → proposal → won
-- broken down by campaign, contact list, industry, first-contact week and
-- sequence step / A/B variant, plus reply labels and lost reasons.
-- security invoker: RLS applies, so only team members get rows.
create or replace function public.outreach_funnel(
  p_since timestamptz default null,
  p_campaign uuid default null
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
with sent as (
  select m.*
  from messages m
  where m.direction = 'outbound'
    and m.status in ('sent', 'delivered', 'bounced', 'complained')
    and m.campaign_id is not null
    and (p_campaign is null or m.campaign_id = p_campaign)
    and m.created_at >= coalesce(p_since, '-infinity'::timestamptz)
),
replies as (
  select i.contact_id, i.created_at
  from messages i
  where i.direction = 'inbound'
    and coalesce((i.ai_meta ->> 'auto_reply')::boolean, false) = false
    and i.contact_id in (select contact_id from sent)
),
per_cc as (
  select
    s.contact_id,
    s.campaign_id,
    count(*) as emails,
    min(s.created_at) as first_sent_at,
    bool_or(s.status = 'bounced') as bounced,
    bool_or(s.status = 'complained') as complained,
    bool_or(s.opened_at is not null) as opened,
    bool_or(s.clicked_at is not null) as clicked
  from sent s
  group by s.contact_id, s.campaign_id
),
facts as (
  select
    pc.*,
    c.stage,
    c.list_id,
    coalesce(nullif(trim(c.industry), ''), 'Unknown') as industry,
    c.reply_label,
    fr.replied_at,
    fr.replied_at is not null as replied,
    (c.stage in ('interested', 'client') or c.status in ('interested', 'booked')) as positive,
    cl.id as client_id,
    cl.stage as client_stage,
    cl.setup_fee,
    cl.monthly_value,
    coalesce(bk.any_booking, false) as booked,
    coalesce(bk.showed, false) as showed
  from per_cc pc
  join contacts c on c.id = pc.contact_id
  left join lateral (
    select min(r.created_at) as replied_at
    from replies r
    where r.contact_id = pc.contact_id and r.created_at >= pc.first_sent_at
  ) fr on true
  left join lateral (
    select x.id, x.stage, x.setup_fee, x.monthly_value
    from clients x
    where x.outreach_contact_id = pc.contact_id
    order by x.created_at
    limit 1
  ) cl on true
  left join lateral (
    select true as any_booking, bool_or(b.status = 'completed') as showed
    from bookings b
    where b.client_id = cl.id
    having count(*) > 0
  ) bk on true
),
grouped as (
  select
    case
      when grouping(f.campaign_id) = 0 then 'campaign'
      when grouping(f.list_id) = 0 then 'list'
      when grouping(f.industry) = 0 then 'industry'
      when grouping(date_trunc('week', f.first_sent_at)) = 0 then 'week'
      else 'total'
    end as dim,
    coalesce(
      f.campaign_id::text,
      f.list_id::text,
      f.industry,
      to_char(date_trunc('week', f.first_sent_at), 'YYYY-MM-DD')
    ) as key,
    jsonb_build_object(
      'contacted', count(distinct f.contact_id),
      'emails', sum(f.emails),
      'delivered', count(distinct f.contact_id) filter (where not f.bounced),
      'bounced', count(distinct f.contact_id) filter (where f.bounced),
      'complained', count(distinct f.contact_id) filter (where f.complained),
      'unsubscribed', count(distinct f.contact_id) filter (where f.stage = 'unsubscribed'),
      'opened', count(distinct f.contact_id) filter (where f.opened),
      'clicked', count(distinct f.contact_id) filter (where f.clicked),
      'replied', count(distinct f.contact_id) filter (where f.replied),
      'positive', count(distinct f.contact_id) filter (where f.positive),
      'booked', count(distinct f.contact_id) filter (where f.booked),
      'showed', count(distinct f.contact_id) filter (where f.showed),
      'proposal', count(distinct f.contact_id) filter (
        where f.client_stage in ('proposal_sent', 'negotiation', 'onboarding', 'building', 'live')
      ),
      'won', count(distinct f.contact_id) filter (where f.client_stage in ('onboarding', 'building', 'live'))
    ) as metrics
  from facts f
  group by grouping sets (
    (),
    (f.campaign_id),
    (f.list_id),
    (f.industry),
    (date_trunc('week', f.first_sent_at))
  )
),
-- Which step a reply came after: the last step sent before the first reply.
reply_step as (
  select distinct on (f.contact_id, f.campaign_id)
    f.contact_id, f.campaign_id, s.step_number, coalesce(s.variant, 'A') as variant
  from facts f
  join sent s on s.contact_id = f.contact_id and s.campaign_id = f.campaign_id and s.created_at < f.replied_at
  where f.replied
  order by f.contact_id, f.campaign_id, s.created_at desc
),
step_sent as (
  select
    s.campaign_id,
    s.step_number,
    coalesce(s.variant, 'A') as variant,
    count(*) as sent,
    count(*) filter (where s.status = 'bounced') as bounced,
    count(*) filter (where s.opened_at is not null) as opened,
    count(*) filter (where s.clicked_at is not null) as clicked
  from sent s
  where s.step_number is not null
  group by 1, 2, 3
),
steps as (
  select
    ss.*,
    (
      select count(*) from reply_step r
      where r.campaign_id = ss.campaign_id and r.step_number = ss.step_number and r.variant = ss.variant
    ) as replied
  from step_sent ss
),
won_clients as (
  select distinct f.client_id, f.setup_fee, f.monthly_value
  from facts f
  where f.client_stage in ('onboarding', 'building', 'live')
)
select jsonb_build_object(
  'since', p_since,
  'campaign', p_campaign,
  'totals', coalesce((select metrics from grouped where dim = 'total'), '{}'::jsonb),
  'by_campaign', coalesce((select jsonb_agg(jsonb_build_object('key', key) || metrics) from grouped where dim = 'campaign'), '[]'::jsonb),
  'by_list', coalesce((select jsonb_agg(jsonb_build_object('key', key) || metrics) from grouped where dim = 'list'), '[]'::jsonb),
  'by_industry', coalesce((select jsonb_agg(jsonb_build_object('key', key) || metrics) from grouped where dim = 'industry'), '[]'::jsonb),
  'by_week', coalesce((select jsonb_agg(jsonb_build_object('key', key) || metrics order by key) from grouped where dim = 'week'), '[]'::jsonb),
  'by_step', coalesce((
    select jsonb_agg(to_jsonb(st) order by st.campaign_id, st.step_number, st.variant) from steps st
  ), '[]'::jsonb),
  'labels', coalesce((
    select jsonb_agg(jsonb_build_object('key', l.label, 'count', l.n) order by l.n desc)
    from (
      select coalesce(f.reply_label, 'unlabelled') as label, count(distinct f.contact_id) as n
      from facts f where f.replied group by 1
    ) l
  ), '[]'::jsonb),
  'lost_reasons', coalesce((
    select jsonb_agg(jsonb_build_object('key', r.reason, 'count', r.n) order by r.n desc)
    from (
      select coalesce(x.lost_reason, 'not_set') as reason, count(*) as n
      from clients x
      where x.stage = 'lost'
        and x.stage_changed_at >= coalesce(p_since, '-infinity'::timestamptz)
        and (p_campaign is null or x.outreach_contact_id in (select contact_id from sent))
      group by 1
    ) r
  ), '[]'::jsonb),
  'revenue', jsonb_build_object(
    'won_clients', (select count(*) from won_clients),
    'setup_fees', coalesce((select sum(setup_fee) from won_clients), 0),
    'monthly', coalesce((select sum(monthly_value) from won_clients), 0)
  )
);
$$;

grant execute on function public.outreach_funnel(timestamptz, uuid) to authenticated;
