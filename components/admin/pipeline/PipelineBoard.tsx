'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsRightLeft, Columns3, Eye, EyeOff, List, Search } from 'lucide-react';
import { SERVICES, type Campaign, type Client, type ContactStage, type TeamMember } from '@/lib/db/types';
import {
  COLUMNS,
  COLUMN_BY_ID,
  PHASES,
  canMoveTo,
  columnForClient,
  columnForContact,
  type Column,
  type Phase,
} from '@/lib/pipeline/stages';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Stat, TableWrap, inputClass, tdClass, thClass } from '@/components/admin/ui';
import { errorMessage, postJson } from '@/components/admin/outreach/shared';
import { ClientCardView, ContactCardView, ScoreChip, type DragPayload } from './PipelineCards';
import { leadScore } from '@/lib/pipeline/score';
import { MoveDialog, type MoveOptions, type PendingMove } from './MoveDialog';
import {
  PAGE_SIZE,
  daysSince,
  dealLabel,
  firstYearValue,
  formatMoneyShort,
  loadContactCards,
  type ContactCard,
} from './data';

const LAYOUT_KEY = 'impx.pipeline.layout.v1';
type View = 'board' | 'list';
type Layout = { cols: string[]; phases: Phase[]; view: View };
const DEFAULT_LAYOUT: Layout = {
  cols: COLUMNS.filter((c) => c.collapsedByDefault).map((c) => c.id),
  phases: ['closed'],
  view: 'board',
};

