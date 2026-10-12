import 'server-only';
import { resolve4, resolveMx } from 'node:dns/promises';

// Email verification before import and before sending. Bounces above
// ~2% put the SES account at risk, so scraped addresses are checked first.
//
// Built in (free): syntax, disposable domains, and the domain's mail
// servers (MX). This catches dead domains and typos but cannot see whether
// the mailbox exists. A paid verifier (see verifierProvider below) checks
// the mailbox itself and detects catch-all domains.

export type Verdict = 'deliverable' | 'risky' | 'undeliverable' | 'unknown';
export type VerifyResult = { verdict: Verdict; reason: string };

const SYNTAX = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'yopmail.com',
  'trashmail.com', 'getnada.com', 'sharklasers.com', 'dispostable.com', 'maildrop.cc', 'throwawaymail.com',
]);

type DnsDeps = { mx?: typeof resolveMx; a?: typeof resolve4 };
// Tests only: stand-in DNS (CI has no network).
let testDns: DnsDeps | null = null;
export function setDnsForTests(d: DnsDeps | null) {
  testDns = d;
  domainCache.clear();
}
const domainCache = new Map<string, { at: number; result: VerifyResult }>();

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms))]);
}

// Syntax + disposable + MX. Results per domain are cached for an hour.
export async function basicCheck(email: string, deps: DnsDeps = testDns ?? {}): Promise<VerifyResult> {
  const e = email.trim().toLowerCase();
  if (!SYNTAX.test(e) || e.length > 254) return { verdict: 'undeliverable', reason: 'invalid_syntax' };
  const domain = e.split('@')[1];
  if (DISPOSABLE.has(domain)) return { verdict: 'undeliverable', reason: 'disposable' };
  if (blockedRole(e)) return { verdict: 'undeliverable', reason: 'role_never_email' };
  const cached = domainCache.get(domain);
  if (cached && Date.now() - cached.at < 3_600_000) return cached.result;

  let result: VerifyResult;
  try {
    const mx = await withTimeout((deps.mx ?? resolveMx)(domain), 5_000);
    result = mx.some((r) => r.exchange && r.exchange !== '.')
      ? { verdict: 'unknown', reason: 'mx_ok' } // domain takes mail; mailbox not checked
      : { verdict: 'undeliverable', reason: 'null_mx' };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'ENOTFOUND' || code === 'ENODATA') {
      // No MX: mail falls back to the A record, which rarely works for a
      // business domain. No A record either means the domain is dead.
      try {
        const a = await withTimeout((deps.a ?? resolve4)(domain), 5_000);
        result = a.length ? { verdict: 'risky', reason: 'no_mx' } : { verdict: 'undeliverable', reason: 'no_mail_server' };
      } catch {
        result = { verdict: 'undeliverable', reason: 'domain_not_found' };
      }
    } else {
      result = { verdict: 'unknown', reason: 'dns_error' };
    }
  }
  if (result.reason !== 'dns_error') domainCache.set(domain, { at: Date.now(), result });
  if (domainCache.size > 5000) domainCache.clear();
  return result;
}

export type VerifierProvider = {
  name: string;
  verify: (email: string) => Promise<VerifyResult>;
};

// Paid mailbox verifier, when a key is set. Filled in by verifyEmail().
let provider: VerifierProvider | null | undefined;
export function setVerifierForTests(p: VerifierProvider | null | undefined) {
  provider = p;
}

export async function verifyEmail(email: string, deps: DnsDeps = testDns ?? {}): Promise<VerifyResult & { checkedBy: string }> {
  const basic = await basicCheck(email, deps);
  if (basic.verdict === 'undeliverable') return { ...basic, checkedBy: 'basic' };
  const p = provider === undefined ? (provider = verifierProvider()) : provider;
  if (!p) return { ...basic, checkedBy: 'basic' };
  try {
    return { ...(await p.verify(email)), checkedBy: p.name };
  } catch (err) {
    console.error(`[verify] ${p.name} failed`, err instanceof Error ? err.message : err);
    return { ...basic, checkedBy: 'basic' };
  }
}

// Which verdicts may be imported and emailed.
export const SENDABLE: (Verdict | null)[] = ['deliverable', 'unknown', null];

// Role inboxes that must never get cold email. Generic business inboxes
// (info@, office@, service@) are fine: for owner-run local businesses they
// are often the only address and the owner reads them.
const NEVER_EMAIL = /^(abuse|postmaster|hostmaster|webmaster|noc|security|privacy|legal|spam|noreply|no-reply|donotreply|mailer-daemon)@/i;
export function blockedRole(email: string): boolean {
  return NEVER_EMAIL.test(email.trim());
}

