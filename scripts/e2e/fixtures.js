// Realistic sample data for visual QA of the dashboard. Not shipped.
const now = Date.now();
const H = 3600e3, D = 24 * H;
const iso = (ms) => new Date(ms).toISOString();
let n = 0; const id = (p) => `${({p:'d',m:'f',q:'9',l:'8',g:'7',s:'6',r:'5'})[p] ?? p}0000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
const ME = '11111111-1111-4111-8111-111111111111';
const team_members = [{ user_id: ME, email: 'tashfeen@implenix.net', full_name: 'Tashfeen Ahmad', role: 'admin', created_at: iso(now - 40 * D) }];
const people = [
  ['Dana', 'Whitfield', 'Whitfield Plumbing', 'whitfieldplumbing.com', 'ai-receptionist', 'call_booked', 'contact-calendar'],
  ['Marcus', 'Oyelaran', 'Oyelaran HVAC', 'oyelaranhvac.com', 'ai-receptionist', 'call_booked', 'homepage-demo-calendar'],
  ['Priya', 'Natarajan', 'Bright Smile Dental', 'brightsmiledental.co', 'ai-receptionist', 'discovery_done', 'contact-calendar'],
  ['Tom', 'Kessler', 'Kessler Roofing', 'kesslerroofing.com', 'ai-calling-agent', 'proposal_sent', 'outreach-ai'],
  ['Alejandra', 'Ruiz', 'Casa Ruiz Realty', 'casaruizrealty.com', 'ai-receptionist', 'onboarding', 'contact-calendar'],
  ['Gwen', 'Halloran', 'Halloran Law', 'hallorانlaw.com'.replace(/[^\x00-\x7f]/g,''), 'custom-ai-agent', 'new', 'manual'],
  ['Ibrahim', 'Saleh', 'Saleh Auto Care', 'salehautocare.com', 'ai-receptionist', 'live', 'contact-calendar'],
  ['Kenji', 'Morita', 'Morita Med Spa', 'moritamedspa.com', 'website', 'new', 'audit-tool'],
  ['Rosa', 'Delgado', 'Delgado Electric', 'delgadoelectric.net', 'ai-receptionist', 'call_booked', 'outreach-ai'],
  ['Femi', 'Adeyemi', 'Northgate Property Mgmt', 'northgatepm.com', 'seo-package', 'proposal_sent', 'contact-calendar'],
  ['Hannah', 'Lindqvist', 'Lindqvist Vet Clinic', 'lindqvistvet.com', 'ai-receptionist', 'lost', 'contact-calendar'],
  ['Omar', 'Farouk', 'Farouk Logistics', 'faroukco.com', 'custom-software', 'discovery_done', 'referral'],
  ['Claire', 'Bouchard', 'Bouchard Pest Control', 'bouchardpest.com', 'ai-receptionist', 'live', 'contact-calendar'],
];
const clients = people.map(([f, l, c, w, svc, stage, src], i) => ({
  id: id('c'), first_name: f, last_name: l, email: `${f.toLowerCase()}@${w}`, phone: `+1 (614) 555-${String(1200 + i * 37).slice(-4)}`,
  website: w, company: c, service: svc, stage, source: src, notes: null, owner_id: ME, outreach_contact_id: null,
  created_at: iso(now - (i * 2.3 + 1) * D), updated_at: iso(now - i * 5 * H),
}));
const zoom = (k) => `https://us06web.zoom.us/j/8451234${String(5600 + k)}`;
const slot = (dayOffset, hour) => { const d = new Date(now + dayOffset * D); d.setUTCHours(hour, 0, 0, 0); return d.getTime(); };
const bookings = [
  [0, 1, 15], [1, 1, 17], [8, 2, 14], [3, 3, 19], [2, 5, 16], [4, -2, 15], [9, -6, 18], [6, -9, 14], [12, -12, 15], [0, -14, 20], [10, 7, 17],
].map(([ci, d, h], k) => ({
  id: id('b'), client_id: clients[ci].id, start_at: iso(slot(d, h)), end_at: iso(slot(d, h) + 30 * 60e3), timezone: 'America/New_York',
  meeting_provider: 'zoom', meeting_url: zoom(k), zoom_meeting_id: 8451234000 + k, calendar_event_id: `evt${k}`,
  status: d < 0 ? (k % 4 === 0 ? 'no_show' : 'completed') : 'scheduled', source: clients[ci].source, page: '/contact',
  form_data: { first_name: clients[ci].first_name, last_name: clients[ci].last_name, email: clients[ci].email, phone: clients[ci].phone, website: clients[ci].website, service: clients[ci].service, notes: k === 0 ? 'Three trucks, we miss most calls after 5pm and all weekend. Using Jobber.' : k === 3 ? 'Want outbound calls to old estimates.' : '' },
  created_at: iso(slot(d, h) - 3 * D),
}));
const acts = [
  [0, 'booking.created', 'Booked a call for Wed, Oct 14 10:00 AM EDT (AI Receptionist)', 2 * H],
  [2, 'stage.changed', 'Moved from Call booked to Discovery done', 5 * H],
  [2, 'note', 'Uses Dentrix. 2 locations. Front desk overwhelmed Mondays. Wants a quote for both sites.', 6 * H],
  [3, 'stage.changed', 'Moved from Discovery done to Proposal sent', 26 * H],
  [4, 'stage.changed', 'Moved from Proposal sent to Onboarding', 30 * H],
  [8, 'booking.created', 'Booked a call through the outreach agent', 33 * H],
  [6, 'booking.status', 'Marked call as completed', 50 * H],
  [10, 'stage.changed', 'Moved from Call booked to Lost', 70 * H],
];
const activities = acts.map(([ci, type, body, ago]) => ({ id: id('a'), client_id: clients[ci].id, type, body, meta: {}, actor_id: ME, created_at: iso(now - ago) }));

