// Built-in mailbox verifier: the same technique paid verifiers use.
//
// 1. Look up the domain's mail servers (MX).
// 2. Open an SMTP conversation on port 25 and ask whether the mailbox
//    exists (EHLO, MAIL FROM, RCPT TO), then hang up. No email is sent.
// 3. Ask again for a random address at the same domain. If that is also
//    accepted, the domain accepts everything ("catch-all") and the answer
//    for the real address means nothing.
//
// Needs outbound port 25, which Vercel and AWS Lambda block. It runs in
// the verifier service (scripts/verifier/server.ts) on a small server with
// port 25 open, or in the app itself when hosted somewhere that allows it.
//
// No 'server-only' import: the standalone service imports this file too.

import net from 'node:net';
import { resolve4, resolveMx } from 'node:dns/promises';
import { randomBytes } from 'node:crypto';

export type ProbeVerdict = 'deliverable' | 'risky' | 'undeliverable' | 'unknown';
export type ProbeResult = { verdict: ProbeVerdict; reason: string; mx?: string; code?: number };

export type ProbeOptions = {
  // Hostname we introduce ourselves as (EHLO). Must resolve to the
  // server's IP, and the IP's reverse DNS should point back to it, or
  // many mail servers refuse to talk.
  heloHost: string;
  // Envelope sender for the probe, on a domain you own.
  mailFrom: string;
  timeoutMs?: number;
  port?: number;
  // Tests only.
  resolveMx?: (domain: string) => Promise<{ exchange: string; priority: number }[]>;
  resolveHost?: (host: string) => Promise<string[]>;
  allowPrivate?: boolean;
};

const SYNTAX = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

// Rejections that are about us (our IP, reputation, policy), not the
// mailbox. These must never mark an address undeliverable.
const ABOUT_US =
  /(block|black ?list|listed|spamhaus|barracuda|reputation|policy|not allowed|denied|access denied|refused|rejected.*(ip|connection|client|sender)|client host|helo|ehlo|reverse|ptr|rdns|too many|rate|try again|temporar|5\.7\.\d|4\.7\.\d|unauthenti|relay)/i;
// Rejections that say the mailbox doesn't exist.
const NO_MAILBOX =
  /(user unknown|unknown user|no such user|no such (mailbox|recipient|address)|does not exist|doesn'?t exist|not exist|invalid (recipient|mailbox|address)|recipient (address )?rejected|mailbox (unavailable|not found)|address rejected|undeliverable|not found|unrouteable|5\.1\.1|5\.1\.10|5\.1\.6)/i;

function isPrivate(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v6 = ip.toLowerCase();
  return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80') || v6.startsWith('::ffff:');
}

// A line-based SMTP client: send a command, wait for the full (possibly
// multi-line) reply.
class Session {
  private buf = '';
  private waiting: ((r: { code: number; text: string }) => void) | null = null;
  private failed: ((e: Error) => void) | null = null;
  private ended: Error | null = null;

  constructor(private sock: net.Socket) {
    sock.setEncoding('utf8');
    sock.on('data', (d: string) => {
      this.buf += d;
      if (this.buf.length > 64_000) return this.fail(new Error('Reply too long'));
      this.drain();
    });
    sock.on('error', (e) => this.fail(e));
    sock.on('close', () => this.fail(new Error('Connection closed')));
    sock.on('timeout', () => this.fail(Object.assign(new Error('Timed out'), { code: 'ETIMEDOUT' })));
  }

  private fail(e: Error) {
    if (this.ended) return;
    this.ended = e;
    this.failed?.(e);
    this.waiting = this.failed = null;
  }

  private drain() {
    if (!this.waiting) return;
    // A reply ends with a line "NNN text" (a space, not a dash, after the code).
    const lines = this.buf.split(/\r?\n/);
    for (let i = 0; i < lines.length - 1; i++) {
      const m = /^(\d{3})([ -])(.*)$/.exec(lines[i]);
      if (m && m[2] === ' ') {
        const text = lines.slice(0, i + 1).map((l) => l.slice(4)).join(' ');
        this.buf = lines.slice(i + 1).join('\n');
        const done = this.waiting;
        this.waiting = this.failed = null;
        done({ code: Number(m[1]), text });
        return;
      }
    }
  }

  read(): Promise<{ code: number; text: string }> {
    if (this.ended) return Promise.reject(this.ended);
    return new Promise((resolve, reject) => {
      this.waiting = resolve;
      this.failed = reject;
      this.drain();
    });
  }

  async cmd(line: string) {
    if (this.ended) throw this.ended;
    // Never let user input inject extra SMTP commands.
    if (/[\r\n]/.test(line)) throw new Error('Invalid command');
    this.sock.write(`${line}\r\n`);
    return this.read();
  }

  close() {
    if (!this.ended) {
      try {
        this.sock.write('QUIT\r\n');
      } catch {
        // ignore
      }
    }
    this.sock.destroy();
  }
}

function connect(host: string, port: number, timeoutMs: number): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    sock.setTimeout(timeoutMs);
    const onErr = (e: Error) => {
      sock.destroy();
      reject(e);
    };
    sock.once('error', onErr);
    sock.once('timeout', () => onErr(Object.assign(new Error('Connect timed out'), { code: 'ETIMEDOUT' })));
    sock.once('connect', () => {
      sock.removeListener('error', onErr);
      resolve(sock);
    });
  });
}

type Rcpt = { code: number; text: string };

