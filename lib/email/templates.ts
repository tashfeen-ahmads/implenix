// Booking emails: confirmation to the person who booked, and an alert to
// the team. Plain, table-free HTML that renders in every client, plus a
// text part.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function shell(title: string, inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#14121f">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="margin:0 0 24px;font-size:18px;font-weight:700;letter-spacing:-0.01em">implenix</p>
<div style="background:#ffffff;border:1px solid #e6e4ef;border-radius:8px;padding:28px">${inner}</div>
<p style="margin:20px 0 0;font-size:12px;color:#6b6880;line-height:1.5">Implenix · AI receptionists for local businesses · <a href="https://implenix.net" style="color:#6b6880">implenix.net</a></p>
</div></body></html>`;
}

const button = (href: string, label: string, primary = true) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:4px 8px 4px 0;padding:11px 18px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;${
    primary ? 'background:#c600ff;color:#ffffff' : 'background:#ffffff;color:#14121f;border:1px solid #d6d3e3'
  }">${esc(label)}</a>`;

export type BookingEmailData = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  website?: string;
  serviceLabel: string;
  notes?: string;
  whenLabel: string; // "Tue, Oct 14 · 10:00 AM EDT"
  meetingUrl?: string | null;
  meetingProvider?: string | null;
  googleCalendarUrl: string;
  dashboardUrl?: string;
};

export function clientConfirmationEmail(d: BookingEmailData) {
  const provider = d.meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet';
  const subject = `You're booked: Implenix call, ${d.whenLabel}`;
  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:22px;line-height:1.3">You're booked, ${esc(d.firstName)}.</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3d3a4f">Your call with an Implenix lead specialist about <strong>${esc(d.serviceLabel)}</strong> is confirmed.</p>
<div style="border-left:3px solid #c600ff;background:#faf7ff;padding:14px 16px;margin:0 0 20px">
<p style="margin:0;font-size:15px;font-weight:600">${esc(d.whenLabel)}</p>
<p style="margin:4px 0 0;font-size:14px;color:#3d3a4f">30 minutes · ${provider}</p>
${d.meetingUrl ? `<p style="margin:8px 0 0;font-size:14px;word-break:break-all"><a href="${esc(d.meetingUrl)}" style="color:#7a00b8">${esc(d.meetingUrl)}</a></p>` : ''}
</div>
<p style="margin:0 0 6px">${d.meetingUrl ? button(d.meetingUrl, `Join ${provider} call`) : ''}${button(d.googleCalendarUrl, 'Add to Google Calendar', !d.meetingUrl)}</p>
<p style="margin:6px 0 20px;font-size:13px;color:#6b6880">Using Outlook or Apple Calendar? Open the attached invite.ics. A calendar invite from our Google Calendar is on its way too.</p>
<p style="margin:0 0 8px;font-size:15px;font-weight:600">To get the most from the call</p>
<ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.7;color:#3d3a4f">
<li>Have a rough idea of how many calls you get a week, and when you miss them.</li>
<li>Know which calendar and CRM you use today.</li>
<li>Bring the one thing you most want fixed.</li>
</ul>
<p style="margin:0;font-size:14px;line-height:1.6;color:#3d3a4f">Need to change the time? Reply to this email and we will sort it out.</p>`,
  );
  const text = [
    `You're booked, ${d.firstName}.`,
    '',
    `Your call with an Implenix lead specialist about ${d.serviceLabel} is confirmed.`,
    '',
    `When: ${d.whenLabel} (30 minutes, ${provider})`,
    d.meetingUrl ? `Join: ${d.meetingUrl}` : '',
    `Add to Google Calendar: ${d.googleCalendarUrl}`,
    'Outlook or Apple Calendar: open the attached invite.ics.',
    '',
    'Need to change the time? Reply to this email.',
    '',
    'Implenix · implenix.net',
  ]
    .filter((l) => l !== '')
    .join('\n');
  return { subject, html, text };
}

export function teamAlertEmail(d: BookingEmailData & { source?: string; page?: string }) {
  const name = [d.firstName, d.lastName].filter(Boolean).join(' ');
  const subject = `New booking: ${name} · ${d.serviceLabel} · ${d.whenLabel}`;
  const rows: [string, string | undefined][] = [
    ['When', d.whenLabel],
    ['Name', name],
    ['Email', d.email],
    ['Phone', d.phone],
    ['Website', d.website],
    ['Service', d.serviceLabel],
    ['Notes', d.notes],
    ['Meeting', d.meetingUrl ?? undefined],
    ['Booked from', [d.source, d.page].filter(Boolean).join(' · ') || undefined],
  ];
  const html = shell(
    subject,
    `<h1 style="margin:0 0 16px;font-size:20px">New call booked</h1>
<table style="width:100%;border-collapse:collapse;font-size:14px">${rows
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#6b6880;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0;word-break:break-word">${esc(v!)}</td></tr>`,
      )
      .join('')}</table>