const contact_lists = [
  { id: id('l'), name: 'HVAC · Columbus, OH', source_file: 'Lead finder: hvac contractor in Columbus, OH', created_by: ME, created_at: iso(now - 9 * D) },
  { id: id('l'), name: 'Dentists · Dayton', source_file: 'dayton-dentists.csv', created_by: ME, created_at: iso(now - 4 * D) },
];
const biz = ['Buckeye Comfort Air', 'Arctic Breeze HVAC', 'Scioto Heating', 'Polar Bear Heating & Air', 'German Village Mechanical', 'Clintonville Climate', 'Hilltop HVAC', 'Westerville Heating Co', 'Dublin Air Pros', 'Easton Comfort Systems', 'Grove City Cooling', 'Short North Heating', 'Worthington Air', 'Bexley Furnace & AC'];
const statuses = ['active', 'active', 'replied', 'interested', 'active', 'booked', 'active', 'unsubscribed', 'active', 'bounced', 'active', 'replied', 'active', 'not_interested'];
const contacts = biz.map((b, i) => ({
  id: id('p'), list_id: contact_lists[i < 10 ? 0 : 1].id, email: `${['info', 'office', 'service', 'hello'][i % 4]}@${b.toLowerCase().replace(/[^a-z]/g, '')}.com`,
  first_name: i % 3 === 0 ? ['Gary', 'Linda', 'Steve', 'Monica', 'Raj'][i % 5] : null, last_name: null, company: b, website: `${b.toLowerCase().replace(/[^a-z]/g, '')}.com`,
  phone: `(614) 555-${String(3100 + i * 41).slice(-4)}`, industry: 'HVAC contractor', city: 'Columbus', state: 'OH', custom: { rating: String((3.9 + (i % 10) / 10).toFixed(1)) },
  status: statuses[i], last_contacted_at: iso(now - (i + 1) * 9 * H), created_at: iso(now - 9 * D),
}));
clients[8].outreach_contact_id = contacts[5].id;
const campaigns = [
  { id: id('m'), name: 'HVAC Columbus · after-hours calls', status: 'active', list_id: contact_lists[0].id, from_name: 'Tashfeen at Implenix', from_email: 'tashfeen@go.implenix.net', reply_to: null, daily_limit: 40, send_timezone: 'America/New_York', send_hour_start: 9, send_hour_end: 16, send_days: [1, 2, 3, 4, 5], ai_mode: 'draft', ai_instructions: 'Offer a 30-minute call. Ask how they handle after-hours calls today.', created_by: ME, created_at: iso(now - 8 * D), updated_at: iso(now - 2 * D) },
  { id: id('m'), name: 'Dayton dentists · front desk overflow', status: 'draft', list_id: contact_lists[1].id, from_name: 'Implenix', from_email: '', reply_to: null, daily_limit: 30, send_timezone: 'America/New_York', send_hour_start: 9, send_hour_end: 17, send_days: [1, 2, 3, 4, 5], ai_mode: 'off', ai_instructions: null, created_by: ME, created_at: iso(now - 1 * D), updated_at: iso(now - 1 * D) },
];
const campaign_steps = [
  { id: id('s'), campaign_id: campaigns[0].id, step_number: 1, delay_days: 0, subject: 'After-hours calls at {{company}}', body: 'Hi {{first_name|there}},\n\nQuick question: when someone calls {{company}} at 7pm with a dead furnace, who picks up?\n\nWe set up AI receptionists for HVAC shops that answer every call, book the job into your calendar, and text you the details. Live in 72 hours.\n\nWorth a 15-minute look?\n\nTashfeen' },
  { id: id('s'), campaign_id: campaigns[0].id, step_number: 2, delay_days: 3, subject: '', body: 'Hi {{first_name|there}}, following up in case this got buried. Happy to show you a recording of a real after-hours call.\n\nTashfeen' },
  { id: id('s'), campaign_id: campaigns[0].id, step_number: 3, delay_days: 5, subject: '', body: 'Last note from me. If after-hours calls are already covered, no worries at all.\n\nTashfeen' },
];
const campaign_enrollments = contacts.slice(0, 10).map((c, i) => ({ id: id('e'), campaign_id: campaigns[0].id, contact_id: c.id, current_step: 1 + (i % 3), next_send_at: iso(now + (i - 3) * H), status: ['replied', 'interested', 'booked'].includes(c.status) ? 'replied' : c.status === 'active' ? 'active' : 'stopped', created_at: iso(now - 8 * D) }));
const messages = [];
contacts.slice(0, 10).forEach((c, i) => {
  messages.push({ id: id('g'), contact_id: c.id, campaign_id: campaigns[0].id, step_number: 1, direction: 'outbound', from_email: 'tashfeen@go.implenix.net', to_email: c.email, subject: `After-hours calls at ${c.company}`, body_text: campaign_steps[0].body.replace('{{first_name|there}}', c.first_name ?? 'there').replace(/{{company}}/g, c.company), body_html: null, message_id: `<m${i}@go.implenix.net>`, in_reply_to: null, ses_message_id: `ses${i}`, status: c.status === 'bounced' ? 'bounced' : 'delivered', ai_generated: false, ai_meta: {}, sent_by: null, created_at: iso(now - (8 - i * 0.3) * D) });
});
const inbound = (ci, text, ago) => messages.push({ id: id('g'), contact_id: contacts[ci].id, campaign_id: campaigns[0].id, step_number: null, direction: 'inbound', from_email: contacts[ci].email, to_email: 'tashfeen@go.implenix.net', subject: `Re: After-hours calls at ${contacts[ci].company}`, body_text: text, body_html: null, message_id: `<in${ci}@mail.com>`, in_reply_to: `<m${ci}@go.implenix.net>`, ses_message_id: null, status: 'received', ai_generated: false, ai_meta: {}, sent_by: null, created_at: iso(now - ago) });
inbound(2, "Honestly it goes to voicemail and my wife checks it in the morning. What does this cost?", 20 * H);
inbound(3, "Interested. Can you do Thursday afternoon? We're slammed mornings.", 6 * H);
inbound(5, "Sure, booked a time on your calendar.", 50 * H);
messages.push({ id: id('g'), contact_id: contacts[3].id, campaign_id: campaigns[0].id, step_number: null, direction: 'outbound', from_email: 'tashfeen@go.implenix.net', to_email: contacts[3].email, subject: `Re: After-hours calls at ${contacts[3].company}`, body_text: "Thursday works. I have 2:00 PM or 3:30 PM Eastern open. Which is better?\n\nOr grab any time here: https://implenix.net/contact#book\n\nTashfeen", body_html: null, message_id: null, in_reply_to: '<in3@mail.com>', ses_message_id: null, status: 'draft', ai_generated: true, ai_meta: { intent: 'interested', confidence: 0.92, summary: 'Prospect wants a Thursday afternoon call.', actions: ['get_open_slots'] }, sent_by: null, created_at: iso(now - 6 * H + 60e3) });
messages.push({ id: id('g'), contact_id: contacts[2].id, campaign_id: campaigns[0].id, step_number: null, direction: 'outbound', from_email: 'tashfeen@go.implenix.net', to_email: contacts[2].email, subject: `Re: After-hours calls at ${contacts[2].company}`, body_text: "Good question. Pricing depends on your call volume and what you want the agent to handle, so we quote it after a short call. Most shops are live in 72 hours.\n\nWant me to send a couple of times?\n\nTashfeen", body_html: null, message_id: null, in_reply_to: '<in2@mail.com>', ses_message_id: null, status: 'draft', ai_generated: true, ai_meta: { intent: 'pricing_question', confidence: 0.81, summary: 'Asked about cost. Handed off pricing to a call.', actions: ['handoff_to_human'] }, sent_by: null, created_at: iso(now - 20 * H + 60e3) });
const suppressions = [{ email: contacts[7].email, reason: 'unsubscribed', created_at: iso(now - 3 * D) }, { email: contacts[9].email, reason: 'bounced', created_at: iso(now - 5 * D) }];
const lead_searches = [
  { id: id('q'), provider: 'apify', query: 'hvac contractor', location: 'Columbus, OH', max_results: 150, find_emails: true, status: 'succeeded', external_id: 'run1', dataset_id: 'ds1', result_count: 9, with_email_count: 6, error: null, created_by: ME, created_at: iso(now - 9 * D), finished_at: iso(now - 9 * D + 7 * 60e3) },
  { id: id('q'), provider: 'apify', query: 'dentist', location: 'Dayton, OH', max_results: 100, find_emails: true, status: 'running', external_id: 'run2', dataset_id: 'ds2', result_count: 0, with_email_count: 0, error: null, created_by: ME, created_at: iso(now - 4 * 60e3), finished_at: null },
  { id: id('q'), provider: 'outscraper', query: 'roofing company', location: 'Cincinnati, OH', max_results: 200, find_emails: true, status: 'failed', external_id: 'req3', dataset_id: null, result_count: 0, with_email_count: 0, error: 'Outscraper 402: insufficient balance', created_by: ME, created_at: iso(now - 2 * D), finished_at: iso(now - 2 * D + 60e3) },
];
const lead_results = biz.slice(0, 9).map((b, i) => ({ id: id('r'), search_id: lead_searches[0].id, name: b, category: 'HVAC contractor', email: i % 3 === 2 ? null : contacts[i].email, emails: i % 3 === 2 ? [] : [contacts[i].email], phone: contacts[i].phone, website: contacts[i].website, address: `${1200 + i * 87} ${['High St', 'Broad St', 'Morse Rd', 'Cleveland Ave'][i % 4]}, Columbus, OH 432${10 + i}`, city: 'Columbus', state: 'OH', postal_code: `432${10 + i}`, country: 'US', rating: Number((3.8 + (i % 12) / 10).toFixed(1)), reviews_count: 40 + i * 53, place_id: `pl${i}`, maps_url: 'https://maps.google.com/?cid=1', imported_contact_id: i < 4 ? contacts[i].id : null, raw: {}, created_at: iso(now - 9 * D) }));

