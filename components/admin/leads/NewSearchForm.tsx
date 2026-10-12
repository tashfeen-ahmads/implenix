'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, inputClass } from '@/components/admin/ui';

// Rough per-place costs, for a ballpark before running. Check the
// provider's current price list; free allowances are not subtracted.
// DataForSEO Maps: about $0.0006 per 100 results (standard queue).
const COST = {
  apify: { place: 0.004, email: 0.002, run: 0.007 },
  outscraper: { place: 0.003, email: 0.003, run: 0 },
  dataforseo: { place: 0.000006, email: 0, run: 0.0006 },
} as const;

export function NewSearchForm({ providers }: { providers: { value: string; label: string }[] }) {
  const router = useRouter();
  const [provider, setProvider] = useState(providers[0]?.value ?? 'apify');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [max, setMax] = useState(100);
  const [findEmails, setFindEmails] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (providers.length === 0) {
    return (
      <p className="font-body text-sm text-white/70 leading-relaxed">
        No provider connected. Set <code className="text-brand-cyan">DATAFORSEO_LOGIN</code> and{' '}
        <code className="text-brand-cyan">DATAFORSEO_PASSWORD</code>, <code className="text-brand-cyan">APIFY_TOKEN</code> or{' '}
        <code className="text-brand-cyan">OUTSCRAPER_API_KEY</code> (see docs/LEAD_FINDER.md), then reload.
      </p>
    );
  }

  const c = COST[provider as keyof typeof COST] ?? COST.apify;
  const hasEmailAddon = provider !== 'dataforseo';
  const estimate = c.run * (provider === 'dataforseo' ? Math.ceil(max / 100) : 1) + max * (c.place + (findEmails && hasEmailAddon ? c.email : 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/admin/leads/searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, query, location, maxResults: max, findEmails: hasEmailAddon && findEmails }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? 'Could not start the search.');
    router.push(`/admin/leads/${data.search.id}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Business type" htmlFor="ls-query" hint="What you would type into Google Maps.">
        <input id="ls-query" required minLength={2} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="hvac contractor" className={inputClass} />
      </Field>
      <Field label="Location" htmlFor="ls-location" hint="City and state, a ZIP code, or a county.">
        <input id="ls-location" required minLength={2} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Columbus, OH" className={inputClass} />
      </Field>
      <Field label="Max businesses" htmlFor="ls-max">
        <input id="ls-max" type="number" min={1} max={2000} value={max} onChange={(e) => setMax(Math.min(2000, Math.max(1, Number(e.target.value) || 1)))} className={inputClass} />
      </Field>
      {providers.length > 1 ? (
        <Field label="Provider" htmlFor="ls-provider">
          <select id="ls-provider" value={provider} onChange={(e) => setProvider(e.target.value)} className={inputClass}>
            {providers.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>
      ) : null}
      {hasEmailAddon ? (
        <label className="flex items-start gap-2.5 font-body text-sm text-white/85">
          <input type="checkbox" checked={findEmails} onChange={(e) => setFindEmails(e.target.checked)} className="mt-0.5 accent-[#c600ff]" />
          <span>
            Also use the provider&rsquo;s paid email add-on
            <span className="block text-xs text-white/55">Optional. Our own website email search and verification run on every search either way, free.</span>
          </span>
        </label>
      ) : (
        <p className="font-body text-xs text-white/60">
          DataForSEO returns websites, not emails. Our email search visits each website for an address and verifies it.
        </p>
      )}
      <p className="font-body text-xs text-white/60">
        Estimated cost: about <span className="text-white">${estimate.toFixed(2)}</span> before any free allowance. Searches take a few minutes.
      </p>
      {error ? <p role="alert" className="font-body text-sm text-red-300">{error}</p> : null}
      <Button type="submit" disabled={busy}>{busy ? 'Starting…' : 'Find businesses'}</Button>
    </form>
  );
}
