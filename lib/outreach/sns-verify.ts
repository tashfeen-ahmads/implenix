import 'server-only';
import { createVerify } from 'node:crypto';

// Amazon SNS message signature verification for HTTPS subscriptions.
// https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html

export type SnsMessage = {
  Type: 'Notification' | 'SubscriptionConfirmation' | 'UnsubscribeConfirmation' | string;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  Subject?: string;
  Token?: string;
  SubscribeURL?: string;
  UnsubscribeURL?: string;
};

export function parseSnsMessage(raw: string): SnsMessage | null {
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === 'string' ? (o[k] as string) : undefined);
  const required = ['Type', 'MessageId', 'TopicArn', 'Message', 'Timestamp', 'SignatureVersion', 'Signature', 'SigningCertURL'];
  if (!required.every((k) => typeof o[k] === 'string')) return null;
  return {
    Type: str('Type')!,
    MessageId: str('MessageId')!,
    TopicArn: str('TopicArn')!,
    Message: str('Message')!,
    Timestamp: str('Timestamp')!,
    SignatureVersion: str('SignatureVersion')!,
    Signature: str('Signature')!,
    SigningCertURL: str('SigningCertURL')!,
    Subject: str('Subject'),
    Token: str('Token'),
    SubscribeURL: str('SubscribeURL'),
    UnsubscribeURL: str('UnsubscribeURL'),
  };
}

// Only AWS-hosted SNS endpoints: https://sns.<region>.amazonaws.com/...
const SNS_HOST_RE = /^sns\.[a-z0-9-]+\.amazonaws\.com$/;

export function isSnsUrl(value: string | undefined, requirePem = false): boolean {
  if (!value) return false;
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' || u.port || u.username || u.password) return false;
  if (!SNS_HOST_RE.test(u.hostname)) return false;
  if (requirePem && !u.pathname.endsWith('.pem')) return false;
  return true;
}

const certCache = new Map<string, { pem: string; at: number }>();
const CERT_TTL_MS = 24 * 3_600_000;

async function fetchCert(url: string): Promise<string> {
  const hit = certCache.get(url);
  if (hit && Date.now() - hit.at < CERT_TTL_MS) return hit.pem;
  const res = await fetch(url, { signal: AbortSignal.timeout(5_000), redirect: 'error' });
  if (!res.ok) throw new Error(`cert fetch ${res.status}`);
  const pem = await res.text();
  if (!pem.includes('-----BEGIN CERTIFICATE-----') || pem.length > 20_000) {
    throw new Error('cert fetch returned something that is not a certificate');
  }
  if (certCache.size > 20) certCache.clear();
  certCache.set(url, { pem, at: Date.now() });
  return pem;
}

export function canonicalString(m: SnsMessage): string | null {
  let keys: (keyof SnsMessage)[];
  if (m.Type === 'Notification') {
    keys = ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'];
  } else if (m.Type === 'SubscriptionConfirmation' || m.Type === 'UnsubscribeConfirmation') {
    keys = ['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type'];
  } else {
    return null;
  }
  let out = '';
  for (const k of keys) {
    const v = m[k];
    // Subject is only part of the string when present.
    if (v === undefined) {
      if (k === 'Subject') continue;
      return null;
    }
    out += `${k}\n${v}\n`;
  }
  return out;
}

export async function verifySnsMessage(m: SnsMessage): Promise<boolean> {
  if (!isSnsUrl(m.SigningCertURL, true)) {
    console.warn('[outreach/sns] rejected SigningCertURL host');
    return false;
  }
  const algorithm = m.SignatureVersion === '1' ? 'RSA-SHA1' : m.SignatureVersion === '2' ? 'RSA-SHA256' : null;
  if (!algorithm) return false;
  const canonical = canonicalString(m);
  if (!canonical) return false;
  try {
    const pem = await fetchCert(m.SigningCertURL);
    const verifier = createVerify(algorithm);
    verifier.update(canonical, 'utf8');
    verifier.end();
    return verifier.verify(pem, m.Signature, 'base64');
  } catch (err) {
    console.error('[outreach/sns] signature verification error', err instanceof Error ? err.message : err);
    return false;
  }
}