// One SMTP conversation: real address, then (if accepted) a random one.
async function converse(ip: string, email: string, domain: string, o: Required<Pick<ProbeOptions, 'heloHost' | 'mailFrom' | 'timeoutMs' | 'port'>>) {
  const s = new Session(await connect(ip, o.port, o.timeoutMs));
  try {
    const greet = await s.read();
    if (greet.code !== 220) return { stage: 'greeting' as const, reply: greet };
    let hello = await s.cmd(`EHLO ${o.heloHost}`);
    if (hello.code >= 500) hello = await s.cmd(`HELO ${o.heloHost}`);
    if (hello.code !== 250) return { stage: 'helo' as const, reply: hello };
    const from = await s.cmd(`MAIL FROM:<${o.mailFrom}>`);
    if (from.code !== 250) return { stage: 'mail' as const, reply: from };
    const real: Rcpt = await s.cmd(`RCPT TO:<${email}>`);
    let random: Rcpt | null = null;
    if (real.code === 250 || real.code === 251) {
      random = await s.cmd(`RCPT TO:<${randomBytes(9).toString('hex')}@${domain}>`).catch(() => null);
    }
    return { stage: 'rcpt' as const, reply: real, random };
  } finally {
    s.close();
  }
}

// Per-domain catch-all memory: every address there gets the same answer,
// so there's no need to ask again for an hour.
const catchAll = new Map<string, number>();
// Polite limits: at most 2 conversations per mail server at once.
const busy = new Map<string, number>();
async function slot(host: string): Promise<() => void> {
  while ((busy.get(host) ?? 0) >= 2) await new Promise((r) => setTimeout(r, 150));
  busy.set(host, (busy.get(host) ?? 0) + 1);
  return () => busy.set(host, Math.max(0, (busy.get(host) ?? 1) - 1));
}

export async function probeEmail(email: string, opts: ProbeOptions): Promise<ProbeResult> {
  const e = email.trim().toLowerCase();
  if (!SYNTAX.test(e) || e.length > 254) return { verdict: 'undeliverable', reason: 'invalid_syntax' };
  const domain = e.split('@')[1];
  const o = { heloHost: opts.heloHost, mailFrom: opts.mailFrom, timeoutMs: opts.timeoutMs ?? 12_000, port: opts.port ?? 25 };

  const ca = catchAll.get(domain);
  if (ca && Date.now() - ca < 3_600_000) return { verdict: 'risky', reason: 'catch_all' };

  let mx: { exchange: string; priority: number }[];
  try {
    mx = (await (opts.resolveMx ?? resolveMx)(domain)).filter((r) => r.exchange && r.exchange !== '.');
  } catch (err) {
    const code = (err as { code?: string }).code;
    return code === 'ENOTFOUND' || code === 'ENODATA'
      ? { verdict: 'undeliverable', reason: 'no_mail_server' }
      : { verdict: 'unknown', reason: 'dns_error' };
  }
  if (!mx.length) return { verdict: 'undeliverable', reason: 'no_mail_server' };
  mx.sort((a, b) => a.priority - b.priority);

  let lastReason = 'smtp_unreachable';
  // Try the two best mail servers; a temporary problem on one is common.
  for (const { exchange } of mx.slice(0, 2)) {
    let ips: string[];
    try {
      ips = await (opts.resolveHost ?? resolve4)(exchange);
    } catch {
      continue;
    }
    // Never connect to internal addresses, whatever the MX record says.
    const ip = ips.find((a) => opts.allowPrivate || !isPrivate(a));
    if (!ip) {
      lastReason = 'mx_private_address';
      continue;
    }
    const release = await slot(exchange);
    let r: Awaited<ReturnType<typeof converse>>;
    try {
      r = await converse(ip, e, domain, o);
    } catch (err) {
      lastReason = (err as { code?: string }).code === 'ETIMEDOUT' ? 'smtp_timeout' : 'smtp_unreachable';
      continue;
    } finally {
      release();
    }

    const { code, text } = r.reply;
    if (r.stage !== 'rcpt') {
      // Refused before we could ask: about us, not the mailbox.
      lastReason = `refused_at_${r.stage}`;
      if (code >= 400 && code < 500) continue;
      return { verdict: 'unknown', reason: lastReason, mx: exchange, code };
    }
    if (code === 250 || code === 251) {
      if (r.random && (r.random.code === 250 || r.random.code === 251)) {
        catchAll.set(domain, Date.now());
        if (catchAll.size > 5000) catchAll.clear();
        return { verdict: 'risky', reason: 'catch_all', mx: exchange, code };
      }
      return { verdict: 'deliverable', reason: 'mailbox_exists', mx: exchange, code };
    }
    if (code === 552 || /mailbox (is )?full|over ?quota|quota exceeded/i.test(text)) {
      return { verdict: 'risky', reason: 'mailbox_full', mx: exchange, code };
    }
    if (code >= 500) {
      // "User unknown" wins over generic words; otherwise a policy
      // rejection is about our server, not the address.
      if (NO_MAILBOX.test(text) || (!ABOUT_US.test(text) && (code === 550 || code === 551 || code === 553))) {
        return { verdict: 'undeliverable', reason: 'mailbox_not_found', mx: exchange, code };
      }
      return { verdict: 'unknown', reason: 'probe_blocked', mx: exchange, code };
    }
    // 4xx: greylisting or rate limiting. Try the next server, else unknown.
    lastReason = 'try_later';
  }
  return { verdict: 'unknown', reason: lastReason };
}

// Tests only.
export function resetProbeCacheForTests() {
  catchAll.clear();
  busy.clear();
}
