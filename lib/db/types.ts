// Row types for the tables in supabase/migrations/*_team_dashboard.sql.
// Keep in sync with the migration.

export type TeamMember = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member';
  created_at: string;
};

// Client (deal) stages. Grouping, labels and probabilities live in
// lib/pipeline/stages.ts.
export const CLIENT_STAGES = [
  'new',
  'call_booked',
  'no_show',
  'discovery_done',
  'proposal_sent',
  'negotiation',
  'onboarding',
  'building',
  'live',
  'nurture',
  'lost',
  'unqualified',
] as const;
export type ClientStage = (typeof CLIENT_STAGES)[number];

export const STAGE_LABELS: Record<ClientStage, string> = {
  new: 'New lead',
  call_booked: 'Call booked',
  no_show: 'No-show',
  discovery_done: 'Discovery done',
  proposal_sent: 'Proposal sent',
  negotiation: 'Negotiation',
  onboarding: 'Won · onboarding',
  building: 'Building',
  live: 'Live',
  nurture: 'In nurture',
  lost: 'Lost',
  unqualified: 'Unqualified',
};

export const LOST_REASONS = [
  { value: 'price', label: 'Price' },
  { value: 'timing', label: 'Timing / not now' },
  { value: 'competitor', label: 'Went with a competitor' },
  { value: 'no_budget', label: 'No budget' },
  { value: 'no_response', label: 'Went quiet after proposal' },
  { value: 'not_a_fit', label: 'Not a fit' },
  { value: 'other', label: 'Other' },
] as const;
export type LostReason = (typeof LOST_REASONS)[number]['value'];

// Outreach stages on contacts. Most are set automatically by the send
// engine, SES events and the AI reply agent.
export const CONTACT_STAGES = [
  'new',
  'queued',
  'email_sent',
  'follow_up_1',
  'follow_up_2',
  'follow_up_3',
  'replied',
  'interested',
  'nurture',
  'client',
  'not_interested',
  'no_response',
  'unsubscribed',
  'bounced',
] as const;
export type ContactStage = (typeof CONTACT_STAGES)[number];

export type Client = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  company: string | null;
  service: string;
  stage: ClientStage;
  source: string | null;
  notes: string | null;
  owner_id: string | null;
  outreach_contact_id: string | null;
  stage_changed_at: string;
  setup_fee: number | null;
  monthly_value: number | null;
  lost_reason: LostReason | null;
  next_step: string | null;
  next_step_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  client_id: string;
  start_at: string;
  end_at: string;
  timezone: string;
  meeting_provider: string | null;
  meeting_url: string | null;
  zoom_meeting_id: number | null;
  calendar_event_id: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  form_data: Record<string, unknown>;
  source: string | null;
  page: string | null;
  created_at: string;
};

export type Activity = {
  id: string;
  client_id: string | null;
  type: string;
  body: string | null;
  meta: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
};

export type ContactList = {
  id: string;
  name: string;
  source_file: string | null;
  created_by: string | null;
  created_at: string;
};

export type ContactStatus =
  | 'active'
  | 'replied'
  | 'interested'
  | 'booked'
  | 'not_interested'
  | 'unsubscribed'
  | 'bounced'
  | 'complained';

export type Contact = {
  id: string;
  list_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  website: string | null;
  phone: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  custom: Record<string, string>;
  status: ContactStatus;
  stage: ContactStage;
  stage_changed_at: string;
  reply_label: string | null;
  email_verdict: 'deliverable' | 'risky' | 'undeliverable' | 'unknown' | null;
  email_verdict_reason: string | null;
  verified_at: string | null;
  revisit_at: string | null;
  owner_id: string | null;
  last_contacted_at: string | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  list_id: string | null;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  daily_limit: number;
  send_timezone: string;
  send_hour_start: number;
  send_hour_end: number;
  send_days: number[];
  ai_mode: 'off' | 'draft' | 'auto';
  ai_instructions: string | null;
  kind: 'sequence' | 'nurture';
  nurture_campaign_id: string | null;
  no_reply_grace_days: number;
  track_opens: boolean;
  stop_company_on_reply: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignStep = {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_days: number;
  subject: string;
  body: string;
  // Optional A/B variant. Blank subject_b reuses the A subject.
  subject_b: string | null;
  body_b: string | null;
};

export type Enrollment = {
  id: string;
  campaign_id: string;
  contact_id: string;
  current_step: number;
  next_send_at: string;
  status: 'active' | 'completed' | 'replied' | 'stopped' | 'failed';
  created_at: string;
};

export type Message = {
  id: string;
  contact_id: string | null;
  campaign_id: string | null;
  step_number: number | null;
  direction: 'outbound' | 'inbound';
  from_email: string;
  to_email: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  message_id: string | null;
  in_reply_to: string | null;
  ses_message_id: string | null;
  status:
    | 'queued'
    | 'sent'
    | 'delivered'
    | 'bounced'
    | 'complained'
    | 'received'
    | 'draft'
    | 'failed';
  ai_generated: boolean;
  ai_meta: Record<string, unknown>;
  sent_by: string | null;
  variant: 'A' | 'B' | null;
  opened_at: string | null;
  open_count: number;
  clicked_at: string | null;
  click_count: number;
  created_at: string;
};

// Services offered on the onboarding form. The main site sells the AI
// receptionist; the rest are taken on case by case.
export const SERVICES = [
  { value: 'ai-receptionist', label: 'AI Receptionist' },
  { value: 'ai-calling-agent', label: 'AI Calling Agent (outbound)' },
  { value: 'custom-ai-agent', label: 'Custom AI Agent / Automation' },
  { value: 'custom-software', label: 'Custom Software / Product' },
  { value: 'seo-package', label: 'SEO Package' },
  { value: 'website', label: 'Website Design & Build' },
  { value: 'other', label: 'Something else' },
] as const;
export type ServiceValue = (typeof SERVICES)[number]['value'];

export function serviceLabel(value: string): string {
  return SERVICES.find((s) => s.value === value)?.label ?? value;
}

export type WebLead = {
  id: string;
  source: string;
  page: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  details: Record<string, string | number | boolean>;
  status: 'new' | 'contacted' | 'converted' | 'dismissed';
  client_id: string | null;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
};
