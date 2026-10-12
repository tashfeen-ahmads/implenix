'use client';

import Link from 'next/link';
import { AlarmClock, CalendarClock, Mail, MessageSquareText, RotateCcw } from 'lucide-react';
import { serviceLabel, type Client, type TeamMember } from '@/lib/db/types';
import {
  COLUMNS,
  PHASES,
  REPLY_LABELS,
  STALL_DAYS,
  canMoveTo,
  columnForClient,
  columnForContact,
} from '@/lib/pipeline/stages';
import { DASHBOARD_TZ } from '@/components/admin/ui';
import { daysSince, dealLabel, type ContactCard } from './data';

const fmtWhen = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: DASHBOARD_TZ });
const fmtDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: DASHBOARD_TZ });

export const initials = (m: TeamMember) =>
  (m.full_name ?? m.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

export type DragPayload = { kind: 'contact' | 'client'; id: string };

const cardClass = (dragging: boolean) =>
  `group rounded-sm border border-white/10 bg-black p-3 cursor-grab active:cursor-grabbing focus-within:border-white/25 ${
    dragging ? 'opacity-50' : ''
  }`;

function Owner({ member }: { member: TeamMember | undefined }) {
  if (!member) return null;
  const name = member.full_name ?? member.email;
  return (
    <span title={`Owner: ${name}`} className="shrink-0 w-6 h-6 rounded-full bg-brand-cyan/15 text-brand-cyan font-body text-[10px] font-semibold flex items-center justify-center">
      <span aria-hidden>{initials(member)}</span>
      <span className="sr-only">Owner: {name}</span>
    </span>
  );
}

function InStage({ iso, stallAfter }: { iso: string; stallAfter?: number }) {
  const d = daysSince(iso);
  const stalled = stallAfter !== undefined && d >= stallAfter;
  return (
    <span
      className={`font-mono text-[11px] tabular-nums ${stalled ? 'text-amber-300' : 'text-white/50'}`}
      title={stalled ? `Stalled: ${d} days in this stage` : `${d} days in this stage`}
    >
      {d === 0 ? 'today' : `${d}d`}
      {stalled ? <span className="sr-only"> (stalled)</span> : null}
    </span>
  );
}

// "Move to" menu: keyboard and touch alternative to drag and drop. Only
// columns a person may choose are listed, grouped by phase.
export function MoveSelect({
  kind,
  id,
  name,
  currentColumn,
  onMove,
}: {
  kind: 'contact' | 'client';
  id: string;
  name: string;
  currentColumn: string;
  onMove: (to: string) => void;
}) {
  return (
    <>
      <label htmlFor={`move-${id}`} className="sr-only">Move {name} to</label>
      <select
        id={`move-${id}`}
        value=""
        onChange={(e) => e.target.value && onMove(e.target.value)}
        className="mt-2.5 w-full bg-transparent border border-white/10 rounded-sm px-2 py-1 font-body text-xs text-white/75 focus:outline-none focus:border-brand-cyan"
      >
        <option value="">Move to…</option>
        {PHASES.map((p) => {
          const cols = COLUMNS.filter((c) => c.phase === p.id && c.id !== currentColumn && canMoveTo(kind, c));
          if (!cols.length) return null;
          return (
            <optgroup key={p.id} label={p.label}>
              {cols.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </>
  );
}

export function ContactCardView({
  c,
  owner,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  c: ContactCard;
  owner: TeamMember | undefined;
  dragging: boolean;
  onDragStart: (p: DragPayload, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: (to: string) => void;
}) {
  const person = [c.first_name, c.last_name].filter(Boolean).join(' ');
  const title = c.company || person || c.email;
  const column = columnForContact(c.stage);
  const seq = c.sequence;
  const label = c.reply_label ? REPLY_LABELS[c.reply_label] ?? c.reply_label : null;
  const revisitDue = c.revisit_at && new Date(c.revisit_at).getTime() <= Date.now();
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart({ kind: 'contact', id: c.id }, e)}
      onDragEnd={onDragEnd}
      className={cardClass(dragging)}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/outreach/inbox?tab=all&contact=${c.id}`} className="min-w-0 font-body text-sm font-medium text-white hover:underline truncate">
          {title}
        </Link>
        <Owner member={owner} />
      </div>
      <p className="font-body text-xs text-white/60 truncate">{person && c.company ? `${person}, ${c.email}` : c.email}</p>
      {seq ? (
        <p className="mt-2 flex items-center gap-1.5 font-body text-xs text-white/70 min-w-0">
          <Mail size={12} aria-hidden className="shrink-0 text-white/45" />
          <span className="truncate">{seq.name}</span>
          {seq.steps && seq.kind === 'sequence' ? (
            <span className="shrink-0 font-mono text-[11px] text-white/50 tabular-nums">
              {Math.min(seq.step, seq.steps)}/{seq.steps}
            </span>
          ) : null}
        </p>
      ) : null}
      {label ? (
        <p className="mt-1.5 flex items-center gap-1.5 font-body text-xs text-[#e3a6ff]">
          <MessageSquareText size={12} aria-hidden /> {label}
        </p>
      ) : null}
      {c.stage === 'nurture' && c.revisit_at ? (
        <p className={`mt-1.5 flex items-center gap-1.5 font-body text-xs ${revisitDue ? 'text-amber-300' : 'text-white/65'}`}>
          <RotateCcw size={12} aria-hidden /> {revisitDue ? 'Check back now' : `Check back ${fmtDay.format(new Date(c.revisit_at))}`}
        </p>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-body text-[11px] text-white/50 truncate">{c.industry || c.city || ''}</span>
        <InStage iso={c.stage_changed_at} />
      </div>
      <MoveSelect kind="contact" id={c.id} name={title} currentColumn={column?.id ?? ''} onMove={onMove} />
    </li>
  );
}

export function ClientCardView({
  c,
  owner,
  nextCall,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  c: Client;
  owner: TeamMember | undefined;
  nextCall: string | undefined;
  dragging: boolean;
  onDragStart: (p: DragPayload, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: (to: string) => void;
}) {
  const name = [c.first_name, c.last_name].filter(Boolean).join(' ');
  const column = columnForClient(c.stage);
  const deal = dealLabel(c);
  const due = c.next_step_at ? new Date(c.next_step_at).getTime() <= Date.now() : false;
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart({ kind: 'client', id: c.id }, e)}
      onDragEnd={onDragEnd}
      className={cardClass(dragging)}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/clients/${c.id}`} className="min-w-0 font-body text-sm font-medium text-white hover:underline truncate">
          {name}
        </Link>
        <Owner member={owner} />
      </div>
      <p className="font-body text-xs text-white/60 truncate">{c.company || c.website || c.email}</p>
      <p className="mt-2 font-body text-xs font-medium text-[#e3a6ff]">{serviceLabel(c.service)}</p>
      {deal ? <p className="mt-1 font-mono text-[11px] text-white/80 tabular-nums">{deal}</p> : null}
      {nextCall ? (
        <p className="mt-1.5 flex items-center gap-1 font-body text-xs text-brand-cyan">
          <CalendarClock size={12} aria-hidden /> {fmtWhen.format(new Date(nextCall))}
        </p>
      ) : null}
      {c.next_step_at || c.next_step ? (
        <p className={`mt-1.5 flex items-start gap-1 font-body text-xs ${due ? 'text-amber-300' : 'text-white/65'}`}>
          <AlarmClock size={12} aria-hidden className="mt-0.5 shrink-0" />
          <span className="min-w-0">
            {c.next_step || 'Follow up'}
            {c.next_step_at ? <span className="text-white/50">{due ? ' (due)' : `, ${fmtDay.format(new Date(c.next_step_at))}`}</span> : null}
          </span>
        </p>
      ) : null}
      <div className="mt-2 flex items-center justify-end">
        <InStage iso={c.stage_changed_at} stallAfter={STALL_DAYS[c.stage]} />
      </div>
      <MoveSelect kind="client" id={c.id} name={name} currentColumn={column?.id ?? ''} onMove={onMove} />
    </li>
  );
}
