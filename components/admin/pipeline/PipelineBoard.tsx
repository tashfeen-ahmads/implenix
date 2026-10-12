'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Search } from 'lucide-react';
import {
  CLIENT_STAGES,
  SERVICES,
  STAGE_LABELS,
  serviceLabel,
  type Client,
  type ClientStage,
  type TeamMember,
} from '@/lib/db/types';
import { DASHBOARD_TZ, inputClass } from '@/components/admin/ui';
import { moveStage } from './actions';

const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: DASHBOARD_TZ });

const initials = (m: TeamMember) =>
  (m.full_name ?? m.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

export function PipelineBoard({
  clients,
  nextCall,
  team,
  meId,
}: {
  clients: Client[];
  nextCall: Record<string, string>;
  team: TeamMember[];
  meId: string | null;
}) {
  const [owner, setOwner] = useState('');
  const byId = useMemo(() => new Map(team.map((m) => [m.user_id, m])), [team]);
  const router = useRouter();
  const [items, setItems] = useState(clients);
  const [query, setQuery] = useState('');
  const [service, setService] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<ClientStage | null>(null);
  const [status, setStatus] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (c) =>
        (!service || c.service === service) &&
        (!owner || (owner === 'none' ? !c.owner_id : c.owner_id === owner)) &&
        (!q ||
          [c.first_name, c.last_name, c.email, c.company, c.website]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(q))),
    );
  }, [items, query, service, owner]);

  const move = async (id: string, to: ClientStage) => {
    const client = items.find((c) => c.id === id);
    if (!client || client.stage === to) return;
    const from = client.stage;
    setItems((list) => list.map((c) => (c.id === id ? { ...c, stage: to } : c)));
    try {
      await moveStage(id, from, to);
      setStatus(`${client.first_name} moved to ${STAGE_LABELS[to]}.`);
      router.refresh();
    } catch {
      setItems((list) => list.map((c) => (c.id === id ? { ...c, stage: from } : c)));
      setStatus(`Could not move ${client.first_name}. Try again.`);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative sm:w-72">
          <Search size={14} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
          <label htmlFor="pipe-search" className="sr-only">Search clients</label>
          <input
            id="pipe-search"
            type="search"
            placeholder="Search name, email, company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputClass} pl-8`}
          />
        </div>
        <label htmlFor="pipe-service" className="sr-only">Filter by service</label>
        <select id="pipe-service" value={service} onChange={(e) => setService(e.target.value)} className={`${inputClass} sm:w-60`}>
          <option value="">All services</option>
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <label htmlFor="pipe-owner" className="sr-only">Filter by owner</label>
        <select id="pipe-owner" value={owner} onChange={(e) => setOwner(e.target.value)} className={`${inputClass} sm:w-48`}>
          <option value="">Everyone</option>
          {meId ? <option value={meId}>Mine</option> : null}
          {team.filter((m) => m.user_id !== meId).map((m) => (
            <option key={m.user_id} value={m.user_id}>{m.full_name ?? m.email}</option>
          ))}
          <option value="none">Unassigned</option>
        </select>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{status}</p>

      <div className="relative flex gap-3 overflow-x-auto pb-4 snap-x scroll-px-0">
        {CLIENT_STAGES.map((stage) => {
          const cards = visible.filter((c) => c.stage === stage);
          return (
            <section
              key={stage}
              aria-label={`${STAGE_LABELS[stage]}, ${cards.length} clients`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setOverStage(stage);
              }}
              onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                const id = dragId ?? e.dataTransfer.getData('text/plain');
                if (id) move(id, stage);
                setDragId(null);
                setOverStage(null);
              }}
              className={`snap-start shrink-0 w-[272px] rounded-md border bg-white/[0.02] flex flex-col max-h-[calc(100vh-220px)] ${
                overStage === stage ? 'border-brand-cyan' : 'border-white/10'
              }`}
            >
              <header className="flex items-center justify-between px-3.5 py-3 border-b border-white/10">
                <h2 className="font-body text-sm font-semibold text-white">{STAGE_LABELS[stage]}</h2>
                <span className="font-mono text-xs text-white/60 tabular-nums">{cards.length}</span>
              </header>
              <ul className="relative flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-24">
                {cards.map((c) => (
                  <li
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      // Firefox only starts a drag when data is attached.
                      e.dataTransfer.setData('text/plain', c.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDragId(c.id);
                    }}
                    onDragEnd={() => setDragId(null)}
                    className={`rounded-sm border border-white/10 bg-black p-3 cursor-grab active:cursor-grabbing ${
                      dragId === c.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/admin/clients/${c.id}`} className="font-body text-sm font-medium text-white hover:underline">
                        {[c.first_name, c.last_name].filter(Boolean).join(' ')}
                      </Link>
                      {c.owner_id && byId.get(c.owner_id) ? (
                        <span
                          title={`Owner: ${byId.get(c.owner_id)!.full_name ?? byId.get(c.owner_id)!.email}`}
                          className="shrink-0 w-6 h-6 rounded-full bg-brand-cyan/15 text-brand-cyan font-body text-[10px] font-semibold flex items-center justify-center"
                        >
                          <span aria-hidden>{initials(byId.get(c.owner_id)!)}</span>
                          <span className="sr-only">Owner: {byId.get(c.owner_id)!.full_name ?? byId.get(c.owner_id)!.email}</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="font-body text-xs text-white/60 truncate">{c.company || c.website || c.email}</p>
                    <p className="mt-2 font-body text-xs font-medium text-[#e3a6ff]">{serviceLabel(c.service)}</p>
                    {nextCall[c.id] ? (
                      <p className="mt-1.5 flex items-center gap-1 font-body text-xs text-brand-cyan">
                        <CalendarClock size={12} aria-hidden /> {fmt.format(new Date(nextCall[c.id]))}
                      </p>
                    ) : null}
                    <label htmlFor={`move-${c.id}`} className="sr-only">
                      Move {c.first_name} to stage
                    </label>
                    <select
                      id={`move-${c.id}`}
                      value={c.stage}
                      onChange={(e) => move(c.id, e.target.value as ClientStage)}
                      className="mt-2.5 w-full bg-transparent border border-white/10 rounded-sm px-2 py-1 font-body text-xs text-white/75 focus:outline-none focus:border-brand-cyan"
                    >
                      {CLIENT_STAGES.map((s) => (
                        <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
