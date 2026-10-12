import 'server-only';
import { SITE_URL as DEFAULT_SITE_URL } from '@/lib/seo';

// Environment for the cold-outreach system (Amazon SES + OpenAI). See
// docs/OUTREACH.md and the "Outreach" block in .env.example.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
export const BOOKING_PAGE_URL = `${SITE_URL}/contact#book`;

// Hard ceiling on sends per cron tick, so one invocation stays well inside
// a serverless time budget.
export const MAX_SENDS_PER_TICK = 40;

export function sesConfigured(): boolean {
  return Boolean(
    process.env.AWS_SES_REGION &&
      process.env.AWS_SES_ACCESS_KEY_ID &&
      process.env.AWS_SES_SECRET_ACCESS_KEY &&
      process.env.OUTREACH_FROM_DOMAIN,
  );
}

export function openaiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function openaiModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-5.5';
}

export function fromDomain(): string {
  return (process.env.OUTREACH_FROM_DOMAIN ?? '').trim().toLowerCase();
}

export function postalAddress(): string {
  return (process.env.OUTREACH_POSTAL_ADDRESS ?? '').trim();
}

export function globalDailyLimit(): number {
  const n = Number(process.env.OUTREACH_GLOBAL_DAILY_LIMIT);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 200;
}

// The day boundary used for the global cap.
export function outreachTimezone(): string {
  return process.env.OUTREACH_TIMEZONE || 'America/New_York';
}

export function unsubscribeSecret(): string {
  const s = process.env.OUTREACH_UNSUBSCRIBE_SECRET ?? '';
  if (s.length < 16) {
    throw new Error('OUTREACH_UNSUBSCRIBE_SECRET is missing or shorter than 16 characters');
  }
  return s;
}

// Optional mailto target for the List-Unsubscribe header. Mail sent there
// must reach the SES inbound receipt rule so it can be processed.
export function unsubscribeMailto(): string | null {
  const v = (process.env.OUTREACH_UNSUBSCRIBE_MAILTO ?? '').trim().toLowerCase();
  return v && v.includes('@') ? v : null;
}

// Comma-separated SNS topic ARNs we accept messages from. Empty = any
// topic whose signature verifies (signature checks still apply).
export function allowedSnsTopics(): string[] {
  return (process.env.SES_INBOUND_SNS_TOPIC_ARN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// True when `email` is on the sending domain or one of its subdomains.
export function isOnSendingDomain(email: string): boolean {
  const domain = fromDomain();
  if (!domain) return false;
  const host = email.split('@')[1]?.toLowerCase() ?? '';
  return host === domain || host.endsWith(`.${domain}`);
}
