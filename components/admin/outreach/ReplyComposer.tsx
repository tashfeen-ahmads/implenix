'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button, Field, inputClass } from '@/components/admin/ui';
import { errorMessage, postJson } from './shared';

// Manual reply in the thread, sent by the engine through the outreach domain.
export function ReplyComposer({
  contactId,
  toEmail,
  defaultSubject,
  disabledReason,
}: {
  contactId: string;
  toEmail: string;
  defaultSubject: string;
  disabledReason?: string;
}) {
  const router = useRouter();
  const uid = useId();
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const send = async () => {
    if (!body.trim() || !subject.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await postJson('/api/admin/outreach/reply', { contactId, subject: subject.trim(), body });
      setBody('');
      setMsg({ ok: true, text: `Reply sent to ${toEmail}.` });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      aria-labelledby={`${uid}-h`}
      className="border border-white/10 rounded-md p-4 flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <h3 id={`${uid}-h`} className="font-body text-sm font-semibold text-white">
        Write a reply
      </h3>
      {disabledReason ? <p className="font-body text-sm text-amber-300">{disabledReason}</p> : null}
      <Field label="Subject" htmlFor={`${uid}-subject`}>
        <input id={`${uid}-subject`} className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} required disabled={!!disabledReason} />
      </Field>
      <Field label="Message" htmlFor={`${uid}-body`}>
        <textarea
          id={`${uid}-body`}
          rows={6}
          className={`${inputClass} leading-relaxed resize-y`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          required
          disabled={!!disabledReason}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || !body.trim() || !subject.trim() || !!disabledReason}>
          <Send size={16} aria-hidden /> {busy ? 'Sending…' : 'Send reply'}
        </Button>
        <span className="font-body text-xs text-white/45">Ctrl/Cmd + Enter to send</span>
        <p aria-live="polite" className="font-body text-sm">
          {msg ? <span className={msg.ok ? 'text-emerald-300' : 'text-red-300'}>{msg.text}</span> : null}
        </p>
      </div>
    </form>
  );
}
