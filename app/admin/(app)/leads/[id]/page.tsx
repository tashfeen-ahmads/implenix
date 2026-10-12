import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import type { LeadResult, LeadSearch } from '@/lib/leads/types';
import { PageHeader } from '@/components/admin/ui';
import { SearchStatus } from '@/components/admin/leads/SearchStatus';
import { ResultsTable } from '@/components/admin/leads/ResultsTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lead search' };

export default async function LeadSearchPage({ params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: search } = await db.from('lead_searches').select('*').eq('id', params.id).maybeSingle();
  if (!search) notFound();
  const s = search as LeadSearch;
  const { data: results } = await db
    .from('lead_results')
    .select('id, search_id, name, category, email, emails, phone, website, address, city, state, postal_code, country, rating, reviews_count, place_id, maps_url, imported_contact_id, created_at')
    .eq('search_id', s.id)
    .order('reviews_count', { ascending: false, nullsFirst: false })
    .limit(2000);

  return (
    <>
      <Link href="/admin/leads" className="inline-flex items-center gap-1.5 mb-4 font-body text-xs text-white/60 hover:text-white">
        <ArrowLeft size={14} aria-hidden /> Lead finder
      </Link>
      <PageHeader title={`${s.query} · ${s.location}`} description={`${s.provider === 'apify' ? 'Apify' : 'Outscraper'} · up to ${s.max_results} businesses${s.find_emails ? ' · with website emails' : ''}`} />
      <SearchStatus search={s} />
      {s.status === 'succeeded' ? (
        <ResultsTable searchId={s.id} defaultListName={`${s.query} · ${s.location}`} results={(results ?? []) as LeadResult[]} />
      ) : null}
    </>
  );
}
