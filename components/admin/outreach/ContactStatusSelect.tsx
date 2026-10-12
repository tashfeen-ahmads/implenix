'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ContactStatus } from '@/lib/db/types';
import { inputClass } from '@/components/admin/ui';
import { CONTACT_STATUSES, CONTACT_STATUS_LABELS, errorMessage, postJson } from './shared';

// Row action: change a contact's status through the engine endpoint (which
// also writes a suppression when the new status is unsubscribed).
export function ContactStatusSelect({
  contactId,
  email,
  status,
}: {
  contactId: string;
  email: string;
  status: ContactStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<ContactStatus>(status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const change = async (next: ContactStatus) => {
    if (next === value) return;
    if (
      (next === 'unsubscribed' || next === 'complained') &&
      !window.confirm(`Mark ${email} as ${CONTACT_STATUS_LABELS[next].toLowerCase()}? They will never be emailed again.`)
    ) {
      return;
    }
    const prev = value;
    setValue(next);
    setBusy(true);
    setMsg('');
    try {
      await postJson(`/api/admin/outreach/contacts/${contactId}/status`, { status: next });
      setMsg('Saved');
      router.refresh();
    } catch (err) {
      setValue(prev);
      setMsg(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 min-w-[10rem]">
      <label htmlFor={`status-${contactId}`} className="sr-only">
        Status for {email}
      </label>
      <select
        id={`status-${contactId}`}
        className={`${inputClass} py-1.5`}
        value={value}
        disabled={busy}
        onChange={(e) => change(e.target.value as ContactStatus)}
      >
        {CONTACT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {CONTACT_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <span aria-live="polite" className={`font-body text-[11px] ${msg && msg !== 'Saved' ? 'text-red-300' : 'text-white/50'}`}>
        {msg}
      </span>
    </div>
  );
}
