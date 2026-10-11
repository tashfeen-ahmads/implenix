// Local stand-in for the CRM: prints each webhook delivery and checks
// its signature. Usage: CRM_WEBHOOK_SECRET=dev-secret npm run crm:test-receiver
import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT || 4545);
const SECRET = process.env.CRM_WEBHOOK_SECRET || '';

function signatureStatus(raw, headers) {
  if (!SECRET) return 'not checked (no CRM_WEBHOOK_SECRET)';
  const ts = headers['x-implenix-timestamp'];
  const sig = headers['x-implenix-signature'] || '';
  const expected =
    'sha256=' + createHmac('sha256', SECRET).update(`${ts}.${raw}`).digest('hex');
  const ok =
    sig.length === expected.length &&
    timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  return ok ? 'valid' : 'INVALID';
}

createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    console.log(`\n${req.headers['x-implenix-event']} · ${req.headers['x-implenix-delivery']}`);
    console.log(`signature: ${signatureStatus(raw, req.headers)}`);
    console.log(JSON.stringify(JSON.parse(raw || '{}'), null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"ok":true}');
  });
}).listen(PORT, () => console.log(`CRM test receiver on http://localhost:${PORT}`));
