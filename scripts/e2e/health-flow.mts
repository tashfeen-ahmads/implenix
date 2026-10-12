// Deliverability guard: a campaign with a bad list pauses on its own, an
// account-wide bounce spike puts all sending on hold (and the tick sends
// nothing), clearing the hold measures afresh, and resuming a campaign
// doesn't re-pause it for old bounces. Run via npm run test:outreach.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
process.env.OUTREACH_ALERT_EMAILS = 'team@implenix.net';
const { supabaseAdmin } = await import('../../lib/supabase/admin.ts');
const { runOutreachTick } = await import('../../lib/outreach/send.ts');
const health = await import('../../lib/outreach/health.ts');
const { verifyContactBatch } = await import('../../lib/outreach/verifyContacts.ts');
const verify = await import('../../lib/leads/verify.ts');
verify.setDnsForTests({
  mx: (async (d: string) => {
    if (d === 'gone-e2e.com') throw Object.assign(new Error('nx'), { code: 'ENOTFOUND' });
    return [{ exchange: `mx.${d}`, priority: 10 }];
  }) as never,
  a: (async () => {
    throw Object.assign(new Error('nx'), { code: 'ENOTFOUND' });
  }) as never,
});
verify.setVerifierForTests({
  name: 'test-verifier',
  verify: async (e: string) => (e.startsWith('catchall') ? { verdict: 'risky', reason: 'catch_all' } : { verdict: 'deliverable', reason: 'ok' }),
});

const db = supabaseAdmin();
const results: [string, boolean, string][] = [];
const check = (n: string, ok: boolean, d: unknown = '') => results.push([n, ok, typeof d === 'string' ? d : JSON.stringify(d)]);
const uid = () => crypto.randomUUID().replace(/^./, 'b');
const recent = () => new Date(Date.now() - 3_600_000).toISOString();
const alerts = () =>
  fs.existsSync(`${HERE}/calls.json`)
    ? JSON.parse(fs.readFileSync(`${HERE}/calls.json`, 'utf8')).filter((c: any) => c.path.startsWith('/emails') && /paused|stopped/i.test(c.body?.subject ?? ''))
    : [];
const msgs = (n: number, status: string, campaignId: string | null) =>
  Array.from({ length: n }, () => ({
    id: uid(),
    campaign_id: campaignId,
    direction: 'outbound',
    from_email: 't@go.implenix.net',
    to_email: `x${Math.random().toString(36).slice(2)}@shop-e2e.com`,
    status,
    created_at: recent(),
  }));

// Unit: thresholds and minimum samples.
const r = (sent: number, bounced: number, complained = 0) => ({ sent, bounced, complained, bounceRate: bounced / sent, complaintRate: complained / sent, since: '' });
check('3 bounces in 20 sends is too few to judge', health.breach(r(20, 3), health.LIMITS.campaign) === null);
check('3 of 50 (6%) pauses a campaign', /Bounce rate 6\.0%/.test(health.breach(r(50, 3), health.LIMITS.campaign) ?? ''));
check('1 complaint never trips on its own', health.breach(r(500, 0, 1), health.LIMITS.account) === null);
check('2 complaints in 1,000 (0.2%) holds the account', /Spam complaint/.test(health.breach(r(1000, 0, 2), health.LIMITS.account) ?? ''));

// Campaign pause.
const window = { send_timezone: 'America/New_York', send_hour_start: 0, send_hour_end: 24, send_days: [1, 2, 3, 4, 5, 6, 7], daily_limit: 100 };
const bad = uid();
const good = uid();
await db.from('campaigns').insert([
  { id: bad, name: 'Bad list', status: 'active', from_name: 'T', from_email: 't@go.implenix.net', ...window },
  { id: good, name: 'Good list', status: 'active', from_name: 'T', from_email: 't@go.implenix.net', ...window },
]);
await db.from('messages').insert([...msgs(46, 'delivered', bad), ...msgs(4, 'bounced', bad), ...msgs(60, 'delivered', good)]);
const { data: active } = await db.from('campaigns').select('*').in('id', [bad, good]);
const res1 = await health.enforceSendingHealth(db, active as never);
const { data: after } = await db.from('campaigns').select('id, status, paused_reason').in('id', [bad, good]);
const byId = new Map((after ?? []).map((c: any) => [c.id, c]));
check('bad campaign paused with the reason', byId.get(bad)?.status === 'paused' && /Bounce rate 8\.0%/.test(byId.get(bad)?.paused_reason ?? ''), byId.get(bad));
check('good campaign keeps sending', byId.get(good)?.status === 'active');
check('no account hold for one bad campaign', res1.hold === null);
check('team alerted about the paused campaign', alerts().some((c: any) => /Campaign paused: Bad list/.test(c.body.subject)));

// Resume: measured from now, so the old bounces don't re-pause it.
await db.from('campaigns').update({ status: 'active', paused_reason: null, health_since: new Date().toISOString() }).eq('id', bad);
const { data: resumed } = await db.from('campaigns').select('*').in('id', [bad, good]);
const res2 = await health.enforceSendingHealth(db, resumed as never);
check('resumed campaign is not paused again for old bounces', res2.paused.length === 0, res2.paused);

