'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/admin/ui';

type Totals = { checked: number; undeliverable: number; risky: number };

// Checks every unverified contact (in the current list, or all) before a
// campaign sends to them. Runs batch after batch while the page is open.
export function VerifyContactsButton({ listId, unverified }: { listId: string | null; unverified: number }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(unverified);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [error, setError] = useState('');
  const stop = useRef(false);

  async function run() {
    stop.current = false;
    setRunning(true);
    setError('');
    const sum: Totals = { checked: 0, undeliverable: 0, risky: 0 };
    try {
      for (;;) {
        const res = await fetch('/api/admin/outreach/contacts/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
        sum.checked += data.checked;
        sum.undeliverable += data.undeliverable;
        sum.risky += data.risky;
        setTotals({ ...sum });
        setLeft(data.remaining);
        if (!data.remaining || !data.checked || stop.current) break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setRunning(false);
      router.refresh();
    }
  }

  if (!left && !totals) return null;
  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      {running ? (
        <Button variant="secondary" onClick={() => (stop.current = true)}>
          <Loader2 size={14} className="animate-spin" aria-hidden /> Stop checking ({left.toLocaleString()} left)
        </Button>
      ) : left ? (
        <Button variant="secondary" onClick={run} title="Unchecked emails are verified before their first send anyway; checking now shows list quality up front.">
          <MailCheck size={14} aria-hidden /> Verify {left.toLocaleString()} unchecked email{left === 1 ? '' : 's'}
        </Button>
      ) : null}
      <p aria-live="polite" className="max-w-xs font-body text-xs text-white/60 sm:text-right">
        {error ? <span className="text-red-300">{error} </span> : null}
        {totals
          ? `${totals.checked.toLocaleString()} checked · ${totals.undeliverable.toLocaleString()} undeliverable (won't be emailed) · ${totals.risky.toLocaleString()} catch-all`
          : null}
      </p>
    </div>
  );
}
