'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/admin/ui';
import { errorMessage } from './shared';

// Creates a draft campaign and opens the editor.
export function NewCampaignButton({ label = 'New campaign' }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    setBusy(true);
    setError('');
    try {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      const name = `New campaign ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date())}`;
      const { data, error: err } = await supabase
        .from('campaigns')
        .insert({ name, from_email: '', status: 'draft', created_by: auth.user?.id ?? null })
        .select('id')
        .single();
      if (err) throw new Error(err.message);
      router.push(`/admin/outreach/campaigns/${(data as { id: string }).id}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={create} disabled={busy}>
        <Plus size={16} aria-hidden /> {busy ? 'Creating…' : label}
      </Button>
      <span aria-live="polite" className="font-body text-xs text-red-300">
        {error}
      </span>
    </div>
  );
}
