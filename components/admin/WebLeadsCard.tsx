'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';
import { SERVICES, type WebLead } from '@/lib/db/types';
import { INDUSTRY_PROFILES, type IndustryKey } from '@/lib/audit';
import { Button, Card, EmptyState, Field, formatDateTime, inputClass } from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/admin/outreach/ConfirmDialog';
import { errorMessage, postJson } from '@/components/admin/outreach/shared';

const DETAIL_LABELS: Record<string, string> = {
  industry: 'Industry',
  averageClientValue: 'Avg. client value',
  weeklyCalls: 'Calls a week',
  businessType: 'Business type',
  callVolume: 'Call volume',
  message: 'Message',
};
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtDetail = (k: string, v: string | number | boolean) => {
  if (k === 'averageClientValue' && typeof v === 'number') return money.format(v);
  if (k === 'industry' && typeof v === 'string' && v in INDUSTRY_PROFILES) return INDUSTRY_PROFILES[v as IndustryKey].label;
  return String(v);
};

// Leads from website forms (the missed-call audit today). Call them, then
// convert the good ones into a client on the pipeline.
export function WebLeadsCard({ leads }: { leads: WebLead[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [converting, setConverting] = useState<WebLead | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', service: 'ai-receptionist' });
  const [formError, setFormError] = useState('');

  const act = async (lead: WebLead, action: 'contacted' | 'dismissed') => {
    setBusy(lead.id);
    setMsg('');
    try {
      await postJson(`/api/admin/web-leads/${lead.id}`, { action });
      setMsg(action === 'contacted' ? 'Marked as called.' : 'Dismissed.');
      router.refresh();
    } catch (err) {
      setMsg(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const openConvert = (lead: WebLead) => {
    const [first, ...rest] = (lead.name ?? '').trim().split(/\s+/);
    setForm({
      firstName: first ?? '',
      lastName: rest.join(' '),
      email: lead.email ?? '',
      phone: lead.phone ?? '',
      company: lead.company ?? '',
      service: 'ai-receptionist',
    });
    setFormError('');
    setConverting(lead);
  };

  const convert = async () => {
    if (!converting) return;
    if (!form.firstName.trim()) return setFormError('First name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setFormError('A valid email is required to add them to the pipeline.');
    setBusy(converting.id);
    try {
      const res = await postJson<{ clientId: string }>(`/api/admin/web-leads/${converting.id}`, { action: 'convert', ...form });
      setConverting(null);
      router.push(`/admin/clients/${res.clientId}`);
    } catch (err) {
      setFormError(errorMessage(err));
      setBusy(null);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <Card title="Website leads" action={<span className="font-mono text-xs text-white/60 tabular-nums">{leads.length}</span>}>
      <div id="website-leads" className="scroll-mt-20" />
      {leads.length === 0 ? (
        <EmptyState title="No new website leads" body="People who run the missed-call audit on the site show up here with their phone number." />
      ) : (
        <ul className="divide-y divide-white/5 -my-2">
          {leads.map((l) => {
            const who = l.name || l.company || (l.source === 'audit' ? 'Missed-call audit visitor' : 'Website visitor');
            const details = Object.entries(l.details ?? {}).filter(([, v]) => v !== '' && v !== null);
            return (
              <li key={l.id} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-body text-sm font-medium text-white">{who}</span>
                  <span className="font-mono text-[11px] text-white/55">
                    {l.source}, {formatDateTime(l.created_at)}
                    {l.status === 'contacted' ? ', called' : ''}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs">
                  {l.phone ? (
                    <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-brand-cyan hover:underline">
                      <Phone size={12} aria-hidden /> {l.phone}
                    </a>
                  ) : null}
                  {l.email ? (
                    <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-brand-cyan hover:underline break-all">
                      <Mail size={12} aria-hidden /> {l.email}
                    </a>
                  ) : null}
                </div>
                {details.length ? (
                  <p className="mt-1 font-body text-xs text-white/60">
                    {details.map(([k, v]) => `${DETAIL_LABELS[k] ?? k}: ${fmtDetail(k, v)}`).join(', ')}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {l.status === 'new' ? (
                    <Button variant="secondary" onClick={() => act(l, 'contacted')} disabled={busy === l.id}>
                      Called
                    </Button>
                  ) : null}
                  <Button variant="secondary" onClick={() => openConvert(l)} disabled={busy === l.id}>
                    Add to pipeline
                  </Button>
                  <Button variant="ghost" onClick={() => act(l, 'dismissed')} disabled={busy === l.id}>
                    Dismiss
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p role="status" aria-live="polite" className="mt-2 font-body text-xs text-white/60">{msg}</p>
      <p className="mt-1 font-body text-xs text-white/45">
        Converted leads appear on the <Link href="/admin/pipeline" className="text-brand-cyan hover:underline">pipeline</Link> as New lead.
      </p>

      <ConfirmDialog
        open={Boolean(converting)}
        title="Add to the pipeline"
        confirmLabel="Add as new lead"
        busy={busy === converting?.id}
        onConfirm={convert}
        onClose={() => {
          if (!busy) setConverting(null);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" htmlFor="wl-first">
            <input id="wl-first" className={inputClass} value={form.firstName} onChange={set('firstName')} />
          </Field>
          <Field label="Last name (optional)" htmlFor="wl-last">
            <input id="wl-last" className={inputClass} value={form.lastName} onChange={set('lastName')} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email" htmlFor="wl-email" hint="Needed for the client record. Ask for it on the call if the form didn't collect it.">
              <input id="wl-email" type="email" className={inputClass} value={form.email} onChange={set('email')} />
            </Field>
          </div>
          <Field label="Phone" htmlFor="wl-phone">
            <input id="wl-phone" type="tel" className={inputClass} value={form.phone} onChange={set('phone')} />
          </Field>
          <Field label="Company" htmlFor="wl-company">
            <input id="wl-company" className={inputClass} value={form.company} onChange={set('company')} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Service" htmlFor="wl-service">
              <select id="wl-service" className={inputClass} value={form.service} onChange={set('service')}>
                {SERVICES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        {formError ? <p role="alert" className="mt-3 font-body text-sm text-red-300">{formError}</p> : null}
      </ConfirmDialog>
    </Card>
  );
}
