// Test only. Minimal PostgREST + GoTrue imitation for local QA and the outreach e2e test. Supports the
// select/filter/order/limit/count/embed patterns the dashboard uses.
const http = require('http');
const { ME, tables } = require('./fixtures');
const FK = { clients: 'client_id', contacts: 'contact_id', campaigns: 'campaign_id', contact_lists: 'list_id', lead_searches: 'search_id' };
const user = { id: ME, aud: 'authenticated', role: 'authenticated', email: 'tashfeen@implenix.net', app_metadata: {}, user_metadata: {}, created_at: '2026-09-01T00:00:00Z' };

function parseVal(v) { if (v === 'null') return null; if (v === 'true') return true; if (v === 'false') return false; return v; }
function cmp(a, b) { const na = Number(a), nb = Number(b); if (!isNaN(na) && !isNaN(nb) && a !== null && b !== '' ) return na - nb; return String(a).localeCompare(String(b)); }
function test(row, col, expr) {
  if (col === 'or' || col === 'and') return true;
  const neg = expr.startsWith('not.'); if (neg) expr = expr.slice(4);
  const i = expr.indexOf('.'); const op = expr.slice(0, i); const raw = expr.slice(i + 1);
  let v = row[col]; let ok = true;
  if (op === 'eq') ok = String(v) === String(parseVal(raw)) || (v === null && raw === 'null');
  else if (op === 'neq') ok = String(v) !== raw;
  else if (op === 'gt') ok = cmp(v, raw) > 0; else if (op === 'gte') ok = cmp(v, raw) >= 0;
  else if (op === 'lt') ok = cmp(v, raw) < 0; else if (op === 'lte') ok = cmp(v, raw) <= 0;
  else if (op === 'is') ok = raw === 'null' ? v == null : v === parseVal(raw);
  else if (op === 'in') { const list = raw.replace(/^\(|\)$/g, '').split(',').map((s) => s.replace(/^"|"$/g, '')); ok = list.includes(String(v)); }
  else if (op === 'ilike' || op === 'like') { const re = new RegExp('^' + raw.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/[*%]/g, '.*') + '$', 'i'); ok = re.test(String(v ?? '')); }
  else if (op === 'cs') ok = true;
  return neg ? !ok : ok;
}
function orTest(row, expr) {
  const parts = expr.replace(/^\(|\)$/g, '').split(',');
  return parts.some((p) => { const [c, ...rest] = p.split('.'); return test(row, c, rest.join('.')); });
}
function embeds(select) {
  const out = []; const re = /([a-z_]+)(?:!\w+)?\(([^()]*)\)/g; let m;
  while ((m = re.exec(select || ''))) out.push({ table: m[1], cols: m[2] });
  return out;
}
function project(row, table, select) {
  const r = { ...row };
  for (const e of embeds(select)) {
    const t = tables[e.table]; if (!t) continue;
    const fk = FK[e.table];
    if (fk && fk in row) r[e.table] = t.find((x) => x.id === row[fk] || x.user_id === row[fk]) ?? null;
    else { // reverse one-to-many: child table referencing this row
      const back = Object.entries(FK).find(([tb]) => tb === table)?.[1];
      r[e.table] = back ? t.filter((x) => x[back] === row.id) : [];
    }
  }
  return r;
}
const send = (res, code, body, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Expose-Headers': 'Content-Range', ...headers }); res.end(body === undefined ? '' : JSON.stringify(body)); };
http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204);
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/auth/v1/user')) return send(res, 200, user);
  if (url.pathname === '/auth/v1/admin/users' && req.method === 'GET') return send(res, 200, { users: tables.team_members.map((m, i) => ({ id: m.user_id, email: m.email, last_sign_in_at: i === 0 ? new Date().toISOString() : null })), aud: 'authenticated' });
  if (url.pathname.startsWith('/auth/v1/admin/users/') && req.method === 'DELETE') { const uid = url.pathname.split('/').pop(); tables.team_members.splice(tables.team_members.findIndex((m) => m.user_id === uid), 1); return send(res, 200, {}); }
  if (url.pathname === '/auth/v1/admin/generate_link') { let b = ''; req.on('data', (c) => (b += c)); return req.on('end', () => { const body = JSON.parse(b); send(res, 200, { id: require('crypto').randomUUID(), email: body.email, aud: 'authenticated', action_link: 'http://x/verify', email_otp: '123456', hashed_token: 'hashtoken123', redirect_to: '', verification_type: body.type }); }); }
  if (url.pathname.startsWith('/auth/v1/')) return send(res, 200, {});
  if (url.pathname === '/rest/v1/rpc/record_message_engagement') {
    let b = ''; req.on('data', (c) => (b += c));
    return req.on('end', () => {
      const a = JSON.parse(b || '{}');
      const m = tables.messages.find((x) => x.ses_message_id === a.p_ses_message_id);
      if (!m) return send(res, 200, null);
      if (a.p_kind === 'open') m.open_count = (m.open_count ?? 0) + 1;
      if (a.p_kind === 'click') { m.click_count = (m.click_count ?? 0) + 1; m.clicked_at ??= a.p_at; }
      m.opened_at ??= a.p_at;
      send(res, 200, true);
    });
  }
  if (url.pathname === '/rest/v1/rpc/outreach_funnel') {
    // Mock-only approximation of public.outreach_funnel (the SQL is tested in PGlite).
    const t = tables; const sentSt = ['sent', 'delivered', 'bounced', 'complained'];
    const sent = t.messages.filter((m) => m.direction === 'outbound' && sentSt.includes(m.status) && m.campaign_id);
    const contactIds = [...new Set(sent.map((m) => m.contact_id))];
    const facts = contactIds.map((cid) => {
      const c = t.contacts.find((x) => x.id === cid) || {}; const ms = sent.filter((m) => m.contact_id === cid);
      const cl = t.clients.find((x) => x.outreach_contact_id === cid);
      const bks = cl ? t.bookings.filter((b) => b.client_id === cl.id) : [];
      return { cid, campaign: ms[0].campaign_id, list: c.list_id, industry: c.industry || 'Unknown', week: ms[0].created_at.slice(0, 10), emails: ms.length,
        bounced: ms.some((m) => m.status === 'bounced'), complained: false, opened: ms.some((m) => m.opened_at), clicked: false,
        replied: t.messages.some((m) => m.direction === 'inbound' && m.contact_id === cid), positive: ['interested', 'client'].includes(c.stage) || ['interested', 'booked'].includes(c.status),
        booked: bks.length > 0, showed: bks.some((b) => b.status === 'completed'), proposal: cl && ['proposal_sent', 'negotiation', 'onboarding', 'building', 'live'].includes(cl.stage), won: cl && ['onboarding', 'building', 'live'].includes(cl.stage), unsub: c.stage === 'unsubscribed', label: c.reply_label };
    });
    const agg = (rows) => ({ contacted: rows.length, emails: rows.reduce((a, r) => a + r.emails, 0), delivered: rows.filter((r) => !r.bounced).length, bounced: rows.filter((r) => r.bounced).length, complained: 0, unsubscribed: rows.filter((r) => r.unsub).length, opened: rows.filter((r) => r.opened).length, clicked: 0, replied: rows.filter((r) => r.replied).length, positive: rows.filter((r) => r.positive).length, booked: rows.filter((r) => r.booked).length, showed: rows.filter((r) => r.showed).length, proposal: rows.filter((r) => r.proposal).length, won: rows.filter((r) => r.won).length });
    const group = (k) => Object.entries(facts.reduce((m, r) => ((m[r[k] ?? ''] ||= []).push(r), m), {})).map(([key, rows]) => ({ key: key || null, ...agg(rows) }));
    const steps = {}; sent.forEach((m) => { const k = `${m.campaign_id}:${m.step_number}:${m.variant || 'A'}`; steps[k] ||= { campaign_id: m.campaign_id, step_number: m.step_number, variant: m.variant || 'A', sent: 0, bounced: 0, opened: 0, clicked: 0, replied: 0 }; steps[k].sent++; if (m.status === 'bounced') steps[k].bounced++; });
    facts.filter((f) => f.replied).forEach((f) => { const m = sent.filter((x) => x.contact_id === f.cid).pop(); const k = `${m.campaign_id}:${m.step_number}:${m.variant || 'A'}`; if (steps[k]) steps[k].replied++; });
    const labels = Object.entries(facts.filter((f) => f.replied).reduce((m, f) => ((m[f.label || 'unlabelled'] = (m[f.label || 'unlabelled'] || 0) + 1), m), {})).map(([key, count]) => ({ key, count }));
    const lost = t.clients.filter((c) => c.stage === 'lost').reduce((m, c) => ((m[c.lost_reason || 'not_set'] = (m[c.lost_reason || 'not_set'] || 0) + 1), m), {});
    const wonC = t.clients.filter((c) => ['onboarding', 'building', 'live'].includes(c.stage) && c.outreach_contact_id);
    return send(res, 200, { totals: agg(facts), by_campaign: group('campaign'), by_list: group('list'), by_industry: group('industry'), by_week: group('week'), by_step: Object.values(steps), labels, lost_reasons: Object.entries(lost).map(([key, count]) => ({ key, count })), revenue: { won_clients: wonC.length, setup_fees: wonC.reduce((a, c) => a + (c.setup_fee || 0), 0), monthly: wonC.reduce((a, c) => a + (c.monthly_value || 0), 0) } });
  }

  const m = /^\/rest\/v1\/([a-z_]+)/.exec(url.pathname); if (!m) return send(res, 404, { message: 'nf' });
  const table = m[1]; const data = tables[table] ?? (tables[table] = []);
  let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => {
    const p = url.searchParams; const select = p.get('select') || '*';
    let rows = data.filter((row) => [...p.entries()].every(([k, v]) => ['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k) || (k === 'or' ? orTest(row, v) : test(row, k, v))));
    const DEFAULTS = { campaigns: { status: 'draft', list_id: null, from_name: 'Implenix', reply_to: null, daily_limit: 50, send_timezone: 'America/New_York', send_hour_start: 9, send_hour_end: 17, send_days: [1, 2, 3, 4, 5], ai_mode: 'draft', ai_instructions: null, kind: 'sequence', nurture_campaign_id: null, no_reply_grace_days: 4, track_opens: false, stop_company_on_reply: true, updated_at: new Date().toISOString() }, messages: { ai_meta: {}, ai_generated: false, open_count: 0, click_count: 0 }, web_leads: { status: 'new', client_id: null, handled_by: null, details: {} } };
    if (req.method === 'POST') {
      // Upsert: on_conflict columns + Prefer resolution (ignore or merge).
      const conflict = (p.get('on_conflict') || '').split(',').filter(Boolean);
      const ignore = (req.headers['prefer'] || '').includes('ignore-duplicates');
      const items = [];
      for (const x of [].concat(JSON.parse(body || '[]'))) {
        const hit = conflict.length && data.find((r) => conflict.every((c) => r[c] === x[c]));
        if (hit) { if (!ignore) { Object.assign(hit, x); items.push(hit); } continue; }
        const row = { id: require('crypto').randomUUID(), created_at: new Date().toISOString(), ...(DEFAULTS[table] || {}), ...x };
        data.push(row); items.push(row);
      } const out = items.map((r) => project(r, table, select)); return send(res, 201, (req.headers['accept'] || '').includes('vnd.pgrst.object') ? out[0] : out); }
    if (req.method === 'PATCH') { const patch = JSON.parse(body || '{}'); rows.forEach((r) => Object.assign(r, patch)); const out = rows.map((r) => project(r, table, select)); if ((req.headers['accept'] || '').includes('vnd.pgrst.object')) return out.length ? send(res, 200, out[0]) : send(res, 406, { code: 'PGRST116' }); return send(res, 200, out); }
    if (req.method === 'DELETE') { rows.forEach((r) => data.splice(data.indexOf(r), 1)); return send(res, 200, rows); }
    const order = p.get('order'); if (order) { const [col, dir] = order.split(',')[0].split('.'); rows = [...rows].sort((a, b) => (a[col] === null) - (b[col] === null) || cmp(a[col] ?? '', b[col] ?? '') * (dir === 'desc' ? -1 : 1)); }
    const total = rows.length;
    const range = req.headers['range']; let from = Number(p.get('offset') || 0), to;
    if (range) { const [a, b] = range.split('-').map(Number); from = a; to = b; }
    const limit = p.get('limit'); if (to === undefined) to = limit ? from + Number(limit) - 1 : total - 1;
    rows = rows.slice(from, to + 1);
    const headers = { 'Content-Range': `${from}-${from + rows.length - 1}/${total}` };
    if (req.method === 'HEAD') return send(res, 200, undefined, headers);
    const out = rows.map((r) => project(r, table, select));
    if ((req.headers['accept'] || '').includes('vnd.pgrst.object')) return out.length ? send(res, 200, out[0], headers) : send(res, 406, { code: 'PGRST116', message: 'no rows' });
    send(res, 200, out, headers);
  });
}).listen(54321, () => console.log('mock supabase on 54321'));
