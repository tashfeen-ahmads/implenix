import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Mail, Phone, Video } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import { BOOKING_CONFIG } from '@/lib/googleCalendar';
import { serviceLabel, type Activity, type Booking, type Client } from '@/lib/db/types';
import { Card, EmptyState, PageHeader, Pill, formatDate, formatDateTime } from '@/components/admin/ui';
import { ClientControls } from '@/components/admin/pipeline/ClientControls';
import { BookingStatusSelect } from '@/components/admin/pipeline/BookingStatusSelect';
import { NoteForm } from '@/components/admin/pipeline/NoteForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Client' };

const FORM_LABELS: Record<string, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  email: 'Email',
  phone: 'Phone',
  website: 'Website',
  service: 'Service',
  notes: 'Notes',
};

const href = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

export default async function ClientPage({ params }: { params: { id: string } }) {
  const db = supabaseServer();
  const { data: client } = await db.from('clients').select('*').eq('id', params.id).maybeSingle();
  if (!client) notFound();
  const c = client as Client;

  const [bookingsRes, activityRes] = await Promise.all([
    db.from('bookings').select('*').eq('client_id', c.id).order('start_at', { ascending: false }),
    db.from('activities').select('*').eq('client_id', c.id).order('created_at', { ascending: false }).limit(100),
  ]);
  const bookings = (bookingsRes.data ?? []) as Booking[];
  const activity = (activityRes.data ?? []) as Activity[];
  const latestForm = bookings[0]?.form_data ?? {};
  const name = [c.first_name, c.last_name].filter(Boolean).join(' ');

  return (
    <>
      <Link href="/admin/pipeline" className="inline-flex items-center gap-1.5 mb-4 font-body text-xs text-white/60 hover:text-white">
        <ArrowLeft size={14} aria-hidden /> Pipeline
      </Link>
      <PageHeader
        title={name}
        description={`${serviceLabel(c.service)} · added ${formatDate(c.created_at)}${c.source ? ` · from ${c.source}` : ''}`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <Card title="Contact">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 font-body text-sm">
              <Item label="Email">
                <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 text-brand-cyan hover:underline break-all">
                  <Mail size={14} aria-hidden /> {c.email}
                </a>
              </Item>
              <Item label="Phone">
                {c.phone ? (
                  <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 text-brand-cyan hover:underline">
                    <Phone size={14} aria-hidden /> {c.phone}
                  </a>
                ) : '—'}
              </Item>
              <Item label="Website">
                {c.website ? (
                  <a href={href(c.website)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-cyan hover:underline break-all">
                    {c.website} <ExternalLink size={12} aria-hidden />
                  </a>
                ) : '—'}
              </Item>
              <Item label="Company">{c.company || '—'}</Item>
            </dl>
            {c.outreach_contact_id ? (
              <p className="mt-4 font-body text-xs text-white/60">
                Came from outreach.{' '}
                <Link href={`/admin/outreach/inbox?contact=${c.outreach_contact_id}`} className="text-brand-cyan hover:underline">
                  View email thread
                </Link>
              </p>
            ) : null}
          </Card>

          <Card title="Onboarding form">
            {Object.keys(latestForm).length === 0 ? (
              <EmptyState title="No form on file" body="Added manually, so there is no booking form." />
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 font-body text-sm">
                {Object.entries(latestForm)
                  .filter(([, v]) => v !== undefined && v !== null && v !== '')
                  .map(([k, v]) => (
                    <Item key={k} label={FORM_LABELS[k] ?? k} wide={k === 'notes'}>
                      {k === 'service' ? serviceLabel(String(v)) : String(v)}
                    </Item>
                  ))}
              </dl>
            )}
          </Card>

          <Card title={`Calls (${bookings.length})`}>
            {bookings.length === 0 ? (
              <EmptyState title="No calls booked" />
            ) : (
              <ul className="divide-y divide-white/5 -my-2">
                {bookings.map((b) => (
                  <li key={b.id} className="py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <span className="md:w-64 font-mono text-xs text-white/80">
                      {formatDateTime(b.start_at, BOOKING_CONFIG.timezone)}
                    </span>
                    <span className="flex-1 font-body text-xs text-white/55">
                      {b.meeting_provider === 'zoom' ? 'Zoom' : b.meeting_provider ? 'Google Meet' : ''}
                      {b.source ? ` · ${b.source}` : ''}
                    </span>
                    {b.meeting_url && b.status === 'scheduled' ? (
                      <a href={b.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-body text-xs text-brand-cyan hover:underline">
                        <Video size={14} aria-hidden /> Join
                      </a>
                    ) : null}
                    <BookingStatusSelect clientId={c.id} bookingId={b.id} status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Activity">
            <NoteForm clientId={c.id} />
            {activity.length === 0 ? null : (
              <ol className="mt-5 flex flex-col gap-4">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span aria-hidden className="mt-1.5 w-2 h-2 rounded-full bg-brand-purple shrink-0" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/55">
                        {formatDateTime(a.created_at)}
                        <Pill tone={a.type === 'note' ? 'neutral' : a.type.startsWith('booking') ? 'cyan' : 'purple'}>
                          {a.type.replace('.', ' ')}
                        </Pill>
                      </p>
                      <p className="mt-1 font-body text-sm text-white/85 whitespace-pre-wrap break-words">{a.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <ClientControls client={c} />
        </div>
      </div>
    </>
  );
}

function Item({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="font-mono text-[11px] uppercase tracking-widest text-white/55">{label}</dt>
      <dd className="mt-1 text-white/90 whitespace-pre-wrap break-words">{children}</dd>
    </div>
  );
}