// ── Pipeline/funnel fields (migration 20261015) ──
const stageFor = { active: 'email_sent', replied: 'replied', interested: 'interested', booked: 'client', unsubscribed: 'unsubscribed', bounced: 'bounced', not_interested: 'not_interested' };
contacts.forEach((c, i) => {
  const e = campaign_enrollments.find((x) => x.contact_id === c.id);
  c.stage = c.status === 'active' ? (e ? ['email_sent', 'follow_up_1', 'follow_up_2'][(e.current_step - 1) % 3] : 'new') : stageFor[c.status];
  c.stage_changed_at = iso(now - (i % 6 + 0.5) * D); c.reply_label = { replied: i === 2 ? 'pricing' : 'question', interested: 'wants_times', not_interested: 'not_interested' }[c.status] ?? null;
  c.revisit_at = null; c.owner_id = i % 4 === 0 ? ME : null;
});
const more = [
  ['Cascade Plumbing Co', 'queued'], ['Riverside Roofing', 'queued'], ['Summit Dental Group', 'email_sent'], ['Lakeview Family Dentistry', 'email_sent'],
  ['Northside Auto Repair', 'follow_up_1'], ['Maple Street Vet', 'follow_up_2'], ['Harbor Law Office', 'follow_up_3'], ['Granite Peak HVAC', 'follow_up_3'],
  ['Brightwater Pest Control', 'nurture'], ['Oakridge Chiropractic', 'nurture'], ['Fairfield Electric', 'no_response'], ['Pinecrest Landscaping', 'no_response'],
  ['Elm City Movers', 'new'], ['Redwood Insurance', 'new'], ['Sunset Spa & Salon', 'interested'],
];
more.forEach(([b, stage], i) => contacts.push({
  id: id('p'), list_id: contact_lists[1].id, email: `${['info', 'office', 'hello'][i % 3]}@${b.toLowerCase().replace(/[^a-z]/g, '')}.com`, first_name: i % 2 ? ['Dana', 'Luis', 'Priya', 'Owen'][i % 4] : null, last_name: null,
  company: b, website: `${b.toLowerCase().replace(/[^a-z]/g, '')}.com`, phone: null, industry: ['Plumbing', 'Roofing', 'Dental', 'Auto repair', 'Veterinary', 'Law'][i % 6], city: 'Dayton', state: 'OH', custom: {},
  status: ['nurture', 'no_response'].includes(stage) ? 'active' : stage === 'interested' ? 'interested' : 'active', stage, stage_changed_at: iso(now - (i % 9 + 1) * D),
  reply_label: stage === 'nurture' ? 'not_now' : stage === 'interested' ? 'interested' : null, revisit_at: stage === 'nurture' ? iso(now + (i % 2 ? -1 : 40) * D) : null, owner_id: null,
  last_contacted_at: iso(now - (i + 2) * D), created_at: iso(now - 12 * D),
}));
const stagesBy = ['call_booked', 'call_booked', 'discovery_done', 'proposal_sent', 'onboarding', 'new', 'live', 'new', 'call_booked', 'proposal_sent', 'lost', 'negotiation', 'live'];
clients.forEach((c, i) => {
  if (i === 9) c.stage = 'no_show'; if (i === 7) c.stage = 'nurture'; if (i === 11) c.stage = 'negotiation'; if (i === 0) c.stage = 'building';
  c.stage_changed_at = iso(now - (i % 8 + 1) * D);
  c.setup_fee = [1500, null, 2500, 1500, 1500, 4000, 1500, null, 1500, 3000, 1500, 12000, 1500][i];
  c.monthly_value = [450, null, 600, 450, 450, null, 450, null, 450, 800, 450, 1200, 450][i];
  c.lost_reason = c.stage === 'lost' ? 'timing' : null;
  c.next_step = { proposal_sent: 'Chase decision', discovery_done: 'Send proposal', negotiation: 'Send contract', no_show: 'Call to rebook', nurture: 'Check back in' }[c.stage] ?? null;
  c.next_step_at = c.next_step ? iso(now + ((i % 3) - 1) * D) : null;
});
campaigns.forEach((c) => Object.assign(c, { kind: 'sequence', nurture_campaign_id: null, no_reply_grace_days: 4, track_opens: false, stop_company_on_reply: true }));
const nurtureCampaign = { id: id('m'), name: 'Nurture · check back quarterly', status: 'active', list_id: null, from_name: 'Tashfeen at Implenix', from_email: 'tashfeen@go.implenix.net', reply_to: null, daily_limit: 40, send_timezone: 'America/New_York', send_hour_start: 9, send_hour_end: 16, send_days: [2, 4], ai_mode: 'draft', ai_instructions: null, created_by: ME, created_at: iso(now - 20 * D), updated_at: iso(now - 20 * D), kind: 'nurture', nurture_campaign_id: null, no_reply_grace_days: 4, track_opens: false, stop_company_on_reply: true };
campaigns.push(nurtureCampaign);
campaigns[0].nurture_campaign_id = nurtureCampaign.id;
campaign_steps.forEach((s) => Object.assign(s, { subject_b: null, body_b: null }));
campaign_steps[0].subject_b = 'Who answers {{company}} calls after 6pm?';
campaign_steps[0].body_b = 'Hi {{first_name|there}},\n\nMost HVAC shops in Columbus miss 3 to 5 calls a night. We answer them with an AI receptionist that books the job.\n\nOpen to a quick look?\n\nTashfeen';
campaign_steps.push({ id: id('s'), campaign_id: nurtureCampaign.id, step_number: 1, delay_days: 30, subject: 'Still missing after-hours calls?', body: 'Hi {{first_name|there}}, checking back as promised.', subject_b: null, body_b: null });
messages.forEach((m, i) => Object.assign(m, { variant: m.step_number === 1 ? (i % 2 ? 'B' : 'A') : m.direction === 'outbound' && m.status !== 'draft' ? 'A' : null, opened_at: null, open_count: 0, clicked_at: null, click_count: 0 }));
module.exports = { ME, tables: { team_members, clients, bookings, activities, contact_lists, contacts, campaigns, campaign_steps, campaign_enrollments, messages, suppressions, lead_searches, lead_results } };