${d.dashboardUrl ? `<p style="margin:20px 0 0">${button(d.dashboardUrl, 'Open in dashboard')}</p>` : ''}`,
  );
  const text = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .concat(d.dashboardUrl ? [`Dashboard: ${d.dashboardUrl}`] : [])
    .join('\n');
  return { subject, html, text };
}

export function teamInviteEmail(d: { name: string; invitedBy: string; url: string }) {
  const subject = `${d.invitedBy} invited you to the Implenix team dashboard`;
  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:22px;line-height:1.3">You're invited, ${esc(d.name)}.</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3d3a4f">${esc(d.invitedBy)} added you to the Implenix team dashboard: client pipeline, booked calls, and outreach.</p>
<p style="margin:0 0 20px">${button(d.url, 'Accept and sign in')}</p>
<p style="margin:0;font-size:13px;line-height:1.6;color:#6b6880">The link works once and expires in 24 hours. After signing in, set a password on your account page. If you weren't expecting this, ignore this email.</p>`,
  );
  const text = `${d.invitedBy} added you to the Implenix team dashboard.\n\nAccept and sign in: ${d.url}\n\nThe link works once and expires in 24 hours.`;
  return { subject, html, text };
}

export function reminderEmail(d: {
  firstName: string;
  whenLabel: string;
  lead: '24h' | '1h';
  meetingUrl?: string | null;
  meetingProvider?: string | null;
  googleCalendarUrl: string;
}) {
  const provider = d.meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet';
  const soon = d.lead === '1h';
  const subject = soon ? `Starting in 1 hour: your Implenix call` : `Tomorrow: your Implenix call, ${d.whenLabel}`;
  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:22px;line-height:1.3">${soon ? 'See you in an hour' : 'See you tomorrow'}, ${esc(d.firstName)}.</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3d3a4f">A reminder of your call with an Implenix lead specialist.</p>
<div style="border-left:3px solid #c600ff;background:#faf7ff;padding:14px 16px;margin:0 0 20px">
<p style="margin:0;font-size:15px;font-weight:600">${esc(d.whenLabel)}</p>
<p style="margin:4px 0 0;font-size:14px;color:#3d3a4f">30 minutes · ${provider}</p>
</div>
<p style="margin:0 0 20px">${d.meetingUrl ? button(d.meetingUrl, `Join ${provider} call`) : ''}${soon ? '' : button(d.googleCalendarUrl, 'Add to Google Calendar', !d.meetingUrl)}</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#3d3a4f">Can't make it? Reply to this email and we'll find another time.</p>`,
  );
  const text = [
    `${soon ? 'See you in an hour' : 'See you tomorrow'}, ${d.firstName}.`,
    '',
    `Your Implenix call: ${d.whenLabel} (30 minutes, ${provider})`,
    d.meetingUrl ? `Join: ${d.meetingUrl}` : '',
    "Can't make it? Reply to this email and we'll find another time.",
  ]
    .filter(Boolean)
    .join('\n');
  return { subject, html, text };
}

// Sent when the team marks a call as a no-show and chooses to send it.
export function rebookEmail(d: { firstName: string; whenLabel: string; bookingUrl: string }) {
  const subject = 'Sorry we missed you. Pick another time?';
  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:22px;line-height:1.3">Sorry we missed you, ${esc(d.firstName)}.</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3d3a4f">We had a call booked for ${esc(d.whenLabel)} but couldn't connect. No problem, things come up. Pick a time that works better and we'll pick up where we left off.</p>
<p style="margin:0 0 20px">${button(d.bookingUrl, 'Pick a new time')}</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#3d3a4f">Or just reply to this email with a couple of times that suit you.</p>`,
  );
  const text = [
    `Sorry we missed you, ${d.firstName}.`,
    '',
    `We had a call booked for ${d.whenLabel} but couldn't connect. Pick a time that works better:`,
    d.bookingUrl,
    '',
    'Or just reply with a couple of times that suit you.',
  ].join('\n');
  return { subject, html, text };
}

