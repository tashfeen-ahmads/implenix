// End-to-end outreach funnel lifecycle against a mock Supabase (PostgREST
// imitation) and stubs for SES, OpenAI and Resend. Run: npm run test:outreach
// (see scripts/e2e/README.md). Exits non-zero if any check fails.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { supabaseAdmin } = await import('../../lib/supabase/admin.ts');
const { runOutreachTick } = await import('../../lib/outreach/send.ts');
const { handleInboundEmail, handleSesEvent } = await import('../../lib/outreach/inbound.ts');
const verify = await import('../../lib/leads/verify.ts');
// No DNS in CI: *-e2e.com domains have mail servers, dead-e2e.com doesn't
// exist, and the "paid verifier" calls catchall@... a catch-all.
verify.setDnsForTests({
  mx: (async (d: string) => {
    if (d === 'dead-e2e.com') throw Object.assign(new Error('nx'), { code: 'ENOTFOUND' });
    return [{ exchange: `mx.${d}`, priority: 10 }];
  }) as never,
  a: (async () => {
    throw Object.assign(new Error('nx'), { code: 'ENOTFOUND' });
  }) as never,
});
verify.setVerifierForTests({
  name: 'test-verifier',
  verify: async (email: string) => (email.startsWith('catchall@') ? { verdict: 'risky', reason: 'catch_all' } : { verdict: 'deliverable', reason: 'ok' }),
});
const db = supabaseAdmin();
const results: [string, boolean, string][] = [];
const check = (name: string, ok: boolean, detail: unknown = '') => results.push([name, ok, typeof detail === 'string' ? detail : JSON.stringify(detail)]);
const past = new Date(Date.now() - 60_000).toISOString();
const uid = () => crypto.randomUUID().replace(/^./, 'a');

// ── Setup: a nurture campaign and a 2-step sequence with an A/B step 1 ──
const nurtureId = uid();
const seqId = uid();
const window = { send_timezone: 'America/New_York', send_hour_start: 0, send_hour_end: 24, send_days: [1, 2, 3, 4, 5, 6, 7], daily_limit: 100 };
await db.from('campaigns').insert([
  { id: nurtureId, name: 'E2E nurture', status: 'active', list_id: null, from_name: 'T', from_email: 't@go.implenix.net', ai_mode: 'draft', kind: 'nurture', nurture_campaign_id: null, no_reply_grace_days: 4, track_opens: false, stop_company_on_reply: true, ...window },
  { id: seqId, name: 'E2E sequence', status: 'active', list_id: null, from_name: 'T', from_email: 't@go.implenix.net', ai_mode: 'draft', kind: 'sequence', nurture_campaign_id: nurtureId, no_reply_grace_days: 0, track_opens: true, stop_company_on_reply: true, ...window },
]);
await db.from('campaign_steps').insert([
  { campaign_id: nurtureId, step_number: 1, delay_days: 30, subject: 'Checking back', body: 'Hi again', subject_b: null, body_b: null },
  { campaign_id: seqId, step_number: 1, delay_days: 0, subject: 'Hello {{company}}', body: 'Body A', subject_b: 'Other subject', body_b: 'Body B' },
  { campaign_id: seqId, step_number: 2, delay_days: 3, subject: '', body: 'Follow up', subject_b: null, body_b: null },
]);
const mk = (email: string, company: string) => ({
  id: uid(), email, company, first_name: 'Pat', last_name: null, website: null, phone: null, industry: 'E2E', city: null, state: null, custom: {},
  status: 'active', stage: 'queued', stage_changed_at: past, reply_label: null, revisit_at: null, owner_id: null, list_id: null, last_contacted_at: null,
});
const people = [
  mk('one@alpha-e2e.com', 'Alpha'),
  mk('two@bravo-e2e.com', 'Bravo'),
  mk('three@charlie-e2e.com', 'Charlie'),
  mk('four@delta-e2e.com', 'Delta'),
  mk('five@delta-e2e.com', 'Delta'), // same company as four
  mk('six@echo-e2e.com', 'Echo'),
  mk('seven@bravo-e2e.com', 'Bravo'), // colleague of two (out of office)
  mk('owner@dead-e2e.com', 'Dead Domain Co'), // fails verification at send time
  mk('catchall@foxtrot-e2e.com', 'Foxtrot'), // catch-all, skipped
];
await db.from('contacts').insert(people);
await db.from('campaign_enrollments').insert(
  people.map((p) => ({ campaign_id: seqId, contact_id: p.id, current_step: 0, next_send_at: past, status: 'active' })),
);
const contact = async (i: number) => (await db.from('contacts').select('*').eq('id', people[i].id).single()).data as any;
const enr = async (i: number, campaign = seqId) =>
  (await db.from('campaign_enrollments').select('*').eq('contact_id', people[i].id).eq('campaign_id', campaign).maybeSingle()).data as any;
