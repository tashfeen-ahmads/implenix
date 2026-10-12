import 'server-only';
import { cleanEmails } from './normalize';

// Paid email-finder APIs, used only when the website crawl finds nothing.
//   Hunter.io domain search (HUNTER_API_KEY)
//   Outscraper Emails & Contacts (OUTSCRAPER_API_KEY, billed only on hits)
// EMAIL_FINDER=hunter|outscraper|off picks one; by default Hunter if its
// key is set, else none (Outscraper must be opted into, since the same key
// also pays for Maps searches).

export type FinderName = 'hunter' | 'outscraper';

export function emailFinderProvider(): FinderName | null {
  const choice = (process.env.EMAIL_FINDER ?? '').trim().toLowerCase();
  if (choice === 'off') return null;
  if (choice === 'hunter') return process.env.HUNTER_API_KEY ? 'hunter' : null;
  if (choice === 'outscraper') return process.env.OUTSCRAPER_API_KEY ? 'outscraper' : null;
  return process.env.HUNTER_API_KEY ? 'hunter' : null;
}

export function domainOf(website: string): string | null {
  try {
    return new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(25_000), cache: 'no-store' });
  if (!res.ok) throw new Error(`${new URL(url).hostname} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// Hunter: https://hunter.io/api-documentation (GET /v2/domain-search).
async function hunter(domain: string): Promise<string[]> {
  const q = new URLSearchParams({ domain, limit: '10', api_key: process.env.HUNTER_API_KEY ?? '' });
  const body = (await getJson(`https://api.hunter.io/v2/domain-search?${q}`)) as {
    data?: { emails?: { value?: string; confidence?: number }[] };
  };
  const list = (body.data?.emails ?? [])
    .filter((e) => (e.confidence ?? 0) >= 50)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .map((e) => e.value);
  return cleanEmails(list);
}

// Outscraper Emails & Contacts: https://outscraper.com/domain-emails-api/
// The response shape varies by version, so every "value"/"email" string in
// it is collected.
async function outscraper(domain: string): Promise<string[]> {
  const q = new URLSearchParams({ query: domain, async: 'false' });
  const body = await getJson(`https://api.app.outscraper.com/emails-and-contacts?${q}`, {
    'X-API-KEY': process.env.OUTSCRAPER_API_KEY ?? '',
  });
  const found: string[] = [];
  const walk = (v: unknown, depth = 0) => {
    if (depth > 6 || v === null || v === undefined) return;
    if (typeof v === 'string') {
      if (v.includes('@')) found.push(v);
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, depth + 1));
    else if (typeof v === 'object') Object.values(v as Record<string, unknown>).forEach((x) => walk(x, depth + 1));
  };
  walk((body as { data?: unknown }).data ?? body);
  return cleanEmails(found);
}

export async function domainEmailSearch(website: string): Promise<string[]> {
  const domain = domainOf(website);
  const p = emailFinderProvider();
  if (!domain || !p) return [];
  return p === 'hunter' ? hunter(domain) : outscraper(domain);
}
