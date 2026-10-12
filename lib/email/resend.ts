import 'server-only';

// Transactional email through Resend (booking confirmations, team
// alerts, updates) from the implenix.net domain. Cold outreach never goes
// through here: it uses Amazon SES on a separate sending domain.

const FROM = process.env.RESEND_FROM ?? 'Implenix <update@implenix.net>';

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export type EmailAttachment = { filename: string; content: string; contentType?: string };

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  tags?: { name: string; value: string }[];
}): Promise<{ id: string } | null> {
  if (!resendConfigured()) {
    console.warn('[email] RESEND_API_KEY not set, skipped:', input.subject);
    return null;
  }
  const res = await fetch(`${process.env.RESEND_API_BASE ?? 'https://api.resend.com'}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo ?? process.env.RESEND_REPLY_TO ?? 'support@implenix.net',
      attachments: input.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content).toString('base64'),
        content_type: a.contentType,
      })),
      tags: input.tags,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return (await res.json()) as { id: string };
}
