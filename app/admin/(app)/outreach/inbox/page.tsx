import Link from 'next/link';
import { ArrowLeft, Bot, ExternalLink } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import type { Campaign, Client, Contact, ContactStatus, Message } from '@/lib/db/types';
import { DASHBOARD_TZ, EmptyState, PageHeader, Pill, buttonClass, formatDateTime } from '@/components/admin/ui';
import { AiDraftCard } from '@/components/admin/outreach/AiDraftCard';
import { ReplyComposer } from '@/components/admin/outreach/ReplyComposer';
import { ContactStatusSelect } from '@/components/admin/outreach/ContactStatusSelect';
import { CONTACT_STATUS_LABELS, CONTACT_STATUS_TONES, contactName } from '@/components/admin/outreach/shared';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inbox · Outreach' };

// Plain-English names for the reply agent's tools.
const ACTION_LABELS: Record<string, string> = {
  get_open_slots: 'Checked open times on the calendar',
  book_meeting: 'Booked a meeting',
  mark_not_interested: 'Marked not interested and stopped the sequence',
  unsubscribe: 'Unsubscribed them',
  handoff_to_human: 'Handed off to the team',
};

const TABS = [
  { id: 'approval', label: 'Needs approval' },
  { id: 'replied', label: 'Replied' },
  { id: 'interested', label: 'Interested' },
  { id: 'all', label: 'All' },
] as const;
type TabId = (typeof TABS)[number]['id'];

type ConvContact = Pick<Contact, 'id' | 'email' | 'first_name' | 'last_name' | 'company' | 'status'>;
type ConvRow = Pick<Message, 'id' | 'contact_id' | 'direction' | 'status' | 'subject' | 'body_text' | 'created_at' | 'ai_generated'> & {
  contacts: ConvContact | ConvContact[] | null;
};
type Conversation = {
  contact: ConvContact;
  last: ConvRow;
  drafts: number;
  inbound: number;
};

function matchesTab(c: Conversation, tab: TabId) {
  if (tab === 'approval') return c.drafts > 0;
  if (tab === 'replied') return c.contact.status === 'replied';
  if (tab === 'interested') return c.contact.status === 'interested' || c.contact.status === 'booked';
  return true;
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: DASHBOARD_TZ }).format(new Date(iso));
}

