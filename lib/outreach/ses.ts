import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { fromDomain, sesConfigured, unsubscribeMailto } from './config';

// Amazon SES v2 sender for cold outreach. Builds the MIME message itself
// so we control Message-ID, threading headers and RFC 8058 one-click
// unsubscribe headers.

let client: SESv2Client | null = null;

function ses(): SESv2Client {
  if (!sesConfigured()) {
    throw new Error(
      'Amazon SES is not configured (AWS_SES_REGION, AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, OUTREACH_FROM_DOMAIN)',
    );
  }
  client ??= new SESv2Client({
    region: process.env.AWS_SES_REGION,
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
    },
    maxAttempts: 2,
  });
  return client;
}

export function generateMessageId(): string {
  const domain = fromDomain() || 'localhost';
  return `<${Date.now().toString(36)}.${randomUUID().replace(/-/g, '')}@${domain}>`;
}

// RFC 5322 msg-id: "<" printable ASCII without spaces or angle brackets ">".
// Anything else (CR/LF from a decoded encoded-word, spaces, control
// characters) could break out of the header, so it's rejected.
const MSG_ID_RE = /^<[\x21-\x3b\x3d\x3f-\x7e]{1,500}>$/;

// Normalises "<id>" / "id" to "<id>". Null when the result isn't a safe msg-id.
export function bracketId(id: string | null | undefined): string | null {
  if (typeof id !== 'string') return null;
  const t = id.trim();
  const v = t.startsWith('<') ? t : `<${t}>`;
  return MSG_ID_RE.test(v) ? v : null;
}

// ── MIME helpers ────────────────────────────────────────────────────

const ASCII_PRINTABLE = /^[\x20-\x7e]*$/;

// RFC 2047 encoded-word for non-ASCII header text.
function encodeHeaderText(s: string): string {
  const clean = s.replace(/[\r\n]+/g, ' ');
  if (ASCII_PRINTABLE.test(clean)) return clean;
  // Split into chunks so each encoded word stays under 75 chars.
  const words: string[] = [];
  let chunk = '';
  for (const ch of clean) {
    if (Buffer.byteLength(chunk + ch, 'utf8') > 42) {
      words.push(chunk);
      chunk = '';
    }
    chunk += ch;
  }
  if (chunk) words.push(chunk);
  return words.map((w) => `=?UTF-8?B?${Buffer.from(w, 'utf8').toString('base64')}?=`).join('\r\n ');
}

