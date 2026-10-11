'use client';

import { AudioLines } from 'lucide-react';
import { openRon } from '@/lib/ron';
import { trackConversion, GA4_EVENTS } from '@/lib/analytics';

type Variant = 'primary' | 'secondary' | 'inline' | 'nav';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  ctaLocation: string;
  variant?: Variant;
  // Applies to primary/secondary only.
  size?: Size;
  label?: string;
  className?: string;
};

const TONES: Record<Variant, string> = {
  primary: 'bg-brand-purple text-white hover:opacity-90',
  secondary: 'border border-brand-cyan/70 text-brand-cyan hover:bg-brand-cyan/10',
  inline:
    'text-brand-cyan text-sm font-mono uppercase tracking-widest hover:opacity-80',
  nav: 'bg-brand-cyan/10 border border-brand-cyan text-brand-cyan px-4 py-2 text-sm hover:bg-brand-cyan/20',
};

const SIZES: Record<Size, string> = {
  sm: 'text-xs px-3 py-2.5',
  md: 'px-6 py-3',
  lg: 'text-base px-7 py-4',
};

// Opens the in-browser Ron voice panel (mounted once per layout by
// RonLauncher). Replaces the old click-to-call phone CTA.
export function TestRonCTA({
  ctaLocation,
  variant = 'primary',
  size = 'md',
  label = 'Test Ron now',
  className = '',
}: Props) {
  const sized = variant === 'primary' || variant === 'secondary';
  const glow =
    variant === 'primary' && size === 'lg'
      ? 'shadow-[0_10px_40px_-10px_rgba(187,0,255,0.6)]'
      : '';

  const onClick = () => {
    trackConversion(GA4_EVENTS.ronOpened, { cta_location: ctaLocation });
    openRon(ctaLocation);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      data-cta-location={ctaLocation}
      data-cta-type="ron"
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-sm transition active:translate-y-px ${TONES[variant]} ${sized ? SIZES[size] : ''} ${glow} ${className}`}
    >
      <AudioLines size={sized && size !== 'sm' ? 16 : 14} aria-hidden />
      {label}
    </button>
  );
}
