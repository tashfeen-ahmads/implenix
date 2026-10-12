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
