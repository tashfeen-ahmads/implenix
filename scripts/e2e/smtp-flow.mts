// Built-in mailbox verifier against a fake mail server (no port 25 or DNS
// needed), plus the verifier service's HTTP layer and the dashboard's
// "builtin" provider. Run via npm run test:outreach.
import net from 'node:net';
import { spawn } from 'node:child_process';
const { probeEmail, resetProbeCacheForTests } = await import('../../lib/leads/smtpProbe.ts');
const verify = await import('../../lib/leads/verify.ts');

const results: [string, boolean, string][] = [];
const check = (n: string, ok: boolean, d: unknown = '') => results.push([n, ok, typeof d === 'string' ? d : JSON.stringify(d)]);

// Fake MX: behaviour depends on the recipient's domain.
const seen: string[] = [];
const mx = net.createServer((sock) => {
  sock.setEncoding('utf8');
  let buf = '';
  sock.write('220-mx.fake ESMTP\r\n220 ready\r\n');
  sock.on('data', (d: string) => {
    buf += d;
    let i: number;
    while ((i = buf.indexOf('\r\n')) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 2);
      seen.push(line);
      const rcpt = /^RCPT TO:<([^@]+)@([^>]+)>/i.exec(line);
      if (/^EHLO/i.test(line)) sock.write('250-mx.fake\r\n250 SIZE 1000\r\n');
      else if (/^MAIL FROM/i.test(line)) sock.write('250 OK\r\n');
      else if (rcpt) {
        const [, user, dom] = rcpt;
        if (dom === 'good-e2e.com') sock.write(user === 'owner' ? '250 2.1.5 OK\r\n' : '550 5.1.1 <x>: Recipient address rejected: User unknown\r\n');
        else if (dom === 'catchall-e2e.com') sock.write('250 OK\r\n');
        else if (dom === 'grey-e2e.com') sock.write('451 4.7.1 Greylisted, try again later\r\n');
        else if (dom === 'policy-e2e.com') sock.write('550 5.7.1 Rejected due to IP reputation, see policy\r\n');
        else if (dom === 'full-e2e.com') sock.write('552 5.2.2 Mailbox full\r\n');
        else if (dom === 'ms-e2e.com') sock.write('550 5.4.1 Recipient address rejected: Access denied. AS(201806281)\r\n');
        else sock.write('550 no\r\n');
      } else if (/^QUIT/i.test(line)) sock.end('221 bye\r\n');
      else sock.write('500 what\r\n');
    }
  });
  sock.on('error', () => undefined);
});
await new Promise<void>((r) => mx.listen(2525, '127.0.0.1', () => r()));
// A second fake MX that blocks every sender at MAIL FROM.
const blocker = net.createServer((sock) => {
  sock.write('220 ready\r\n');
  sock.on('data', (d) => {
    const s = String(d);
    if (/^EHLO/i.test(s)) sock.write('250 ok\r\n');
    else if (/^MAIL/i.test(s)) sock.write('554 5.7.1 Client host blocked using Spamhaus\r\n');
    else if (/^QUIT/i.test(s)) sock.end('221 bye\r\n');
  });
  sock.on('error', () => undefined);
});
await new Promise<void>((r) => blocker.listen(2526, '127.0.0.1', () => r()));

const base = {
  heloHost: 'verify.implenix-e2e.com',
  mailFrom: 'check@implenix-e2e.com',
  port: 2525,
  timeoutMs: 3000,
  allowPrivate: true,
  resolveMx: async (d: string) => {
    if (d === 'nomx-e2e.com') throw Object.assign(new Error('nx'), { code: 'ENOTFOUND' });
    return [{ exchange: `mx.${d}`, priority: 10 }];
  },
  resolveHost: async () => ['127.0.0.1'],
};
const p = (e: string, o = {}) => probeEmail(e, { ...base, ...o });

