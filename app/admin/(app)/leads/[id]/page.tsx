import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import type { LeadResult, LeadSearch } from '@/lib/leads/types';
import { PageHeader } from '@/components/admin/ui';
import { SearchStatus } from '@/components/admin/leads/SearchStatus';
import { ResultsTable } from '@/components/admin/leads/ResultsTable';
import { EmailLayer } from '@/components/admin/leads/EmailLayer';
import { progress } from '@/lib/leads/enrich';

const PROVIDER_LABEL: Record<string, string> = { apify: 'Apify', outscraper: 'Outscraper', dataforseo: 'DataForSEO' };

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lead search' };

export default async function LeadSearchPage({ params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: search } = await db.from('lead_searches').select('*').eq('id', params.id).maybeSingle();
  if (!search) notFound();
  const s = search as LeadSearch;
  const { data: results } = await db
    .from('lead_results')
    .select('id, search_id, name, category, email, emails, phone, website, address, city, state, postal_code, country, rating, reviews_count, place_id, maps_url, imported_contact_id, email_status, email_source, email_verdict, email_verdict_reason, enriched_at, verified_at, created_at')
    .eq('search_id', s.id)
    .order('reviews_count', { ascending: false, nullsFirst: false })
    .limit(2000);

  const rows = (results ?? []) as LeadResult[];
  return (
    <>
      <Link href="/admin/leads" className="inline-flex items-center gap-1.5 mb-4 font-body text-xs text-white/60 hover:text-white">
        <ArrowLeft size={14} aria-hidden /> Lead finder
      </Link>
      <PageHeader title={`${s.query} · ${s.location}`} description={`${PROVIDER_LABEL[s.provider]}, up to ${s.max_results} businesses`} />
      <SearchStatus search={s} />
      {s.status === 'succeeded' && rows.length ? (
        <EmailLayer searchId={s.id} total={rows.length} initial={await progress(db, s.id, { write: false })} />
      ) : null}
      {s.status === 'succeeded' ? (
        <ResultsTable searchId={s.id} defaultListName={`${s.query} · ${s.location}`} results={rows} />
      ) : null}
    </>
  );
}
