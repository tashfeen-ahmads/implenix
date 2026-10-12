'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { LeadSearch } from '@/lib/leads/types';

// While a search runs, asks the server to check the provider every 15s and
// refreshes the page once results are in.
export function SearchStatus({ search }: { search: LeadSearch }) {
  const router = useRouter();
  const busy = useRef(false);

  useEffect(() => {
    if (search.status !== 'running') return;
    const tick = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const res = await fetch(`/api/admin/leads/searches/${search.id}/sync`, { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (data.search && data.search.status !== 'running') router.refresh();
      } finally {
        busy.current = false;
      }
    };
    tick();
    const t = setInterval(tick, 15_000);
    return () => clearInterval(t);
  }, [search.id, search.status, router]);

  if (search.status === 'running') {
    return (
      <p role="status" className="flex items-center gap-2 border border-amber-400/30 bg-amber-500/10 rounded-md px-4 py-3 font-body text-sm text-amber-200">
        <Loader2 size={16} className="animate-spin" aria-hidden />
        Searching. This usually takes 2-10 minutes depending on size; you can leave this page and come back.
      </p>
    );
  }
  if (search.status === 'failed') {
    return (
      <p role="alert" className="border border-red-400/30 bg-red-500/10 rounded-md px-4 py-3 font-body text-sm text-red-200">
        The search failed: {search.error ?? 'unknown error'}
      </p>
    );
  }
  return null;
}