const makeDue = async () => {
  const { data } = await db.from('campaign_enrollments').select('id, campaign_id').eq('campaign_id', seqId).eq('status', 'active');
  for (const e of data ?? []) await db.from('campaign_enrollments').update({ next_send_at: past }).eq('id', e.id);
};

// ── Tick 1: step 1 to everyone ──
const t1 = await runOutreachTick();
const msgs1 = ((await db.from('messages').select('*').eq('campaign_id', seqId)).data ?? []) as any[];
const c7 = await contact(7);
const c8 = await contact(8);
check('send-time verification: dead domain never emailed', !msgs1.some((m) => m.contact_id === people[7].id) && c7.stage === 'bounced' && c7.email_verdict === 'undeliverable', { stage: c7.stage, verdict: c7.email_verdict });
check('send-time verification: catch-all skipped', !msgs1.some((m) => m.contact_id === people[8].id) && c8.stage === 'no_response' && c8.reply_label === 'catch_all_skipped', { stage: c8.stage, label: c8.reply_label });
check('send-time verification: good address verified and sent', (await contact(0)).email_verdict === 'deliverable', (await contact(0)).email_verdict_reason);
check('tick1 emails every sendable contact', msgs1.length === people.length - 2, { tick: t1.sent, here: msgs1.length });
check('stage email_sent after step 1', (await contact(0)).stage === 'email_sent', (await contact(0)).stage);
check('variants recorded', msgs1.every((m) => m.variant === 'A' || m.variant === 'B'), msgs1.map((m) => m.variant));
check('B variant body used', msgs1.filter((m) => m.variant === 'B').every((m) => m.body_text.includes('Body B') && m.subject === 'Other subject'), msgs1.filter((m) => m.variant === 'B').length);
const sesCalls = JSON.parse(fs.readFileSync(`${HERE}/calls.json`, 'utf8')).filter((c: any) => c.path.startsWith('/v2/email'));
check('tracking config set requested', JSON.stringify(sesCalls.slice(-1)[0]?.body ?? {}).includes('variant'), 'tags include variant');

// ── SES open event on one message ──
const opened = msgs1[0];
await handleSesEvent(db, { eventType: 'Open', mail: { messageId: opened.ses_message_id }, open: { timestamp: new Date().toISOString() } });
await handleSesEvent(db, { eventType: 'Click', mail: { messageId: opened.ses_message_id }, click: { timestamp: new Date().toISOString() } });
const om = (await db.from('messages').select('*').eq('id', opened.id).single()).data as any;
check('open + click recorded', Boolean(om.opened_at) && om.open_count === 1 && om.click_count === 1, { o: om.open_count, c: om.click_count });

// ── Tick 2: step 2 ──
await makeDue();
const t2 = await runOutreachTick();
check('tick2 sends step 2', t2.sent >= 6, t2);
check('stage follow_up_1 after step 2', (await contact(0)).stage === 'follow_up_1', (await contact(0)).stage);
const e0 = await enr(0);
check('last step waits (enrollment still active, grace 0)', e0.status === 'active' && e0.current_step === 2, e0);

// ── Replies while still in grace ──
const reply = async (i: number, text: string, headers: string[] = []) => {
  const mime = [`From: Pat <${people[i].email}>`, 'To: t@go.implenix.net', 'Subject: Re: Hello', `Message-ID: <r${i}-${Date.now()}@e2e.test>`, ...headers, 'Content-Type: text/plain; charset=UTF-8', '', text].join('\r\n');
  return handleInboundEmail(db, {
    notificationType: 'Received',
    mail: {},
    receipt: { recipients: ['t@go.implenix.net'], action: { type: 'SNS', encoding: 'BASE64' }, spamVerdict: { status: 'PASS' }, virusVerdict: { status: 'PASS' } },
    content: Buffer.from(mime).toString('base64'),
  });
};
const agentSays = (o: Record<string, unknown>) =>
  fs.writeFileSync(`${HERE}/agent_reply.json`, JSON.stringify({ should_reply: true, body: 'Thanks!\n\nT', summary: 's', confidence: 0.9, resume_on: null, ...o }));

