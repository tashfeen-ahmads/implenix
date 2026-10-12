'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Button, Field, inputClass } from '@/components/admin/ui';

export function AccountForms({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/admin/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: name }),
    });
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: 'Name saved.' } : { ok: false, text: 'Could not save your name.' });
    if (res.ok) router.refresh();
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 10) return setMsg({ ok: false, text: 'Use at least 10 characters.' });
    if (password !== confirm) return setMsg({ ok: false, text: 'The two passwords do not match.' });
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setPassword('');
    setConfirm('');
    setMsg({ ok: true, text: 'Password updated.' });
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={saveName} className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <Field label="Display name" htmlFor="acc-name">
            <input id="acc-name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} />
          </Field>
        </div>
        <Button type="submit" variant="secondary" disabled={busy || !name.trim() || name === fullName}>Save name</Button>
      </form>
      <form onSubmit={savePassword} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New password" htmlFor="acc-pw" hint="At least 10 characters.">
            <input id="acc-pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Confirm password" htmlFor="acc-pw2">
            <input id="acc-pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div>
          <Button type="submit" disabled={busy || !password}>Set password</Button>
        </div>
      </form>
      <p aria-live="polite" className={`font-body text-sm min-h-5 ${msg?.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg?.text}</p>
    </div>
  );
}