export default async function InboxPage({ searchParams }: { searchParams: { tab?: string; contact?: string } }) {
  const supabase = supabaseServer();
  const tab: TabId = (TABS.find((t) => t.id === searchParams.tab)?.id ?? 'approval') as TabId;
  const contactId = searchParams.contact ?? '';

  // Conversations: any contact with an inbound message or a pending AI draft.
  const { data: convData, error: convError } = await supabase
    .from('messages')
    .select('id, contact_id, direction, status, subject, body_text, created_at, ai_generated, contacts(id, email, first_name, last_name, company, status)')
    .or('direction.eq.inbound,status.eq.draft')
    .not('contact_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1000);

  const byContact = new Map<string, Conversation>();
  for (const row of (convData ?? []) as unknown as ConvRow[]) {
    const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts;
    if (!contact) continue;
    let conv = byContact.get(contact.id);
    if (!conv) {
      conv = { contact, last: row, drafts: 0, inbound: 0 };
      byContact.set(contact.id, conv);
    }
    if (row.status === 'draft') conv.drafts++;
    if (row.direction === 'inbound') conv.inbound++;
  }
  const conversations = [...byContact.values()];
  const counts = Object.fromEntries(TABS.map((t) => [t.id, conversations.filter((c) => matchesTab(c, t.id)).length])) as Record<TabId, number>;
  const visible = conversations.filter((c) => matchesTab(c, tab));

  const tabHref = (id: TabId) => `/admin/outreach/inbox?tab=${id}`;
  const convHref = (id: string) => `/admin/outreach/inbox?tab=${tab}&contact=${id}`;

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Replies to your campaigns. Approve or edit AI drafts, answer by hand, and track who is interested."
      />

      {convError ? (
        <p role="alert" className="mb-6 font-body text-sm text-red-300">
          Could not load conversations: {convError.message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:min-h-[70vh]">
        {/* ── Conversation list ── */}
        <section aria-label="Conversations" className={`${contactId ? 'hidden lg:flex' : 'flex'} flex-col border border-white/10 rounded-md min-w-0`}>
          <nav aria-label="Inbox filters" className="relative flex flex-wrap gap-1 p-2 border-b border-white/10">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={tabHref(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm font-body text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                  tab === t.id ? 'bg-brand-purple/20 text-white' : 'text-white/65 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.label}
                <span className={`tabular-nums ${t.id === 'approval' && counts.approval ? 'text-amber-300' : 'text-white/45'}`}>{counts[t.id]}</span>
              </Link>
            ))}
          </nav>
          {visible.length === 0 ? (
            <div className="p-6 text-center font-body text-sm text-white/60">
              {tab === 'approval' ? 'No AI drafts waiting for approval.' : 'No conversations here yet.'}
            </div>
          ) : (
            <ul className="relative flex-1 overflow-y-auto lg:max-h-[75vh] divide-y divide-white/5">
              {visible.map((c) => {
                const active = c.contact.id === contactId;
                const preview = (c.last.body_text ?? '').replace(/\s+/g, ' ').trim().slice(0, 110);
                return (
                  <li key={c.contact.id}>
                    <Link
                      href={convHref(c.contact.id)}
                      aria-current={active ? 'true' : undefined}
                      className={`block px-4 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-cyan ${
                        active ? 'bg-brand-purple/15' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-body text-sm font-medium text-white truncate">{contactName(c.contact)}</span>
                        <time dateTime={c.last.created_at} className="shrink-0 font-mono text-[11px] text-white/45">
                          {relTime(c.last.created_at)}
                        </time>
                      </div>
                      {c.contact.company ? <p className="font-body text-xs text-white/55 truncate">{c.contact.company}</p> : null}
                      <p className="mt-1 font-body text-xs text-white/60 line-clamp-2">
                        {c.last.status === 'draft' ? <span className="text-amber-300">AI draft: </span> : null}
                        {preview || c.last.subject || '(empty)'}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {c.drafts ? <Pill tone="amber">Needs approval</Pill> : null}
                        {c.contact.status !== 'active' ? (
                          <Pill tone={CONTACT_STATUS_TONES[c.contact.status]}>{CONTACT_STATUS_LABELS[c.contact.status]}</Pill>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Thread ── */}
        <section aria-label="Conversation" className={`${contactId ? 'block' : 'hidden lg:block'} min-w-0`}>
          {contactId ? (
            <Thread contactId={contactId} backHref={tabHref(tab)} />
          ) : (
            <div className="h-full min-h-[50vh] flex items-center justify-center border border-dashed border-white/15 rounded-md p-8 text-center">
              <div>
                <p className="font-body text-sm font-semibold text-white">Pick a conversation</p>
                <p className="mt-1.5 font-body text-sm text-white/60 max-w-xs">
                  {counts.approval
                    ? `${counts.approval} AI ${counts.approval === 1 ? 'draft is' : 'drafts are'} waiting for your approval.`
                    : 'Select a contact on the left to read the thread and reply.'}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

async function Thread({ contactId, backHref }: { contactId: string; backHref: string }) {
  const supabase = supabaseServer();
  const [contactRes, messagesRes, clientRes] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', contactId).maybeSingle(),
    supabase.from('messages').select('*').eq('contact_id', contactId).order('created_at', { ascending: true }),
    supabase.from('clients').select('id, first_name, last_name, stage').eq('outreach_contact_id', contactId).maybeSingle(),
  ]);
  const contact = contactRes.data as Contact | null;
  if (!contact) {
    return <EmptyState title="Contact not found" body="It may have been deleted." action={<Link href={backHref} className={buttonClass('secondary')}>Back to inbox</Link>} />;
  }
  const messages = (messagesRes.data ?? []) as Message[];
  const client = clientRes.data as Pick<Client, 'id' | 'first_name' | 'last_name' | 'stage'> | null;

  const campaignIds = [...new Set(messages.map((m) => m.campaign_id).filter((x): x is string => !!x))];
  const campaignsRes = campaignIds.length
    ? await supabase.from('campaigns').select('id, name').in('id', campaignIds)
    : { data: [] };
  const campaignName = new Map(((campaignsRes.data ?? []) as Pick<Campaign, 'id' | 'name'>[]).map((c) => [c.id, c.name]));

  const sent = messages.filter((m) => m.status !== 'draft');
  const drafts = messages.filter((m) => m.status === 'draft');
  const lastInbound = [...messages].reverse().find((m) => m.direction === 'inbound');
  const lastSubject = lastInbound?.subject ?? [...sent].reverse().find((m) => m.subject)?.subject ?? '';
  const replySubject = lastSubject ? (/^re:/i.test(lastSubject) ? lastSubject : `Re: ${lastSubject}`) : '';
  const blocked: ContactStatus[] = ['unsubscribed', 'bounced', 'complained'];
  const disabledReason = blocked.includes(contact.status)
    ? `This contact is ${CONTACT_STATUS_LABELS[contact.status].toLowerCase()}, so outreach email to them is blocked.`
    : undefined;

  return (
    <div className="flex flex-col gap-5">
      <Link href={backHref} className="lg:hidden inline-flex items-center gap-1.5 font-body text-sm text-white/65 hover:text-white">
        <ArrowLeft size={14} aria-hidden /> All conversations
      </Link>

      {/* Contact header */}
      <header className="border border-white/10 rounded-md p-4 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-xl text-white truncate">{contactName(contact)}</h2>
          <p className="font-body text-sm text-white/65 break-all">{contact.email}</p>
          <p className="mt-1 font-body text-xs text-white/55">
            {[contact.company, contact.website?.replace(/^https?:\/\//, ''), [contact.city, contact.state].filter(Boolean).join(', '), contact.phone]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {client ? (
            <Link
              href={`/admin/clients/${client.id}`}
              className="mt-3 inline-flex items-center gap-1.5 font-body text-sm text-brand-cyan hover:underline underline-offset-2"
            >
              <ExternalLink size={14} aria-hidden /> Open client record ({[client.first_name, client.last_name].filter(Boolean).join(' ')})
            </Link>
          ) : null}
        </div>
        <ContactStatusSelect contactId={contact.id} email={contact.email} status={contact.status} />
      </header>

      {/* Messages */}
      {sent.length === 0 ? (
        <p className="font-body text-sm text-white/60">No messages yet.</p>
      ) : (
        <ol aria-label="Messages" className="flex flex-col gap-3">
          {sent.map((m) => {
            const inbound = m.direction === 'inbound';
            return (
              <li key={m.id} className={`flex ${inbound ? 'justify-start' : 'justify-end'}`}>
                <article
                  aria-label={`${inbound ? 'Received from' : 'Sent to'} ${inbound ? m.from_email : m.to_email}`}
                  className={`w-full sm:max-w-[85%] rounded-md border px-4 py-3 ${
                    inbound ? 'border-white/10 bg-white/[0.04]' : 'border-brand-purple/30 bg-brand-purple/[0.08]'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-xs text-white/55">
                    <span className="font-medium text-white/85">{inbound ? contactName(contact) : m.ai_generated ? 'AI reply' : m.campaign_id && m.step_number ? `Step ${m.step_number}` : 'Team reply'}</span>
                    {!inbound && m.campaign_id ? <span>· {campaignName.get(m.campaign_id) ?? 'Campaign'}</span> : null}
                    <time dateTime={m.created_at} className="ml-auto">{formatDateTime(m.created_at)}</time>
                  </div>
                  {m.subject ? <p className="mt-1.5 font-body text-sm font-semibold text-white">{m.subject}</p> : null}
                  <div className="mt-1.5 font-body text-sm text-white/85 leading-relaxed whitespace-pre-wrap break-words">
                    {m.body_text?.trim() || <span className="text-white/40">(no text)</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.ai_generated && !inbound ? <Pill tone="purple">AI</Pill> : null}
                    {['bounced', 'complained', 'failed'].includes(m.status) ? <Pill tone="red">{m.status}</Pill> : null}
                    {m.status === 'queued' ? <Pill tone="neutral">queued</Pill> : null}
                    {m.status === 'delivered' ? <Pill tone="green">delivered</Pill> : null}
                  </div>
                  {inbound && hasMeta(m.ai_meta) ? <div className="mt-3"><AiMeta meta={m.ai_meta} /></div> : null}
                </article>
              </li>
            );
          })}
        </ol>
      )}

      {drafts.map((d) => (
        <AiDraftCard
          key={d.id}
          messageId={d.id}
          subject={d.subject ?? replySubject}
          body={d.body_text ?? ''}
          toEmail={d.to_email || contact.email}
          meta={hasMeta(d.ai_meta) ? <AiMeta meta={d.ai_meta} /> : null}
        />
      ))}

      <ReplyComposer key={`${contact.id}-${messages.length}`} contactId={contact.id} toEmail={contact.email} defaultSubject={replySubject} disabledReason={disabledReason} />
    </div>
  );
}

function hasMeta(meta: Record<string, unknown> | null | undefined) {
  return !!meta && Object.keys(meta).length > 0;
}

// The AI agent's reasoning, as stored in messages.ai_meta. Known keys get
// labels; anything else is listed generically so nothing is hidden.
function AiMeta({ meta }: { meta: Record<string, unknown> }) {
  const str = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : '');
  const intent = str(meta.intent);
  const summary = str(meta.summary) || str(meta.reason) || str(meta.reasoning);
  const confidence = typeof meta.confidence === 'number' ? meta.confidence : null;
  const rawActions = Array.isArray(meta.actions) ? meta.actions : Array.isArray(meta.tool_calls) ? meta.tool_calls : [];
  const actions = rawActions.map((a) => {
    if (typeof a === 'string') return a;
    if (a && typeof a === 'object') {
      const o = a as Record<string, unknown>;
      const name = str(o.name) || str(o.type) || str(o.tool) || 'action';
      const detail = str(o.result) || str(o.summary) || str(o.status);
      return detail ? `${name}: ${detail}` : name;
    }
    return String(a);
  });
  const known = new Set(['intent', 'summary', 'reason', 'reasoning', 'confidence', 'actions', 'tool_calls']);
  const extra = Object.entries(meta).filter(([k, v]) => !known.has(k) && v !== null && v !== '' && typeof v !== 'object');

  return (
    <div className="rounded-sm border border-white/10 bg-black/40 px-3 py-2.5 font-body text-xs text-white/70">
      <p className="flex flex-wrap items-center gap-2">
        <Bot size={14} aria-hidden className="text-brand-cyan" />
        <span className="font-medium text-white/85">AI read this as</span>
        {intent ? <Pill tone="cyan">{intent.replace(/_/g, ' ')}</Pill> : <span>no intent recorded</span>}
        {confidence !== null ? <span>{Math.round(confidence <= 1 ? confidence * 100 : confidence)}% sure</span> : null}
      </p>
      {summary ? <p className="mt-1.5 leading-relaxed">{summary}</p> : null}
      {actions.length ? (
        <div className="mt-1.5">
          <span className="text-white/55">Actions taken:</span>
          <ul className="mt-0.5 list-disc pl-5">
            {actions.map((a, i) => (
              <li key={i}>{ACTION_LABELS[a] ?? a.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {extra.length ? (
        <dl className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5">
          {extra.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-white/50">{k.replace(/_/g, ' ')}</dt>
              <dd className="break-words">{str(v)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

