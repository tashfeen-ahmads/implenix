'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TeamMember } from '@/lib/db/types';
import { Button } from '@/components/admin/ui';

export function MemberActions({ member }: { member: TeamMember }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = member.full_name ?? member.email;

  const call = async (method: 'PATCH' | 'DELETE', body?: object) => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/team/${member.user_id}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? 'Something went wrong.');
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-1 whitespace-nowrap">
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => call('PATCH', { role: member.role === 'admin' ? 'member' : 'admin' })}
        >
          {member.role === 'admin' ? 'Make member' : 'Make admin'}
        </Button>
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => {
            if (window.confirm(`Remove ${name} from the team? They lose access right away. Their notes and history stay.`)) call('DELETE');
          }}
        >
          Remove
        </Button>
      </div>
      {error ? <p role="alert" className="font-body text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
