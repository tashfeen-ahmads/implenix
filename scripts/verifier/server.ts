// Implenix verifier service: the built-in mailbox verifier as a tiny HTTP
// server, for a small Linux server with outbound port 25 open (Vercel and
// AWS Lambda block it). The dashboard calls it with VERIFIER_URL and
// VERIFIER_SECRET. Setup: docs/EMAIL_VERIFIER.md.
//
//   VERIFIER_SECRET=... VERIFIER_HELO_HOST=verify.example.com \
//   VERIFIER_MAIL_FROM=check@example.com node_modules/.bin/tsx scripts/verifier/server.ts
//
// POST /verify  {"emails": ["a@b.com", ...]}  (max 25, Bearer secret)
//   -> {"results": [{"email", "verdict", "reason", "mx"}]}
// GET  /health  -> {"ok": true}
import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { probeEmail, type ProbeOptions } from '../../lib/leads/smtpProbe';

const SECRET = process.env.VERIFIER_SECRET ?? '';
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.VERIFIER_BIND || '127.0.0.1';
const opts: ProbeOptions = {
  heloHost: process.env.VERIFIER_HELO_HOST ?? '',
  mailFrom: process.env.VERIFIER_MAIL_FROM ?? '',
  timeoutMs: Number(process.env.VERIFIER_TIMEOUT_MS || 12_000),
  ...(process.env.VERIFIER_SMTP_PORT ? { port: Number(process.env.VERIFIER_SMTP_PORT) } : {}),
};
const MAX_EMAILS = 25;
const CONCURRENCY = Number(process.env.VERIFIER_CONCURRENCY || 5);

if (SECRET.length < 24 || !opts.heloHost || !/@/.test(opts.mailFrom)) {
  console.error('Set VERIFIER_SECRET (24+ characters), VERIFIER_HELO_HOST and VERIFIER_MAIL_FROM.');
  process.exit(1);
}
const expected = Buffer.from(`Bearer ${SECRET}`);
const authorized = (h: string | undefined) => {
  const given = Buffer.from(h ?? '');
  return given.length === expected.length && timingSafeEqual(given, expected);
};

// Simple global concurrency limit across requests.
let running = 0;
const queue: (() => void)[] = [];
async function limited<T>(fn: () => Promise<T>): Promise<T> {
  if (running >= CONCURRENCY) await new Promise<void>((r) => queue.push(r));
  running++;
  try {
    return await fn();
  } finally {
    running--;
    queue.shift()?.();
  }
}

const send = (res: http.ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

export const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });
  if (req.method !== 'POST' || req.url !== '/verify') return send(res, 404, { error: 'Not found' });
  if (!authorized(req.headers.authorization)) return send(res, 401, { error: 'Unauthorized' });
  let raw = '';
  req.setEncoding('utf8');
  req.on('data', (c: string) => {
    raw += c;
    if (raw.length > 32_000) {
      send(res, 413, { error: 'Too large' });
      req.destroy();
    }
  });
  req.on('end', async () => {
    if (res.headersSent) return;
    let emails: unknown;
    try {
      emails = (JSON.parse(raw) as { emails?: unknown }).emails;
    } catch {
      return send(res, 400, { error: 'Invalid JSON' });
    }
    if (!Array.isArray(emails) || !emails.length || emails.length > MAX_EMAILS || !emails.every((e) => typeof e === 'string' && e.length <= 254)) {
      return send(res, 400, { error: `Send 1-${MAX_EMAILS} emails` });
    }
    const results = await Promise.all(
      [...new Set(emails as string[])].map((email) =>
        limited(() => probeEmail(email, opts))
          .then((r) => ({ email, ...r }))
          .catch(() => ({ email, verdict: 'unknown', reason: 'probe_error' })),
      ),
    );
    send(res, 200, { results });
  });
});

server.listen(PORT, HOST, () => console.log(`verifier listening on ${HOST}:${PORT} as ${opts.heloHost}`));
