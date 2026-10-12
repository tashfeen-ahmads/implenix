import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import type { Contact, ContactList, ContactStatus } from '@/lib/db/types';
import {
  ButtonLink,
  EmptyState,
  PageHeader,
  Stat,
  TableWrap,
  buttonClass,
  formatDate,
  inputClass,
  tdClass,
  thClass,
} from '@/components/admin/ui';
import { CsvImporter } from '@/components/admin/outreach/CsvImporter';
import { ContactStatusSelect } from '@/components/admin/outreach/ContactStatusSelect';
import { contactStageLabel } from '@/lib/pipeline/stages';
import { CONTACT_STATUSES, CONTACT_STATUS_LABELS, contactName } from '@/components/admin/outreach/shared';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contacts · Outreach' };

const PAGE_SIZE = 50;

type SP = { list?: string; status?: string; q?: string; page?: string };

function hrefWith(sp: SP, patch: Partial<SP>) {
  const p = new URLSearchParams();
  const merged = { ...sp, ...patch };
  for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v));
  const s = p.toString();
  return `/admin/outreach/contacts${s ? `?${s}` : ''}`;
}

export default async function ContactsPage({ searchParams }: { searchParams: SP }) {
  const supabase = supabaseServer();
  const listId = searchParams.list || '';
  const status = CONTACT_STATUSES.includes(searchParams.status as ContactStatus)
    ? (searchParams.status as ContactStatus)
    : '';
  // Characters that would break PostgREST's or() filter syntax are dropped.
  const q = (searchParams.q ?? '').replace(/[,()%*\\]/g, ' ').trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  // Stats follow the list filter so a freshly imported list can be read at a glance.
  const countBy = (statuses?: ContactStatus[]) => {
    let query = supabase.from('contacts').select('id', { count: 'exact', head: true });
    if (listId) query = query.eq('list_id', listId);
    if (statuses) query = query.in('status', statuses);
    return query;
  };

  let rowsQuery = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (listId) rowsQuery = rowsQuery.eq('list_id', listId);
  if (status) rowsQuery = rowsQuery.eq('status', status);
  if (q) rowsQuery = rowsQuery.or(`email.ilike.%${q}%,company.ilike.%${q}%`);

  const [listsRes, total, active, replied, booked, lost, rowsRes] = await Promise.all([
    supabase.from('contact_lists').select('*').order('created_at', { ascending: false }),
    countBy(),
    countBy(['active']),
    countBy(['replied', 'interested']),
    countBy(['booked']),
    countBy(['unsubscribed', 'bounced', 'complained']),
    rowsQuery,
  ]);

  const lists = (listsRes.data ?? []) as ContactList[];
  const listName = new Map(lists.map((l) => [l.id, l.name]));
  const contacts = (rowsRes.data ?? []) as Contact[];
  const matching = rowsRes.count ?? 0;
  const pages = Math.max(1, Math.ceil(matching / PAGE_SIZE));
  const filtered = Boolean(listId || status || q);

  return (
    <>
      <PageHeader
        title="Contacts"
        description="Everyone you can reach with a campaign. Import a CSV to add a list; unsubscribes and bounces are never emailed again."
        actions={<CsvImporter />}
      />

      {rowsRes.error ? (
        <p role="alert" className="mb-6 font-body text-sm text-red-300">
          Could not load contacts: {rowsRes.error.message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <Stat label="Total" value={(total.count ?? 0).toLocaleString()} hint={listId ? `In ${listName.get(listId) ?? 'this list'}` : 'All lists'} />
        <Stat label="Active" value={(active.count ?? 0).toLocaleString()} hint="Can be emailed" />
        <Stat label="Replied" value={(replied.count ?? 0).toLocaleString()} hint="Incl. interested" />
        <Stat label="Booked" value={(booked.count ?? 0).toLocaleString()} />
        <Stat label="Unsub / bounced" value={(lost.count ?? 0).toLocaleString()} hint="Suppressed" />
      </div>

      <form method="get" action="/admin/outreach/contacts" className="flex flex-col md:flex-row md:items-end gap-3 mb-4" role="search" aria-label="Filter contacts">
        <div className="flex flex-col gap-1.5 md:w-56">
          <label htmlFor="f-list" className="font-body text-xs font-medium text-white/80">List</label>
          <select id="f-list" name="list" defaultValue={listId} className={inputClass}>
            <option value="">All lists</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 md:w-44">
          <label htmlFor="f-status" className="font-body text-xs font-medium text-white/80">Status</label>
          <select id="f-status" name="status" defaultValue={status} className={inputClass}>
            <option value="">Any status</option>
            {CONTACT_STATUSES.map((s) => (
              <option key={s} value={s}>{CONTACT_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor="f-q" className="font-body text-xs font-medium text-white/80">Search email or company</label>
          <input id="f-q" name="q" type="search" defaultValue={q} placeholder="e.g. dental or @gmail.com" className={inputClass} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass('secondary')}>
            <Search size={16} aria-hidden /> Apply
          </button>
          {filtered ? (
            <Link href="/admin/outreach/contacts" className={buttonClass('ghost')}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {contacts.length === 0 ? (
        filtered ? (
          <EmptyState title="No contacts match these filters" action={<ButtonLink href="/admin/outreach/contacts" variant="secondary">Clear filters</ButtonLink>} />
        ) : (
          <EmptyState
            title="No contacts yet"
            body="Import a CSV with at least an email column. Name, company, website, city and industry columns make better personalised emails."
          />
        )
      ) : (
        <>
          <TableWrap label="Contacts">
            <thead>
              <tr>
                <th scope="col" className={thClass}>Contact</th>
                <th scope="col" className={thClass}>Company</th>
                <th scope="col" className={thClass}>Location</th>
                <th scope="col" className={thClass}>List</th>
                <th scope="col" className={thClass}>Last contacted</th>
                <th scope="col" className={thClass}>Pipeline</th>
                <th scope="col" className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className={tdClass}>
                    <Link href={`/admin/outreach/inbox?contact=${c.id}`} className="text-white hover:text-brand-cyan underline-offset-2 hover:underline">
                      {contactName(c)}
                    </Link>
                    {contactName(c) !== c.email ? <p className="text-xs text-white/55 break-all">{c.email}</p> : null}
                  </td>
                  <td className={tdClass}>
                    {c.company ?? <span className="text-white/35">—</span>}
                    {c.website ? <p className="text-xs text-white/55 break-all">{c.website.replace(/^https?:\/\//, '')}</p> : null}
                    {c.industry ? <p className="text-xs text-white/45">{c.industry}</p> : null}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {[c.city, c.state].filter(Boolean).join(', ') || <span className="text-white/35">—</span>}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {c.list_id ? (
                      <Link href={hrefWith({}, { list: c.list_id })} className="hover:text-brand-cyan hover:underline underline-offset-2">
                        {listName.get(c.list_id) ?? 'List'}
                      </Link>
                    ) : (
                      <span className="text-white/35">—</span>
                    )}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {c.last_contacted_at ? formatDate(c.last_contacted_at) : <span className="text-white/35">Never</span>}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-white/75`}>{c.stage ? contactStageLabel(c.stage) : ''}</td>
                  <td className={tdClass}>
                    <ContactStatusSelect contactId={c.id} email={c.email} status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3 font-body text-sm text-white/65">
            <p>
              Showing {(from + 1).toLocaleString()}–{(from + contacts.length).toLocaleString()} of {matching.toLocaleString()}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link href={hrefWith(searchParams, { page: String(page - 1) })} className={buttonClass('secondary')} rel="prev">
                  <ChevronLeft size={16} aria-hidden /> Previous
                </Link>
              ) : null}
              <span className="inline-flex items-center px-2" aria-current="page">
                Page {page} of {pages}
              </span>
              {page < pages ? (
                <Link href={hrefWith(searchParams, { page: String(page + 1) })} className={buttonClass('secondary')} rel="next">
                  Next <ChevronRight size={16} aria-hidden />
                </Link>
              ) : null}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
