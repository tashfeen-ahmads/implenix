import 'server-only';
import type { LeadPlace, PollResult, StartedSearch } from './types';
import { cleanEmails, num, place, str } from './normalize';

// DataForSEO Google Maps (SERP API, async task):
//   POST /v3/serp/google/maps/task_post
//   GET  /v3/serp/google/maps/task_get/advanced/{id}
// Docs: https://docs.dataforseo.com/v3/serp-maps-live-advanced/
// Results carry website, phone, rating and a contact-page URL but no
// email; the email layer (lib/leads/enrich.ts) crawls the site for one.
// Auth is HTTP Basic with the API login and password. Set
// DATAFORSEO_API_BASE=https://sandbox.dataforseo.com to test for free.

const base = () => (process.env.DATAFORSEO_API_BASE || 'https://api.dataforseo.com').replace(/\/+$/, '');
export const dataforseoConfigured = () => Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);

type Task = { id: string; status_code: number; status_message: string; result?: { items?: Record<string, unknown>[] }[] | null };
type Envelope = { status_code: number; status_message: string; tasks?: Task[] };

async function call(path: string, init?: RequestInit): Promise<Envelope> {
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json', ...init?.headers },
    signal: AbortSignal.timeout(25_000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`DataForSEO ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as Envelope;
  if (body.status_code !== 20000) throw new Error(`DataForSEO ${body.status_code}: ${body.status_message}`);
  return body;
}

export async function startDataforseo(input: { query: string; location: string; maxResults: number }): Promise<StartedSearch> {
  const body = await call('/v3/serp/google/maps/task_post', {
    method: 'POST',
    body: JSON.stringify([
      {
        // The city goes in the keyword ("hvac contractor Columbus, OH"),
        // searched from the country set below (default: United States).
        keyword: `${input.query} ${input.location}`,
        location_code: Number(process.env.DATAFORSEO_LOCATION_CODE || 2840),
        language_code: 'en',
        depth: Math.min(700, Math.max(20, input.maxResults)),
      },
    ]),
  });
  const task = body.tasks?.[0];
  if (!task || task.status_code !== 20100) throw new Error(`DataForSEO task not created: ${task?.status_message ?? 'no task'}`);
  return { externalId: task.id };
}

export async function pollDataforseo(taskId: string): Promise<PollResult> {
  const body = await call(`/v3/serp/google/maps/task_get/advanced/${encodeURIComponent(taskId)}`);
  const task = body.tasks?.[0];
  if (!task) return { state: 'running' };
  // 40601 "Task Handed", 40602 "Task in Queue": not ready yet.
  if (task.status_code === 40601 || task.status_code === 40602) return { state: 'running' };
  if (task.status_code !== 20000) return { state: 'failed', error: `DataForSEO ${task.status_code}: ${task.status_message}` };
  const items = (task.result ?? []).flatMap((r) => r.items ?? []);
  return {
    state: 'succeeded',
    places: items
      .filter((i) => i.type === 'maps_search' || i.type === undefined)
      .map(fromDataforseo)
      .filter((p): p is LeadPlace => p !== null),
  };
}

function fromDataforseo(r: Record<string, unknown>): LeadPlace | null {
  const name = str(r.title);
  if (!name) return null;
  const info = (r.address_info ?? {}) as Record<string, unknown>;
  const rating = (r.rating ?? {}) as Record<string, unknown>;
  const contacts = Array.isArray(r.contact_info) ? (r.contact_info as Record<string, unknown>[]) : [];
  return place({
    name,
    category: str(r.category),
    // Business Listings data sometimes includes contact_info type "mail".
    emails: cleanEmails(contacts.filter((c) => c.type === 'mail').map((c) => c.value)),
    phone: str(r.phone),
    website: str(r.url) ?? (str(r.domain) ? `https://${str(r.domain)}` : null),
    address: str(r.address),
    city: str(info.city),
    state: str(info.region),
    postal_code: str(info.zip),
    country: str(info.country_code),
    rating: num(rating.value),
    reviews_count: num(rating.votes_count),
    place_id: str(r.place_id) ?? str(r.cid),
    maps_url: str(r.cid) ? `https://maps.google.com/?cid=${str(r.cid)}` : null,
    raw: r,
  });
}
