import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import { publishedBlogPosts } from '@/lib/blog';
import { getRelatedPosts, getTopicsForPost } from '@/lib/blogTopics';
import { mdxComponents } from '@/components/docs/MdxComponents';
import { Badge } from '@/components/common/Badge';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { RelatedContent } from '@/components/common/RelatedContent';
import { TopicalLinks } from '@/components/common/TopicalLinks';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  blogPostingSchema,
  howToSchema,
  speakableSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

type Params = { slug: string };

// Every valid slug is prebuilt; anything else is a real 404 (not a
// streamed 200 that renders the not-found UI).
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedBlogPosts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const doc = publishedBlogPosts.find((p) => p.slug === params.slug);
  if (!doc) return {};
  return buildMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: doc.url,
    ogImage: doc.heroImage,
    ogType: 'article',
    publishedTime: new Date(doc.publishedAt).toISOString(),
    author: doc.author,
    tags: [doc.category],
  });
}

export default function BlogPostPage({ params }: { params: Params }) {
  const doc = publishedBlogPosts.find((p) => p.slug === params.slug);
  if (!doc) notFound();
  const MDX = useMDXComponent(doc.body.code);

  // Same category, newest first, skipping posts the topic-hub block
  // below already links to.
  const hubLinked = new Set(getRelatedPosts(doc.slug).map((r) => r.slug));
  const related = publishedBlogPosts
    .filter(
      (p) =>
        p.slug !== doc.slug &&
        p.category === doc.category &&
        !hubLinked.has(p.slug),
    )
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 3);
  const hub = getTopicsForPost(doc.slug)[0];

  const initials = doc.author
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const howToSteps = doc.howToSteps as
    | { name: string; text: string }[]
    | undefined;

  return (
    <>
      <SchemaOrg
        schema={[
          blogPostingSchema({
            title: doc.title,
            description: doc.metaDescription,
            url: doc.url,
            datePublished: doc.publishedAt,
            author: doc.author,
            authorRole: doc.authorRole,
            image: doc.heroImage,
          }),
          ...(howToSteps && howToSteps.length > 0
            ? [
                howToSchema({
                  name: doc.title,
                  description: doc.metaDescription,
                  url: doc.url,
                  steps: howToSteps,
                  totalTime: doc.howToTotalTime ?? undefined,
                }),
              ]
            : []),
          speakableSchema([
            'h1',
            'article p:first-of-type',
            '[data-speakable]',
          ]),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 md:pt-24 md:pb-16">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              ...(hub
                ? [{ label: hub.name, href: `/blog/topics/${hub.slug}` }]
                : []),
            ]}
            className="mb-6"
          />
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-cyan font-mono hover:opacity-80"
            >
              <ArrowLeft size={12} aria-hidden /> All posts
            </Link>
          </div>
          <div>
            <Badge label={doc.category} variant="purple" />
          </div>
          <h1 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.08]">
            {doc.title}
          </h1>
          <p
            className="mt-5 font-body text-white/75 text-lg leading-relaxed"
            data-speakable
          >
            {doc.description}
          </p>
        </div>
      </section>

      {doc.heroImage ? (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="relative w-full aspect-[16/9] border border-brand-purple/25 bg-black overflow-hidden">
            <Image
              src={doc.heroImage}
              alt={doc.heroImageAlt ?? doc.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-brand-purple/20 py-5">
          <div className="w-11 h-11 bg-brand-purple text-white flex items-center justify-center font-heading rounded-sm">
            {initials}
          </div>
          <div className="flex-1 text-sm font-body">
            <p className="text-white">{doc.author}</p>
            <p className="text-white/55 text-xs">{doc.authorRole}</p>
          </div>
          <div className="basis-full sm:basis-auto flex items-center gap-3 text-xs font-mono text-white/55 uppercase tracking-widest">
            <time
              dateTime={new Date(doc.publishedAt).toISOString()}
              className="flex items-center gap-1.5"
            >
              <Calendar size={12} aria-hidden />
              {new Date(doc.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <span>·</span>
            <span>{doc.readTime}</span>
          </div>
        </header>

        <div className="prose-implenix mt-12">
          <MDX components={mdxComponents} />
        </div>

        {doc.authorBio && (
          <div className="mt-14 border border-brand-purple/30 bg-brand-dark p-6 md:p-7 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-14 h-14 bg-brand-purple text-white flex items-center justify-center font-heading rounded-sm shrink-0 text-lg">
              {initials}
            </div>
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                ▸ About the author
              </p>
              <p className="mt-2 font-heading text-white text-xl">
                {doc.author}
              </p>
              <p className="mt-1 text-white/60 text-sm font-body">
                {doc.authorRole}
              </p>
              <p className="mt-3 text-white/80 text-sm font-body leading-relaxed">
                {doc.authorBio}
              </p>
            </div>
          </div>
        )}

        <div className="mt-16 border border-brand-cyan/35 bg-black p-6 md:p-8 grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <Badge label="Skip the form" variant="cyan" />
            <p className="font-heading text-2xl text-white mt-3 leading-snug">
              Talk to Ron, our AI receptionist, or pick a slot.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <TestRonCTA
              ctaLocation={`blog-${doc.slug}-ron`}
              variant="primary"
            />
            <Link
              href="/contact"
              data-cta-location={`blog-${doc.slug}-calendar`}
              data-cta-type="calendar"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-5 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Book a 30-min call <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>

        <TopicalLinks postSlug={doc.slug} />

        {related.length > 0 && (
          <RelatedContent
            topic="More from the blog"
            type="blog"
            links={related.map((r) => ({ href: r.url, label: r.title }))}
          />
        )}
      </article>
    </>
  );
}
