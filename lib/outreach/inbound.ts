import 'server-only';
import { simpleParser, type AddressObject, type ParsedMail } from 'mailparser';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Campaign, Contact, Message } from '@/lib/db/types';
import { unsubscribeMailto } from './config';
import { handleInboundWithAgent } from './agent';
import { sesIdFromReference } from './ses';
import { escapeLike, normalizeEmail, suppressAndStop } from './suppress';

// SES notifications delivered over SNS: sending events (bounce, complaint,
// delivery) and inbound replies (receipt rule with an SNS action).

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === 'object' ? (v as Json) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');

// ── Sending events ──────────────────────────────────────────────────

export async function handleSesEvent(db: SupabaseClient, payload: Json): Promise<string> {
  // Configuration-set event publishing uses eventType; identity
  // notifications use notificationType. Both carry mail.messageId.
  const type = str(payload.eventType) || str(payload.notificationType);
  const mail = obj(payload.mail);
  const sesId = str(mail.messageId);

  const setStatus = async (status: Message['status']) => {
    if (!sesId) return;
    const { error } = await db.from('messages').update({ status }).eq('ses_message_id', sesId);
    if (error) console.error('[outreach/ses] message status update failed', error.message);
  };

  switch (type) {
    case 'Bounce': {
      const bounce = obj(payload.bounce);
      const permanent = str(bounce.bounceType) === 'Permanent';
      if (!permanent) return 'bounce_transient';
      await setStatus('bounced');
      for (const r of arr(bounce.bouncedRecipients)) {
        const email = str(obj(r).emailAddress);
        if (email) await suppressAndStop(db, email, 'bounced');
      }
      return 'bounce_permanent';
    }
    case 'Complaint': {
      await setStatus('complained');
      for (const r of arr(obj(payload.complaint).complainedRecipients)) {
        const email = str(obj(r).emailAddress);
        if (email) await suppressAndStop(db, email, 'complained');
      }
      return 'complaint';
    }
    case 'Delivery': {
      // Don't overwrite a later bounce/complaint.
      if (sesId) {
        await db.from('messages').update({ status: 'delivered' }).eq('ses_message_id', sesId).eq('status', 'sent');
      }
      return 'delivery';
    }
    case 'Received':
      return 'received';
    default:
      return `ignored_${type || 'unknown'}`;
  }
}

// ── Inbound replies ─────────────────────────────────────────────────

const OOO_SUBJECT =
  /(out of (the )?office|automatic reply|auto[- ]?reply|autoreply|auto[- ]?response|away from (the )?office|on vacation|on leave|abwesenheit|r[ée]ponse automatique|respuesta autom[aá]tica|delivery status notification|undeliver(able|ed))/i;

export function isAutoReply(mail: ParsedMail): boolean {
  const h = mail.headers;
  const get = (k: string) => {
    const v = h.get(k);
    return typeof v === 'string' ? v.toLowerCase() : v ? JSON.stringify(v).toLowerCase() : '';
  };
  const autoSubmitted = get('auto-submitted');
  if (autoSubmitted && !autoSubmitted.includes('no')) return true;
  if (h.has('x-autoreply') || h.has('x-autorespond') || h.has('x-autoresponder')) return true;
  if (/^(bulk|junk|list|auto_reply)/.test(get('precedence'))) return true;
  if (get('x-auto-response-suppress').includes('all')) return true;
  if (h.has('x-failed-recipients')) return true;
  const from = (mail.from?.value[0]?.address ?? '').toLowerCase();
  if (/^(mailer-daemon|postmaster|no-?reply|do-?not-?reply)@/.test(from)) return true;
  return OOO_SUBJECT.test(mail.subject ?? '');
}

