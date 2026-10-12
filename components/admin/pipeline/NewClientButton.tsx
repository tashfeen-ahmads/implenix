'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { SERVICES } from '@/lib/db/types';
import { Button, Field, inputClass } from '@/components/admin/ui';
import { createClient } from './actions';

// Manual entry for leads that came in by phone, referral, events, etc.
export function NewClientButton() {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '').trim() || null;
    setBusy(true);
    setError(null);
    try {
      const id = await createClient({
        first_name: v('first_name')!,
        last_name: v('last_name'),
        email: v('email')!,
        phone: v('phone'),
        website: v('website'),
        company: v('company'),
        service: v('service') ?? 'ai-receptionist',
        source: v('source') ?? 'manual',
      });
      setOpen(false);
      router.push(`/admin/clients/${id}`);
    } catch (err) {
      setError(err instanceof Error && err.message.includes('duplicate') ? 'A client with that email already exists.' : 'Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden /> Add client
      </Button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-labelledby="new-client-title"
        className="w-[min(520px,calc(100vw-32px))] bg-[#0d0b24] text-white border border-white/15 rounded-md p-0 backdrop:bg-black/70"
      >
        <form onSubmit={submit} className="p-6 flex flex-col gap-4">
          <h2 id="new-client-title" className="font-heading text-xl">Add client</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" htmlFor="nc-first">
              <input id="nc-first" name="first_name" required className={inputClass} />
            </Field>
            <Field label="Last name" htmlFor="nc-last">
              <input id="nc-last" name="last_name" className={inputClass} />
            </Field>
          </div>
          <Field label="Email" htmlFor="nc-email">
            <input id="nc-email" name="email" type="email" required spellCheck={false} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone" htmlFor="nc-phone">
              <input id="nc-phone" name="phone" type="tel" className={inputClass} />
            </Field>
            <Field label="Company" htmlFor="nc-company">
              <input id="nc-company" name="company" className={inputClass} />
            </Field>
          </div>
          <Field label="Website" htmlFor="nc-website">
            <input id="nc-website" name="website" spellCheck={false} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Service" htmlFor="nc-service">
              <select id="nc-service" name="service" className={inputClass} defaultValue="ai-receptionist">
                {SERVICES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Source" htmlFor="nc-source">
              <input id="nc-source" name="source" placeholder="referral, phone, event…" className={inputClass} />
            </Field>
          </div>
          {error ? <p role="alert" className="font-body text-sm text-red-300">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Add client'}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
