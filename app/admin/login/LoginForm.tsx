'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { supabaseConfigured } from '@/lib/supabase/env';
import { Button, Field, inputClass } from '@/components/admin/ui';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next')?.startsWith('/admin') ? params.get('next')! : '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') === 'link' ? 'That sign-in link is invalid or has expired. Ask for a new invite, or sign in below.' : null,
  );
  const [sent, setSent] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <p className="mt-4 font-body text-sm text-white/70">
        Supabase is not connected yet. See docs/TEAM_DASHBOARD.md.
      </p>
    );
  }

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    router.replace(next);
    router.refresh();
  };

  const magicLink = async () => {
    if (!email) return setError('Enter your email first.');
    setBusy(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  };

  return (
    <form onSubmit={signIn} className="mt-6 flex flex-col gap-4">
      <Field label="Work email" htmlFor="login-email">
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Password" htmlFor="login-password">
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      {error ? (
        <p role="alert" className="font-body text-sm text-red-300">{error}</p>
      ) : null}
      {sent ? (
        <p role="status" className="font-body text-sm text-emerald-300">
          Check your inbox for a sign-in link.
        </p>
      ) : null}
      <Button type="submit" disabled={busy || !password}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
      <Button variant="ghost" onClick={magicLink} disabled={busy}>
        Email me a sign-in link instead
      </Button>
    </form>
  );
}