async function getJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: 'no-store' });
  if (!res.ok) throw new Error(`${new URL(url).hostname} ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

// MillionVerifier: https://developer.millionverifier.com/
// result: ok | catch_all | unknown | disposable | invalid | error
const millionVerifier: VerifierProvider = {
  name: 'millionverifier',
  async verify(email) {
    const q = new URLSearchParams({ api: process.env.MILLIONVERIFIER_API_KEY ?? '', email, timeout: '10' });
    const r = await getJson(`https://api.millionverifier.com/api/v3/?${q}`);
    const result = String(r.result ?? 'unknown');
    if (result === 'error') throw new Error(String(r.error ?? 'verifier error'));
    const verdict: Verdict =
      result === 'ok' ? 'deliverable' : result === 'catch_all' ? 'risky' : result === 'invalid' || result === 'disposable' ? 'undeliverable' : 'unknown';
    return { verdict, reason: [result, r.subresult].filter(Boolean).join(':') };
  },
};

// ZeroBounce: https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-validate-emails
// status: valid | invalid | catch-all | unknown | spamtrap | abuse | do_not_mail
const zeroBounce: VerifierProvider = {
  name: 'zerobounce',
  async verify(email) {
    const q = new URLSearchParams({ api_key: process.env.ZEROBOUNCE_API_KEY ?? '', email, ip_address: '' });
    const r = await getJson(`https://api.zerobounce.net/v2/validate?${q}`);
    if (r.error) throw new Error(String(r.error));
    const status = String(r.status ?? 'unknown');
    const verdict: Verdict =
      status === 'valid' ? 'deliverable' : status === 'catch-all' ? 'risky' : status === 'unknown' ? 'unknown' : 'undeliverable';
    return { verdict, reason: [status, r.sub_status].filter(Boolean).join(':') };
  },
};

// Built-in verifier, run by our own verifier service (scripts/verifier)
// on a server with port 25 open. Free apart from that server.
const builtinRemote: VerifierProvider = {
  name: 'builtin',
  async verify(email) {
    const base = (process.env.VERIFIER_URL ?? '').replace(/\/+$/, '');
    const res = await fetch(`${base}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.VERIFIER_SECRET ?? ''}` },
      body: JSON.stringify({ emails: [email] }),
      signal: AbortSignal.timeout(45_000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`verifier service ${res.status}`);
    const r = ((await res.json()) as { results?: { verdict?: string; reason?: string }[] }).results?.[0];
    const verdict = (['deliverable', 'risky', 'undeliverable', 'unknown'] as const).find((v) => v === r?.verdict);
    if (!verdict) throw new Error('verifier service returned no result');
    return { verdict, reason: r?.reason ?? verdict };
  },
};

// Same check inside the app, for hosts that allow outbound port 25 (not
// Vercel or AWS Lambda).
const builtinLocal: VerifierProvider = {
  name: 'smtp',
  async verify(email) {
    const { probeEmail } = await import('./smtpProbe');
    const r = await probeEmail(email, {
      heloHost: process.env.VERIFIER_HELO_HOST ?? '',
      mailFrom: process.env.VERIFIER_MAIL_FROM ?? '',
    });
    return { verdict: r.verdict, reason: r.reason };
  },
};

const builtinRemoteConfigured = () => Boolean(process.env.VERIFIER_URL && process.env.VERIFIER_SECRET);
const builtinLocalConfigured = () => Boolean(process.env.VERIFIER_HELO_HOST && process.env.VERIFIER_MAIL_FROM);

// EMAIL_VERIFIER=builtin|smtp|millionverifier|zerobounce|off. By default
// the built-in service when VERIFIER_URL is set, else whichever paid key
// is set. "smtp" (in-app probing) is never picked automatically, because
// most hosts block port 25.
export function verifierProvider(): VerifierProvider | null {
  const choice = (process.env.EMAIL_VERIFIER ?? '').trim().toLowerCase();
  if (choice === 'off') return null;
  if (choice === 'smtp') return builtinLocalConfigured() ? builtinLocal : null;
  if ((choice === '' || choice === 'builtin') && builtinRemoteConfigured()) return builtinRemote;
  if ((choice === '' || choice === 'millionverifier') && process.env.MILLIONVERIFIER_API_KEY) return millionVerifier;
  if ((choice === '' || choice === 'zerobounce') && process.env.ZEROBOUNCE_API_KEY) return zeroBounce;
  return null;
}

export function verifierName(): string {
  return verifierProvider()?.name ?? 'basic';
}
