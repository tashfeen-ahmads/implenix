'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/admin/ui';

// Modal confirm built on the native <dialog> element: focus is trapped,
// Escape closes it, and focus returns to the opener.
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  confirmVariant = 'primary',
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      className="w-[min(32rem,calc(100vw-2rem))] bg-[#0b0b14] text-white border border-white/15 rounded-md p-0 backdrop:bg-black/70"
    >
      <div className="p-6">
        <h2 id={titleId} className="font-heading text-lg text-white">
          {title}
        </h2>
        <div className="mt-3 font-body text-sm text-white/75 leading-relaxed">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={busy} autoFocus>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
