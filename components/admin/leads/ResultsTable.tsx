'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Star } from 'lucide-react';
import type { LeadResult } from '@/lib/leads/types';
import { Button, Stat, TableWrap, inputClass, tdClass, thClass } from '@/components/admin/ui';

const href = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

// Sendable: has an email that verification hasn't ruled out. Unverified
// emails are verified during import.
const sendable = (r: LeadResult, includeRisky: boolean) =>
  Boolean(r.email) && r.email_verdict !== 'undeliverable' && (includeRisky || r.email_verdict !== 'risky');

const SOURCE: Record<string, string> = { provider: 'from listing', website: 'from website', hunter: 'via Hunter', outscraper: 'via Outscraper' };

function EmailState({ r }: { r: LeadResult }) {
  if (!r.email) {
    const text = r.email_status === 'pending' ? 'Searching website…' : r.email_status === 'no_website' ? 'No website' : 'No email on website';
    return <span className="text-white/45">{text}</span>;
  }
  const v = r.email_verdict;
  const reason = r.email_verdict_reason ?? '';
  const [label, cls] =
    v === 'deliverable'
      ? ['Verified', 'border-emerald-400/40 text-emerald-300']
      : v === 'risky'
        ? ['Catch-all', 'border-amber-400/40 text-amber-300']
        : v === 'undeliverable'
          ? ['Undeliverable', 'border-red-400/40 text-red-300']
          : v === 'unknown'
            ? [reason.startsWith('mx_ok') ? 'Domain OK' : 'Unconfirmed', 'border-white/20 text-white/70']
            : ['Not verified yet', 'border-white/10 text-white/50'];
  return (
    <>
      <span className={`break-all ${v === 'undeliverable' ? 'line-through text-white/50' : ''}`}>{r.email}</span>
      <span className="mt-1 flex flex-wrap items-center gap-1.5">
        <span title={reason || undefined} className={`px-1.5 rounded-sm border font-body text-[10px] leading-4 ${cls}`}>{label}</span>
        {r.email_source ? <span className="text-[10px] text-white/45">{SOURCE[r.email_source] ?? r.email_source}</span> : null}
      </span>
    </>
  );
}

