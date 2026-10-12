'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { REPLY_LABELS, contactStageLabel } from '@/lib/pipeline/stages';
import type { ContactStage } from '@/lib/db/types';
import { inputClass } from '@/components/admin/ui';
import { errorMessage, postJson } from './shared';

// Correct the AI's label for this conversation. The pipeline stage follows.
export function ReplyLabelSelect({ contactId, label }: { contactId: string; label: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(label ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const change = async (next: string) => {
    if (!next || next === value) return;
    if (next === 'unsubscribe' && !window.confirm('Unsubscribe this address? It will never be emailed again.')) return;
    const prev = value;
    setValue(next);
    setBusy(true);
    setMsg('');
    try {
      const res = await postJson<{ stage?: ContactStage }>(`/api/admin/outreach/contacts/${contactId}/label`, { label: next });
      setMsg(res.stage ? `Pipeline: ${contactStageLabel(res.stage)}` : 'Saved');
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
      <label htmlFor={`label-${contactId}`} className="font-body text-xs font-medium text-white/70">
        Reply label
      </label>
      <select
        id={`label-${contactId}`}
        className={`${inputClass} py-1.5`}
        value={value}
        disabled={busy}
        onChange={(e) => change(e.target.value)}
      >
        {value ? null : <option value="">Not labelled</option>}
        {Object.entries(REPLY_LABELS).map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </select>
      <span aria-live="polite" className="font-body text-[11px] text-white/55">{msg}</span>
    </div>
  );
}
