'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MailCheck, Pause, Play } from 'lucide-react';
import { Button } from '@/components/admin/ui';

type Progress = { pending: number; unverified: number; found: number; verified: number; sendable: number; done: boolean };

const VERIFIER_TEXT: Record<string, string> = {
  basic: 'Basic check (syntax and mail servers). Connect the built-in verifier (Setup page) to confirm each mailbox.',
  builtin: 'Mailboxes verified with the built-in verifier.',
  smtp: 'Mailboxes verified with the built-in verifier.',
  millionverifier: 'Mailboxes verified with MillionVerifier.',
  zerobounce: 'Mailboxes verified with ZeroBounce.',
};

// Runs the email layer for this search while the page is open: crawl each
// business website for an email, fall back to the finder API, then verify.
// The cron carries on in the background when nobody is watching.
export function EmailLayer({ searchId, total, initial }: { searchId: string; total: number; initial: Progress }) {
  const router = useRouter();
  const [p, setP] = useState<Progress>(initial);
  const [running, setRunning] = useState(!initial.done);
  const [meta, setMeta] = useState<{ finder: string | null; verifier: string } | null>(null);
  const [error, setError] = useState('');
  const busy = useRef(false);

  const step = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const res = await fetch(`/api/admin/leads/searches/${searchId}/enrich`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setP(data.progress);
      setMeta({ finder: data.finder, verifier: data.verifier });
      setError('');
      router.refresh();
      if (data.progress.done) setRunning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email search failed');
      setRunning(false);
    } finally {
      busy.current = false;
    }
  }, [searchId, router]);

  useEffect(() => {
    if (!running) return;
    void step();
    const t = setInterval(() => void step(), 3_000);
    return () => clearInterval(t);
  }, [running, step]);

  // Know the verifier name even when there's nothing left to do.
  useEffect(() => {
    if (meta) return;
    fetch(`/api/admin/leads/searches/${searchId}/enrich?peek=1`, { method: 'POST' })
      .then((r) => r.json())
      .then((d) => d.verifier && setMeta({ finder: d.finder, verifier: d.verifier }))
      .catch(() => undefined);
  }, [meta, searchId]);

  const checked = total - p.pending;
  const pct = total ? Math.round((checked / total) * 100) : 100;

  return (
    <section aria-label="Email finding and verification" className="mb-6 border border-white/10 rounded-md bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-body text-sm text-white">
          {running ? <Loader2 size={16} className="animate-spin text-brand-cyan" aria-hidden /> : <MailCheck size={16} className="text-emerald-300" aria-hidden />}
          {p.done ? 'Email search finished' : running ? 'Finding and verifying emails…' : 'Email search paused'}
        </div>
        {!p.done ? (
          <Button variant="secondary" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />} {running ? 'Pause' : 'Resume'}
          </Button>
        ) : null}
      </div>
      <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 font-body">
        <div>
          <dt className="text-xs text-white/55">Websites checked</dt>
          <dd className="font-mono text-sm text-white tabular-nums">{checked} / {total} <span className="text-white/50">({pct}%)</span></dd>
        </div>
        <div>
          <dt className="text-xs text-white/55">Emails found</dt>
          <dd className="font-mono text-sm text-white tabular-nums">{p.found}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/55">Verified</dt>
          <dd className="font-mono text-sm text-white tabular-nums">{p.verified}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/55">Ready to email</dt>
          <dd className="font-mono text-sm text-emerald-300 tabular-nums">{p.sendable}</dd>
        </div>
      </dl>
      <p aria-live="polite" className="mt-3 font-body text-xs text-white/55">
        {error ? <span className="text-red-300">{error} </span> : null}
        {meta ? VERIFIER_TEXT[meta.verifier] ?? `Verified with ${meta.verifier}.` : ''}
        {meta?.finder ? ` Websites without an email are looked up with ${meta.finder === 'hunter' ? 'Hunter' : 'Outscraper'}.` : ''}
        {' '}You can leave this page; the email search continues in the background.
      </p>
    </section>
  );
}
