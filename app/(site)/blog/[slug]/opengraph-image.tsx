import { ImageResponse } from 'next/og';
import { publishedBlogPosts } from '@/lib/blog';

export const runtime = 'edge';
export const alt = 'Implenix blog post';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Branded per-blog cover, matches the reference design:
// dark navy background, subtle radial glow, purple BLOGS pill badge,
// large heading, description line, purple footer bar with the domain
// and handle. Used for OG social cards AND rendered inline on the
// blog list + blog post pages via <img src="/blog/<slug>/opengraph-image">.
export default function BlogOgImage({
  params,
}: {
  params: { slug: string };
}) {
  const doc = publishedBlogPosts.find((p) => p.slug === params.slug);
  const title = doc?.title ?? 'Implenix Blog';
  const description =
    doc?.description ?? 'Field-tested operator playbooks from Implenix.';

  const titleFontSize = title.length > 90 ? 60 : title.length > 55 ? 76 : 92;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0d3f',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 64px 0 64px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-140px',
            right: '-140px',
            width: '560px',
            height: '560px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(187,0,255,0.28) 0%, rgba(187,0,255,0) 65%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`v${i}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${(i + 1) * 100}px`,
                width: '1px',
                background: 'rgba(61,250,255,0.04)',
              }}
            />
          ))}
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#bb00ff',
              color: '#ffffff',
              padding: '10px 26px 10px 26px',
              borderRadius: 40,
              alignSelf: 'flex-start',
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: '0.02em',
            }}
          >
            BLOGS
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: '3px solid #ffffff',
                marginLeft: 6,
              }}
            />
          </div>

          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              maxWidth: 1000,
              color: '#ffffff',
              display: 'flex',
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.35,
              maxWidth: 980,
              display: 'flex',
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            marginLeft: -64,
            marginRight: -64,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: 4,
              background: 'rgba(255,255,255,0.9)',
              margin: '0 64px',
            }}
          />
          <div style={{ display: 'flex' }}>
            <div
              style={{
                flex: 1,
                background: '#bb00ff',
                color: '#ffffff',
                padding: '24px 40px',
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              IMPLENIX.NET
            </div>
            <div style={{ width: 4, background: '#ffffff' }} />
            <div
              style={{
                flex: 1,
                background: '#bb00ff',
                color: '#ffffff',
                padding: '24px 40px',
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              @IMPLENIX.AI
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
