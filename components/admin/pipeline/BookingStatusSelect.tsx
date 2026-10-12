'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/admin/outreach/ConfirmDialog';
import { errorMessage, postJson } from '@/components/admin/outreach/shared';

const OPTIONS = [
  ['scheduled', 'Scheduled'],
  ['completed', 'Completed'],
  ['no_show', 'No-show'],
  ['cancelled', 'Cancelled'],
] as const;

const STAGE_NOTE: Record<string, string> = {
  no_show: 'Moved to No-show.',
  discovery_done: 'Moved to Discovery done.',
};

// Call outcome. Completed and no-show also move the deal (see
// /api/admin/bookings/[id]/status); a no-show can send a rebook email.
export function BookingStatusSelect({ bookingId, status, firstName }: { bookingId: string; status: string; firstName: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async (next: string, sendRebook = false) => {
    const prev = value;
    setValue(next);
    setBusy(true);
    setMsg('');
    try {
      const res = await postJson<{ stage: string | null; rebook: string | null }>(`/api/admin/bookings/${bookingId}/status`, {
        status: next,
        sendRebook,
      });
      const notes = [res.stage ? STAGE_NOTE[res.stage] : '', res.rebook === 'sent' ? 'Rebook email sent.' : '', res.rebook === 'not_configured' ? 'Rebook email not sent: Resend is not set up.' : '', res.rebook === 'failed' ? 'Rebook email failed.' : '']
        .filter(Boolean)
        .join(' ');
      setMsg(notes);
      router.refresh();
    } catch (err) {
      setValue(prev);
      setMsg(errorMessage(err));
    } finally {
      setBusy(false);
      setAsking(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <label htmlFor={`bs-${bookingId}`} className="sr-only">Call status</label>
      <select
        id={`bs-${bookingId}`}
        value={value}
        disabled={busy}
        onChange={(e) => {
          const next = e.target.value;
          if (next === 'no_show') setAsking(true);
          else void save(next);
        }}
        className="bg-black border border-white/15 rounded-sm px-2 py-1 font-body text-xs text-white focus:outline-none focus:border-brand-cyan"
      >
        {OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <p aria-live="polite" className="font-body text-[11px] text-white/60 text-right max-w-[16rem]">{msg}</p>
      <ConfirmDialog
        open={asking}
        title="Mark as no-show"
        confirmLabel="Mark no-show and email"
        busy={busy}
        onConfirm={() => save('no_show', true)}
        onClose={() => {
          if (!busy) setAsking(false);
        }}
      >
        <p>
          {firstName} moves to No-show. Send them a short &ldquo;sorry we missed you&rdquo; email with a link to pick a new time?
        </p>
        <button
          type="button"
          onClick={() => save('no_show', false)}
          disabled={busy}
          className="mt-3 font-body text-sm text-brand-cyan hover:underline disabled:opacity-50"
        >
          Mark no-show without emailing
        </button>
      </ConfirmDialog>
    </div>
  );
}
