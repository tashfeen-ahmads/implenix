'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CLIENT_STAGES,
  SERVICES,
  STAGE_LABELS,
  type Client,
  type ClientStage,
  type TeamMember,
} from '@/lib/db/types';
import { Button, Card, Field, inputClass } from '@/components/admin/ui';
import { moveStage, updateClient } from './actions';

export function ClientControls({ client, team }: { client: Client; team: TeamMember[] }) {
  const router = useRouter();
  const [stage, setStage] = useState<ClientStage>(client.stage);
  const [owner, setOwner] = useState(client.owner_id ?? '');

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
  const [fields, setFields] = useState({
    phone: client.phone ?? '',
    company: client.company ?? '',
    website: client.website ?? '',
    service: client.service,
  });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const changeStage = async (to: ClientStage) => {
    const from = stage;
    setStage(to);
    try {
      await moveStage(client.id, from, to);
      setStatus(`Stage set to ${STAGE_LABELS[to]}.`);
      router.refresh();
    } catch {
      setStage(from);
      setStatus('Could not change the stage.');
    }
  };

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

  return (
    <>
      <Card title="Stage and owner">
        <div className="flex flex-col gap-4">
          <Field label="Pipeline stage" htmlFor="client-stage">
            <select
              id="client-stage"
              value={stage}
              onChange={(e) => changeStage(e.target.value as ClientStage)}
              className={inputClass}
            >
              {CLIENT_STAGES.map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
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
    </>
  );
}
