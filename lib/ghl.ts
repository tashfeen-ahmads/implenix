// GoHighLevel form IDs.
//
// REPLACE these placeholder IDs with real GHL form IDs once the forms
// have been built in your GHL sub-account. Form IDs are visible in
// the GHL form builder URL: .../v2/location/.../forms/builder/{FORM_ID}.
//
// You can also override per-environment via NEXT_PUBLIC_GHL_FORM_*.

// Each key must be read with a literal `process.env.NEXT_PUBLIC_*` access:
// Next.js only inlines public env vars into the client bundle when the
// name is written out statically.
export const GHL_FORM_IDS = {
  demo: process.env.NEXT_PUBLIC_GHL_FORM_DEMO || 'GHL_FORM_ID_DEMO',
  contact: process.env.NEXT_PUBLIC_GHL_FORM_CONTACT || 'GHL_FORM_ID_CONTACT',
  lp: process.env.NEXT_PUBLIC_GHL_FORM_LP || 'GHL_FORM_ID_LP',
  industry: process.env.NEXT_PUBLIC_GHL_FORM_INDUSTRY || 'GHL_FORM_ID_INDUSTRY',
  caseStudy: process.env.NEXT_PUBLIC_GHL_FORM_CASESTUDY || 'GHL_FORM_ID_CASESTUDY',
  newsletter: process.env.NEXT_PUBLIC_GHL_FORM_NEWSLETTER || 'GHL_FORM_ID_NEWSLETTER',
  roiGate: process.env.NEXT_PUBLIC_GHL_FORM_ROI_GATE || 'GHL_FORM_ID_ROI_GATE',
} as const;

export type GhlFormKey = keyof typeof GHL_FORM_IDS;

// GHL form embed URL pattern. Adjust if your account uses a different
// hostname (e.g. regional or white-labeled sub-account).
export function ghlEmbedUrl(formId: string): string {
  return `https://api.leadconnectorhq.com/widget/form/${formId}`;
}
