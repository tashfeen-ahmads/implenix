'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/admin/ui';
import { CAMPAIGN_TEMPLATES } from '@/lib/outreach/campaignTemplates';
import { ConfirmDialog } from './ConfirmDialog';
import { errorMessage } from './shared';

// Creates a draft campaign, blank or from a template, and opens the editor.
export function NewCampaignButton({ label = 'New campaign' }: { label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState('blank');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    setBusy(true);
    setError('');
    try {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      const t = CAMPAIGN_TEMPLATES.find((x) => x.id === choice);
      const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date());
      const { data, error: err } = await supabase
        .from('campaigns')
        .insert({
          name: t ? `${t.name} (${date})` : `New campaign ${date}`,
          from_email: '',
          status: 'draft',
          created_by: auth.user?.id ?? null,
          ...(t ? { kind: t.kind, ai_instructions: t.ai_instructions } : {}),
        })
        .select('id')
        .single();
      if (err) throw new Error(err.message);
      const id = (data as { id: string }).id;
      if (t) {
        const { error: stepErr } = await supabase.from('campaign_steps').insert(
          t.steps.map((s, i) => ({
            campaign_id: id,
            step_number: i + 1,
            delay_days: s.delay_days,
            subject: s.subject,
            body: s.body,
            subject_b: s.body_b ? s.subject_b ?? null : null,
            body_b: s.body_b ?? null,
          })),
        );
        if (stepErr) throw new Error(`Campaign created, but the template steps failed: ${stepErr.message}`);
      }
      router.push(`/admin/outreach/campaigns/${id}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={() => setOpen(true)} disabled={busy}>
        <Plus size={16} aria-hidden /> {label}
      </Button>
      <span aria-live="polite" className="font-body text-xs text-red-300">
        {error}
      </span>
      <ConfirmDialog
        open={open}
        title="New campaign"
        confirmLabel={busy ? 'Creating…' : 'Create campaign'}
        busy={busy}
        onConfirm={create}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
      >
        <fieldset>
          <legend className="mb-3">Start blank or from a template. Templates are drafts: edit the wording, then send yourself a test.</legend>
          <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto pr-1">
            {[{ id: 'blank', name: 'Blank campaign', audience: '', description: 'Write your own sequence from scratch.', kind: 'sequence' as const, steps: [] }, ...CAMPAIGN_TEMPLATES].map((t) => (
              <label
                key={t.id}
                className={`flex gap-3 p-3 rounded-md border cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-brand-cyan ${
                  choice === t.id ? 'border-brand-purple/60 bg-brand-purple/10' : 'border-white/10 hover:bg-white/[0.03]'
                }`}
              >
                <input
                  type="radio"
                  name="campaign-template"
                  value={t.id}
                  checked={choice === t.id}
                  onChange={() => setChoice(t.id)}
                  className="mt-0.5 h-4 w-4 accent-brand-purple"
                />
                <span className="min-w-0">
                  <span className="block font-body text-sm font-medium text-white">{t.name}</span>
                  <span className="block mt-0.5 font-body text-xs text-white/60 leading-relaxed">
                    {t.description}
                    {t.steps.length ? ` ${t.steps.length} emails${t.kind === 'nurture' ? ', nurture' : ''}.` : ''}
                    {t.audience ? ` For: ${t.audience}.` : ''}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </ConfirmDialog>
    </div>
  );
}
