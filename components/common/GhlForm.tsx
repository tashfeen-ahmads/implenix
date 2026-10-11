'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GHL_FORM_IDS, ghlEmbedUrl, type GhlFormKey } from '@/lib/ghl';
import { trackLead, GA4_EVENTS, type GA4EventName } from '@/lib/analytics';

// Map GHL form keys to GA4 event names so each slot reports under a
// distinct conversion. Demo, contact, and audit get their own event;
// other variants share leadGhl.
const FORM_KEY_TO_EVENT: Record<string, GA4EventName> = {
  demo: GA4_EVENTS.leadDemo,
  contact: GA4_EVENTS.leadContact,
  lp: GA4_EVENTS.leadDemo,
  industry: GA4_EVENTS.leadDemo,
  caseStudy: GA4_EVENTS.leadDemo,
  newsletter: GA4_EVENTS.leadNewsletter,
  roiGate: GA4_EVENTS.leadAudit,
};

type Props = {
  formKey: GhlFormKey;
  ctaLocation: string;
  height?: number;
  title?: string;
};

// Embeds a GoHighLevel form via iframe. Listens for the GHL postMessage
// handshake to fire trackLead/trackConversion on submit.
//
// Requires a real GHL form ID in lib/ghl.ts (or via NEXT_PUBLIC_GHL_FORM_*
// env vars). When the placeholder ID is in use the component renders a
// visible inline notice instead of a broken iframe so it is obvious during
// development.
export function GhlForm({
  formKey,
  ctaLocation,
  height = 540,
  title,
}: Props) {
  const formId = GHL_FORM_IDS[formKey];
  const isPlaceholder = formId.startsWith('GHL_FORM_ID_');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isPlaceholder) return;
    function onMessage(event: MessageEvent) {
      const origin = event.origin;
      if (
        !origin.includes('leadconnectorhq.com') &&
        !origin.includes('msgsndr.com') &&
        !origin.includes('gohighlevel.com')
      ) {
        return;
      }
      const data = event.data;
      const type =
        typeof data === 'string'
          ? data
          : (data && (data.type || data.event)) || '';
      if (typeof type === 'string' && /submit|success/i.test(type)) {
        trackLead(
          ctaLocation,
          FORM_KEY_TO_EVENT[formKey] ?? GA4_EVENTS.leadGhl,
          { formKey },
        );
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [ctaLocation, isPlaceholder]);

  if (isPlaceholder) {
    return (
      <div
        role="note"
        className="border border-dashed border-brand-cyan/40 bg-black p-5 flex flex-col gap-2"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
          ▸ GHL form placeholder
        </span>
        <p className="font-body text-sm text-white/75 leading-relaxed">
          Set <code className="font-mono text-brand-cyan">{`NEXT_PUBLIC_GHL_FORM_${formKey.toUpperCase()}`}</code>{' '}
          in <code className="font-mono text-brand-cyan">.env.local</code> to
          embed the live GoHighLevel form here.
        </p>
        <p className="font-mono text-[11px] text-white/55">
          Slot · {ctaLocation}
        </p>
      </div>
    );
  }

  const url = ghlEmbedUrl(formId);

  return (
    <div className="relative bg-black border border-brand-purple/30">
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={20} className="text-brand-cyan animate-spin" aria-hidden />
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        src={url}
        title={title ?? `Implenix · ${formKey}`}
        data-cta-location={ctaLocation}
        data-cta-type="ghl-form"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ height }}
        className="block w-full border-0"
        allow="payment; geolocation"
      />
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