export function ResultsTable({
  searchId,
  defaultListName,
  results,
}: {
  searchId: string;
  defaultListName: string;
  results: LeadResult[];
}) {
  const router = useRouter();
  const [onlyEmail, setOnlyEmail] = useState(true);
  const [includeRisky, setIncludeRisky] = useState(false);
  const [hideImported, setHideImported] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [listName, setListName] = useState(defaultListName);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string; listId?: string } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return results.filter(
      (r) =>
        (!onlyEmail || sendable(r, includeRisky)) &&
        (!hideImported || !r.imported_contact_id) &&
        (r.rating ?? 0) >= minRating &&
        (!q || [r.name, r.city, r.category, r.email].filter(Boolean).some((v) => v!.toLowerCase().includes(q))),
    );
  }, [results, onlyEmail, includeRisky, hideImported, minRating, query]);

  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected((cur) => {
      const next = new Set(cur);
      visible.forEach((r) => (allVisibleSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  const toggle = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedWithEmail = results.filter((r) => selected.has(r.id) && sendable(r, includeRisky)).length;

  const importSelected = async () => {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/admin/leads/searches/${searchId}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultIds: [...selected], listName, includeRisky }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage({ ok: false, text: data.error ?? 'Import failed.' });
    setSelected(new Set());
    setMessage({
      ok: true,
      listId: data.listId,
      text: `Imported ${data.inserted} new and ${data.updated} existing contacts${
        data.skippedSuppressed ? `, skipped ${data.skippedSuppressed} unsubscribed or bounced` : ''
      }${data.skippedNoEmail ? `, ${data.skippedNoEmail} had no email` : ''}${
        data.skippedUnsendable ? `, ${data.skippedUnsendable} failed verification` : ''
      }.`,
    });
    router.refresh();
  };

  const withEmail = results.filter((r) => r.email).length;
  const ready = results.filter((r) => sendable(r, false) && r.verified_at).length;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Businesses found" value={results.length} />
        <Stat label="With email" value={withEmail} hint={results.length ? `${Math.round((withEmail / results.length) * 100)}% hit rate` : undefined} />
        <Stat label="Ready to email" value={ready} hint="Email found and verified" />
        <Stat label="Imported" value={results.filter((r) => r.imported_contact_id).length} />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label htmlFor="lr-search" className="sr-only">Filter results</label>
          <input id="lr-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name, city, email…" className={`${inputClass} w-full sm:w-56`} />
          <label className="flex items-center gap-2 font-body text-sm text-white/80">
            <input type="checkbox" checked={onlyEmail} onChange={(e) => setOnlyEmail(e.target.checked)} className="accent-[#c600ff]" /> Sendable email only
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-white/80" title="Catch-all domains accept every address, so the mailbox can't be confirmed. Higher bounce risk.">
            <input type="checkbox" checked={includeRisky} onChange={(e) => setIncludeRisky(e.target.checked)} className="accent-[#c600ff]" /> Include catch-all
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-white/80">
            <input type="checkbox" checked={hideImported} onChange={(e) => setHideImported(e.target.checked)} className="accent-[#c600ff]" /> Hide imported
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-white/80 whitespace-nowrap">
            Min rating
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="bg-black border border-white/15 rounded-sm px-2 py-1 text-sm text-white">
              {[0, 3, 3.5, 4, 4.5].map((v) => (
                <option key={v} value={v}>{v === 0 ? 'Any' : `${v}+`}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="sm:w-64">
            <label htmlFor="lr-list" className="block mb-1.5 font-body text-xs font-medium text-white/80">Import into new list</label>
            <input id="lr-list" value={listName} onChange={(e) => setListName(e.target.value)} className={inputClass} />
          </div>
          <Button onClick={importSelected} disabled={busy || selectedWithEmail === 0 || !listName.trim()} className="whitespace-nowrap">
            {busy ? 'Importing…' : selectedWithEmail === 0 ? 'Select businesses to import' : `Import ${selectedWithEmail} ${selectedWithEmail === 1 ? 'contact' : 'contacts'}`}
          </Button>
        </div>
      </div>
      <div aria-live="polite">
        {message ? (
          <p className={`mb-4 font-body text-sm ${message.ok ? 'text-emerald-300' : 'text-red-300'}`}>
            {message.text}{' '}
            {message.ok && message.listId ? (
              <Link href={`/admin/outreach/contacts?list=${message.listId}`} className="text-brand-cyan hover:underline">
                View list
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>

      <TableWrap label="Businesses found">
        <thead>
          <tr>
            <th className={thClass}>
              <input type="checkbox" aria-label="Select all shown" checked={allVisibleSelected} onChange={toggleAll} className="accent-[#c600ff]" />
            </th>
            <th className={thClass}>Business</th>
            <th className={thClass}>Email</th>
            <th className={thClass}>Phone</th>
            <th className={thClass}>Rating</th>
            <th className={thClass}>Location</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <tr key={r.id} className={selected.has(r.id) ? 'bg-brand-purple/10' : ''}>
              <td className={tdClass}>
                <input type="checkbox" aria-label={`Select ${r.name}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="accent-[#c600ff]" />
              </td>
              <td className={tdClass}>
                <p className="text-white">{r.name}</p>
                <p className="text-xs text-white/50">{r.category}</p>
                {r.website ? (
                  <a href={href(r.website)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:underline break-all">
                    {r.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} <ExternalLink size={10} aria-hidden />
                  </a>
                ) : null}
              </td>
              <td className={tdClass}>
                <EmailState r={r} />
                {r.emails.length > 1 ? <p className="text-xs text-white/50">+{r.emails.length - 1} more</p> : null}
                {r.imported_contact_id ? <p className="text-xs text-emerald-300">Imported</p> : null}
              </td>
              <td className={`${tdClass} whitespace-nowrap`}>{r.phone ?? '—'}</td>
              <td className={`${tdClass} whitespace-nowrap`}>
                {r.rating != null ? (
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} className="text-amber-300" aria-hidden /> {r.rating}
                    <span className="text-xs text-white/50">({r.reviews_count ?? 0})</span>
                  </span>
                ) : '—'}
              </td>
              <td className={tdClass}>{[r.city, r.state].filter(Boolean).join(', ') || r.address || '—'}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      {visible.length === 0 ? (
        <p className="mt-4 font-body text-sm text-white/60">No businesses match these filters.</p>
      ) : null}
    </>
  );
}
