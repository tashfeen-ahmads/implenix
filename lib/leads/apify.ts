import 'server-only';
import type { LeadPlace, PollResult, StartedSearch } from './types';
import { cleanEmails, num, place, str } from './normalize';

// Apify Google Maps Scraper (compass/crawler-google-places by default).
// Pay per result; contact enrichment (emails from the business website)
// is an add-on billed per place. Docs: https://apify.com/compass/crawler-google-places

const API = 'https://api.apify.com/v2';
const ACTOR = () => process.env.APIFY_GMAPS_ACTOR || 'compass~crawler-google-places';

export const apifyConfigured = () => Boolean(process.env.APIFY_TOKEN);

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.APIFY_TOKEN}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Apify ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as T;
}

export async function startApify(input: {
  query: string;
  location: string;
  maxResults: number;
  findEmails: boolean;
}): Promise<StartedSearch> {
  const run = await call<{ data: { id: string; defaultDatasetId: string } }>(
    `/acts/${ACTOR()}/runs`,
    {
      method: 'POST',
      body: JSON.stringify({
        searchStringsArray: [input.query],
        locationQuery: input.location,
        maxCrawledPlacesPerSearch: input.maxResults,
        language: 'en',
        skipClosedPlaces: true,
        scrapeContacts: input.findEmails,
      }),
    },
  );
  return { externalId: run.data.id, datasetId: run.data.defaultDatasetId };
}

export async function pollApify(runId: string, datasetId: string | null): Promise<PollResult> {
  const { data } = await call<{ data: { status: string; defaultDatasetId: string; statusMessage?: string } }>(
    `/actor-runs/${runId}`,
  );
  if (data.status === 'READY' || data.status === 'RUNNING') return { state: 'running' };
  if (data.status !== 'SUCCEEDED') {
    return { state: 'failed', error: `Apify run ${data.status.toLowerCase()}${data.statusMessage ? `: ${data.statusMessage}` : ''}` };
  }
  const ds = datasetId || data.defaultDatasetId;
  const items = await call<Record<string, unknown>[]>(`/datasets/${ds}/items?clean=true&format=json&limit=5000`);
  return { state: 'succeeded', places: items.map(fromApify).filter((p): p is LeadPlace => p !== null) };
}

function fromApify(r: Record<string, unknown>): LeadPlace | null {
  const name = str(r.title) ?? str(r.name);
  if (!name) return null;
  return place({
    name,
    category: str(r.categoryName) ?? (Array.isArray(r.categories) ? str(r.categories[0]) : null),
    emails: cleanEmails([...(Array.isArray(r.emails) ? r.emails : []), r.email]),
    phone: str(r.phone) ?? str(r.phoneUnformatted),
    website: str(r.website),
    address: str(r.address),
    city: str(r.city),
    state: str(r.state),
    postal_code: str(r.postalCode),
    country: str(r.countryCode),
    rating: num(r.totalScore),
    reviews_count: num(r.reviewsCount),
    place_id: str(r.placeId),
    maps_url: str(r.url),
    raw: r,
  });
}
