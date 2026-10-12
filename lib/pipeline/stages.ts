// The pipeline board: phases, columns and which moves are allowed.
// Plain module so server pages, API routes and client components share it.
//
// Two record types sit on one board:
// - contacts (outreach prospects): Outreach and Closed columns, mostly
//   moved automatically by the send engine, SES events and the AI agent;
// - clients (people who booked or were qualified): Sales, Delivery and
//   Closed columns, moved by the team.
// "In nurture" holds both.

import {
  STAGE_LABELS,
  type ClientStage,
  type ContactStage,
} from '@/lib/db/types';

export type Phase = 'outreach' | 'nurture' | 'sales' | 'delivery' | 'closed';

export const PHASES: { id: Phase; label: string; description: string }[] = [
  { id: 'outreach', label: 'Outreach', description: 'Cold email sequences. Moves automatically as emails go out and replies come in.' },
  { id: 'nurture', label: 'Nurture', description: 'Not now. Low-frequency emails and a date to check back.' },
  { id: 'sales', label: 'Sales', description: 'From qualified lead to signed deal.' },
  { id: 'delivery', label: 'Delivery', description: 'Won clients being set up, then live.' },
  { id: 'closed', label: 'Closed', description: 'Lost, unqualified, not interested, no response, opted out or bounced.' },
];

export type Column = {
  id: string;
  phase: Phase;
  label: string;
  hint: string;
  contactStage?: ContactStage;
  clientStage?: ClientStage;
  // Moves into this column happen on their own (sends, replies, events).
  automatic?: boolean;
  // Win probability for the weighted pipeline value.
  probability?: number;
  collapsedByDefault?: boolean;
};

export const COLUMNS: Column[] = [
  // Outreach
  { id: 'c:new', phase: 'outreach', contactStage: 'new', label: 'Not contacted', hint: 'Imported or found, not in a sequence yet.', automatic: true, collapsedByDefault: true },
  { id: 'c:queued', phase: 'outreach', contactStage: 'queued', label: 'Queued', hint: 'In a sequence, first email not sent yet.', automatic: true },
  { id: 'c:email_sent', phase: 'outreach', contactStage: 'email_sent', label: 'Email sent', hint: 'First email sent, waiting for a reply.', automatic: true },
  { id: 'c:follow_up_1', phase: 'outreach', contactStage: 'follow_up_1', label: 'Follow-up 1', hint: 'Second email sent.', automatic: true },
  { id: 'c:follow_up_2', phase: 'outreach', contactStage: 'follow_up_2', label: 'Follow-up 2', hint: 'Third email sent.', automatic: true },
  { id: 'c:follow_up_3', phase: 'outreach', contactStage: 'follow_up_3', label: 'Follow-up 3+', hint: 'Fourth email or later sent.', automatic: true },
  { id: 'c:replied', phase: 'outreach', contactStage: 'replied', label: 'Replied · review', hint: 'Wrote back. The AI could not tell what they want, or it is off.' },
  { id: 'c:interested', phase: 'outreach', contactStage: 'interested', label: 'Interested', hint: 'Positive reply. The AI offers times; book a call.' },
  // Nurture (contacts and clients)
  { id: 'nurture', phase: 'nurture', contactStage: 'nurture', clientStage: 'nurture', label: 'In nurture', hint: 'Not now. Nurture emails every few weeks and a date to check back.' },
  // Sales
  { id: 'd:new', phase: 'sales', clientStage: 'new', label: 'New lead', hint: 'Qualified, call not booked yet.', probability: 0.05 },
  { id: 'd:call_booked', phase: 'sales', clientStage: 'call_booked', label: 'Call booked', hint: 'Set automatically by a booking.', probability: 0.1 },
  { id: 'd:no_show', phase: 'sales', clientStage: 'no_show', label: 'No-show', hint: 'Missed the call. Send a rebook link.', probability: 0.05 },
  { id: 'd:discovery_done', phase: 'sales', clientStage: 'discovery_done', label: 'Discovery done', hint: 'Call held. Next: proposal.', probability: 0.3 },
  { id: 'd:proposal_sent', phase: 'sales', clientStage: 'proposal_sent', label: 'Proposal sent', hint: 'Waiting on a decision. Chase after 3 days.', probability: 0.5 },
  { id: 'd:negotiation', phase: 'sales', clientStage: 'negotiation', label: 'Negotiation', hint: 'Verbal yes or terms being agreed.', probability: 0.75 },
  // Delivery
  { id: 'd:onboarding', phase: 'delivery', clientStage: 'onboarding', label: 'Won · onboarding', hint: 'Signed. Collecting access and details.', probability: 1 },
  { id: 'd:building', phase: 'delivery', clientStage: 'building', label: 'Building', hint: 'Setup in progress.', probability: 1 },
  { id: 'd:live', phase: 'delivery', clientStage: 'live', label: 'Live', hint: 'Running for the client.', probability: 1 },
  // Closed
  { id: 'd:lost', phase: 'closed', clientStage: 'lost', label: 'Lost', hint: 'Deal lost. A reason is required.' },
  { id: 'd:unqualified', phase: 'closed', clientStage: 'unqualified', label: 'Unqualified', hint: 'Not a fit for us.' },
  { id: 'c:not_interested', phase: 'closed', contactStage: 'not_interested', label: 'Not interested', hint: 'Said no. Sequences stopped.' },
  { id: 'c:no_response', phase: 'closed', contactStage: 'no_response', label: 'No response', hint: 'Finished the sequence without replying.', automatic: true },
  { id: 'c:unsubscribed', phase: 'closed', contactStage: 'unsubscribed', label: 'Unsubscribed', hint: 'Opted out or complained. Never emailed again.' },
  { id: 'c:bounced', phase: 'closed', contactStage: 'bounced', label: 'Bounced', hint: 'Address does not exist. Suppressed.', automatic: true },
];

