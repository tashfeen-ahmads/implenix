'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/admin/ui';
import { ConfirmDialog } from './ConfirmDialog';

export function ResumeSendingButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function clear() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/outreach/hold', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resume sending');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Resume sending
      </Button>
      <ConfirmDialog
        open={open}
        title="Resume outreach sending?"
        confirmLabel="Resume sending"
        busy={busy}
        onConfirm={clear}
        onClose={() => setOpen(false)}
      >
        <p>
          Do this after you have paused or fixed the campaign that caused the bounces or complaints. Rates are measured
          afresh from now, and sending stops again if they climb back over the limit.
        </p>
        {error ? <p role="alert" className="mt-3 text-red-300">{error}</p> : null}
      </ConfirmDialog>
    </>
  );
}
