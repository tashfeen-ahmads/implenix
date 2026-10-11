const { withContentlayer } = require('next-contentlayer2');

// Slug-to-canonical mapping. Old "-businesses" URLs and the original
// /industries/ path both 301 to the SEO-aligned /ai-receptionist-for-[slug]
// pattern shipped in Phase 2 of the SEO plan.
const SLUG_REDIRECTS = [
  { from: 'hvac', to: 'hvac-companies' },
  { from: 'dental', to: 'dentists' },
  { from: 'plumbing', to: 'plumbers' },
  { from: 'med-spa', to: 'med-spas' },
  { from: 'roofing', to: 'roofers' },
  { from: 'real-estate', to: 'real-estate' },
  { from: 'law-firms', to: 'law-firms' },
  { from: 'auto-repair', to: 'auto-repair' },
];

// Static page slugs at /ai-receptionist-for-* that must NOT be rewritten
// to the dynamic /i/[slug] handler — they have their own dedicated
// pillar pages and should resolve to those.
const STATIC_FOR_SLUGS = [
  'small-business',
  'solopreneurs',
  'startups',
  'multi-location-businesses',
];

const STATIC_VS_SLUGS = ['human-receptionist'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  async redirects() {
    const fromBusinesses = SLUG_REDIRECTS.map(({ from, to }) => ({
      source: `/ai-receptionist-for-${from}-businesses`,
      destination: `/ai-receptionist-for-${to}`,
      permanent: true,
    }));
    const fromIndustries = SLUG_REDIRECTS.map(({ from, to }) => ({
      source: `/industries/${from}`,
      destination: `/ai-receptionist-for-${to}`,
      permanent: true,
    }));
    // Consolidate the AI Receptionist keyword target on the homepage.
    // The old /ai-receptionist pillar page is retired and 301s here so
    // any existing backlinks or bookmarks flow to the primary landing
    // page without content duplication.
    const pillarConsolidation = [
      // Retired: competed with /ai-receptionist-for-marketing-agencies for
      // the same keyword.
      {
        source: '/ai-receptionist-for-agencies',
        destination: '/ai-receptionist-for-marketing-agencies',
        permanent: true,
      },
      {
        source: '/ai-receptionist',
        destination: '/',
        permanent: true,
      },
      {
        // /solutions/ai-receptionist retired to eliminate
        // AI-Receptionist keyword cannibalization with the homepage.
        // Google flags two pages competing for the same query as
        // duplicate content and ranks neither.
        source: '/solutions/ai-receptionist',
        destination: '/',
        permanent: true,
      },
      {
        // /ai-call-answering-service was near-duplicate content vs
        // /ai-phone-answering-service, same keyword family. 301
        // consolidates the ranking signal on the phone version.
        source: '/ai-call-answering-service',
        destination: '/ai-phone-answering-service',
        permanent: true,
      },
    ];
    return [...fromBusinesses, ...fromIndustries, ...pillarConsolidation];
  },
  // Next.js does not support partially-dynamic directory names like
  // `ai-receptionist-for-[slug]`. The dynamic page lives at /i/[slug]
  // and /v/[slug] internally, and we rewrite the SEO-friendly URLs to
  // those clean dynamic routes here. Static pages at the same path
  // (e.g. /ai-receptionist-for-agencies) are NOT rewritten — Next.js
  // resolves the literal directory match first and only falls through
  // to the rewrite for slugs that aren't statically defined.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/ai-receptionist-for-:slug',
          destination: '/i/:slug',
        },
        {
          source: '/ai-receptionist-vs-:slug',
          destination: '/v/:slug',
        },
      ],
      fallback: [],
    };
  },
};

module.exports = withContentlayer(nextConfig);
