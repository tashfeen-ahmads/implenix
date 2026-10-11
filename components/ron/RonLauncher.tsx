'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { RON_OPEN_EVENT, type RonOpenDetail } from '@/lib/ron';

// The voice SDK only downloads the first time someone opens Ron.
const RonPanel = dynamic(
  () => import('./RonPanel').then((m) => m.RonPanel),
  { ssr: false },
);

export function RonLauncher() {
  const [open, setOpen] = useState(false);
  const [ctaLocation, setCtaLocation] = useState('unknown');

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<RonOpenDetail>).detail;
      setCtaLocation(detail?.ctaLocation ?? 'unknown');
      setOpen(true);
    };
    window.addEventListener(RON_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(RON_OPEN_EVENT, onOpen);
  }, []);

  if (!open) return null;
  return <RonPanel ctaLocation={ctaLocation} onClose={() => setOpen(false)} />;
}
