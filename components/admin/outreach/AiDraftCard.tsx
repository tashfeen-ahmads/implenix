'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Check, Trash2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Button, Field, inputClass } from '@/components/admin/ui';
import { errorMessage, postJson } from './shared';

// An AI-drafted reply awaiting approval: edit, approve & send, or discard.
export function AiDraftCard({
  messageId,
  subject: initialSubject,
  body: initialBody,
  toEmail,
  meta,
}: {
  messageId: string;
  subject: string;
  body: string;
  toEmail: string;
  meta: React.ReactNode;
}) {
  const router = useRouter();
  const uid = useId();
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [busy, setBusy] = useState<'approve' | 'discard' | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const edited = subject !== initialSubject || body !== initialBody;

  const approve = async () => {
    if (!body.trim()) return;
    setBusy('approve');
    setMsg(null);
    try {
      await postJson(`/api/admin/outreach/messages/${messageId}/approve`, edited ? { subject, body } : {});
      setMsg({ ok: true, text: `Sent to ${toEmail}.` });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const discard = async () => {
    if (!window.confirm('Discard this AI draft? It will be deleted and nothing is sent.')) return;
    setBusy('discard');
    setMsg(null);
    try {
      const { error } = await supabaseBrowser().from('messages').delete().eq('id', messageId).eq('status', 'draft');
      if (error) throw new Error(error.message);
      setMsg({ ok: true, text: 'Draft discarded.' });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      aria-labelledby={`${uid}-h`}
      className="border border-dashed border-amber-400/50 bg-amber-500/[0.06] rounded-md"
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-amber-400/20">
        <Bot size={16} aria-hidden className="text-amber-300" />
        <h3 id={`${uid}-h`} className="font-body text-sm font-semibold text-white">
          AI draft, waiting for approval
        </h3>
        <span className="font-body text-xs text-white/55">To {toEmail}</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {meta}
        <Field label="Subject" htmlFor={`${uid}-subject`}>
          <input id={`${uid}-subject`} className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Reply" htmlFor={`${uid}-body`} hint="Edit freely before sending. The unsubscribe footer is added automatically.">
          <textarea
            id={`${uid}-body`}
            rows={8}
            className={`${inputClass} leading-relaxed resize-y`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={approve} disabled={!!busy || !body.trim()}>
            <Check size={16} aria-hidden /> {busy === 'approve' ? 'Sending…' : edited ? 'Send edited reply' : 'Approve & send'}
          </Button>
          <Button variant="danger" onClick={discard} disabled={!!busy}>
            <Trash2 size={16} aria-hidden /> {busy === 'discard' ? 'Discarding…' : 'Discard'}
          </Button>
          <p aria-live="polite" className="font-body text-sm">
            {msg ? <span className={msg.ok ? 'text-emerald-300' : 'text-red-300'}>{msg.text}</span> : null}
          </p>
        </div>
      </div>
    </section>
  );
}
