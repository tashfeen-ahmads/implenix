'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, CalendarCheck } from 'lucide-react';
import { TestRonCTA } from '@/components/ron/TestRonCTA';

export function StickyDemoCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY;
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const ratio = scrolled / total;
      if (ratio > 0.35) setVisible(true);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 lg:left-auto lg:right-6 lg:bottom-6 lg:w-[360px] z-40 bg-black border border-brand-purple p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-heading text-white text-sm">
            Talk to Ron now
          </p>
          <p className="text-xs text-white/70 font-body mt-0.5 leading-relaxed">
            Test our AI receptionist in your browser, or pick a slot.
          </p>
        </div>
        <button
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-2">
        <TestRonCTA
          ctaLocation="sticky"
          size="sm"
          className="flex-1"
        />
        <Link
          href="/contact"
          data-cta-location="sticky-calendar"
          data-cta-type="calendar"
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-brand-cyan text-brand-cyan text-xs font-medium px-3 py-2.5 rounded-sm hover:bg-brand-cyan/10"
        >
          <CalendarCheck size={12} /> Book slot
        </Link>
      </div>
    </div>
  );
}
