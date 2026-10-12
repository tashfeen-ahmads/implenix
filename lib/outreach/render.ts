import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Contact } from '@/lib/db/types';
import { SITE_URL, postalAddress, unsubscribeSecret } from './config';

// Template rendering, plain text -> HTML, the compliance footer and signed
// unsubscribe links for outreach email.

export type TemplateContact = Pick<
  Contact,
  'first_name' | 'last_name' | 'company' | 'website' | 'city' | 'industry' | 'email'
> & { state?: string | null; phone?: string | null; custom?: Record<string, string> | null };

const STANDARD_VARS = [
  'first_name',
  'last_name',
  'company',
  'website',
  'city',
  'state',
  'industry',
  'email',
  'phone',
] as const;
type StandardVar = (typeof STANDARD_VARS)[number];

function isStandardVar(v: string): v is StandardVar {
  return (STANDARD_VARS as readonly string[]).includes(v);
}

const VAR_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*(?:\|([^}]*))?\}\}/g;

// {{first_name}}, {{first_name|there}}, {{custom.key}}, {{custom.key|fallback}}.
// Unknown or empty variables render as their fallback, or nothing.
export function renderTemplate(template: string, contact: TemplateContact): string {
  return template.replace(VAR_RE, (_m, rawName: string, fallback: string | undefined) => {
    const name = rawName.trim();
    let value: string | null | undefined;
    if (name.startsWith('custom.')) {
      const key = name.slice('custom.'.length);
      const custom = contact.custom ?? {};
      value = custom[key] ?? custom[key.toLowerCase()];
    } else if (isStandardVar(name)) {
      value = contact[name];
    }
    const v = typeof value === 'string' ? value.trim() : '';
    if (v) return v;
    return (fallback ?? '').trim();
  });
}

// Lists the variable names used in a template (for UI previews / checks).
export function templateVariables(template: string): string[] {
  const out = new Set<string>();
  for (const m of template.matchAll(VAR_RE)) out.add(m[1].trim());
  return [...out];
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const URL_RE = /\bhttps?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;

function linkify(escaped: string): string {
  return escaped.replace(URL_RE, (url) => `<a href="${url}">${url}</a>`);
}

// Plain text with blank-line paragraphs -> minimal HTML. Single newlines
// become <br>. No images, no tracking, no styling beyond the basics: plain
// looking mail lands in the inbox more often than designed mail.
export function textToHtml(text: string): string {
  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs
    .map((p) => `<p style="margin:0 0 1em 0">${linkify(escapeHtml(p)).replace(/\n/g, '<br>\n')}</p>`)
    .join('\n');
}

// ── Unsubscribe tokens ──────────────────────────────────────────────

function unsubscribeSignature(contactId: string, email: string): Buffer {
  return createHmac('sha256', unsubscribeSecret())
    .update(`${contactId}:${email.trim().toLowerCase()}`)
    .digest();
}

export function unsubscribeToken(contactId: string, email: string): string {
  return unsubscribeSignature(contactId, email).toString('base64url');
}

export function verifyUnsubscribeToken(contactId: string, email: string, token: string): boolean {
  if (!token || token.length > 128) return false;
  let given: Buffer;
  try {
    given = Buffer.from(token, 'base64url');
  } catch {
    return false;
  }
  const expected = unsubscribeSignature(contactId, email);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function unsubscribeUrl(contactId: string, email: string): string {
  const params = new URLSearchParams({ c: contactId, t: unsubscribeToken(contactId, email) });
  return `${SITE_URL}/api/outreach/unsubscribe?${params.toString()}`;
}

// ── Compliance footer ───────────────────────────────────────────────

export const FOOTER_REASON =
  "You're getting this because your business contact details are publicly listed and I thought this could be relevant to you.";

export function complianceFooter(unsubUrl: string): { text: string; html: string } {
  const address = postalAddress();
  const lines = [
    FOOTER_REASON,
    `Not interested? Unsubscribe here: ${unsubUrl}`,
    address ? `Implenix, ${address}` : 'Implenix',
  ];
  const text = `--\n${lines.join('\n')}`;
  const html = `<p style="margin:2em 0 0 0;font-size:12px;line-height:1.5;color:#777">${escapeHtml(
    FOOTER_REASON,
  )}<br>Not interested? <a href="${escapeHtml(unsubUrl)}" style="color:#777">Unsubscribe</a>.<br>${escapeHtml(
    address ? `Implenix, ${address}` : 'Implenix',
  )}</p>`;
  return { text, html };
}

export type RenderedEmail = {
  subject: string;
  // Merged body without the footer (what the inbox shows).
  body: string;
  text: string;
  html: string;
  unsubscribeUrl: string;
};

// Full outreach email for a contact: merged subject/body plus footer.
// `render` false means subject/body are already final text (AI/manual replies).
export function buildOutreachEmail(input: {
  subject: string;
  body: string;
  contact: TemplateContact & { id: string };
  render?: boolean;
  unsubscribeUrlOverride?: string;
}): RenderedEmail {
  const doRender = input.render !== false;
  const subject = (doRender ? renderTemplate(input.subject, input.contact) : input.subject)
    .replace(/[\r\n]+/g, ' ')
    .trim();
  const body = (doRender ? renderTemplate(input.body, input.contact) : input.body)
    .replace(/\r\n?/g, '\n')
    .trim();
  const unsub = input.unsubscribeUrlOverride ?? unsubscribeUrl(input.contact.id, input.contact.email);
  const footer = complianceFooter(unsub);
  const text = `${body}\n\n${footer.text}\n`;
  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#222">\n${textToHtml(
    body,
  )}\n${footer.html}\n</body></html>`;
  return { subject, body, text, html, unsubscribeUrl: unsub };
}

// "Re: " + subject without stacking prefixes.
export function replySubject(subject: string | null | undefined): string {
  const base = (subject ?? '').replace(/^\s*((re|fwd?|aw|sv)\s*:\s*)+/i, '').trim();
  return base ? `Re: ${base}` : 'Re: our conversation';
}
