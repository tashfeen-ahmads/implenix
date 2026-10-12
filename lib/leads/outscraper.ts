import 'server-only';
import type { LeadPlace, PollResult, StartedSearch } from './types';
import { cleanEmails, num, place, str } from './normalize';

// Outscraper Google Maps search with the "domains_service" enrichment,
// which visits each business website for emails and contacts.
// Docs: https://app.outscraper.com/api-docs

const API = 'https://api.app.outscraper.com';

export const outscraperConfigured = () => Boolean(process.env.OUTSCRAPER_API_KEY);

async function call<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'X-API-KEY': process.env.OUTSCRAPER_API_KEY ?? '' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Outscraper ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as T;
}

export async function startOutscraper(input: {
  query: string;
  location: string;
  maxResults: number;
  findEmails: boolean;
}): Promise<StartedSearch> {
  const params = new URLSearchParams({
    query: `${input.query}, ${input.location}`,
    limit: String(input.maxResults),
    language: 'en',
    region: process.env.OUTSCRAPER_REGION || 'US',
    async: 'true',
  });
  if (input.findEmails) params.set('enrichment', 'domains_service');
  const res = await call<{ id: string }>(`/maps/search-v3?${params}`);
  return { externalId: res.id };
}

export async function pollOutscraper(requestId: string): Promise<PollResult> {
  const res = await call<{ status: string; data?: unknown }>(`/requests/${encodeURIComponent(requestId)}`);
  const status = res.status.toLowerCase();
  if (status === 'pending' || status === 'running') return { state: 'running' };
  if (status !== 'success') return { state: 'failed', error: `Outscraper request ${status}` };
  // data is one array of places per query.
  const rows = (Array.isArray(res.data) ? res.data : []).flatMap((q) => (Array.isArray(q) ? q : [q]));
  return {
    state: 'succeeded',
    places: rows
      .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
      .map(fromOutscraper)
      .filter((p): p is LeadPlace => p !== null),
  };
}

function fromOutscraper(r: Record<string, unknown>): LeadPlace | null {
  const name = str(r.name);
  if (!name) return null;
  const emailFields = Object.keys(r)
    .filter((k) => /^email(_\d+)?$/.test(k))
    .map((k) => r[k]);
  return place({
    name,
    category: str(r.category) ?? str(r.type),
    emails: cleanEmails([...emailFields, ...(Array.isArray(r.emails) ? r.emails : [])]),
    phone: str(r.phone),
    website: str(r.site) ?? str(r.website),
    address: str(r.full_address) ?? str(r.address),
    city: str(r.city),
    state: str(r.us_state) ?? str(r.state),
    postal_code: str(r.postal_code),
    country: str(r.country_code),
    rating: num(r.rating),
    reviews_count: num(r.reviews),
    place_id: str(r.place_id),
    maps_url: str(r.location_link),
    raw: r,
  });
}
