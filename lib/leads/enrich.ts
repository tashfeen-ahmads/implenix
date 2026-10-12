import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { findEmailsOnWebsite, rankEmails } from './emailFinder';
import { domainEmailSearch, emailFinderProvider } from './emailProviders';
import { verifyEmail } from './verify';
import type { LeadResult } from './types';

// The email layer on top of any listings provider. For each result:
//   1. no email from the provider -> crawl the business website;
//   2. still none and a finder API is configured (Hunter) -> ask it;
//   3. every email found is verified before anyone can import it.
// Runs in small batches: from the search page (button) and from the cron.

const CONCURRENCY = 4;

export type EnrichProgress = {
  pending: number; // still to search for an email
  unverified: number; // has an email, not verified yet
  found: number;
  verified: number;
  sendable: number;
  done: boolean;
};

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>, deadline: number) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length && Date.now() < deadline) await fn(items[i++]);
    }),
  );
}

async function findFor(db: SupabaseClient, r: LeadResult): Promise<void> {
  const now = new Date().toISOString();
  if (!r.website) {
    await db.from('lead_results').update({ email_status: 'no_website', enriched_at: now }).eq('id', r.id);
    return;
  }
  let emails: string[] = [];
  let source: string | null = null;
  const raw = (r as LeadResult & { raw?: Record<string, unknown> }).raw ?? {};
  const contactUrl = typeof raw.contact_url === 'string' ? [raw.contact_url] : [];
  const site = await findEmailsOnWebsite(r.website, undefined, contactUrl);
  if (site.emails.length) {
    emails = site.emails;
    source = 'website';
  } else if (emailFinderProvider()) {
    const found = await domainEmailSearch(r.website).catch((err) => {
      console.error('[leads/enrich] finder API failed', err instanceof Error ? err.message : err);
      return [] as string[];
    });
    if (found.length) {
      emails = rankEmails(found, r.website);
      source = emailFinderProvider();
    }
  }
  await db
    .from('lead_results')
    .update(
      emails.length
        ? { email: emails[0], emails, email_status: 'found', email_source: source, enriched_at: now }
        : { email_status: 'not_found', enriched_at: now },
    )
    .eq('id', r.id)
    .eq('email_status', 'pending');
}

async function verifyFor(db: SupabaseClient, r: LeadResult): Promise<void> {
  if (!r.email) return;
  const v = await verifyEmail(r.email);
  await db
    .from('lead_results')
    .update({ email_verdict: v.verdict, email_verdict_reason: `${v.reason} (${v.checkedBy})`, verified_at: new Date().toISOString() })
    .eq('id', r.id);
}

export async function enrichSearch(
  db: SupabaseClient,
  searchId: string,
  opts: { limit?: number; budgetMs?: number } = {},
): Promise<EnrichProgress> {
  const deadline = Date.now() + (opts.budgetMs ?? 40_000);
  const limit = opts.limit ?? 12;

  const { data: pending } = await db
    .from('lead_results')
    .select('*')
    .eq('search_id', searchId)
    .eq('email_status', 'pending')
    .limit(limit);
  await pool((pending ?? []) as LeadResult[], CONCURRENCY, (r) => findFor(db, r), deadline);

  const { data: unverified } = await db
    .from('lead_results')
    .select('*')
    .eq('search_id', searchId)
    .eq('email_status', 'found')
    .is('verified_at', null)
    .limit(limit * 2);
  await pool((unverified ?? []) as LeadResult[], CONCURRENCY, (r) => verifyFor(db, r), deadline);

  return progress(db, searchId);
}

export async function progress(db: SupabaseClient, searchId: string, opts: { write?: boolean } = {}): Promise<EnrichProgress> {
  const base = () => db.from('lead_results').select('id', { count: 'exact', head: true }).eq('search_id', searchId);
  const [pending, unverified, found, verified, ready] = await Promise.all([
    base().eq('email_status', 'pending'),
    base().eq('email_status', 'found').is('verified_at', null),
    base().eq('email_status', 'found'),
    base().not('verified_at', 'is', null),
    // Same rule as import: verified, and not undeliverable or catch-all.
    base().eq('email_status', 'found').not('verified_at', 'is', null).in('email_verdict', ['deliverable', 'unknown']),
  ]);
  const n = (r: { count: number | null }) => r.count ?? 0;
  if (opts.write !== false) await db.from('lead_searches').update({ with_email_count: n(found) }).eq('id', searchId);
  return {
    pending: n(pending),
    unverified: n(unverified),
    found: n(found),
    verified: n(verified),
    sendable: n(ready),
    done: n(pending) === 0 && n(unverified) === 0,
  };
}

// Cron: keep enriching finished searches that still have work.
export async function enrichPending(db: SupabaseClient, budgetMs = 25_000): Promise<number> {
  const { data } = await db
    .from('lead_results')
    .select('search_id')
    .or('email_status.eq.pending,and(email_status.eq.found,verified_at.is.null)')
    .limit(1);
  const id = (data as { search_id: string }[] | null)?.[0]?.search_id;
  if (!id) return 0;
  await enrichSearch(db, id, { limit: 20, budgetMs });
  return 1;
}