function readLayout(): Layout {
  try {
    const raw = window.localStorage.getItem(LAYOUT_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const v = JSON.parse(raw) as Partial<Layout>;
    return {
      cols: Array.isArray(v.cols) ? v.cols.filter((c) => COLUMN_BY_ID.has(c)) : DEFAULT_LAYOUT.cols,
      phases: Array.isArray(v.phases) ? (v.phases.filter((p) => PHASES.some((x) => x.id === p)) as Phase[]) : DEFAULT_LAYOUT.phases,
      view: v.view === 'list' ? 'list' : 'board',
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function writeLayout(l: Layout) {
  try {
    window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(l));
  } catch {
    // Storage blocked; the layout just isn't remembered.
  }
}

const BULK = '__bulk__';
const OPEN_SALES = new Set(['new', 'call_booked', 'no_show', 'discovery_done', 'proposal_sent', 'negotiation']);

export function PipelineBoard({
  clients,
  contacts,
  contactCounts,
  nextCall,
  team,
  meId,
  nurtureCampaigns,
}: {
  clients: Client[];
  contacts: ContactCard[];
  contactCounts: Record<string, number>;
  nextCall: Record<string, string>;
  team: TeamMember[];
  meId: string | null;
  nurtureCampaigns: Pick<Campaign, 'id' | 'name' | 'status'>[];
}) {
  const router = useRouter();
  const byId = useMemo(() => new Map(team.map((m) => [m.user_id, m])), [team]);

  const [clientItems, setClientItems] = useState(clients);
  const [contactItems, setContactItems] = useState(contacts);
  const [counts, setCounts] = useState(contactCounts);
  useEffect(() => setClientItems(clients), [clients]);
  useEffect(() => setContactItems(contacts), [contacts]);
  useEffect(() => setCounts(contactCounts), [contactCounts]);

  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  useEffect(() => setLayout(readLayout()), []);
  const updateLayout = (fn: (l: Layout) => Layout) =>
    setLayout((l) => {
      const next = fn(l);
      writeLayout(next);
      return next;
    });
  const toggleCol = (id: string) =>
    updateLayout((l) => ({ ...l, cols: l.cols.includes(id) ? l.cols.filter((c) => c !== id) : [...l.cols, id] }));
  const togglePhase = (p: Phase) =>
    updateLayout((l) => ({ ...l, phases: l.phases.includes(p) ? l.phases.filter((x) => x !== p) : [...l.phases, p] }));

  const [query, setQuery] = useState('');
  const [service, setService] = useState('');
  const [owner, setOwner] = useState('');
  const [campaign, setCampaign] = useState('');
  const [sort, setSort] = useState<'recent' | 'score'>('recent');
  const filtering = Boolean(query.trim() || service || owner || campaign);

  const [drag, setDrag] = useState<DragPayload | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState<PendingMove | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  const campaigns = useMemo(() => {
    const m = new Map<string, string>();
    contactItems.forEach((c) => c.sequence && m.set(c.sequence.campaignId, c.sequence.name));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [contactItems]);

  const ownerOk = (id: string | null) => !owner || (owner === 'none' ? !id : id === owner);
  const q = query.trim().toLowerCase();
  const visibleClients = useMemo(
    () =>
      clientItems.filter(
        (c) =>
          !campaign &&
          (!service || c.service === service) &&
          ownerOk(c.owner_id) &&
          (!q || [c.first_name, c.last_name, c.email, c.company, c.website].some((v) => v?.toLowerCase().includes(q))),
      ),
    [clientItems, q, service, owner, campaign],
  );
  const visibleContacts = useMemo(
    () =>
      contactItems.filter(
        (c) =>
          !service &&
          (!campaign || c.sequence?.campaignId === campaign) &&
          ownerOk(c.owner_id) &&
          (!q || [c.first_name, c.last_name, c.email, c.company, c.website, c.industry, c.city].some((v) => v?.toLowerCase().includes(q))),
      ),
    [contactItems, q, service, owner, campaign],
  );

  const cardsFor = (col: Column) => ({
    contacts: col.contactStage
      ? (() => {
          const list = visibleContacts.filter((c) => c.stage === col.contactStage);
          return sort === 'score' ? [...list].sort((a, b) => leadScore(b).score - leadScore(a).score) : list;
        })()
      : [],
    clients: col.clientStage ? visibleClients.filter((c) => c.stage === col.clientStage) : [],
  });
  const totalFor = (col: Column) => {
    const { contacts: cs, clients: cl } = cardsFor(col);
    if (filtering || !col.contactStage) return cs.length + cl.length;
    return (counts[col.contactStage] ?? cs.length) + cl.length;
  };

  // ── Summary ─────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const open = clientItems.filter((c) => OPEN_SALES.has(c.stage));
    const value = open.reduce((s, c) => s + firstYearValue(c), 0);
    const weighted = open.reduce((s, c) => s + firstYearValue(c) * (columnForClient(c.stage)?.probability ?? 0), 0);
    const now = Date.now();
    const due =
      clientItems.filter((c) => c.next_step_at && new Date(c.next_step_at).getTime() <= now && !['lost', 'unqualified', 'live'].includes(c.stage)).length +
      contactItems.filter((c) => c.stage === 'nurture' && c.revisit_at && new Date(c.revisit_at).getTime() <= now).length;
    const interested = (counts.interested ?? 0) + (counts.replied ?? 0);
    return { open: open.length, value, weighted, due, interested };
  }, [clientItems, contactItems, counts]);

  // ── Moves ───────────────────────────────────────────────────────
  const nameOf = (kind: 'contact' | 'client', id: string) => {
    if (kind === 'client') {
      const c = clientItems.find((x) => x.id === id);
      return c ? [c.first_name, c.last_name].filter(Boolean).join(' ') : 'this client';
    }
    const c = contactItems.find((x) => x.id === id);
    return c ? c.company || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email : 'this contact';
  };

  const requestMove = (kind: 'contact' | 'client', id: string, to: string) => {
    const col = COLUMN_BY_ID.get(to);
    if (!col) return;
    if (!canMoveTo(kind, col)) {
      setStatus(`${col.label} is set automatically by the outreach engine.`);
      return;
    }
    const current = kind === 'client' ? columnForClient(clientItems.find((c) => c.id === id)?.stage ?? 'new') : columnForContact(contactItems.find((c) => c.id === id)?.stage ?? 'new');
    if (current?.id === to) return;
    const name = nameOf(kind, id);
    if (col.clientStage === 'lost') return setPending({ kind, id, name, to, ask: 'lost' });
    if (col.id === 'nurture') return setPending({ kind, id, name, to, ask: 'nurture' });
    if (kind === 'contact' && col.contactStage === 'unsubscribed') return setPending({ kind, id, name, to, ask: 'unsubscribe' });
    void runMove(kind, id, to, {});
  };

  const runMove = async (kind: 'contact' | 'client', id: string, to: string, opts: MoveOptions) => {
    const col = COLUMN_BY_ID.get(to)!;
    const name = nameOf(kind, id);
    const prevClients = clientItems;
    const prevContacts = contactItems;
    const prevCounts = counts;
    // Optimistic update.
    if (kind === 'client' && col.clientStage) {
      setClientItems((l) => l.map((c) => (c.id === id ? { ...c, stage: col.clientStage!, stage_changed_at: new Date().toISOString() } : c)));
    } else if (kind === 'contact') {
      const from = contactItems.find((c) => c.id === id)?.stage;
      const toStage: ContactStage | null = col.id === 'nurture' ? 'nurture' : col.contactStage ?? null;
      setContactItems((l) =>
        toStage ? l.map((c) => (c.id === id ? { ...c, stage: toStage, stage_changed_at: new Date().toISOString() } : c)) : l.filter((c) => c.id !== id),
      );
      if (from) {
        setCounts((n) => ({
          ...n,
          [from]: Math.max(0, (n[from] ?? 1) - 1),
          ...(toStage ? { [toStage]: (n[toStage] ?? 0) + 1 } : {}),
        }));
      }
    }
    setBusy(true);
    try {
      const res = await postJson<{ nurture?: { enrolled: boolean; reason?: string } | null }>('/api/admin/pipeline/move', {
        kind,
        id,
        to,
        ...opts,
      });
      const extra = res.nurture ? (res.nurture.enrolled ? ' Enrolled in nurture emails.' : res.nurture.reason ? ` ${res.nurture.reason}` : '') : '';
      setStatus(`${name} moved to ${col.label}.${extra}`);
      setPending(null);
      router.refresh();
    } catch (err) {
      setClientItems(prevClients);
      setContactItems(prevContacts);
      setCounts(prevCounts);
      setStatus(`Could not move ${name}: ${errorMessage(err)}`);
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  // ── Bulk (list view) ────────────────────────────────────────────
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const bulkMove = (items: BulkItem[], to: string) => {
    const col = COLUMN_BY_ID.get(to);
    if (!col || !items.length) return;
    const ask: PendingMove['ask'] | null =
      col.clientStage === 'lost' ? 'lost' : col.id === 'nurture' ? 'nurture' : col.contactStage === 'unsubscribed' ? 'unsubscribe' : null;
    setBulkItems(items);
    if (ask) setPending({ kind: items[0].kind, id: BULK, name: `${items.length} cards`, to, ask });
    else void runBulk(items, to, {});
  };
  const runBulk = async (items: BulkItem[], to: string, opts: MoveOptions) => {
    const col = COLUMN_BY_ID.get(to)!;
    setBusy(true);
    let ok = 0;
    const failed: string[] = [];
    for (const it of items) {
      try {
        await postJson('/api/admin/pipeline/move', { kind: it.kind, id: it.id, to, ...opts });
        ok++;
      } catch (err) {
        failed.push(`${nameOf(it.kind, it.id)}: ${errorMessage(err)}`);
      }
    }
    setBusy(false);
    setPending(null);
    setStatus(`Moved ${ok} of ${items.length} to ${col.label}.${failed.length ? ` Not moved: ${failed.slice(0, 3).join('; ')}${failed.length > 3 ? '…' : ''}` : ''}`);
    router.refresh();
  };
  const bulkOwner = async (items: BulkItem[], ownerId: string | null) => {
    setBusy(true);
    const db = supabaseBrowser();
    const ids = (k: BulkItem['kind']) => items.filter((i) => i.kind === k).map((i) => i.id);
    try {
      const results = await Promise.all([
        ids('client').length ? db.from('clients').update({ owner_id: ownerId }).in('id', ids('client')) : null,
        ids('contact').length ? db.from('contacts').update({ owner_id: ownerId }).in('id', ids('contact')) : null,
      ]);
      const err = results.find((r) => r?.error)?.error;
      if (err) throw new Error(err.message);
      const who = ownerId ? team.find((m) => m.user_id === ownerId) : null;
      setStatus(`${items.length} ${items.length === 1 ? 'card' : 'cards'} ${who ? `assigned to ${who.full_name ?? who.email}` : 'unassigned'}.`);
      router.refresh();
    } catch (err) {
      setStatus(`Could not assign: ${errorMessage(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const loadMore = async (stage: ContactStage) => {
    setLoadingMore(stage);
    try {
      const loaded = contactItems.filter((c) => c.stage === stage).length;
      const more = await loadContactCards(supabaseBrowser(), stage, loaded);
      setContactItems((l) => {
        const seen = new Set(l.map((c) => c.id));
        return [...l, ...more.filter((c) => !seen.has(c.id))];
      });
    } catch (err) {
      setStatus(`Could not load more: ${errorMessage(err)}`);
    } finally {
      setLoadingMore(null);
    }
  };

  // ── Drag and drop ───────────────────────────────────────────────
  const onDragStart = (p: DragPayload, e: React.DragEvent) => {
    // Firefox only starts a drag when data is attached.
    e.dataTransfer.setData('text/plain', JSON.stringify(p));
    e.dataTransfer.effectAllowed = 'move';
    setDrag(p);
  };
  const dropProps = (col: Column) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!drag || !canMoveTo(drag.kind, col)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOver(col.id);
    },
    onDragLeave: () => setOver((s) => (s === col.id ? null : s)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      let p = drag;
      if (!p) {
        try {
          p = JSON.parse(e.dataTransfer.getData('text/plain')) as DragPayload;
        } catch {
          p = null;
        }
      }
      if (p) requestMove(p.kind, p.id, col.id);
      setDrag(null);
      setOver(null);
    },
  });

  const allowedWhileDragging = (col: Column) => !drag || canMoveTo(drag.kind, col);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      <section aria-label="Pipeline summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Open deals" value={summary.open} hint={`${summary.interested} prospects replied or interested`} />
        <Stat label="Pipeline value" value={formatMoneyShort(summary.value)} hint="First-year value of open deals" />
        <Stat label="Weighted forecast" value={formatMoneyShort(summary.weighted)} hint="Value times stage probability" />
        <Stat label="Follow-ups due" value={summary.due} hint="Next steps and nurture check-backs due" />
      </section>

      <div className="flex flex-col xl:flex-row xl:items-center gap-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
          <div className="relative sm:w-64">
            <Search size={14} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <label htmlFor="pipe-search" className="sr-only">Search the pipeline</label>
            <input
              id="pipe-search"
              type="search"
              placeholder="Search name, company, email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputClass} pl-8`}
            />
          </div>
          <label htmlFor="pipe-owner" className="sr-only">Filter by owner</label>
          <select id="pipe-owner" value={owner} onChange={(e) => setOwner(e.target.value)} className={`${inputClass} sm:w-40`}>
            <option value="">Everyone</option>
            {meId ? <option value={meId}>Mine</option> : null}
            {team.filter((m) => m.user_id !== meId).map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.full_name ?? m.email}</option>
            ))}
            <option value="none">Unassigned</option>
          </select>
          <label htmlFor="pipe-service" className="sr-only">Filter clients by service</label>
          <select id="pipe-service" value={service} onChange={(e) => setService(e.target.value)} className={`${inputClass} sm:w-48`}>
            <option value="">All services</option>
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <label htmlFor="pipe-campaign" className="sr-only">Filter prospects by campaign</label>
          <select id="pipe-campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} className={`${inputClass} sm:w-48`}>
            <option value="">All campaigns</option>
            {campaigns.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <label htmlFor="pipe-sort" className="sr-only">Sort prospect cards</label>
          <select id="pipe-sort" value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'score')} className={`${inputClass} sm:w-44`}>
            <option value="recent">Newest first</option>
            <option value="score">Highest lead score</option>
          </select>
        </div>
        <div role="group" aria-label="View" className="flex shrink-0 rounded-md border border-white/15 p-0.5 self-start">
          {([['board', 'Board', Columns3], ['list', 'List', List]] as const).map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              aria-pressed={layout.view === v}
              onClick={() => updateLayout((l) => ({ ...l, view: v }))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] font-body text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                layout.view === v ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Icon size={14} aria-hidden /> {label}
            </button>
          ))}
        </div>
      </div>

      {filtering ? (
        <p className="mb-3 font-body text-xs text-white/55">
          Filtering the cards loaded on this page. {service ? 'Service applies to clients only. ' : ''}{campaign ? 'Campaign applies to prospects only.' : ''}
        </p>
      ) : null}

      {/* Phase toggles */}
      {layout.view === 'board' ? (
        <div role="group" aria-label="Show or collapse phases" className="flex flex-wrap gap-2 mb-4">
          {PHASES.map((p) => {
            const cols = COLUMNS.filter((c) => c.phase === p.id);
            const n = cols.reduce((s, c) => s + totalFor(c), 0);
            const open = !layout.phases.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={open}
                title={p.description}
                onClick={() => togglePhase(p.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-body text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                  open ? 'border-white/25 bg-white/[0.06] text-white' : 'border-white/10 text-white/55 hover:text-white'
                }`}
              >
                {open ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
                {p.label}
                <span className="font-mono text-xs tabular-nums text-white/60">{n.toLocaleString()}</span>
                <span className="sr-only">{open ? '(shown, press to collapse)' : '(collapsed, press to show)'}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <p role="status" aria-live="polite" className={`font-body text-sm text-white/75 ${status ? 'mb-3' : ''}`}>{status}</p>

      {layout.view === 'board' ? (
        <div className="relative flex gap-5 overflow-x-auto pb-4 -mx-1 px-1" onDragEnd={() => { setDrag(null); setOver(null); }}>
          {PHASES.map((p) => {
            const cols = COLUMNS.filter((c) => c.phase === p.id);
            const phaseCollapsed = layout.phases.includes(p.id);
            return (
              <section key={p.id} aria-label={`${p.label} phase`} className="shrink-0 flex flex-col">
                <h2 className="mb-2 px-1 font-body text-xs font-semibold text-white/60">{p.label}</h2>
                {phaseCollapsed ? (
                  <div className="w-52 rounded-md border border-dashed border-white/15 p-3 flex flex-col gap-1.5">
                    {cols.map((c) => (
                      <div
                        key={c.id}
                        {...dropProps(c)}
                        className={`flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 font-body text-sm ${
                          over === c.id ? 'bg-brand-cyan/15 text-white' : 'text-white/75'
                        } ${drag && !allowedWhileDragging(c) ? 'opacity-40' : ''}`}
                      >
                        <span className="truncate">{c.label}</span>
                        <span className="font-mono text-xs tabular-nums text-white/60">{totalFor(c).toLocaleString()}</span>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => togglePhase(p.id)}
                      className="mt-1 self-start font-body text-xs text-brand-cyan hover:underline"
                    >
                      Expand {p.label}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {cols.map((col) => (
                      <BoardColumn
                        key={col.id}
                        col={col}
                        collapsed={layout.cols.includes(col.id)}
                        onToggle={() => toggleCol(col.id)}
                        total={totalFor(col)}
                        cards={cardsFor(col)}
                        over={over === col.id}
                        dimmed={Boolean(drag) && !allowedWhileDragging(col)}
                        dropProps={dropProps(col)}
                        canLoadMore={
                          !filtering && Boolean(col.contactStage) &&
                          contactItems.filter((c) => c.stage === col.contactStage).length < (counts[col.contactStage!] ?? 0)
                        }
                        loadingMore={loadingMore === col.contactStage}
                        onLoadMore={() => col.contactStage && loadMore(col.contactStage)}
                        renderContact={(c) => (
                          <ContactCardView
                            key={c.id}
                            c={c}
                            owner={c.owner_id ? byId.get(c.owner_id) : undefined}
                            dragging={drag?.id === c.id}
                            onDragStart={onDragStart}
                            onDragEnd={() => setDrag(null)}
                            onMove={(to) => requestMove('contact', c.id, to)}
                          />
                        )}
                        renderClient={(c) => (
                          <ClientCardView
                            key={c.id}
                            c={c}
                            owner={c.owner_id ? byId.get(c.owner_id) : undefined}
                            nextCall={nextCall[c.id]}
                            dragging={drag?.id === c.id}
                            onDragStart={onDragStart}
                            onDragEnd={() => setDrag(null)}
                            onMove={(to) => requestMove('client', c.id, to)}
                          />
                        )}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <PipelineList
          clients={visibleClients}
          contacts={visibleContacts}
          byId={byId}
          team={team}
          busy={busy}
          onBulkMove={bulkMove}
          onBulkOwner={bulkOwner}
        />
      )}

      <MoveDialog
        pending={pending}
        busy={busy}
        nurtureCampaigns={nurtureCampaigns}
        onConfirm={(opts) => {
          if (!pending) return;
          if (pending.id === BULK) void runBulk(bulkItems, pending.to, opts);
          else void runMove(pending.kind, pending.id, pending.to, opts);
        }}
        onClose={() => {
          if (!busy) setPending(null);
        }}
      />
    </>
  );
}

function BoardColumn({
  col,
  collapsed,
  onToggle,
  total,
  cards,
  over,
  dimmed,
  dropProps,
  canLoadMore,
  loadingMore,
  onLoadMore,
  renderContact,
  renderClient,
}: {
  col: Column;
  collapsed: boolean;
  onToggle: () => void;
  total: number;
  cards: { contacts: ContactCard[]; clients: Client[] };
  over: boolean;
  dimmed: boolean;
  dropProps: Record<string, unknown>;
  canLoadMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  renderContact: (c: ContactCard) => React.ReactNode;
  renderClient: (c: Client) => React.ReactNode;
}) {
  const value = cards.clients.reduce((s, c) => s + firstYearValue(c), 0);
  const border = over ? 'border-brand-cyan' : 'border-white/10';
  if (collapsed) {
    return (
      <div {...dropProps} className={`shrink-0 w-11 rounded-md border bg-white/[0.02] ${border} ${dimmed ? 'opacity-40' : ''}`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={false}
          aria-label={`${col.label}, ${total} cards. Expand column`}
          title={col.hint}
          className="w-full h-full min-h-48 flex flex-col items-center gap-3 py-3 rounded-md hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
        >
          <span className="font-mono text-xs tabular-nums text-white/70">{total.toLocaleString()}</span>
          <span className="font-body text-xs font-medium text-white/80 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">{col.label}</span>
        </button>
      </div>
    );
  }
  const empty = !cards.contacts.length && !cards.clients.length;
  return (
    <section
      aria-label={`${col.label}, ${total} cards`}
      {...dropProps}
      className={`shrink-0 w-[264px] rounded-md border bg-white/[0.02] flex flex-col max-h-[calc(100vh-260px)] min-h-48 ${border} ${dimmed ? 'opacity-40' : ''}`}
    >
      <header className="px-3 pt-2.5 pb-2 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-body text-sm font-semibold text-white truncate" title={col.hint}>{col.label}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-xs text-white/60 tabular-nums">{total.toLocaleString()}</span>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded
              aria-label={`Collapse ${col.label}`}
              className="p-1 rounded-sm text-white/45 hover:text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
            >
              <ChevronsRightLeft size={13} aria-hidden />
            </button>
          </div>
        </div>
        <p className="mt-0.5 font-body text-[11px] leading-snug text-white/50">
          {value ? (
            <>
              <span className="font-mono tabular-nums text-white/75">{formatMoneyShort(value)}</span>
              {col.probability !== undefined && col.probability < 1 ? (
                <span> first year, {formatMoneyShort(value * col.probability)} weighted</span>
              ) : (
                <span> first year</span>
              )}
            </>
          ) : (
            col.hint
          )}
        </p>
      </header>
      <ul className="relative flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {cards.clients.map(renderClient)}
        {cards.contacts.map(renderContact)}
        {empty ? (
          <li className="px-2 py-6 text-center font-body text-xs text-white/40">
            {col.automatic ? 'Nobody here right now.' : 'Drop a card here.'}
          </li>
        ) : null}
        {canLoadMore ? (
          <li>
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full py-2 rounded-sm border border-white/10 font-body text-xs text-white/70 hover:text-white hover:border-white/25 disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : `Load ${PAGE_SIZE} more`}
            </button>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

const ORDER = new Map(COLUMNS.map((c, i) => [c.id, i]));

type BulkItem = { kind: 'contact' | 'client'; id: string };

function PipelineList({
  clients,
  contacts,
  byId,
  team,
  busy,
  onBulkMove,
  onBulkOwner,
}: {
  clients: Client[];
  contacts: ContactCard[];
  byId: Map<string, TeamMember>;
  team: TeamMember[];
  busy: boolean;
  onBulkMove: (items: BulkItem[], to: string) => void;
  onBulkOwner: (items: BulkItem[], ownerId: string | null) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  type Row = {
    kind: 'contact' | 'client';
    id: string;
    contact?: ContactCard;
    key: string;
    href: string;
    name: string;
    sub: string;
    type: 'Prospect' | 'Client';
    col: Column | undefined;
    owner: string;
    value: string;
    days: number;
    next: string;
  };
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const rows: Row[] = [
    ...clients.map((c) => ({
      kind: 'client' as const,
      id: c.id,
      key: `d${c.id}`,
      href: `/admin/clients/${c.id}`,
      name: [c.first_name, c.last_name].filter(Boolean).join(' '),
      sub: c.company || c.email,
      type: 'Client' as const,
      col: columnForClient(c.stage),
      owner: c.owner_id ? byId.get(c.owner_id)?.full_name ?? '' : '',
      value: dealLabel(c) ?? '',
      days: daysSince(c.stage_changed_at),
      next: c.next_step_at ? `${c.next_step || 'Follow up'}, ${fmt(c.next_step_at)}` : c.next_step ?? '',
    })),
    ...contacts.map((c) => ({
      kind: 'contact' as const,
      id: c.id,
      key: `c${c.id}`,
      href: `/admin/outreach/inbox?tab=all&contact=${c.id}`,
      name: c.company || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email,
      sub: c.email,
      type: 'Prospect' as const,
      col: columnForContact(c.stage),
      owner: c.owner_id ? byId.get(c.owner_id)?.full_name ?? '' : '',
      value: '',
      contact: c,
      days: daysSince(c.stage_changed_at),
      next: c.stage === 'nurture' && c.revisit_at ? `Check back ${fmt(c.revisit_at)}` : c.sequence ? c.sequence.name : '',
    })),
  ].sort((a, b) => (ORDER.get(a.col?.id ?? '') ?? 99) - (ORDER.get(b.col?.id ?? '') ?? 99) || a.days - b.days);

  if (!rows.length) {
    return <p className="py-10 text-center font-body text-sm text-white/55">No cards match these filters.</p>;
  }
  const picked = rows.filter((r) => selected.has(r.key));
  const items: BulkItem[] = picked.map((r) => ({ kind: r.kind, id: r.id }));
  const kinds = new Set(picked.map((r) => r.kind));
  const targets = COLUMNS.filter((c) => [...kinds].every((k) => canMoveTo(k, c)));
  const allOn = rows.length > 0 && rows.every((r) => selected.has(r.key));
  const toggle = (key: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  return (
    <>
    {picked.length ? (
      <div role="region" aria-label="Bulk actions" className="sticky top-14 lg:top-0 z-10 mb-3 flex flex-wrap items-center gap-3 rounded-md border border-white/15 bg-[#0b0b14] px-4 py-2.5">
        <span className="font-body text-sm text-white">{picked.length} selected</span>
        <label htmlFor="bulk-move" className="sr-only">Move selected to</label>
        <select
          id="bulk-move"
          value=""
          disabled={busy || !targets.length}
          onChange={(e) => {
            if (e.target.value) {
              onBulkMove(items, e.target.value);
              setSelected(new Set());
            }
          }}
          className={`${inputClass} py-1.5 sm:!w-56`}
        >
          <option value="">{targets.length ? 'Move to…' : 'No stage fits all selected'}</option>
          {PHASES.map((p) => {
            const cols = targets.filter((c) => c.phase === p.id);
            return cols.length ? (
              <optgroup key={p.id} label={p.label}>
                {cols.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </optgroup>
            ) : null;
          })}
        </select>
        <label htmlFor="bulk-owner" className="sr-only">Assign selected to</label>
        <select
          id="bulk-owner"
          value=""
          disabled={busy}
          onChange={(e) => {
            if (e.target.value) {
              onBulkOwner(items, e.target.value === 'none' ? null : e.target.value);
              setSelected(new Set());
            }
          }}
          className={`${inputClass} py-1.5 sm:!w-56`}
        >
          <option value="">Assign owner…</option>
          {team.map((m) => (
            <option key={m.user_id} value={m.user_id}>{m.full_name ?? m.email}</option>
          ))}
          <option value="none">Unassigned</option>
        </select>
        <button type="button" onClick={() => setSelected(new Set())} className="font-body text-sm text-white/65 hover:text-white">
          Clear
        </button>
      </div>
    ) : null}
    <TableWrap label="Pipeline as a list">
        <thead>
          <tr>
            <th scope="col" className={`${thClass} w-10`}>
              <input
                type="checkbox"
                aria-label={allOn ? 'Clear selection' : 'Select all rows'}
                checked={allOn}
                onChange={() => setSelected(allOn ? new Set() : new Set(rows.map((r) => r.key)))}
                className="h-4 w-4 accent-brand-purple"
              />
            </th>
            <th scope="col" className={thClass}>Name</th>
            <th scope="col" className={thClass}>Stage</th>
            <th scope="col" className={thClass}>Type</th>
            <th scope="col" className={thClass}>Owner</th>
            <th scope="col" className={thClass}>Value</th>
            <th scope="col" className={thClass}>Score</th>
            <th scope="col" className={`${thClass} text-right`}>In stage</th>
            <th scope="col" className={thClass}>Next</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={selected.has(r.key) ? 'bg-white/[0.04]' : ''}>
              <td className={tdClass}>
                <input
                  type="checkbox"
                  aria-label={`Select ${r.name}`}
                  checked={selected.has(r.key)}
                  onChange={() => toggle(r.key)}
                  className="h-4 w-4 accent-brand-purple"
                />
              </td>
              <td className={tdClass}>
                <Link href={r.href} className="font-medium text-white hover:underline">{r.name}</Link>
                <div className="text-xs text-white/55 truncate max-w-[16rem]">{r.sub}</div>
              </td>
              <td className={`${tdClass} whitespace-nowrap`}>
                {r.col?.label ?? ''}
                <div className="text-xs text-white/50">{PHASES.find((p) => p.id === r.col?.phase)?.label}</div>
              </td>
              <td className={tdClass}>{r.type}</td>
              <td className={`${tdClass} whitespace-nowrap`}>{r.owner}</td>
              <td className={`${tdClass} font-mono text-xs tabular-nums whitespace-nowrap`}>{r.value}</td>
              <td className={tdClass}>{r.contact ? <ScoreChip c={r.contact} /> : null}</td>
              <td className={`${tdClass} text-right font-mono text-xs tabular-nums`}>{r.days}d</td>
              <td className={`${tdClass} text-xs text-white/70`}>{r.next}</td>
            </tr>
          ))}
        </tbody>
    </TableWrap>
    </>
  );
}
