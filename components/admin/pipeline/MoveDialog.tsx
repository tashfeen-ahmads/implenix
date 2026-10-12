'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/outreach/ConfirmDialog';
import { Field, inputClass } from '@/components/admin/ui';
import { LOST_REASONS, type Campaign, type LostReason } from '@/lib/db/types';

export type MoveOptions = {
  lostReason?: LostReason;
  nurtureCampaignId?: string | null;
  revisitAt?: string | null;
};

export type PendingMove = {
  kind: 'contact' | 'client';
  id: string;
  name: string;
  to: string;
  // Which extra input the move needs.
  ask: 'lost' | 'nurture' | 'unsubscribe';
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);

// Extra details some moves need before they run: a lost reason, nurture
// settings, or confirmation of a permanent opt-out.
export function MoveDialog({
  pending,
  busy,
  nurtureCampaigns,
  onConfirm,
  onClose,
}: {
  pending: PendingMove | null;
  busy: boolean;
  nurtureCampaigns: Pick<Campaign, 'id' | 'name' | 'status'>[];
  onConfirm: (opts: MoveOptions) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<LostReason | ''>('');
  const [campaignId, setCampaignId] = useState('');
  const [revisit, setRevisit] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pending) return;
    setReason('');
    setError('');
    setCampaignId(nurtureCampaigns.find((c) => c.status === 'active')?.id ?? '');
    setRevisit(ymd(new Date(Date.now() + 60 * 86_400_000)));
  }, [pending, nurtureCampaigns]);

  if (!pending) return null;

  const confirm = () => {
    if (pending.ask === 'lost') {
      if (!reason) {
        setError('Pick a reason.');
        return;
      }
      onConfirm({ lostReason: reason });
    } else if (pending.ask === 'nurture') {
      onConfirm({
        nurtureCampaignId: campaignId || null,
        revisitAt: revisit ? new Date(`${revisit}T14:00:00Z`).toISOString() : null,
      });
    } else {
      onConfirm({});
    }
  };

  const title =
    pending.ask === 'lost' ? `Mark ${pending.name} as lost` : pending.ask === 'nurture' ? `Move ${pending.name} to nurture` : `Unsubscribe ${pending.name}`;

  return (
    <ConfirmDialog
      open
      title={title}
      confirmLabel={pending.ask === 'lost' ? 'Mark as lost' : pending.ask === 'nurture' ? 'Move to nurture' : 'Unsubscribe'}
      confirmVariant={pending.ask === 'nurture' ? 'primary' : 'danger'}
      busy={busy}
      onConfirm={confirm}
      onClose={onClose}
    >
      {pending.ask === 'lost' ? (
        <Field label="Why was it lost?" htmlFor="lost-reason" hint="Shown in the funnel report so you can see where deals slip.">
          <select
            id="lost-reason"
            className={inputClass}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value as LostReason);
              setError('');
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'lost-reason-error' : undefined}
          >
            <option value="">Choose a reason…</option>
            {LOST_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>
      ) : pending.ask === 'nurture' ? (
        <div className="flex flex-col gap-4">
          <p>Their running sequences stop. They get occasional nurture emails, and the card shows when to check back.</p>
          <Field
            label="Nurture emails"
            htmlFor="nurture-campaign"
            hint={nurtureCampaigns.length ? 'Paused or draft nurture campaigns only send once activated.' : 'No nurture campaign yet. Create one under Campaigns to send emails; the check-back date is saved either way.'}
          >
            <select id="nurture-campaign" className={inputClass} value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
              <option value="">No emails, just the check-back date</option>
              {nurtureCampaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.status === 'active' ? '' : ` (${c.status})`}</option>
              ))}
            </select>
          </Field>
          <Field label="Check back on" htmlFor="nurture-revisit">
            <input
              id="nurture-revisit"
              type="date"
              className={inputClass}
              value={revisit}
              min={ymd(new Date())}
              onChange={(e) => setRevisit(e.target.value)}
            />
          </Field>
        </div>
      ) : (
        <p>
          The address goes on the suppression list and will never be emailed again by any campaign. This cannot be undone from the dashboard.
        </p>
      )}
      {error ? (
        <p id="lost-reason-error" role="alert" className="mt-2 font-body text-sm text-red-300">{error}</p>
      ) : null}
    </ConfirmDialog>
  );
}
