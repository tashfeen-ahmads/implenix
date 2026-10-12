'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Pause,
  Play,
  Plus,
  Rocket,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import type { Campaign, CampaignStep, Contact, ContactList } from '@/lib/db/types';
import { Button, Card, Field, PageHeader, Pill, inputClass } from '@/components/admin/ui';
import { ConfirmDialog } from './ConfirmDialog';
import {
  CAMPAIGN_STATUS_TONES,
  SAMPLE_CONTACT,
  TEMPLATE_VARIABLES,
  TIMEZONES,
  WEEKDAYS,
  contactName,
  errorMessage,
  hourLabel,
  postJson,
  renderPreview,
  type PreviewContact,
} from './shared';

type Settings = {
  name: string;
  list_id: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  daily_limit: number;
  send_timezone: string;
  send_hour_start: number;
  send_hour_end: number;
  send_days: number[];
  ai_mode: Campaign['ai_mode'];
  ai_instructions: string;
};

type StepDraft = { key: string; delay_days: number; subject: string; body: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AI_MODES: { value: Campaign['ai_mode']; label: string; help: string }[] = [
  {
    value: 'off',
    label: 'Off',
    help: 'Replies land in the inbox and the team answers them by hand. The AI does nothing.',
  },
  {
    value: 'draft',
    label: 'Draft for approval',
    help: 'The AI reads each reply and writes a suggested answer. Nothing is sent until someone on the team approves it in the inbox. Recommended to start.',
  },
  {
    value: 'auto',
    label: 'Auto-reply',
    help: 'The AI answers replies on its own, using your instructions below, and can offer meeting times. Switch to this only after its drafts have been consistently good.',
  },
];

let keySeq = 0;
const newKey = () => `s${Date.now().toString(36)}${(keySeq++).toString(36)}`;

function settingsFrom(c: Campaign): Settings {
  return {
    name: c.name,
    list_id: c.list_id ?? '',
    from_name: c.from_name,
    from_email: c.from_email,
    reply_to: c.reply_to ?? '',
    daily_limit: c.daily_limit,
    send_timezone: c.send_timezone,
    send_hour_start: c.send_hour_start,
    send_hour_end: c.send_hour_end,
    send_days: [...c.send_days].sort((a, b) => a - b),
    ai_mode: c.ai_mode,
    ai_instructions: c.ai_instructions ?? '',
  };
}

function stepsFrom(steps: CampaignStep[]): StepDraft[] {
  return [...steps]
    .sort((a, b) => a.step_number - b.step_number)
    .map((s) => ({ key: s.id, delay_days: s.delay_days, subject: s.subject, body: s.body }));
}

const snapshot = (s: Settings, st: StepDraft[]) =>
  JSON.stringify({ s, st: st.map(({ delay_days, subject, body }) => ({ delay_days, subject, body })) });

export function CampaignEditor({
  campaign,
  steps: initialSteps,
  lists,
  stats,
}: {
  campaign: Campaign;
  steps: CampaignStep[];
  lists: ContactList[];
  stats: ReactNode;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(() => settingsFrom(campaign));
  const [steps, setSteps] = useState<StepDraft[]>(() => stepsFrom(initialSteps));
  const [baseline, setBaseline] = useState(() => snapshot(settingsFrom(campaign), stepsFrom(initialSteps)));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [samples, setSamples] = useState<PreviewContact[]>([]);
  const [sampleIndex, setSampleIndex] = useState(0);

  const dirty = snapshot(settings, steps) !== baseline;
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v }));

  // Re-sync when the server sends fresh data (after save or status change),
  // unless the user has unsaved edits we would otherwise throw away.
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    if (dirtyRef.current) return;
    const s = settingsFrom(campaign);
    const st = stepsFrom(initialSteps);
    setSettings(s);
    setSteps(st);
    setBaseline(snapshot(s, st));
  }, [campaign, initialSteps]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  // Sample contacts from the chosen list for the live preview.
  useEffect(() => {
    let cancelled = false;
    setSampleIndex(0);
    if (!settings.list_id) {
      setSamples([]);
      return;
    }
    supabaseBrowser()
      .from('contacts')
      .select('first_name, last_name, company, website, city, industry, email, custom')
      .eq('list_id', settings.list_id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (!cancelled) setSamples((data ?? []) as PreviewContact[]);
      });
    return () => {
      cancelled = true;
    };
  }, [settings.list_id]);

  const sample = samples[sampleIndex] ?? SAMPLE_CONTACT;
  const customKeys = useMemo(() => Object.keys(samples[0]?.custom ?? {}).slice(0, 8), [samples]);

  // ── Validation ──────────────────────────────────────────────────
  const problems: string[] = [];
  if (!settings.name.trim()) problems.push('Give the campaign a name.');
  if (settings.from_email && !EMAIL_RE.test(settings.from_email)) problems.push('From email is not a valid address.');
  if (settings.reply_to && !EMAIL_RE.test(settings.reply_to)) problems.push('Reply-to is not a valid address.');
  if (!(settings.daily_limit >= 1 && settings.daily_limit <= 2000)) problems.push('Daily limit must be between 1 and 2000.');
  if (settings.send_hour_end <= settings.send_hour_start) problems.push('Send window must end after it starts.');
  if (!settings.send_days.length) problems.push('Pick at least one sending day.');
  steps.forEach((s, i) => {
    if (i === 0 && !s.subject.trim()) problems.push('Step 1 needs a subject.');
    if (!s.body.trim()) problems.push(`Step ${i + 1} needs a body.`);
  });

  const launchBlockers: string[] = [];
  if (!campaign.list_id) launchBlockers.push('choose a contact list');
  if (!campaign.from_email) launchBlockers.push('set a from email');
  if (!initialSteps.length) launchBlockers.push('add at least one step');

  // ── Save ────────────────────────────────────────────────────────
  const save = async () => {
    if (problems.length) {
      setSaveMsg({ ok: false, text: problems[0] });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    const supabase = supabaseBrowser();
    try {
      const { error: cErr } = await supabase
        .from('campaigns')
        .update({
          name: settings.name.trim(),
          list_id: settings.list_id || null,
          from_name: settings.from_name.trim() || 'Implenix',
          from_email: settings.from_email.trim(),
          reply_to: settings.reply_to.trim() || null,
          daily_limit: settings.daily_limit,
          send_timezone: settings.send_timezone,
          send_hour_start: settings.send_hour_start,
          send_hour_end: settings.send_hour_end,
          send_days: settings.send_days,
          ai_mode: settings.ai_mode,
          ai_instructions: settings.ai_instructions.trim() || null,
        })
        .eq('id', campaign.id);
      if (cErr) throw new Error(cErr.message);

      const stepsChanged =
        JSON.stringify(steps.map(({ delay_days, subject, body }) => ({ delay_days, subject, body }))) !==
        JSON.stringify(stepsFrom(initialSteps).map(({ delay_days, subject, body }) => ({ delay_days, subject, body })));
      if (stepsChanged) {
        // Replace the whole sequence: simplest way to keep step_number
        // contiguous and unique after reordering.
        const { error: dErr } = await supabase.from('campaign_steps').delete().eq('campaign_id', campaign.id);
        if (dErr) throw new Error(dErr.message);
        if (steps.length) {
          const { error: iErr } = await supabase.from('campaign_steps').insert(
            steps.map((s, i) => ({
              campaign_id: campaign.id,
              step_number: i + 1,
              delay_days: Math.max(0, Math.floor(s.delay_days) || 0),
              subject: s.subject,
              body: s.body,
            })),
          );
          if (iErr) throw new Error(`Sequence not saved: ${iErr.message}. Your edits are still here; try Save again.`);
        }
      }
      setBaseline(snapshot(settings, steps));
      setSaveMsg({ ok: true, text: 'Saved.' });
      router.refresh();
    } catch (err) {
      setSaveMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  // ── Variable chips: insert at the caret of the last focused field ──
  const fieldRefs = useRef(new Map<string, HTMLInputElement | HTMLTextAreaElement>());
  const lastFocused = useRef<{ key: string; field: 'subject' | 'body' } | null>(null);
  const insertToken = useCallback((stepKey: string, token: string) => {
    const field = lastFocused.current?.key === stepKey ? lastFocused.current.field : 'body';
    const el = fieldRefs.current.get(`${stepKey}:${field}`);
    setSteps((all) =>
      all.map((s) => {
        if (s.key !== stepKey) return s;
        const value = s[field];
        const start = el?.selectionStart ?? value.length;
        const end = el?.selectionEnd ?? value.length;
        const next = value.slice(0, start) + token + value.slice(end);
        requestAnimationFrame(() => {
          if (!el) return;
          el.focus();
          el.setSelectionRange(start + token.length, start + token.length);
        });
        return { ...s, [field]: next };
      }),
    );
  }, []);

  const updateStep = (key: string, patch: Partial<StepDraft>) =>
    setSteps((all) => all.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const addStep = () => {
    setSteps((all) => [
      ...all,
      {
        key: newKey(),
        delay_days: all.length ? 3 : 0,
        // Blank = sent as a reply in step 1's thread ("Re: …").
        subject: '',
        body: '',
      },
    ]);
    setPreviewIndex(steps.length);
  };
  const removeStep = (key: string) => {
    const s = steps.find((x) => x.key === key);
    if (s && (s.subject || s.body) && !window.confirm('Remove this step?')) return;
    setSteps((all) => all.filter((x) => x.key !== key));
    setPreviewIndex(0);
  };
  const moveStep = (index: number, dir: -1 | 1) => {
    setSteps((all) => {
      const j = index + dir;
      if (j < 0 || j >= all.length) return all;
      const next = [...all];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
    setPreviewIndex(index + dir);
  };

  const previewStep = steps[Math.min(previewIndex, steps.length - 1)];
  const dayOffsets = steps.reduce<number[]>((acc, s, i) => {
    acc.push((i ? acc[i - 1] : 0) + (Number(s.delay_days) || 0));
    return acc;
  }, []);

  return (
    <>
      <PageHeader
        title={campaign.name}
        description={
          campaign.status === 'active'
            ? 'Sending. Edits apply to emails that have not gone out yet.'
            : campaign.status === 'paused'
              ? 'Paused. Nobody is emailed until you resume.'
              : campaign.status === 'completed'
                ? 'Completed. Every enrolled contact has finished the sequence or replied.'
                : 'Draft. Set up the sequence, send yourself a test, then launch.'
        }
        actions={
          <>
            <Pill tone={CAMPAIGN_STATUS_TONES[campaign.status]}>{campaign.status}</Pill>
            <CampaignControls campaign={campaign} dirty={dirty} blockers={launchBlockers} />
          </>
        }
      />

      {stats}

      {/* Save bar */}
      <div className="sticky top-14 lg:top-0 z-10 -mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10 py-3 mb-6 bg-black/90 backdrop-blur border-y border-white/10 flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving || !dirty}>
          <Save size={16} aria-hidden /> {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <p aria-live="polite" className="font-body text-sm">
          {saveMsg ? (
            <span className={saveMsg.ok ? 'text-emerald-300' : 'text-red-300'}>{saveMsg.text}</span>
          ) : dirty ? (
            <span className="text-amber-300">Unsaved changes</span>
          ) : (
            <span className="text-white/50">All changes saved</span>
          )}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        {/* ── Sequence ── */}
        <Card title={`Sequence · ${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`} action={
          <Button variant="secondary" onClick={addStep}>
            <Plus size={16} aria-hidden /> Add step
          </Button>
        }>
          {steps.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-body text-sm text-white/70">No steps yet. Most cold sequences work best with 2-4 short emails a few days apart.</p>
              <Button className="mt-4" onClick={addStep}>
                <Plus size={16} aria-hidden /> Add the first email
              </Button>
            </div>
          ) : (
            <ol className="flex flex-col gap-4">
              {steps.map((s, i) => {
                const idBase = `step-${s.key}`;
                return (
                  <li
                    key={s.key}
                    className={`border rounded-md ${previewIndex === i ? 'border-brand-purple/60' : 'border-white/10'}`}
                    onFocusCapture={() => setPreviewIndex(i)}
                  >
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                      <h3 className="font-body text-sm font-semibold text-white mr-auto">
                        Step {i + 1}
                        <span className="ml-2 font-normal text-white/55">
                          {i === 0
                            ? s.delay_days
                              ? `day ${dayOffsets[i]} after enrolment`
                              : 'sent first, right after launch'
                            : `day ${dayOffsets[i]} · if no reply`}
                        </span>
                      </h3>
                      <Button variant="ghost" onClick={() => moveStep(i, -1)} disabled={i === 0} aria-label={`Move step ${i + 1} up`}>
                        <ArrowUp size={14} aria-hidden /> Up
                      </Button>
                      <Button variant="ghost" onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1} aria-label={`Move step ${i + 1} down`}>
                        <ArrowDown size={14} aria-hidden /> Down
                      </Button>
                      <Button variant="ghost" onClick={() => removeStep(s.key)} aria-label={`Remove step ${i + 1}`} className="text-red-300 hover:text-red-200">
                        <Trash2 size={14} aria-hidden /> Remove
                      </Button>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <div className="grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
                        <Field label={i === 0 ? 'Wait (days)' : 'Wait after previous (days)'} htmlFor={`${idBase}-delay`}>
                          <input
                            id={`${idBase}-delay`}
                            type="number"
                            min={0}
                            max={60}
                            inputMode="numeric"
                            className={inputClass}
                            value={s.delay_days}
                            onChange={(e) => updateStep(s.key, { delay_days: Math.max(0, Number(e.target.value) || 0) })}
                          />
                        </Field>
                        <Field
                          label={i === 0 ? 'Subject' : 'Subject (optional)'}
                          htmlFor={`${idBase}-subject`}
                          hint={i === 0 ? undefined : 'Leave blank to send as a reply in the same thread.'}
                        >
                          <input
                            id={`${idBase}-subject`}
                            ref={(el) => {
                              if (el) fieldRefs.current.set(`${s.key}:subject`, el);
                              else fieldRefs.current.delete(`${s.key}:subject`);
                            }}
                            className={inputClass}
                            value={s.subject}
                            placeholder={i === 0 ? 'Quick question about {{company}}' : steps[0]?.subject ? `Re: ${steps[0].subject}` : 'Re: (step 1 subject)'}
                            onFocus={() => (lastFocused.current = { key: s.key, field: 'subject' })}
                            onChange={(e) => updateStep(s.key, { subject: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field
                        label="Body"
                        htmlFor={`${idBase}-body`}
                        hint="Plain text. Leave a blank line between paragraphs. The unsubscribe link and postal address are added automatically."
                      >
                        <textarea
                          id={`${idBase}-body`}
                          ref={(el) => {
                            if (el) fieldRefs.current.set(`${s.key}:body`, el);
                            else fieldRefs.current.delete(`${s.key}:body`);
                          }}
                          rows={8}
                          className={`${inputClass} font-body leading-relaxed resize-y`}
                          value={s.body}
                          placeholder={'Hi {{first_name|there}},\n\n…'}
                          onFocus={() => (lastFocused.current = { key: s.key, field: 'body' })}
                          onChange={(e) => updateStep(s.key, { body: e.target.value })}
                        />
                      </Field>
                      <div role="group" aria-label={`Insert a variable into step ${i + 1}`} className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-widest text-white/50 mr-1">Insert</span>
                        {[...TEMPLATE_VARIABLES.map((v) => ({ token: v.token, label: v.label })), ...customKeys.map((k) => ({ token: `{{custom.${k}}}`, label: `custom.${k}` }))].map((v) => (
                          <button
                            key={v.token}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => insertToken(s.key, v.token)}
                            title={`Insert ${v.token}`}
                            className="px-2 py-1 rounded-sm border border-white/15 font-mono text-xs text-white/80 hover:border-brand-cyan hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                      <p className="font-body text-xs text-white/50">
                        Fallbacks: <code className="font-mono text-white/70">{'{{first_name|there}}'}</code> prints &ldquo;there&rdquo; when the first name is blank.
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>

        {/* ── Preview + test ── */}
        <div className="flex flex-col gap-6 xl:sticky xl:top-20 self-start w-full">
          <Card title="Preview">
            {previewStep ? (
              <div className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Field label="Step" htmlFor="preview-step">
                    <select id="preview-step" className={inputClass} value={Math.min(previewIndex, steps.length - 1)} onChange={(e) => setPreviewIndex(Number(e.target.value))}>
                      {steps.map((s, i) => (
                        <option key={s.key} value={i}>Step {i + 1}{s.subject ? `: ${s.subject.slice(0, 40)}` : ''}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Preview as" htmlFor="preview-contact" hint={samples.length ? undefined : 'Sample contact. Choose a list to preview with real contacts.'}>
                    <select id="preview-contact" className={inputClass} value={sampleIndex} onChange={(e) => setSampleIndex(Number(e.target.value))} disabled={!samples.length}>
                      {samples.length ? (
                        samples.map((c, i) => (
                          <option key={c.email} value={i}>{contactName(c)}{c.company ? ` · ${c.company}` : ''}</option>
                        ))
                      ) : (
                        <option value={0}>{contactName(SAMPLE_CONTACT)} (sample)</option>
                      )}
                    </select>
                  </Field>
                </div>
                <article aria-label="Rendered email preview" className="border border-white/10 rounded-md bg-white/[0.03]">
                  <dl className="px-4 py-3 border-b border-white/10 font-body text-xs text-white/60 grid grid-cols-[3.5rem_minmax(0,1fr)] gap-y-1">
                    <dt>From</dt>
                    <dd className="text-white/85 truncate">{settings.from_name || 'Implenix'} &lt;{settings.from_email || 'not set'}&gt;</dd>
                    <dt>To</dt>
                    <dd className="text-white/85 truncate">{sample.email}</dd>
                    <dt>Subject</dt>
                    <dd className="text-white font-medium">{renderPreview(previewStep.subject, sample) ||
                        (previewIndex > 0 && steps[0]?.subject ? (
                          `Re: ${renderPreview(steps[0].subject, sample)}`
                        ) : (
                          <span className="text-white/40">(no subject)</span>
                        ))}</dd>
                  </dl>
                  <div className="px-4 py-4 font-body text-sm text-white/85 leading-relaxed whitespace-pre-wrap break-words">
                    {renderPreview(previewStep.body, sample) || <span className="text-white/40">Write the body to see it here.</span>}
                    <p className="mt-4 pt-3 border-t border-white/10 text-xs text-white/45">
                      Footer added when sent: postal address and an unsubscribe link.
                    </p>
                  </div>
                </article>
              </div>
            ) : (
              <p className="font-body text-sm text-white/60">Add a step to see a preview.</p>
            )}
          </Card>
          <TestEmail campaignId={campaign.id} stepCount={initialSteps.length} dirty={dirty} hasFrom={!!campaign.from_email} />
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card title="Sender and list">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Campaign name" htmlFor="c-name">
                <input id="c-name" className={inputClass} value={settings.name} onChange={(e) => set('name', e.target.value)} required />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Contact list" htmlFor="c-list" hint={campaign.status !== 'draft' ? 'Changing the list after launch only affects contacts enrolled later.' : 'Every active contact in this list is enrolled at launch.'}>
                <select id="c-list" className={inputClass} value={settings.list_id} onChange={(e) => set('list_id', e.target.value)}>
                  <option value="">Choose a list…</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="From name" htmlFor="c-from-name">
              <input id="c-from-name" className={inputClass} value={settings.from_name} onChange={(e) => set('from_name', e.target.value)} placeholder="Alex at Implenix" />
            </Field>
            <Field label="From email" htmlFor="c-from-email" hint="Must be on the verified outreach sending domain.">
              <input id="c-from-email" type="email" className={inputClass} value={settings.from_email} onChange={(e) => set('from_email', e.target.value)} placeholder="alex@outreach.implenix.net" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Reply-to (optional)" htmlFor="c-reply-to" hint="Leave blank so replies come back to the from address and show up in the inbox here.">
                <input id="c-reply-to" type="email" className={inputClass} value={settings.reply_to} onChange={(e) => set('reply_to', e.target.value)} />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Schedule">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Daily limit" htmlFor="c-limit" hint="New domains: start around 20-30 a day and raise slowly.">
              <input
                id="c-limit"
                type="number"
                min={1}
                max={2000}
                inputMode="numeric"
                className={inputClass}
                value={settings.daily_limit}
                onChange={(e) => set('daily_limit', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Time zone" htmlFor="c-tz">
              <select id="c-tz" className={inputClass} value={settings.send_timezone} onChange={(e) => set('send_timezone', e.target.value)}>
                {TIMEZONES.some((t) => t.value === settings.send_timezone) ? null : (
                  <option value={settings.send_timezone}>{settings.send_timezone}</option>
                )}
                {TIMEZONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Start sending at" htmlFor="c-start">
              <select id="c-start" className={inputClass} value={settings.send_hour_start} onChange={(e) => set('send_hour_start', Number(e.target.value))}>
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>{hourLabel(h)}</option>
                ))}
              </select>
            </Field>
            <Field label="Stop sending at" htmlFor="c-end">
              <select id="c-end" className={inputClass} value={settings.send_hour_end} onChange={(e) => set('send_hour_end', Number(e.target.value))}>
                {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>{h === 24 ? 'Midnight' : hourLabel(h)}</option>
                ))}
              </select>
            </Field>
            <fieldset className="sm:col-span-2">
              <legend className="font-body text-xs font-medium text-white/80 mb-1.5">Sending days</legend>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d) => {
                  const on = settings.send_days.includes(d.value);
                  return (
                    <label
                      key={d.value}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border font-body text-sm cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-brand-cyan ${
                        on ? 'border-brand-purple/60 bg-brand-purple/15 text-white' : 'border-white/15 text-white/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-brand-purple"
                        checked={on}
                        onChange={(e) =>
                          set(
                            'send_days',
                            e.target.checked
                              ? [...settings.send_days, d.value].sort((a, b) => a - b)
                              : settings.send_days.filter((x) => x !== d.value),
                          )
                        }
                      />
                      <span aria-hidden>{d.short}</span>
                      <span className="sr-only">{d.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </Card>

        <Card title="AI replies" className="lg:col-span-2">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <fieldset>
              <legend className="font-body text-xs font-medium text-white/80 mb-2 flex items-center gap-1.5">
                <Bot size={14} aria-hidden /> When someone replies
              </legend>
              <div className="flex flex-col gap-2">
                {AI_MODES.map((m) => (
                  <label
                    key={m.value}
                    className={`flex gap-3 p-3 rounded-md border cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-brand-cyan ${
                      settings.ai_mode === m.value ? 'border-brand-purple/60 bg-brand-purple/10' : 'border-white/10 hover:bg-white/[0.03]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ai_mode"
                      value={m.value}
                      checked={settings.ai_mode === m.value}
                      onChange={() => set('ai_mode', m.value)}
                      className="mt-0.5 h-4 w-4 accent-brand-purple"
                    />
                    <span>
                      <span className="block font-body text-sm font-medium text-white">{m.label}</span>
                      <span className="block mt-0.5 font-body text-xs text-white/60 leading-relaxed">{m.help}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field
              label="Instructions for the AI"
              htmlFor="c-ai"
              hint="The AI only knows what you write here plus the email thread. Be concrete; it will not make up prices or promises you leave out."
            >
              <textarea
                id="c-ai"
                rows={12}
                disabled={settings.ai_mode === 'off'}
                className={`${inputClass} leading-relaxed resize-y disabled:opacity-50`}
                value={settings.ai_instructions}
                onChange={(e) => set('ai_instructions', e.target.value)}
                placeholder={
                  'What we offer: an AI receptionist that answers every call 24/7 and books appointments.\n' +
                  'Goal: book a 20-minute intro call.\n' +
                  'Tone: friendly, short, no hype. Sign off as Alex.\n' +
                  'Qualify: how many calls a week do they miss? Which booking software do they use?\n' +
                  'Pricing: custom, discussed on the call. Never quote a number.\n' +
                  'If they say not interested: thank them and stop.'
                }
              />
            </Field>
          </div>
        </Card>
      </div>
    </>
  );
}

// ── Test email ─────────────────────────────────────────────────────
function TestEmail({ campaignId, stepCount, dirty, hasFrom }: { campaignId: string; stepCount: number; dirty: boolean; hasFrom: boolean }) {
  const [to, setTo] = useState('');
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user?.email) setTo((t) => t || data.user!.email!);
      });
  }, []);

  useEffect(() => {
    if (step > stepCount) setStep(Math.max(1, stepCount));
  }, [step, stepCount]);

  const send = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await postJson(`/api/admin/outreach/campaigns/${campaignId}/test`, { to: to.trim(), step });
      setMsg({ ok: true, text: `Test of step ${step} sent to ${to.trim()}.` });
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const blocker = !stepCount
    ? 'Save at least one step first.'
    : !hasFrom
      ? 'Save a from email first.'
      : dirty
        ? 'Save your changes first; the test uses the saved version.'
        : '';

  return (
    <Card title="Send a test">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!blocker) send();
        }}
      >
        <div className="grid gap-3 grid-cols-[minmax(0,1fr)_6.5rem]">
          <Field label="Send to" htmlFor="test-to">
            <input id="test-to" type="email" required className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label="Step" htmlFor="test-step">
            <select id="test-step" className={inputClass} value={step} onChange={(e) => setStep(Number(e.target.value))} disabled={!stepCount}>
              {Array.from({ length: Math.max(1, stepCount) }, (_, i) => (
                <option key={i} value={i + 1}>Step {i + 1}</option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <Button type="submit" variant="secondary" disabled={busy || !!blocker || !EMAIL_RE.test(to.trim())}>
            <Send size={16} aria-hidden /> {busy ? 'Sending…' : 'Send test email'}
          </Button>
        </div>
        <p aria-live="polite" className="font-body text-xs">
          {msg ? <span className={msg.ok ? 'text-emerald-300' : 'text-red-300'}>{msg.text}</span> : <span className="text-white/55">{blocker || 'Uses the first contact of the list for variables.'}</span>}
        </p>
      </form>
    </Card>
  );
}

// ── Launch / pause / resume ────────────────────────────────────────
function CampaignControls({ campaign, dirty, blockers }: { campaign: Campaign; dirty: boolean; blockers: string[] }) {
  const router = useRouter();
  const [action, setAction] = useState<'launch' | 'pause' | 'resume' | null>(null);
  const [eligible, setEligible] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const open = async (a: 'launch' | 'pause' | 'resume') => {
    setMsg(null);
    setAction(a);
    if (a === 'launch' && campaign.list_id) {
      setEligible(null);
      const { count } = await supabaseBrowser()
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('list_id', campaign.list_id)
        .eq('status', 'active');
      setEligible(count ?? 0);
    }
  };

  const confirm = async () => {
    if (!action) return;
    setBusy(true);
    try {
      const res = await postJson<{ enrolled?: number; status?: string }>(
        `/api/admin/outreach/campaigns/${campaign.id}/${action}`,
      );
      setMsg({
        ok: true,
        text:
          action === 'launch'
            ? `Launched. ${(res.enrolled ?? 0).toLocaleString()} contacts enrolled.`
            : action === 'pause'
              ? 'Campaign paused.'
              : 'Campaign resumed.',
      });
      setAction(null);
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
      setAction(null);
    } finally {
      setBusy(false);
    }
  };

  const launchDisabledReason = blockers.length
    ? `To launch, ${blockers.join(', ')} and save.`
    : dirty
      ? 'Save your changes before launching.'
      : '';
  const days = eligible ? Math.ceil(eligible / Math.max(1, campaign.daily_limit)) : 0;

  return (
    <div className="flex flex-col items-start sm:items-end gap-1">
      <div className="flex flex-wrap gap-2">
        {campaign.status === 'draft' ? (
          <Button onClick={() => open('launch')} disabled={!!launchDisabledReason} aria-describedby="launch-hint">
            <Rocket size={16} aria-hidden /> Launch
          </Button>
        ) : null}
        {campaign.status === 'active' ? (
          <Button variant="secondary" onClick={() => open('pause')}>
            <Pause size={16} aria-hidden /> Pause
          </Button>
        ) : null}
        {campaign.status === 'paused' ? (
          <Button onClick={() => open('resume')} disabled={dirty}>
            <Play size={16} aria-hidden /> Resume
          </Button>
        ) : null}
      </div>
      <p id="launch-hint" aria-live="polite" className="font-body text-xs max-w-xs sm:text-right">
        {msg ? (
          <span className={msg.ok ? 'text-emerald-300' : 'text-red-300'}>{msg.text}</span>
        ) : campaign.status === 'draft' && launchDisabledReason ? (
          <span className="text-white/55">{launchDisabledReason}</span>
        ) : null}
      </p>

      <ConfirmDialog
        open={action !== null}
        busy={busy}
        title={action === 'launch' ? 'Launch this campaign?' : action === 'pause' ? 'Pause this campaign?' : 'Resume this campaign?'}
        confirmLabel={action === 'launch' ? 'Launch campaign' : action === 'pause' ? 'Pause' : 'Resume'}
        confirmVariant={action === 'pause' ? 'danger' : 'primary'}
        onConfirm={confirm}
        onClose={() => !busy && setAction(null)}
      >
        {action === 'launch' ? (
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-white">{eligible === null ? 'Counting…' : eligible.toLocaleString()}</strong> active
              contacts will be enrolled (unsubscribed, bounced and already-enrolled contacts are skipped).
            </li>
            <li>
              Up to <strong className="text-white">{campaign.daily_limit.toLocaleString()}</strong> emails a day, {hourLabel(campaign.send_hour_start)}-{campaign.send_hour_end === 24 ? 'midnight' : hourLabel(campaign.send_hour_end)}{' '}
              {TIMEZONES.find((t) => t.value === campaign.send_timezone)?.label ?? campaign.send_timezone} time,{' '}
              {WEEKDAYS.filter((d) => campaign.send_days.includes(d.value)).map((d) => d.short).join(', ')}.
            </li>
            {days > 1 ? <li>First emails to everyone will take about {days} sending days.</li> : null}
            <li>AI replies: {AI_MODES.find((m) => m.value === campaign.ai_mode)?.label.toLowerCase()}.</li>
          </ul>
        ) : action === 'pause' ? (
          <p>No more emails go out until you resume. Replies still arrive in the inbox{campaign.ai_mode !== 'off' ? ' and the AI still drafts answers' : ''}.</p>
        ) : (
          <p>
            Sending restarts in the next sending window, up to {campaign.daily_limit.toLocaleString()} emails a day.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
