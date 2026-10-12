'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, inputClass } from '@/components/admin/ui';

export function InviteForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; link?: string } | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setResult(null);
    const res = await fetch('/api/admin/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: f.get('fullName'), email: f.get('email'), role: f.get('role') }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setResult({ ok: false, text: data.error ?? 'Could not send the invite.' });
    form.reset();
    setResult(
      data.emailed
        ? { ok: true, text: 'Invite sent. They get a sign-in link by email.' }
        : { ok: true, text: 'Added. Email is not set up yet, so share this one-time link with them (expires in 24 hours):', link: data.link },
    );
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Full name" htmlFor="inv-name">
        <input id="inv-name" name="fullName" required autoComplete="off" className={inputClass} />
      </Field>
      <Field label="Work email" htmlFor="inv-email">
        <input id="inv-email" name="email" type="email" required spellCheck={false} autoComplete="off" className={inputClass} />
      </Field>
      <Field label="Role" htmlFor="inv-role" hint="Admins can also manage the team. Everyone can use the pipeline, calendar and outreach.">
        <select id="inv-role" name="role" defaultValue="member" className={inputClass}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      <div aria-live="polite">
        {result ? (
          <div className={`font-body text-sm ${result.ok ? 'text-emerald-300' : 'text-red-300'}`}>
            <p>{result.text}</p>
            {result.link ? (
              <input readOnly value={result.link} onFocus={(e) => e.currentTarget.select()} aria-label="Invite link" className={`${inputClass} mt-2 text-xs`} />
            ) : null}
          </div>
        ) : null}
      </div>
      <Button type="submit" disabled={busy}>{busy ? 'Inviting…' : 'Send invite'}</Button>
    </form>
  );
}
