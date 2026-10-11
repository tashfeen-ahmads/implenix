// Docs navigation, shared by the sidebar (client) and the doc pages
// (server: breadcrumbs, prev/next). Keep it out of 'use client' files so
// server components receive the data, not a client reference.

export type DocsNavItem = {
  title: string;
  href: string;
};

export type DocsNavSection = {
  title: string;
  items: DocsNavItem[];
};

export const DOCS_NAV: DocsNavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Quick Start', href: '/docs/getting-started/quick-start' },
      { title: 'Prerequisites', href: '/docs/getting-started/prerequisites' },
      { title: 'First Call Test', href: '/docs/getting-started/first-call-test' },
    ],
  },
  {
    title: 'Agent Configuration',
    items: [
      { title: 'Call Scripts', href: '/docs/agent-configuration/call-scripts' },
      { title: 'Transfer Rules', href: '/docs/agent-configuration/transfer-rules' },
      { title: 'Business Hours', href: '/docs/agent-configuration/business-hours' },
      { title: 'Voicemail Handling', href: '/docs/agent-configuration/voicemail-handling' },
    ],
  },
  {
    title: 'CRM Integrations',
    items: [
      { title: 'GoHighLevel', href: '/docs/crm-integrations/gohighlevel' },
      { title: 'HubSpot', href: '/docs/crm-integrations/hubspot' },
      { title: 'Salesforce', href: '/docs/crm-integrations/salesforce' },
      { title: 'Zoho', href: '/docs/crm-integrations/zoho' },
      { title: 'Custom Webhook', href: '/docs/crm-integrations/custom-webhook' },
    ],
  },
  {
    title: 'Phone Setup',
    items: [
      { title: 'Number Provisioning', href: '/docs/phone-setup/number-provisioning' },
      { title: 'SIP Trunk Basics', href: '/docs/phone-setup/sip-trunk-basics' },
      { title: 'Call Forwarding Setup', href: '/docs/phone-setup/call-forwarding-setup' },
    ],
  },
  {
    title: 'Implementation Guide',
    items: [
      { title: 'How Implenix Deploys Your Agent', href: '/docs/implementation-guide/overview' },
      { title: 'Timeline', href: '/docs/implementation-guide/timeline' },
      { title: 'What You Need to Provide', href: '/docs/implementation-guide/what-you-provide' },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      { title: 'Common Issues', href: '/docs/troubleshooting/common-issues' },
      { title: 'Support Contact', href: '/docs/troubleshooting/support-contact' },
    ],
  },
];

export const DOCS_FLAT: DocsNavItem[] = DOCS_NAV.flatMap((s) => s.items);

export function docsNeighbors(href: string) {
  const i = DOCS_FLAT.findIndex((d) => d.href === href);
  return {
    prev: i > 0 ? DOCS_FLAT[i - 1] : null,
    next: i >= 0 && i < DOCS_FLAT.length - 1 ? DOCS_FLAT[i + 1] : null,
  };
}

export function docsSectionStart(sectionTitle: string): string | null {
  return DOCS_NAV.find((s) => s.title === sectionTitle)?.items[0]?.href ?? null;
}
