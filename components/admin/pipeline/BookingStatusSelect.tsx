'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setBookingStatus } from './actions';

const OPTIONS = [
  ['scheduled', 'Scheduled'],
  ['completed', 'Completed'],
  ['no_show', 'No-show'],
  ['cancelled', 'Cancelled'],
] as const;

export function BookingStatusSelect({ clientId, bookingId, status }: { clientId: string; bookingId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  return (
    <>
      <label htmlFor={`bs-${bookingId}`} className="sr-only">Call status</label>
      <select
        id={`bs-${bookingId}`}
        value={value}
        onChange={async (e) => {
          const next = e.target.value;
          const prev = value;
          setValue(next);
          try {
            await setBookingStatus(clientId, bookingId, next);
            router.refresh();
          } catch {
            setValue(prev);
          }
        }}
        className="bg-black border border-white/15 rounded-sm px-2 py-1 font-body text-xs text-white focus:outline-none focus:border-brand-cyan"
      >
        {OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </>
  );
}