// Account hold: push the 7-day account bounce rate over 4%.
const now = await health.accountRates(db);
const k = Math.max(100 - now.sent, Math.ceil((0.05 * now.sent - now.bounced) / 0.95), 1);
await db.from('messages').insert(msgs(k, 'bounced', null));
const tick = await runOutreachTick();
check('tick sends nothing while held', tick.skipped === 'sending on hold' && tick.sent === 0 && /Bounce rate/.test(tick.held ?? ''), tick);
const hold = await health.activeHold(db);
check('hold recorded', Boolean(hold?.reason), hold);
check('team alerted that sending stopped', alerts().some((c: any) => c.body.subject === 'Outreach sending stopped'));
const tick2 = await runOutreachTick();
check('still held on the next tick (no duplicate alert)', tick2.skipped === 'sending on hold' && alerts().filter((c: any) => c.body.subject === 'Outreach sending stopped').length === 1);

// Clear (what the Resume sending button does): measured from now.
await db.from('outreach_holds').update({ cleared_at: new Date().toISOString() }).is('cleared_at', null);
const res3 = await health.enforceSendingHealth(db, []);
check('after clearing, old bounces no longer hold sending', res3.hold === null && (await health.accountRates(db)).sent === 0);

// Bulk verification of a CSV list.
const list = uid();
const mk = (email: string) => ({
  id: uid(), email, company: 'Co', first_name: null, last_name: null, website: null, phone: null, industry: null, city: null, state: null, custom: {},
  status: 'active', stage: 'queued', reply_label: null, list_id: list, last_contacted_at: null, verified_at: null, email_verdict: null,
});
const csv = [mk('owner@good-e2e.com'), mk('owner@gone-e2e.com'), mk('catchall@maybe-e2e.com'), mk('postmaster@good-e2e.com')];
await db.from('contacts').insert(csv);
// The dead address is already enrolled somewhere: verification stops it.
const enrolledCampaign = uid();
await db.from('campaigns').insert({ id: enrolledCampaign, name: 'Uses CSV', status: 'draft', from_name: 'T', from_email: 't@go.implenix.net', ...window });
await db.from('campaign_enrollments').insert({ campaign_id: enrolledCampaign, contact_id: csv[1].id, current_step: 0, next_send_at: recent(), status: 'active' });
const batch = await verifyContactBatch(db, { listId: list });
const got = new Map(((await db.from('contacts').select('*').eq('list_id', list)).data ?? []).map((c: any) => [c.email, c]));
check('bulk verify checks the whole list', batch.checked === 4 && batch.remaining === 0, batch);
check('dead domain and blocked role marked undeliverable + bounced', ['owner@gone-e2e.com', 'postmaster@good-e2e.com'].every((e) => got.get(e)?.email_verdict === 'undeliverable' && got.get(e)?.status === 'bounced') && batch.undeliverable === 2);
check('catch-all saved as risky, still active', got.get('catchall@maybe-e2e.com')?.email_verdict === 'risky' && got.get('catchall@maybe-e2e.com')?.status === 'active');
const { data: stoppedEnr } = await db.from('campaign_enrollments').select('status').eq('contact_id', csv[1].id);
check("undeliverable contact's sequence stopped", stoppedEnr?.[0]?.status === 'stopped', stoppedEnr);

// Catch-all: skipped by default, sent when the campaign allows it.
const steps = (id: string) => ({ campaign_id: id, step_number: 1, delay_days: 0, subject: 'Hi', body: 'Hello', subject_b: null, body_b: null });
const strict = uid();
const lenient = uid();
await db.from('campaigns').insert([
  { id: strict, name: 'Strict', status: 'active', from_name: 'T', from_email: 't@go.implenix.net', include_risky: false, ...window },
  { id: lenient, name: 'Lenient', status: 'active', from_name: 'T', from_email: 't@go.implenix.net', include_risky: true, ...window },
]);
await db.from('campaign_steps').insert([steps(strict), steps(lenient)]);
const ca = [mk('catchall-a@maybe-e2e.com'), mk('catchall-b@maybe-e2e.com')].map((c) => ({ ...c, list_id: null, email_verdict: 'risky', verified_at: recent() }));
await db.from('contacts').insert(ca);
await db.from('campaign_enrollments').insert([
  { campaign_id: strict, contact_id: ca[0].id, current_step: 0, next_send_at: recent(), status: 'active' },
  { campaign_id: lenient, contact_id: ca[1].id, current_step: 0, next_send_at: recent(), status: 'active' },
]);
await runOutreachTick();
const st = async (c: string) => ((await db.from('campaign_enrollments').select('status, current_step').eq('contact_id', c)).data ?? [])[0] as any;
check('catch-all skipped when the campaign does not allow it', (await st(ca[0].id))?.status === 'stopped');
check('catch-all emailed when the campaign allows it', (await st(ca[1].id))?.current_step === 1, await st(ca[1].id));

for (const [n, ok, d] of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${ok ? '' : `  ${d}`}`);
console.log(`${results.filter((x) => x[1]).length}/${results.length} passed`);
if (results.some((x) => !x[1])) process.exit(1);
