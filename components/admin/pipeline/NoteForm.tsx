'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, inputClass } from '@/components/admin/ui';
import { addNote } from './actions';

export function NoteForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        setBusy(true);
        await addNote(clientId, body.trim()).finally(() => setBusy(false));
        setBody('');
        router.refresh();
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="note" className="sr-only">Add a note</label>
      <textarea
        id="note"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note: call summary, next step, what they need…"
        className={`${inputClass} resize-y`}
      />
      <div>
        <Button type="submit" variant="secondary" disabled={busy || !body.trim()}>
          {busy ? 'Saving…' : 'Add note'}
        </Button>
      </div>
    </form>
  );
}
