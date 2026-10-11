import { publishedBlogPosts } from '@/lib/blog';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo';

export const dynamic = 'force-static';

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const posts = [...publishedBlogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}${post.url}`;
      const heroImage = post.heroImage
        ? `\n      <media:content url="${escape(
            post.heroImage,
          )}" medium="image" />`
        : '';
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escape(post.description)}</description>
      <category>${escape(post.category)}</category>
      <dc:creator>${escape(post.author)}</dc:creator>${heroImage}
    </item>`;
    })
    .join('\n');

  // RSS 2.0 with Dublin Core (dc:creator, spec-compliant author) and
  // Media RSS (media:content, per-item hero image for reader thumbnails)
  // namespaces declared on the root <rss> element.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escape(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escape(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
