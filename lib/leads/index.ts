import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { apifyConfigured, pollApify, startApify } from './apify';
import { outscraperConfigured, pollOutscraper, startOutscraper } from './outscraper';
import { dataforseoConfigured, pollDataforseo, startDataforseo } from './dataforseo';
import type { LeadProvider, LeadSearch, PollResult, StartedSearch } from './types';

export const PROVIDERS: Record<LeadProvider, { label: string; configured: () => boolean }> = {
  apify: { label: 'Apify (Google Maps Scraper)', configured: apifyConfigured },
  outscraper: { label: 'Outscraper', configured: outscraperConfigured },
  dataforseo: { label: 'DataForSEO (Google Maps)', configured: dataforseoConfigured },
};

export function configuredProviders(): LeadProvider[] {
  return (Object.keys(PROVIDERS) as LeadProvider[]).filter((p) => PROVIDERS[p].configured());
}

export function startSearch(
  provider: LeadProvider,
  input: { query: string; location: string; maxResults: number; findEmails: boolean },
): Promise<StartedSearch> {
  if (provider === 'dataforseo') return startDataforseo(input);
  return provider === 'apify' ? startApify(input) : startOutscraper(input);
}

function poll(s: LeadSearch): Promise<PollResult> {
  if (!s.external_id) return Promise.resolve({ state: 'failed', error: 'Search never started' });
  if (s.provider === 'dataforseo') return pollDataforseo(s.external_id);
  return s.provider === 'apify' ? pollApify(s.external_id, s.dataset_id) : pollOutscraper(s.external_id);
}

// Checks a running search and, once the provider is done, stores its
// results. Safe to call repeatedly (UI polling and cron both do).
export async function syncSearch(db: SupabaseClient, s: LeadSearch): Promise<LeadSearch> {
  if (s.status !== 'running') return s;
  let result: PollResult;
  try {
    result = await poll(s);
  } catch (err) {
    // Network/provider hiccup: stay running, try again next poll, but give up
    // after 6 hours.
    console.error('[leads] poll failed', err instanceof Error ? err.message : err);
    if (Date.now() - new Date(s.created_at).getTime() < 6 * 3_600_000) return s;
    result = { state: 'failed', error: 'Provider did not respond for 6 hours' };
  }
  if (result.state === 'running') return s;

  if (result.state === 'failed') {
    const { data } = await db
      .from('lead_searches')
      .update({ status: 'failed', error: result.error, finished_at: new Date().toISOString() })
      .eq('id', s.id)
      .eq('status', 'running')
      .select('*')
      .maybeSingle();
    return (data as LeadSearch | null) ?? s;
  }

  // Claim the search so two pollers don't both insert results.
  const { data: claimed } = await db
    .from('lead_searches')
    .update({ status: 'succeeded', finished_at: new Date().toISOString() })
    .eq('id', s.id)
    .eq('status', 'running')
    .select('*')
    .maybeSingle();
  if (!claimed) return s;

  const seen = new Set<string>();
  const rows = result.places
    .filter((p) => {
      const key = p.place_id ?? `${p.name}|${p.address ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((p) => ({
      search_id: s.id,
      name: p.name,
      category: p.category,
      email: p.emails[0] ?? null,
      emails: p.emails,
      // The email layer picks up 'pending' rows (lib/leads/enrich.ts).
      email_status: p.emails.length ? 'found' : p.website ? 'pending' : 'no_website',
      email_source: p.emails.length ? 'provider' : null,
      phone: p.phone,
      website: p.website,
      address: p.address,
      city: p.city,
      state: p.state,
      postal_code: p.postal_code,
      country: p.country,
      rating: p.rating,
      reviews_count: p.reviews_count,
      place_id: p.place_id,
      maps_url: p.maps_url,
      raw: p.raw,
    }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db.from('lead_results').insert(rows.slice(i, i + 500));
    if (error) console.error('[leads] result insert failed', error.message);
  }
  const withEmail = rows.filter((r) => r.email).length;
  const { data } = await db
    .from('lead_searches')
    .update({ result_count: rows.length, with_email_count: withEmail })
    .eq('id', s.id)
    .select('*')
    .single();
  return (data as LeadSearch | null) ?? (claimed as LeadSearch);
}

// Cron hook: sync every running search.
export async function syncRunningSearches(db: SupabaseClient): Promise<number> {
  const { data } = await db.from('lead_searches').select('*').eq('status', 'running').limit(20);
  const list = (data ?? []) as LeadSearch[];
  for (const s of list) await syncSearch(db, s);
  return list.length;
}
