// A business found by the lead finder, normalised across providers.
export type LeadPlace = {
  name: string;
  category: string | null;
  emails: string[];
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  rating: number | null;
  reviews_count: number | null;
  place_id: string | null;
  maps_url: string | null;
  raw: Record<string, unknown>;
};

export type LeadProvider = 'apify' | 'outscraper' | 'dataforseo';

export type StartedSearch = { externalId: string; datasetId?: string | null };

export type PollResult =
  | { state: 'running' }
  | { state: 'failed'; error: string }
  | { state: 'succeeded'; places: LeadPlace[] };

export type LeadSearch = {
  id: string;
  provider: LeadProvider;
  query: string;
  location: string;
  max_results: number;
  find_emails: boolean;
  status: 'running' | 'succeeded' | 'failed';
  external_id: string | null;
  dataset_id: string | null;
  result_count: number;
  with_email_count: number;
  error: string | null;
  created_by: string | null;
  created_at: string;
  finished_at: string | null;
};

export type LeadResult = Omit<LeadPlace, 'raw' | 'emails'> & {
  id: string;
  search_id: string;
  email: string | null;
  emails: string[];
  imported_contact_id: string | null;
  email_status: 'pending' | 'found' | 'not_found' | 'no_website';
  email_source: string | null;
  email_verdict: 'deliverable' | 'risky' | 'undeliverable' | 'unknown' | null;
  email_verdict_reason: string | null;
  enriched_at: string | null;
  verified_at: string | null;
  created_at: string;
};