export const COLUMN_BY_ID = new Map(COLUMNS.map((c) => [c.id, c]));

export function columnForContact(stage: ContactStage): Column | undefined {
  return COLUMNS.find((c) => c.contactStage === stage);
}
export function columnForClient(stage: ClientStage): Column | undefined {
  return COLUMNS.find((c) => c.clientStage === stage);
}

// Contacts in these stages are still in an automatic sequence step.
export const SEQUENCE_STAGES: ContactStage[] = ['new', 'queued', 'email_sent', 'follow_up_1', 'follow_up_2', 'follow_up_3', 'no_response'];

// Stage after sending sequence step N (1-based).
export function stageForStep(step: number): ContactStage {
  if (step <= 0) return 'queued';
  if (step === 1) return 'email_sent';
  if (step === 2) return 'follow_up_1';
  if (step === 3) return 'follow_up_2';
  return 'follow_up_3';
}

// Columns a person can drag a contact into. Sequence columns are set by the
// engine only; client columns convert the contact into a client.
const CONTACT_MANUAL: ContactStage[] = ['replied', 'interested', 'nurture', 'not_interested', 'no_response', 'unsubscribed'];

export function canMoveTo(kind: 'contact' | 'client', column: Column): boolean {
  if (kind === 'contact') {
    if (column.id === 'nurture') return true;
    if (column.contactStage) return CONTACT_MANUAL.includes(column.contactStage);
    return Boolean(column.clientStage);
  }
  return Boolean(column.clientStage);
}

export const contactStageLabel = (s: ContactStage) =>
  s === 'client' ? 'Client' : columnForContact(s)?.label ?? s;
export const clientStageLabel = (s: ClientStage) => STAGE_LABELS[s];

// Reply labels written by the AI agent (contacts.reply_label).
export const REPLY_LABELS: Record<string, string> = {
  interested: 'Interested',
  wants_times: 'Meeting request',
  booked: 'Booked',
  question: 'Question',
  pricing: 'Pricing question',
  not_now: 'Not now',
  not_interested: 'Not interested',
  unsubscribe: 'Unsubscribe',
  wrong_person: 'Wrong person',
  out_of_office: 'Out of office',
  other: 'Other',
};

export const DAY_MS = 86_400_000;

// Days in the current stage after which a sales card is flagged as stalled.
export const STALL_DAYS: Partial<Record<ClientStage, number>> = {
  new: 3,
  no_show: 2,
  discovery_done: 5,
  proposal_sent: 5,
  negotiation: 7,
};

// Outreach cards that need a person: a reply waiting for review, or an
// interested lead with no call booked yet.
export const CONTACT_STALL_DAYS: Partial<Record<ContactStage, number>> = {
  replied: 1,
  interested: 2,
};
