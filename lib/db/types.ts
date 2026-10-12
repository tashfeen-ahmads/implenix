// Row types for the tables in supabase/migrations/*_team_dashboard.sql.
// Keep in sync with the migration.

export type TeamMember = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member';
  created_at: string;
};

export const CLIENT_STAGES = [
  'new',
  'call_booked',
  'discovery_done',
  'proposal_sent',
  'onboarding',
  'live',
  'lost',
] as const;
export type ClientStage = (typeof CLIENT_STAGES)[number];

export const STAGE_LABELS: Record<ClientStage, string> = {
  new: 'New lead',
  call_booked: 'Call booked',
  discovery_done: 'Discovery done',
  proposal_sent: 'Proposal sent',
  onboarding: 'Onboarding',
  live: 'Live',
  lost: 'Lost',
};

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
