'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as { dataLayer?: unknown[] }).dataLayer) {
      (window as { dataLayer?: unknown[] }).dataLayer!.push({
        event: 'app_error',
        digest: error.digest,
        message: error.message,
      });
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 grid-bg">
      <div className="max-w-xl w-full border border-brand-purple/20 bg-black p-10 flex flex-col gap-6">
        <Badge label="Something broke" variant="purple" />
        <h1 className="font-heading text-4xl md:text-5xl text-white leading-tight">
          We hit an unexpected error.
        </h1>
        <p className="text-white/75 font-body leading-relaxed">
          The team has been notified. Try reloading, or jump back to the home
          page.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-white/50 uppercase tracking-widest">
            ▸ ref · {error.digest}
          </p>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
          >
            <RefreshCw size={16} aria-hidden /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
          >
            Back to Implenix <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
