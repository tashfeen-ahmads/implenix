import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { publishedBlogPosts } from '@/lib/blog';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  articleSchema,
  breadcrumbListSchema,
  speakableSchema,
} from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';
import { TOPICS, TOPIC_SLUGS, getTopic } from '@/lib/blogTopics';

type Params = { hub: string };

// Every valid slug is prebuilt; anything else is a real 404 (not a
// streamed 200 that renders the not-found UI).
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPIC_SLUGS.map((hub) => ({ hub }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const topic = getTopic(params.hub);
  if (!topic) return {};
  return buildMetadata({
    title: topic.metaTitle,
    description: topic.metaDescription,
    path: `/blog/topics/${topic.slug}`,
  });
}

export default function TopicHubPage({ params }: { params: Params }) {
  const topic = getTopic(params.hub);
  if (!topic) notFound();

  const posts = topic.postSlugs
    .map((slug) => publishedBlogPosts.find((p) => p.slug === slug))
    .filter(Boolean) as (typeof publishedBlogPosts)[number][];

  const otherHubs = TOPICS.filter((t) => t.slug !== topic.slug);

  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: topic.heading,
            description: topic.metaDescription,
            url: `/blog/topics/${topic.slug}`,
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: 'Topics', href: '/blog' },
            { label: topic.name, href: `/blog/topics/${topic.slug}` },
          ]),
          speakableSchema(),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-16 md:pt-24 md:pb-20">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: topic.name, href: `/blog/topics/${topic.slug}` },
            ]}
            className="mb-6"
          />
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-cyan font-mono mb-8 hover:opacity-80"
          >
            <ArrowLeft size={12} /> All posts
          </Link>
          <div className="max-w-3xl flex flex-col gap-5">
            <Badge label={`Topic hub · ${topic.name}`} variant="purple" />
            <h1
              className="font-heading text-4xl md:text-5xl lg:text-6xl leading-[1.05]"
              data-speakable
            >
              {topic.heading}
            </h1>
            <p
              className="font-body text-white/80 text-lg leading-relaxed"
              data-speakable
            >
              {topic.intro}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
              ▸ {posts.length} posts in this hub
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-16 md:py-20">
          <SectionHeader
            eyebrow="In this hub"
            title={`All ${topic.name} posts`}
            badgeVariant="cyan"
          />
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={post.url}
                data-cta-location={`topic-hub-${topic.slug}`}
                className="group flex flex-col bg-black border border-brand-purple/20 hover:border-brand-purple transition-colors overflow-hidden"
              >
                <div className="relative aspect-[16/9] bg-brand-dark border-b border-brand-purple/20 overflow-hidden">
                  {post.heroImage ? (
                    <Image
                      src={post.heroImage}
                      alt={post.heroImageAlt ?? post.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <span className="self-start bg-brand-purple text-white text-[10px] uppercase tracking-widest font-medium px-2 py-1">
                    {post.category}
                  </span>
                  <h3 className="font-heading text-xl text-white leading-snug">
                    {post.title}
                  </h3>
                  <p className="font-body text-sm text-white/70 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-white/50 font-mono">
                      {post.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-brand-cyan text-sm">
                      Read{' '}
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-16 md:py-20">
          <SectionHeader
            eyebrow="Explore more"
            title="Other topic hubs"
            badgeVariant="purple"
          />
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherHubs.map((h) => (
              <Link
                key={h.slug}
                href={`/blog/topics/${h.slug}`}
                data-cta-location={`topic-hub-cross-${topic.slug}`}
                className="group border-l-[3px] border-brand-cyan bg-black p-5 flex flex-col gap-2 hover:bg-brand-cyan/5 transition-colors"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ Topic hub
                </span>
                <p className="font-heading text-lg text-white leading-snug">
                  {h.name}
                </p>
                <p className="font-body text-sm text-white/65 leading-relaxed">
                  {h.postSlugs.length} posts
                </p>
                <span className="inline-flex items-center gap-1 text-brand-cyan text-xs font-mono uppercase tracking-widest mt-2">
                  Explore <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-16">
            <RelatedContent
              topic="Get on a call"
              type="resource"
              links={[
                { href: '/audit', label: 'Free missed-call audit' },
                { href: '/contact', label: 'Book a 30-min call' },
                { href: '/', label: 'How Implenix answers your calls' },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