// Team alert when the AI reads an outreach reply as positive.
export function hotLeadEmail(d: {
  who: string;
  email: string;
  company?: string | null;
  label: string;
  excerpt: string;
  summary?: string;
  campaign?: string | null;
  draftWaiting: boolean;
  inboxUrl: string;
}) {
  // Names come from imported CSVs: keep the subject on one line.
  const subject = `Hot lead: ${d.company || d.who} replied (${d.label.toLowerCase()})`.replace(/[\r\n\t]+/g, ' ').slice(0, 200);
  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:20px;line-height:1.3">${esc(d.company || d.who)} wants to talk</h1>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3d3a4f">${esc(d.who)} &lt;${esc(d.email)}&gt;${d.campaign ? ` replied to <strong>${esc(d.campaign)}</strong>` : ' replied'}. The AI labelled it <strong>${esc(d.label)}</strong>.</p>
<blockquote style="margin:0 0 16px;padding:12px 14px;border-left:3px solid #c600ff;background:#faf7ff;font-size:14px;line-height:1.6;color:#14121f;white-space:pre-wrap">${esc(d.excerpt)}</blockquote>
${d.summary ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#3d3a4f">AI summary: ${esc(d.summary)}</p>` : ''}
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#3d3a4f">${d.draftWaiting ? 'A reply draft is waiting for approval in the inbox.' : 'Reply while they are engaged.'}</p>
<p style="margin:0">${button(d.inboxUrl, 'Open the conversation')}</p>`,
  );
  const text = [
    `${d.company || d.who} wants to talk.`,
    `${d.who} <${d.email}>${d.campaign ? ` replied to ${d.campaign}` : ' replied'}. Label: ${d.label}.`,
    '',
    d.excerpt,
    '',
    d.summary ? `AI summary: ${d.summary}` : '',
    d.draftWaiting ? 'A reply draft is waiting for approval in the inbox.' : '',
    d.inboxUrl,
  ]
    .filter((l) => l !== '')
    .join('\n');
  return { subject, html, text };
}

// Team alert when the deliverability guard stops sending.
export function sendingAlertEmail(d: {
  kind: 'hold' | 'campaign';
  reason: string;
  campaign: string | null;
  sent: number;
  bounced: number;
  complained: number;
  url: string;
}) {
  const subject = (d.kind === 'hold' ? 'Outreach sending stopped' : `Campaign paused: ${d.campaign ?? ''}`)
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, 200);
  const what =
    d.kind === 'hold'
      ? 'All outreach sending is on hold to protect the Amazon SES account. Booking confirmations still go out.'
      : `The campaign <strong>${esc(d.campaign ?? '')}</strong> was paused. Other campaigns keep sending.`;
  const next =
    d.kind === 'hold'
      ? 'Check which list the bounces or complaints came from, pause or fix that campaign, then resume sending from the Campaigns page.'
      : 'Check the list (verify it, remove bad addresses), then resume the campaign.';
  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:20px;line-height:1.3">${esc(subject)}</h1>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3d3a4f">${what}</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#14121f"><strong>${esc(d.reason)}.</strong></p>
<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#3d3a4f">Sent ${d.sent} · bounced ${d.bounced} · complaints ${d.complained}</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#3d3a4f">${esc(next)}</p>
<p style="margin:0">${button(d.url, 'Open the dashboard')}</p>`,
  );
  const text = [
    subject,
    '',
    what.replace(/<[^>]+>/g, ''),
    `${d.reason}.`,
    `Sent ${d.sent} · bounced ${d.bounced} · complaints ${d.complained}`,
    '',
    next,
    d.url,
  ].join('\n');
  return { subject, html, text };
}

// Team alert for a lead from a website form (e.g. the missed-call audit).
export function webLeadEmail(d: {
  source: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  details: [string, string][];
  dashboardUrl: string;
}) {
  const who = d.name || d.company || d.phone || d.email || 'Someone';
  const subject = `New website lead (${d.source}): ${who}`.replace(/[\r\n\t]+/g, ' ').slice(0, 200);
  const rows = [
    ['Name', d.name],
    ['Company', d.company],
    ['Phone', d.phone],
    ['Email', d.email],
    ...d.details,
  ].filter((r): r is [string, string] => Boolean(r[1]));
  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:20px;line-height:1.3">New lead from the website</h1>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3d3a4f">Source: <strong>${esc(d.source)}</strong>. They left contact details, so call or email them while it's fresh.</p>
<table style="border-collapse:collapse;margin:0 0 20px;font-size:14px">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#6b6880;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;color:#14121f">${esc(v)}</td></tr>`,
      )
      .join('')}</table>
<p style="margin:0">${button(d.dashboardUrl, 'Open in the dashboard')}</p>`,
  );
  const text = [`New lead from the website (${d.source}).`, '', ...rows.map(([k, v]) => `${k}: ${v}`), '', d.dashboardUrl].join('\n');
  return { subject, html, text };
}