// 0: interested
agentSays({ intent: 'interested' });
await reply(0, 'Yes, sounds good, tell me more.');
let c = await contact(0);
check('interested reply → stage interested', c.stage === 'interested' && c.status === 'interested' && c.reply_label === 'interested', { stage: c.stage, status: c.status, label: c.reply_label });

// 1: hand-written out-of-office with a return date → resume, stage restored
agentSays({ intent: 'out_of_office', should_reply: false, resume_on: '2099-01-10' });
await reply(1, "I'm away until January 10 with limited access to email.");
c = await contact(1);
const e1 = await enr(1);
check('OOO → enrollment resumed after return date', e1.status === 'active' && e1.next_send_at.startsWith('2099-01-11'), e1);
check('OOO → stage restored, status active', c.stage === 'follow_up_1' && c.status === 'active', { stage: c.stage, status: c.status });
const e6 = await enr(6);
check('OOO → colleague sequence keeps running', e6.status === 'active', e6.status);

// 2: not now → nurture campaign
agentSays({ intent: 'not_now', resume_on: '2099-03-01' });
await reply(2, 'Not right now, maybe in the spring.');
c = await contact(2);
const n2 = await enr(2, nurtureId);
check('not now → stage nurture with revisit date', c.stage === 'nurture' && String(c.revisit_at).startsWith('2099-03-01'), { stage: c.stage, revisit: c.revisit_at });
check('not now → enrolled in nurture, status active', n2?.status === 'active' && c.status === 'active', { n2, status: c.status });

// 3: low-confidence reply stays in review; colleague 4 stopped
agentSays({ intent: 'interested', confidence: 0.4 });
await reply(3, 'Hmm, who are you?');
c = await contact(3);
check('low confidence → stays Replied · review', c.stage === 'replied' && c.reply_label === 'interested', { stage: c.stage, label: c.reply_label });
const e4 = await enr(4);
check('same-company colleague sequence stopped', e4.status === 'stopped', e4.status);
const c4 = await contact(4);
check('stopped colleague leaves outreach columns', c4.stage === 'no_response' && c4.reply_label === 'colleague_replied', { stage: c4.stage, label: c4.reply_label });

// 5: header auto-reply pauses the sequence a week
const before5 = (await enr(5)).next_send_at;
await reply(5, 'Thanks for your email, I am out of office.', ['Auto-Submitted: auto-replied']);
const e5 = await enr(5);
check('auto-reply header → sequence paused ~7 days, still active', e5.status === 'active' && new Date(e5.next_send_at).getTime() > Date.now() + 6.9 * 86_400_000, { before5, after: e5.next_send_at });

// ── Tick 3: grace over for contact 4? (stopped) — run completion for anyone due ──
// Contact 1 is resumed in 2099, contact 5 paused. Nobody else active → no sends.
await db.from('campaign_enrollments').update({ next_send_at: past }).eq('id', e5.id);
const t3 = await runOutreachTick();
const n5 = await enr(5, nurtureId);
c = await contact(5);
check('sequence end with no reply → nurture handoff', (await enr(5)).status === 'completed' && n5?.status === 'active' && c.stage === 'nurture', { t3, n5, stage: c.stage });

// ── Nurture drip runs to its end: the lead stays In nurture ──
const n5row = await enr(5, nurtureId);
await db.from('campaign_enrollments').update({ next_send_at: past }).eq('id', n5row.id);
const t4 = await runOutreachTick();
const afterSend = await enr(5, nurtureId);
check('nurture step sends', afterSend.current_step === 1 && t4.sent >= 1, { t4, afterSend });
await db.from('campaign_enrollments').update({ next_send_at: past }).eq('id', n5row.id);
await runOutreachTick();
const c5 = await contact(5);
check('end of nurture drip → still In nurture', (await enr(5, nurtureId)).status === 'completed' && c5.stage === 'nurture', { stage: c5.stage });

for (const [name, ok, detail] of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  ${detail}`}`);
console.log(`${results.filter((r) => r[1]).length}/${results.length} passed`);
fs.rmSync(`${HERE}/agent_reply.json`, { force: true });
if (results.some((r) => !r[1])) process.exit(1);
