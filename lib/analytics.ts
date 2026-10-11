// GTM, Meta Pixel, Google Ads conversion, and GA4 conversion helpers.
// Replace placeholder IDs in /app/layout.tsx before launch.

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, unknown>;

// Named GA4 conversion events. Mark these as "Mark as conversion" in the
// Google Analytics 4 Admin → Events panel to register them as conversions.
// Keep names stable, analytics dashboards and ad campaigns reference
// these strings.
export const GA4_EVENTS = {
  // Lead capture surfaces (form submits)
  leadAudit: 'lead_audit', // /audit gate unlock
  leadPopup: 'lead_popup', // lead-magnet popup playbook signup
  leadContact: 'lead_contact', // /contact form submit
  leadDemo: 'lead_demo', // demo CTA / GHL form submit
  leadNewsletter: 'lead_newsletter', // newsletter form submit
  leadGhl: 'lead_ghl', // any GHL iframe submit
  // Engagement signals
  tryItCallClicked: 'try_demo_call_clicked', // /try-it phone number click
  pricingViewed: 'pricing_viewed', // /pricing page view
  industryViewed: 'industry_page_viewed', // /ai-receptionist-for-* view
  comparisonViewed: 'comparison_page_viewed', // vs / alternative pages
  // Calendly + phone CTAs (no-form lead capture)
  agentPhoneClicked: 'agent_phone_clicked', // PhoneCTA tap
  auditRun: 'audit_run', // /audit input step completed
  auditBookClicked: 'audit_book_clicked', // /audit calendar CTA tap
  leadPopupBookClicked: 'lead_popup_book_clicked', // popup calendar tap
} as const;

export type GA4EventName = (typeof GA4_EVENTS)[keyof typeof GA4_EVENTS];

export function trackEvent(eventName: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

// GA4 named conversion event. Pushes to dataLayer for GTM tag-managed
// firing AND directly to gtag if available. Fires Google Ads conversion
// in parallel for paid-traffic attribution.
const GOOGLE_ADS_SEND_TO =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID &&
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL
    ? `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL}`
    : null;

export function trackConversion(
  eventName: GA4EventName,
  params: EventParams = {},
): void {
  if (typeof window === 'undefined') return;
  // GA4 named event (configure as Conversion in GA4 Admin)
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
    // Google Ads conversion, only when both the account ID and the
    // conversion label are configured (see LAUNCH_CHECKLIST.md).
    if (GOOGLE_ADS_SEND_TO) {
      window.gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_SEND_TO,
        event_label: eventName, ...params,
      });
    }
  }
  trackEvent(eventName, params);
}

// Meta Pixel Lead event + GA4 conversion. Use this on any form submit
// that captures a contact identity (email, phone). Pass a GA4 event name
// for consistent dashboard reporting.
export function trackLead(
  source: string,
  ga4Event: GA4EventName = GA4_EVENTS.leadGhl,
  params: EventParams = {},
): void {
  if (typeof window === 'undefined') return;
  // Meta Pixel Lead event. fbq only exists when NEXT_PUBLIC_META_PIXEL_ID
  // is set (the pixel loads in app/layout.tsx).
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', { source, ...params });
  }
  trackConversion(ga4Event, { source, ...params });
}

// POSTs the form payload to the internal /api/leads route, which forwards to
// CRM_WEBHOOK_URL when configured. Failures are swallowed so the UI can still
// complete its success state, analytics events still fire either way.
export async function submitWebhook(
  data: Record<string, unknown>,
  source: string,
): Promise<void> {
  if (typeof window === 'undefined') return;
  trackEvent('form_submit', { source, ...data });
  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source,
        data,
        page: window.location.pathname,
        ts: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    // Never block the success state on a webhook failure.
  }
}
