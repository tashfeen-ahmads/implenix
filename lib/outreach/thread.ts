import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Campaign, Contact, Message } from '@/lib/db/types';
import { buildOutreachEmail, replySubject } from './render';
import { sendOutreachEmail } from './ses';
import { isSuppressed } from './suppress';

// Sending a reply inside an existing conversation (AI auto reply, an
// approved AI draft, or a manual reply from the inbox).

const BLOCKED_STATUSES = new Set(['unsubscribed', 'bounced', 'complained']);

export class ThreadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ThreadError';
  }
}

// The campaign this contact was last emailed from (sender identity for replies).
export async function campaignForContact(db: SupabaseClient, contactId: string): Promise<Campaign | null> {
  const { data: msg } = await db
    .from('messages')
    .select('campaign_id')
    .eq('contact_id', contactId)
    .not('campaign_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  let campaignId = (msg as { campaign_id: string | null } | null)?.campaign_id ?? null;
  if (!campaignId) {
    const { data: enr } = await db
      .from('campaign_enrollments')
      .select('campaign_id')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    campaignId = (enr as { campaign_id: string } | null)?.campaign_id ?? null;
  }
  if (!campaignId) return null;
  const { data } = await db.from('campaigns').select('*').eq('id', campaignId).maybeSingle();
  return (data as Campaign | null) ?? null;
}

export async function threadHeaders(
  db: SupabaseClient,
  contactId: string,
): Promise<{ inReplyTo: string | null; references: string[]; lastSubject: string | null }> {
  const { data } = await db
    .from('messages')
    .select('direction, message_id, subject, status, created_at')
    .eq('contact_id', contactId)
    .neq('status', 'draft')
    .neq('status', 'failed')
    .order('created_at', { ascending: true })
    .limit(200);
  const rows = (data ?? []) as Pick<Message, 'direction' | 'message_id' | 'subject' | 'status' | 'created_at'>[];
  const references = rows.map((r) => r.message_id).filter((v): v is string => Boolean(v));
  const lastInbound = [...rows].reverse().find((r) => r.direction === 'inbound' && r.message_id);
  const last = rows[rows.length - 1];
  return {
    inReplyTo: lastInbound?.message_id ?? last?.message_id ?? null,
    references: references.slice(-10),
    lastSubject: lastInbound?.subject ?? last?.subject ?? null,
  };
}

export type ThreadReplyInput = {
  contact: Contact;
  campaign?: Campaign | null;
  subject?: string | null;
  body: string;
  aiGenerated: boolean;
  aiMeta?: Record<string, unknown>;
  sentBy?: string | null;
  // Update this draft row in place instead of inserting a new message.
  draftId?: string;
};

export async function sendThreadReply(
  db: SupabaseClient,
  input: ThreadReplyInput,
): Promise<{ id: string; messageId: string; sesMessageId: string }> {
  const { contact } = input;
  if (BLOCKED_STATUSES.has(contact.status)) {
    throw new ThreadError(`Contact is ${contact.status}; not sending.`, 409);
  }
  if (await isSuppressed(db, contact.email)) {
    throw new ThreadError('Address is on the suppression list; not sending.', 409);
  }
  const campaign = input.campaign ?? (await campaignForContact(db, contact.id));
  if (!campaign) throw new ThreadError('No campaign found for this contact to send from.', 400);

  const thread = await threadHeaders(db, contact.id);
  const subject = input.subject?.trim() || replySubject(thread.lastSubject);
  const email = buildOutreachEmail({ subject, body: input.body, contact, render: false });
  const sent = await sendOutreachEmail({
    fromName: campaign.from_name,
    fromEmail: campaign.from_email,
    to: contact.email,
    replyTo: campaign.reply_to,
    subject: email.subject,
    text: email.text,
    html: email.html,
    unsubscribeUrl: email.unsubscribeUrl,
    inReplyTo: thread.inReplyTo,
    references: thread.references,
    tags: { campaign_id: campaign.id, kind: input.aiGenerated ? 'ai_reply' : 'reply' },
  });

  const row = {
    contact_id: contact.id,
    campaign_id: campaign.id,
    direction: 'outbound' as const,
    from_email: campaign.from_email,
    to_email: contact.email,
    subject: email.subject,
    body_text: input.body,
    body_html: email.html,
    message_id: sent.messageId,
    in_reply_to: thread.inReplyTo,
    ses_message_id: sent.sesMessageId,
    status: 'sent' as const,
    ai_generated: input.aiGenerated,
    ...(input.aiMeta ? { ai_meta: input.aiMeta } : {}),
    sent_by: input.sentBy ?? null,
  };

  let id: string;
  if (input.draftId) {
    const { error } = await db.from('messages').update(row).eq('id', input.draftId);
    if (error) console.error('[outreach] draft update after send failed', error.message);
    id = input.draftId;
  } else {
    const { data, error } = await db.from('messages').insert(row).select('id').single();
    if (error) console.error('[outreach] reply insert failed (email was sent)', error.message);
    id = (data as { id: string } | null)?.id ?? '';
  }
  await db.from('contacts').update({ last_contacted_at: new Date().toISOString() }).eq('id', contact.id);
  return { id, messageId: sent.messageId, sesMessageId: sent.sesMessageId };
}