// Keeps only the new text of a reply: cuts at the quoted original.
export function stripQuoted(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const two = `${line} ${lines[i + 1] ?? ''}`;
    if (/^\s*On .{3,200}wrote:\s*$/i.test(line) || /^\s*On .{3,200}wrote:\s*$/i.test(two)) break;
    if (/^\s*-{2,}\s*(Original Message|Forwarded message)\s*-{2,}/i.test(line)) break;
    if (/^\s*_{10,}\s*$/.test(line)) break;
    if (/^\s*From:\s.+/i.test(line) && (out.length === 0 || out[out.length - 1].trim() === '')) {
      const next = lines.slice(i + 1, i + 5).join('\n');
      if (/^\s*(Sent|Date|To|Subject):/im.test(next)) break;
    }
    if (/^\s*>/.test(line)) continue;
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function addresses(a: AddressObject | AddressObject[] | undefined): string[] {
  const list = Array.isArray(a) ? a : a ? [a] : [];
  return list.flatMap((o) => o.value.map((v) => (v.address ?? '').toLowerCase())).filter(Boolean);
}

async function findReferencedMessage(db: SupabaseClient, refs: string[]): Promise<Message | null> {
  for (const ref of refs.reverse()) {
    const sesId = sesIdFromReference(ref);
    const q = sesId
      ? db.from('messages').select('*').eq('ses_message_id', sesId)
      : db.from('messages').select('*').eq('message_id', ref.startsWith('<') ? ref : `<${ref}>`);
    const { data } = await q.eq('direction', 'outbound').limit(1).maybeSingle();
    if (data) return data as Message;
  }
  return null;
}

export async function handleInboundEmail(db: SupabaseClient, payload: Json): Promise<string> {
  const receipt = obj(payload.receipt);
  const action = obj(receipt.action);
  if (str(obj(receipt.spamVerdict).status) === 'FAIL' || str(obj(receipt.virusVerdict).status) === 'FAIL') {
    return 'spam_or_virus';
  }
  const content = str(payload.content);
  if (!content) {
    // SNS actions drop messages over 150 KB; nothing to parse.
    console.warn('[outreach/inbound] notification without content (too large or not an SNS action)');
    return 'no_content';
  }
  const raw = str(action.encoding).toUpperCase() === 'BASE64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf8');

  let mail: ParsedMail;
  try {
    mail = await simpleParser(raw, { skipImageLinks: true, skipTextToHtml: true });
  } catch (err) {
    console.error('[outreach/inbound] parse failed', err instanceof Error ? err.message : err);
    return 'parse_failed';
  }

  const sender = normalizeEmail(mail.from?.value[0]?.address ?? '');
  if (!sender) return 'no_sender';
  const recipients = [
    ...arr(receipt.recipients).map((r) => str(r).toLowerCase()),
    ...addresses(mail.to),
  ];
  const messageId = mail.messageId ? (mail.messageId.startsWith('<') ? mail.messageId : `<${mail.messageId}>`) : null;

  // Mail to the List-Unsubscribe mailto address.
  const unsubAddr = unsubscribeMailto();
  if (unsubAddr && recipients.includes(unsubAddr)) {
    await suppressAndStop(db, sender, 'unsubscribed');
    return 'unsubscribe_mailto';
  }

  // SNS can deliver the same notification twice.
  if (messageId) {
    const { data: dupe } = await db
      .from('messages')
      .select('id')
      .eq('message_id', messageId)
      .eq('direction', 'inbound')
      .limit(1)
      .maybeSingle();
    if (dupe) return 'duplicate';
  }

  const refs = [
    ...(typeof mail.references === 'string' ? [mail.references] : mail.references ?? []),
    ...(mail.inReplyTo ? [mail.inReplyTo] : []),
  ]
    .flatMap((r) => r.split(/\s+/))
    .filter(Boolean);
  const referenced = refs.length ? await findReferencedMessage(db, [...refs]) : null;

  const { data: byEmail } = await db.from('contacts').select('*').ilike('email', escapeLike(sender)).maybeSingle();
  let contact = byEmail as Contact | null;
  if (!contact && referenced?.contact_id) {
    // Replied from a different address (e.g. forwarded to a colleague).
    const { data } = await db.from('contacts').select('*').eq('id', referenced.contact_id).maybeSingle();
    contact = data as Contact | null;
  }

  const fullText = (mail.text ?? '').trim();
  const body = stripQuoted(fullText) || fullText.slice(0, 4000);
  const auto = isAutoReply(mail);

  let campaignId = referenced?.campaign_id ?? null;
  if (!campaignId && contact) {
    const { data } = await db
      .from('messages')
      .select('campaign_id')
      .eq('contact_id', contact.id)
      .eq('direction', 'outbound')
      .not('campaign_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    campaignId = (data as { campaign_id: string | null } | null)?.campaign_id ?? null;
  }

  const { data: inserted, error } = await db
    .from('messages')
    .insert({
      contact_id: contact?.id ?? null,
      campaign_id: campaignId,
      direction: 'inbound',
      from_email: sender,
      to_email: recipients[0] ?? '',
      subject: mail.subject ?? null,
      body_text: body.slice(0, 20_000),
      message_id: messageId,
      in_reply_to: mail.inReplyTo ?? referenced?.message_id ?? null,
      status: 'received',
      ai_meta: {
        auto_reply: auto,
        full_text: fullText.length > body.length ? fullText.slice(0, 20_000) : undefined,
        matched: contact ? (byEmail ? 'sender' : 'thread') : 'none',
      },
    })
    .select('*')
    .single();
  if (error || !inserted) {
    console.error('[outreach/inbound] insert failed', error?.message);
    throw new Error('inbound insert failed');
  }
  const inbound = inserted as Message;

  if (!contact) return 'stored_unmatched';
  if (auto) return 'auto_reply_stored';

  // A real reply ends every running sequence for this person.
  await db
    .from('campaign_enrollments')
    .update({ status: 'replied' })
    .eq('contact_id', contact.id)
    .eq('status', 'active');
  if (contact.status === 'active') {
    await db.from('contacts').update({ status: 'replied' }).eq('id', contact.id);
    contact = { ...contact, status: 'replied' };
  }

  let { data: client } = await db
    .from('clients')
    .select('id')
    .eq('outreach_contact_id', contact.id)
    .limit(1)
    .maybeSingle();
  if (!client) {
    ({ data: client } = await db
      .from('clients')
      .select('id')
      .ilike('email', escapeLike(contact.email))
      .limit(1)
      .maybeSingle());
  }
  if (client) {
    await db.from('activities').insert({
      client_id: (client as { id: string }).id,
      type: 'outreach.reply',
      body: `Replied to outreach: ${body.slice(0, 500)}`,
      meta: { message_id: inbound.id, subject: mail.subject ?? null },
    });
  }

  let campaign: Campaign | null = null;
  if (campaignId) {
    const { data } = await db.from('campaigns').select('*').eq('id', campaignId).maybeSingle();
    campaign = data as Campaign | null;
  }
  const res = await handleInboundWithAgent({ db, contact, campaign, inbound });
  return `reply_${res.handled}`;
}