function formatAddress(name: string | undefined, email: string): string {
  const addr = email.trim();
  if (!name) return addr;
  const clean = name.replace(/[\r\n]+/g, ' ').trim();
  if (!ASCII_PRINTABLE.test(clean)) return `${encodeHeaderText(clean)} <${addr}>`;
  const quoted = /[()<>@,;:\\".[\]]/.test(clean) ? `"${clean.replace(/(["\\])/g, '\\$1')}"` : clean;
  return `${quoted} <${addr}>`;
}

// Folds a long header (e.g. References) at spaces to stay under 78 chars.
function foldHeader(name: string, value: string): string {
  const parts = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = `${name}:`;
  for (const p of parts) {
    if (line.length + 1 + p.length > 76 && line !== `${name}:`) {
      lines.push(line);
      line = ` ${p}`;
    } else {
      line += ` ${p}`;
    }
  }
  lines.push(line);
  return lines.join('\r\n');
}

// Quoted-printable (RFC 2045) over UTF-8 bytes, CRLF line breaks.
function quotedPrintable(input: string): string {
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  for (const line of lines) {
    const bytes = Buffer.from(line, 'utf8');
    let encoded = '';
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      const isLast = i === bytes.length - 1;
      let tok: string;
      if ((b === 0x20 || b === 0x09) && !isLast) tok = String.fromCharCode(b);
      else if (b >= 33 && b <= 126 && b !== 61) tok = String.fromCharCode(b);
      else tok = `=${b.toString(16).toUpperCase().padStart(2, '0')}`;
      encoded += tok;
    }
    // Soft line breaks at 76 chars without splitting an =XX escape.
    let rest = encoded;
    while (rest.length > 76) {
      let cut = 75;
      const esc = rest.lastIndexOf('=', cut);
      if (esc > cut - 3) cut = esc;
      out.push(`${rest.slice(0, cut)}=`);
      rest = rest.slice(cut);
    }
    out.push(rest);
  }
  return out.join('\r\n');
}

export type SendInput = {
  fromName: string;
  fromEmail: string;
  to: string;
  replyTo?: string | null;
  subject: string;
  text: string;
  html: string;
  unsubscribeUrl: string;
  inReplyTo?: string | null;
  references?: string[];
  tags?: Record<string, string>;
};

export type SendResult = { sesMessageId: string; messageId: string };

export function buildRawMessage(input: SendInput, messageId: string): string {
  const boundary = `=_impx_${randomBytes(12).toString('hex')}`;
  const headers: string[] = [
    `From: ${formatAddress(input.fromName, input.fromEmail)}`,
    `To: ${formatAddress(undefined, input.to)}`,
  ];
  if (input.replyTo) headers.push(`Reply-To: ${formatAddress(undefined, input.replyTo)}`);
  headers.push(`Subject: ${encodeHeaderText(input.subject)}`);
  headers.push(`Date: ${new Date().toUTCString().replace('GMT', '+0000')}`);
  headers.push(`Message-ID: ${messageId}`);
  const inReplyTo = bracketId(input.inReplyTo);
  if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
  const refs = (input.references ?? [])
    .map(bracketId)
    .filter((r, i, a): r is string => !!r && a.indexOf(r) === i);
  if (inReplyTo && !refs.includes(inReplyTo)) refs.push(inReplyTo);
  if (refs.length) headers.push(foldHeader('References', refs.slice(-20).join(' ')));
  const mailto = unsubscribeMailto();
  headers.push(
    `List-Unsubscribe: <${input.unsubscribeUrl}>${mailto ? `, <mailto:${mailto}?subject=unsubscribe>` : ''}`,
  );
  headers.push('List-Unsubscribe-Post: List-Unsubscribe=One-Click');
  headers.push('MIME-Version: 1.0');
  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);

  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    quotedPrintable(input.text),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    quotedPrintable(input.html),
    `--${boundary}--`,
    '',
  ];
  return `${headers.join('\r\n')}\r\n\r\n${body.join('\r\n')}`;
}

const TAG_RE = /[^A-Za-z0-9_-]/g;

export class SesSendError extends Error {
  constructor(
    message: string,
    readonly code: string,
    // Account-level problems (sending paused, throttled, quota): stop the run.
    readonly fatal: boolean,
    // Problems with this one message (rejected address/content): don't retry it.
    readonly permanent: boolean,
  ) {
    super(message);
    this.name = 'SesSendError';
  }
}

export async function sendOutreachEmail(input: SendInput): Promise<SendResult> {
  const messageId = generateMessageId();
  const raw = buildRawMessage(input, messageId);
  const configurationSet = process.env.SES_CONFIGURATION_SET?.trim();
  const command = new SendEmailCommand({
    FromEmailAddress: formatAddress(input.fromName, input.fromEmail),
    Destination: { ToAddresses: [input.to] },
    Content: { Raw: { Data: Buffer.from(raw, 'utf8') } },
    ...(configurationSet ? { ConfigurationSetName: configurationSet } : {}),
    EmailTags: Object.entries(input.tags ?? {})
      .map(([Name, Value]) => ({ Name: Name.replace(TAG_RE, '_'), Value: Value.replace(TAG_RE, '_').slice(0, 256) }))
      .filter((t) => t.Name && t.Value),
  });
  try {
    const res = await ses().send(command, { abortSignal: AbortSignal.timeout(15_000) });
    if (!res.MessageId) throw new SesSendError('SES returned no MessageId', 'NoMessageId', false, false);
    return { sesMessageId: res.MessageId, messageId };
  } catch (err) {
    if (err instanceof SesSendError) throw err;
    const name = err instanceof Error ? err.name : 'Unknown';
    const msg = err instanceof Error ? err.message : String(err);
    const fatal = [
      'AccountSuspendedException',
      'SendingPausedException',
      'LimitExceededException',
      'TooManyRequestsException',
      'MailFromDomainNotVerifiedException',
    ].includes(name);
    const permanent = ['MessageRejected', 'BadRequestException', 'NotFoundException'].includes(name);
    console.error(`[outreach/ses] send failed (${name}): ${msg.slice(0, 300)}`);
    throw new SesSendError(msg, name, fatal, permanent);
  }
}

// SES rewrites nothing we rely on, but some receivers reference the SES
// form "<sesMessageId@email.amazonses.com>" in In-Reply-To. Returns the
// SES message id from such a reference, or null.
export function sesIdFromReference(ref: string): string | null {
  const m = /^<?([^@<>]+)@([a-z0-9.-]*amazonses\.com)>?$/i.exec(ref.trim());
  return m ? m[1] : null;
}
