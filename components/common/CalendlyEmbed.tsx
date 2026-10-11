'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { CALENDLY_URL } from '@/lib/leadCapture';
import { trackLead, GA4_EVENTS } from '@/lib/analytics';

type Props = {
  /** Where this embed lives, used in analytics events. */
  ctaLocation: string;
  /** Pixel height of the embedded calendar. */
  height?: number;
  /** Optional title for screen readers. */
  title?: string;
};

// Inline Calendly embed. Booking event fires via Calendly's postMessage
// API so every confirmed booking is tracked as a lead conversion.
export function CalendlyEmbed({
  ctaLocation,
  height = 720,
  title = 'Book a 30-minute call with Implenix',
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!event.origin.includes('calendly.com')) return;
      const data = event.data;
      const eventType =
        typeof data === 'object' && data && 'event' in data
          ? (data as { event?: string }).event
          : '';
      if (typeof eventType === 'string' && eventType.includes('invitee_scheduled')) {
        trackLead(ctaLocation, GA4_EVENTS.leadDemo, { source: 'calendly' });
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [ctaLocation]);

  const url = `${CALENDLY_URL}?hide_landing_page_details=1&hide_event_type_details=0&background_color=070538&text_color=ffffff&primary_color=bb00ff`;

  return (
    <div className="relative bg-black border border-brand-purple/30">
      {!loaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
          <Loader2 size={20} className="text-brand-cyan animate-spin" aria-hidden />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/55 flex items-center gap-1.5">
            <Calendar size={11} aria-hidden /> Loading calendar
          </span>
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        src={url}
        title={title}
        data-cta-location={ctaLocation}
        data-cta-type="calendly"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ height }}
        className="block w-full border-0"
      />
    </div>
  );
}
