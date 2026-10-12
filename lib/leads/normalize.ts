import type { LeadPlace } from './types';

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
// Addresses scraped from websites that are never a real inbox.
const JUNK_EMAIL = /(example\.|sentry|wixpress|domain\.com|\.(png|jpe?g|gif|webp|svg)$|^(noreply|no-reply|donotreply)@)/i;

export function cleanEmails(values: unknown[]): string[] {
  const out = new Set<string>();
  for (const v of values) {
    if (typeof v !== 'string') continue;
    for (const part of v.split(/[\s,;]+/)) {
      const e = part.trim().replace(/^mailto:/i, '').toLowerCase();
      if (EMAIL_RE.test(e) && !JUNK_EMAIL.test(e)) out.add(e);
    }
  }
  return [...out];
}

export const str = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' ? String(v) : null;

export const num = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

export function place(p: Partial<LeadPlace> & { name: string; raw: Record<string, unknown> }): LeadPlace {
  return {
    category: null,
    emails: [],
    phone: null,
    website: null,
    address: null,
    city: null,
    state: null,
    postal_code: null,
    country: null,
    rating: null,
    reviews_count: null,
    place_id: null,
    maps_url: null,
    ...p,
  };
}
