import type { Metadata } from 'next';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { publishedBlogPosts } from '@/lib/blog';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import {
  itemListSchema,
  collectionPageSchema,
  breadcrumbListSchema,
} from '@/lib/schema';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { TOPICS } from '@/lib/blogTopics';
import { BlogIndexClient } from './BlogIndexClient';

const baseMetadata = buildMetadata({
  title: 'Implenix Blog, AI Voice Agents and Local Business',
  description:
    'Field notes, operator playbooks, and case studies from teams that run on calls. The Implenix blog.',
  path: '/blog',
});

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...baseMetadata.alternates,
    types: {
      'application/rss+xml': [
        { url: `${SITE_URL}/blog/rss.xml`, title: 'Implenix Blog RSS' },
      ],
    },
  },
};

export default function BlogIndexPage() {
  const posts = [...publishedBlogPosts]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime(),
    )
    .map((p) => ({
      url: p.url,
      title: p.title,
      description: p.description,
      category: p.category,
      publishedAt: p.publishedAt,
      readTime: p.readTime,
      heroImage: p.heroImage,
      heroImageAlt: p.heroImageAlt,
    }));

  return (
    <>
      <SchemaOrg
        schema={[
          collectionPageSchema({
            name: 'Implenix Blog',
            description:
              'Operator playbooks, agent tuning notes, and verified case studies for AI voice agents in local business.',
            url: '/blog',
          }),
          itemListSchema({
            name: 'Implenix Blog Posts',
            description:
              'Every published Implenix blog post covering AI voice agents, industry deployments, decision frameworks, and operator playbooks.',
            url: '/blog',
            items: posts.slice(0, 30).map((p) => ({
              name: p.title,
              url: p.url,
              description: p.description,
            })),
          }),
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
          ]),
        ]}
      />
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-24">
          <div className="max-w-3xl flex flex-col gap-5">
            <Badge label="Implenix · Blog" variant="cyan" />
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
              Field notes from teams that{' '}
              <span className="text-brand-violet">run on calls</span>.
            </h1>
            <p className="font-body text-white/75 text-lg max-w-2xl leading-relaxed">
              Operator playbooks, agent tuning notes, and deployment
              lessons, published by the team deploying voice AI for local
              business.
            </p>
            <Link
              href="/blog/rss.xml"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-brand-cyan hover:opacity-80 self-start"
            >
              <Rss size={12} aria-hidden /> Subscribe via RSS
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-brand-dark border-t border-brand-purple/20">
        <div className="max-w-content mx-auto px-6 py-10 md:py-14">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
            ▸ Browse by topic hub
          </span>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TOPICS.map((t) => (
              <Link
                key={t.slug}
                href={`/blog/topics/${t.slug}`}
                data-cta-location="blog-index-topics"
                className="group border-l-[3px] border-brand-purple bg-black p-4 flex flex-col gap-1.5 hover:border-brand-cyan transition-colors"
              >
                <span className="font-heading text-white text-base leading-snug">
                  {t.name}
                </span>
                <span className="text-xs text-white/55 font-body">
                  {t.postSlugs.length} posts
                </span>
                <span className="inline-flex items-center gap-1 text-brand-cyan text-[10px] font-mono uppercase tracking-widest mt-1">
                  Explore <ArrowRight size={10} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-black border-t border-brand-purple/20">
        <BlogIndexClient posts={posts} />
      </section>
    </>
  );
}
