'use client';

import { Button } from '@/components/admin/ui';

// Dashboard-wide error state: keeps the sidebar, explains, offers a retry.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="max-w-lg border border-red-400/30 bg-red-500/[0.06] rounded-md p-6">
      <h1 className="font-heading text-xl text-white">This page could not load</h1>
      <p className="mt-2 font-body text-sm text-white/70 leading-relaxed">
        The database or a connected service did not respond. Your data is safe. Try again, and if it keeps
        happening, check the Supabase project status.
      </p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-white/45">Reference: {error.digest}</p> : null}
      <Button className="mt-5" onClick={reset}>Try again</Button>
    </div>
  );
}