check('existing mailbox → deliverable', (await p('owner@good-e2e.com')).verdict === 'deliverable');
check('unknown user → undeliverable', (await p('nobody@good-e2e.com')).reason === 'mailbox_not_found');
const ca = await p('anyone@catchall-e2e.com');
check('accepts a random address → catch-all (risky)', ca.verdict === 'risky' && ca.reason === 'catch_all', ca);
check('greylisting → unknown, not undeliverable', (await p('a@grey-e2e.com')).verdict === 'unknown');
check('reputation/policy rejection → unknown, not undeliverable', (await p('a@policy-e2e.com')).reason === 'probe_blocked');
check('mailbox full → risky', (await p('a@full-e2e.com')).reason === 'mailbox_full');
check('Microsoft "recipient rejected: access denied" → undeliverable', (await p('a@ms-e2e.com')).verdict === 'undeliverable');
check('no mail server → undeliverable', (await p('a@nomx-e2e.com')).reason === 'no_mail_server');
const blocked = await p('owner@good-e2e.com', { port: 2526 });
check('our server blocked at MAIL FROM → unknown', blocked.verdict === 'unknown' && blocked.reason === 'refused_at_mail', blocked);
const priv = await probeEmail('owner@good-e2e.com', { ...base, allowPrivate: false });
check('MX pointing at an internal address is never contacted', priv.verdict === 'unknown' && priv.reason === 'mx_private_address', priv);
const dead = await p('owner@good-e2e.com', { port: 2599 });
check('unreachable mail server → unknown', dead.verdict === 'unknown', dead);
resetProbeCacheForTests();
const n = seen.filter((l) => /^RCPT/i.test(l)).length;
await p('x@catchall-e2e.com');
await p('y@catchall-e2e.com');
check('catch-all domain remembered (second address costs no connection)', seen.filter((l) => /^RCPT/i.test(l)).length - n === 2);
check('EHLO uses the configured host name; no DATA ever sent', seen.some((l) => l === 'EHLO verify.implenix-e2e.com') && !seen.some((l) => /^DATA/i.test(l)));

// Verifier service (HTTP layer) and the dashboard's builtin provider.
const SECRET = 'e2e-secret-0123456789abcdefgh';
const svc = spawn('npx', ['tsx', 'scripts/verifier/server.ts'], {
  env: { ...process.env, VERIFIER_SECRET: SECRET, VERIFIER_HELO_HOST: 'verify.implenix-e2e.com', VERIFIER_MAIL_FROM: 'check@implenix-e2e.com', PORT: '8788', VERIFIER_TIMEOUT_MS: '2000' },
  stdio: 'ignore',
});
for (let i = 0; i < 50; i++) {
  const ok = await fetch('http://127.0.0.1:8788/health').then((r) => r.ok).catch(() => false);
  if (ok) break;
  await new Promise((r) => setTimeout(r, 200));
}
const call = (body: unknown, auth = `Bearer ${SECRET}`) =>
  fetch('http://127.0.0.1:8788/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: auth }, body: JSON.stringify(body) });
check('service rejects a wrong secret', (await call({ emails: ['a@b.com'] }, 'Bearer nope')).status === 401);
check('service rejects more than 25 emails', (await call({ emails: Array.from({ length: 26 }, (_, i) => `a${i}@b.com`) })).status === 400);
const ok = await call({ emails: ['bad syntax', 'owner@good-e2e.com'] });
const body = (await ok.json()) as any;
check('service answers each email', ok.status === 200 && body.results.length === 2 && body.results[0].verdict === 'undeliverable', body);

process.env.VERIFIER_URL = 'http://127.0.0.1:8788';
process.env.VERIFIER_SECRET = SECRET;
process.env.EMAIL_VERIFIER = 'builtin';
verify.setVerifierForTests(undefined); // pick the provider from env
verify.setDnsForTests({ mx: (async (d: string) => [{ exchange: `mx.${d}`, priority: 10 }]) as never });
const v = await verify.verifyEmail('owner@good-e2e.com');
check('dashboard uses the builtin verifier service', v.checkedBy === 'builtin' && ['deliverable', 'risky', 'undeliverable', 'unknown'].includes(v.verdict), v);
check('verifier name shown in the dashboard', verify.verifierName() === 'builtin');

svc.kill();
mx.close();
blocker.close();
for (const [n2, ok2, d] of results) console.log(`${ok2 ? 'PASS' : 'FAIL'}  ${n2}${ok2 ? '' : `  ${d}`}`);
console.log(`${results.filter((x) => x[1]).length}/${results.length} passed`);
process.exit(results.some((x) => !x[1]) ? 1 : 0);
