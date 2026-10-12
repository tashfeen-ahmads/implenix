'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LOST_REASONS,
  SERVICES,
  type Campaign,
  type Client,
  type ClientStage,
  type TeamMember,
} from '@/lib/db/types';
import { COLUMNS, COLUMN_BY_ID, PHASES, columnForClient } from '@/lib/pipeline/stages';
import { Button, Card, Field, inputClass } from '@/components/admin/ui';
import { errorMessage, postJson } from '@/components/admin/outreach/shared';
import { updateClient } from './actions';
import { MoveDialog, type MoveOptions, type PendingMove } from './MoveDialog';
import { formatMoney, firstYearValue } from './data';

const ymd = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export function ClientControls({
  client,
  team,
  nurtureCampaigns,
}: {
  client: Client;
  team: TeamMember[];
  nurtureCampaigns: Pick<Campaign, 'id' | 'name' | 'status'>[];
}) {
  const router = useRouter();
  const [stage, setStage] = useState<ClientStage>(client.stage);
  const [owner, setOwner] = useState(client.owner_id ?? '');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingMove | null>(null);
  const name = [client.first_name, client.last_name].filter(Boolean).join(' ');

  const changeOwner = async (to: string) => {
    const prev = owner;
    setOwner(to);
    try {
      await updateClient(client.id, { owner_id: to || null });
      const who = team.find((m) => m.user_id === to);
      setStatus(to ? `Assigned to ${who?.full_name ?? who?.email ?? 'teammate'}.` : 'Unassigned.');
      router.refresh();
    } catch {
      setOwner(prev);
      setStatus('Could not change the owner.');
    }
  };

  const move = async (to: ClientStage, opts: MoveOptions = {}) => {
    const col = columnForClient(to)!;
    const from = stage;
    setStage(to);
    setBusy(true);
    try {
      const res = await postJson<{ nurture?: { enrolled: boolean; reason?: string } | null }>('/api/admin/pipeline/move', {
        kind: 'client',
        id: client.id,
        to: col.id,
        ...opts,
      });
      const extra = res.nurture ? (res.nurture.enrolled ? ' Enrolled in nurture emails.' : res.nurture.reason ? ` ${res.nurture.reason}` : '') : '';
      setStatus(`Stage set to ${col.label}.${extra}`);
      setPending(null);
      router.refresh();
    } catch (err) {
      setStage(from);
      setPending(null);
      setStatus(`Could not change the stage: ${errorMessage(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const changeStage = (to: ClientStage) => {
    if (to === stage) return;
    const col = columnForClient(to)!;
    if (to === 'lost') return setPending({ kind: 'client', id: client.id, name, to: col.id, ask: 'lost' });
    if (to === 'nurture') return setPending({ kind: 'client', id: client.id, name, to: col.id, ask: 'nurture' });
    void move(to);
  };

  // ── Details ─────────────────────────────────────────────────────
  const [fields, setFields] = useState({
    phone: client.phone ?? '',
    company: client.company ?? '',
    website: client.website ?? '',
    service: client.service,
  });
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const changed = Object.fromEntries(
      Object.entries(fields).filter(([k, v]) => (client[k as keyof Client] ?? '') !== v).map(([k, v]) => [k, v || null]),
    );
    if (Object.keys(changed).length === 0) return setStatus('Nothing to save.');
    setBusy(true);
    try {
      await updateClient(client.id, changed);
      setStatus('Saved.');
      router.refresh();
    } catch {
      setStatus('Could not save.');
    } finally {
      setBusy(false);
    }
  };

  // ── Deal ────────────────────────────────────────────────────────
  const [deal, setDeal] = useState({
    setup_fee: client.setup_fee?.toString() ?? '',
    monthly_value: client.monthly_value?.toString() ?? '',
    next_step: client.next_step ?? '',
    next_step_at: ymd(client.next_step_at),
    lost_reason: client.lost_reason ?? '',
  });
  const dealProblem =
    [deal.setup_fee, deal.monthly_value].some((v) => v !== '' && !(Number(v) >= 0)) ? 'Amounts must be zero or more.' : '';
  const saveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dealProblem) return setStatus(dealProblem);
    const next: Record<string, string | null> = {
      setup_fee: deal.setup_fee === '' ? null : String(Number(deal.setup_fee)),
      monthly_value: deal.monthly_value === '' ? null : String(Number(deal.monthly_value)),
      next_step: deal.next_step.trim() || null,
      next_step_at: deal.next_step_at ? new Date(`${deal.next_step_at}T14:00:00Z`).toISOString() : null,
      ...(stage === 'lost' ? { lost_reason: deal.lost_reason || null } : {}),
    };
    const current: Record<string, string | null> = {
      setup_fee: client.setup_fee === null ? null : String(Number(client.setup_fee)),
      monthly_value: client.monthly_value === null ? null : String(Number(client.monthly_value)),
      next_step: client.next_step,
      next_step_at: client.next_step_at ? new Date(client.next_step_at).toISOString() : null,
      lost_reason: client.lost_reason,
    };
    const changed = Object.fromEntries(Object.entries(next).filter(([k, v]) => current[k] !== v));
    if (Object.keys(changed).length === 0) return setStatus('Nothing to save.');
    setBusy(true);
    try {
      await updateClient(client.id, changed);
      setStatus('Deal saved.');
      router.refresh();
    } catch {
      setStatus('Could not save the deal.');
    } finally {
      setBusy(false);
    }
  };
  const fy = firstYearValue({
    setup_fee: deal.setup_fee === '' ? null : Number(deal.setup_fee) || 0,
    monthly_value: deal.monthly_value === '' ? null : Number(deal.monthly_value) || 0,
  });

  return (
    <>
      <Card title="Stage and owner">
        <div className="flex flex-col gap-4">
          <Field label="Pipeline stage" htmlFor="client-stage" hint={columnForClient(stage)?.hint}>
            <select
              id="client-stage"
              value={stage}
              disabled={busy}
              onChange={(e) => changeStage(e.target.value as ClientStage)}
              className={inputClass}
            >
              {PHASES.filter((p) => p.id !== 'outreach').map((p) => (
                <optgroup key={p.id} label={p.label}>
                  {COLUMNS.filter((c) => c.phase === p.id && c.clientStage).map((c) => (
                    <option key={c.id} value={c.clientStage}>{c.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Owner" htmlFor="client-owner" hint="The teammate responsible for this client.">
            <select id="client-owner" value={owner} onChange={(e) => changeOwner(e.target.value)} className={inputClass}>
              <option value="">Unassigned</option>
              {team.map((m) => (
                <option key={m.user_id} value={m.user_id}>{m.full_name ?? m.email}</option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Deal and next step">
        <form onSubmit={saveDeal} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Setup fee ($)" htmlFor="deal-setup">
              <input
                id="deal-setup"
                type="number"
                min={0}
                step="1"
                inputMode="decimal"
                value={deal.setup_fee}
                onChange={(e) => setDeal({ ...deal, setup_fee: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Monthly ($)" htmlFor="deal-monthly">
              <input
                id="deal-monthly"
                type="number"
                min={0}
                step="1"
                inputMode="decimal"
                value={deal.monthly_value}
                onChange={(e) => setDeal({ ...deal, monthly_value: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
          <p className="-mt-2 font-body text-xs text-white/55">
            First-year value: <span className="font-mono tabular-nums text-white/80">{formatMoney(fy)}</span>. Internal only, never shown to clients.
          </p>
          <Field label="Next step" htmlFor="deal-next">
            <input
              id="deal-next"
              value={deal.next_step}
              placeholder="Send proposal, chase signature…"
              onChange={(e) => setDeal({ ...deal, next_step: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Due" htmlFor="deal-next-at" hint="Shows on the pipeline card and turns amber when due.">
            <input
              id="deal-next-at"
              type="date"
              value={deal.next_step_at}
              onChange={(e) => setDeal({ ...deal, next_step_at: e.target.value })}
              className={inputClass}
            />
          </Field>
          {stage === 'lost' ? (
            <Field label="Lost reason" htmlFor="deal-lost">
              <select id="deal-lost" value={deal.lost_reason} onChange={(e) => setDeal({ ...deal, lost_reason: e.target.value })} className={inputClass}>
                <option value="">Not set</option>
                {LOST_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
          ) : null}
          {dealProblem ? <p role="alert" className="font-body text-xs text-red-300">{dealProblem}</p> : null}
          <div>
            <Button type="submit" variant="secondary" disabled={busy}>{busy ? 'Saving…' : 'Save deal'}</Button>
          </div>
        </form>
      </Card>

      <Card title="Details">
        <form onSubmit={save} className="flex flex-col gap-4">
          <Field label="Service" htmlFor="cc-service">
            <select
              id="cc-service"
              value={fields.service}
              onChange={(e) => setFields({ ...fields, service: e.target.value })}
              className={inputClass}
            >
              {SERVICES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Company" htmlFor="cc-company">
            <input id="cc-company" value={fields.company} onChange={(e) => setFields({ ...fields, company: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Phone" htmlFor="cc-phone">
            <input id="cc-phone" type="tel" value={fields.phone} onChange={(e) => setFields({ ...fields, phone: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Website" htmlFor="cc-website">
            <input id="cc-website" spellCheck={false} value={fields.website} onChange={(e) => setFields({ ...fields, website: e.target.value })} className={inputClass} />
          </Field>
          <div>
            <Button type="submit" variant="secondary" disabled={busy}>{busy ? 'Saving…' : 'Save details'}</Button>
          </div>
        </form>
      </Card>
      <p role="status" aria-live="polite" className="font-body text-xs text-white/60 min-h-4">{status}</p>

      <MoveDialog
        pending={pending}
        busy={busy}
        nurtureCampaigns={nurtureCampaigns}
        onConfirm={(opts) => {
          const to = pending ? COLUMN_BY_ID.get(pending.to)?.clientStage : undefined;
          if (to) void move(to, opts);
        }}
        onClose={() => {
          if (!busy) setPending(null);
        }}
      />
    </>
  );
}
