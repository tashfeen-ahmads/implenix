// Sitemap generation config. Runs after every `next build` via the
// postbuild hook in package.json. Priorities are tuned so Google
// crawls money pages first.

const fs = require('node:fs');
const path = require('node:path');

// Try to read blog + case-study + industry lastmod from the MDX file's
// publishedAt / modification time. Falls back to build time on any
// error so the config never crashes the build.
function getContentLastmod(sitePath) {
  const tryReadMdx = (subdir, slugSegments) => {
    try {
      const filePath = path.join(
        process.cwd(),
        'content',
        subdir,
        `${slugSegments.join('/')}.mdx`,
      );
      if (!fs.existsSync(filePath)) return null;
      const stat = fs.statSync(filePath);
      const raw = fs.readFileSync(filePath, 'utf8');
      // Prefer explicit `publishedAt: "YYYY-MM-DD"` frontmatter over
      // filesystem mtime — better signal for Google.
      const m = raw.match(/publishedAt:\s*"?(\d{4}-\d{2}-\d{2})"?/);
      if (m) return new Date(m[1]).toISOString();
      return stat.mtime.toISOString();
    } catch {
      return null;
    }
  };

  if (sitePath.startsWith('/blog/')) {
    const slug = sitePath.replace('/blog/', '');
    return tryReadMdx('blog', [slug]);
  }
  if (sitePath.startsWith('/case-studies/')) {
    const slug = sitePath.replace('/case-studies/', '');
    return tryReadMdx('case-studies', [slug]);
  }
  if (sitePath.startsWith('/i/')) {
    const slug = sitePath.replace('/i/', '');
    return tryReadMdx('industries', [slug]);
  }
  return null;
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://implenix.net',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: [
    '/lp/*',
    '/api/*',
    '/admin/*',
    '/preview/*',
    // /i and /v are internal rewrite targets. The public URLs
    // (/ai-receptionist-for-X, /ai-receptionist-vs-X) are what Google
    // indexes. Prevent duplicate indexing.
    '/i/*',
    '/v/*',
    // Static assets and feeds should not appear in the URL sitemap.
    // RSS is announced separately via additionalSitemaps.
    '/icon.svg',
    '/manifest.webmanifest',
    '/blog/rss.xml',
    // Legacy /ai-call-answering-service is 301'd to /ai-phone-answering-service.
    '/ai-call-answering-service',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/lp/', '/api/', '/admin/', '/preview/', '/i/', '/v/'],
      },
      // Explicit welcome for major AI search / answer engines so they
      // know they can index for Google AI Overviews, Perplexity,
      // ChatGPT search, Claude, Bing Copilot, You.com.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
    ],
    additionalSitemaps: [
      // RSS acts as a second discovery surface for blog freshness.
      'https://implenix.net/blog/rss.xml',
    ],
  },

  // Industry (/i/*) and comparison (/v/*) pages are served at rewritten
  // public URLs, so next-sitemap never discovers them on its own. Add the
  // public URLs from the prerendered build output.
  additionalPaths: async (config) => {
    const fromBuild = (dir, prefix) => {
      try {
        return fs
          .readdirSync(path.join(process.cwd(), '.next/server/app', dir))
          .filter((f) => f.endsWith('.html'))
          .map((f) => `${prefix}${f.replace(/\.html$/, '')}`);
      } catch {
        return [];
      }
    };
    const paths = [
      ...fromBuild('i', '/ai-receptionist-for-'),
      ...fromBuild('v', '/ai-receptionist-vs-'),
    ];
    return Promise.all(paths.map((p) => config.transform(config, p)));
  },

  // Priority signals what we want crawled most. Money pages (industry,
  // comparison, pricing, audit) get top priority. Educational and
  // long-tail content ranks lower.
  transform: async (config, sitePath) => {
    let priority = 0.7;
    let changefreq = 'weekly';

    if (sitePath === '/') {
      // Home page — top priority. This IS the "AI Receptionist"
      // keyword target after the /ai-receptionist pillar consolidation.
      priority = 1.0;
      changefreq = 'daily';
    } else if (
      sitePath.startsWith('/ai-receptionist-for-') ||
      sitePath.startsWith('/ai-receptionist-vs-') ||
      sitePath.endsWith('-alternative')
    ) {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (
      sitePath === '/pricing' ||
      sitePath === '/audit' ||
      sitePath === '/try-it' ||
      sitePath === '/contact' ||
      sitePath === '/ai-phone-answering-service' ||
      sitePath.startsWith('/solutions')
    ) {
      priority = 0.85;
      changefreq = 'weekly';
    } else if (sitePath.startsWith('/case-studies')) {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (
      sitePath === '/what-is-an-ai-receptionist' ||
      sitePath === '/how-does-an-ai-receptionist-work' ||
      sitePath === '/benefits-of-ai-receptionist' ||
      sitePath === '/ai-receptionist-cost-comparison' ||
      sitePath === '/ai-call-answering-service' ||
      sitePath === '/24-7-ai-receptionist' ||
      sitePath === '/virtual-ai-receptionist'
    ) {
      priority = 0.75;
      changefreq = 'monthly';
    } else if (sitePath.startsWith('/blog/topics/')) {
      // Topical hub pages — Google 2026 topical-authority signal.
      priority = 0.8;
      changefreq = 'weekly';
    } else if (sitePath === '/blog') {
      priority = 0.75;
      changefreq = 'daily';
    } else if (sitePath.startsWith('/blog') || sitePath.startsWith('/resources')) {
      priority = 0.6;
      changefreq = 'monthly';
    } else if (sitePath.startsWith('/glossary')) {
      priority = 0.5;
      changefreq = 'monthly';
    } else if (sitePath.startsWith('/docs')) {
      priority = 0.5;
      changefreq = 'monthly';
    } else if (sitePath === '/about' || sitePath === '/industries') {
      priority = 0.75;
      changefreq = 'monthly';
    } else if (sitePath === '/privacy-policy' || sitePath === '/terms') {
      priority = 0.3;
      changefreq = 'yearly';
    }

    // Prefer content-file lastmod for MDX-backed pages. Google prefers
    // stable dates over "everything changed at deploy time".
    const contentLastmod = getContentLastmod(sitePath);
    const lastmod = contentLastmod ?? new Date().toISOString();

    return {
      loc: sitePath,
      changefreq,
      priority,
      lastmod,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
