'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, scroll } from 'framer-motion';
import { X, ArrowRight, CalendarCheck } from 'lucide-react';
import { Badge } from './Badge';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { trackConversion, GA4_EVENTS } from '@/lib/analytics';

const SHOW_AFTER_MS = 25_000;
const SHOW_AFTER_SCROLL = 0.5;
const PAGES_BEFORE_SHOW = 2;

const COOLDOWN_DISMISS_MS = 4 * 60 * 60 * 1000;

const KEY_DISMISSED = 'implenix.lead_dismissed_at';
const KEY_PAGES = 'implenix.lead_pages_viewed';

const EXCLUDED_PREFIXES = ['/lp/', '/contact', '/docs/', '/api/'];

function readTs(key: string): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  const dismissed = readTs(KEY_DISMISSED);
  if (dismissed && Date.now() - dismissed < COOLDOWN_DISMISS_MS) return false;
  return true;
}

// Lead-capture popup. No form, no email, direct conversion CTAs only:
// (1) talk to Ron now, (2) book on the calendar. Both are
// one-tap actions so the popup converts without any data entry.
export function LeadMagnetPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggeredRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const isExcluded = EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = Number(window.localStorage.getItem(KEY_PAGES) ?? '0');
    const next = current + 1;
    window.localStorage.setItem(KEY_PAGES, String(next));

    if (isExcluded) return;
    if (triggeredRef.current) return;
    if (!shouldShow()) return;

    if (next >= PAGES_BEFORE_SHOW) {
      const t = window.setTimeout(() => {
        if (!triggeredRef.current && shouldShow()) {
          triggeredRef.current = true;
          setOpen(true);
        }
      }, 1500);
      return () => window.clearTimeout(t);
    }
  }, [pathname, isExcluded]);

  useEffect(() => {
    if (isExcluded) return;
    if (triggeredRef.current) return;
    if (!shouldShow()) return;

    const fire = (reason: string) => {
      if (triggeredRef.current) return;
      if (!shouldShow()) return;
      triggeredRef.current = true;
      setOpen(true);
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'lead_popup_open',
          trigger: reason,
        });
      }
    };

    const timer = window.setTimeout(() => fire('time'), SHOW_AFTER_MS);

    const stopScroll = scroll((progress: number) => {
      if (progress >= SHOW_AFTER_SCROLL) fire('scroll');
    });

    const supportsHover = window.matchMedia('(hover: hover)').matches;
    let onMouseLeave: ((e: MouseEvent) => void) | null = null;
    if (supportsHover) {
      onMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) fire('exit-intent');
      };
      document.addEventListener('mouseleave', onMouseLeave);
    }

    return () => {
      window.clearTimeout(timer);
      stopScroll();
      if (onMouseLeave) document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isExcluded]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
      if (e.key !== 'Tab' || !panelRef.current) return;
      // Keep Tab cycling inside the dialog.
      const items = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, iframe',
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    setTimeout(() => closeButtonRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(KEY_DISMISSED, String(Date.now()));
    }
    setOpen(false);
  };

  const handleBook = () => {
    trackConversion(GA4_EVENTS.leadPopupBookClicked, { source: 'popup' });
  };

  if (isExcluded) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="popup"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-magnet-heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={handleDismiss}
            tabIndex={-1}
            className="absolute inset-0 bg-black/70"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            ref={panelRef}
            className="relative w-full max-w-md bg-brand-dark border border-brand-purple/40 grid-bg overscroll-contain"
          >
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Dismiss"
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-white/55 hover:text-white transition-colors"
            >
              <X size={18} aria-hidden />
            </button>

            <div className="p-5 sm:p-7 flex flex-col gap-5">
              <Badge label="Skip the form · pick one" variant="cyan" />
              <h2
                id="lead-magnet-heading"
                className="font-heading text-2xl md:text-3xl text-white leading-snug"
              >
                Stop losing deals to missed calls.
              </h2>
              <p className="font-body text-sm text-white/75 leading-relaxed">
                Talk to Ron live and hear him run a real qualification
                conversation, or book a 30-minute call with the team on the
                calendar. No form, no email, just one tap.
              </p>

              <div className="flex flex-col gap-3 mt-1">
                <TestRonCTA
                  ctaLocation="lead-popup-ron"
                  variant="primary"
                  label="Test Ron now"
                />
                <a
                  href="/contact"
                  onClick={handleBook}
                  data-cta-location="lead-popup-calendar"
                  data-cta-type="calendar"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-5 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  <CalendarCheck size={16} /> Book on the calendar
                  <ArrowRight size={14} />
                </a>
              </div>

              <p className="text-[10px] font-mono uppercase tracking-widest text-white/45 mt-2">
                ▸ Zero data entry · zero spam · just a real conversation
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
