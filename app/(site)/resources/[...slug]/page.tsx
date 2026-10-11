import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import { allResources } from 'contentlayer/generated';
import { mdxComponents } from '@/components/docs/MdxComponents';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { articleSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

type Params = { slug: string[] };

export const dynamicParams = false;

export function generateStaticParams() {
  return allResources.map((r) => ({ slug: r.slug.split('/') }));
}

const find = (params: Params) =>
  allResources.find((r) => r.slug === params.slug.join('/'));

export function generateMetadata({ params }: { params: Params }): Metadata {
  const doc = find(params);
  if (!doc) return {};
  return buildMetadata({
    title: `${doc.title} | Implenix`,
    description: doc.description,
    path: doc.url,
    ogType: 'article',
    publishedTime: doc.publishedAt,
  });
}

export default function ResourcePage({ params }: { params: Params }) {
  const doc = find(params);
  if (!doc) notFound();
  const MDX = useMDXComponent(doc.body.code);
  const kindLabel = doc.kind === 'guide' ? 'Guide' : 'Playbook';
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: doc.title,
            description: doc.description,
            url: doc.url,
            datePublished: doc.publishedAt.slice(0, 10),
          }),
        ]}
      />
      <article className="max-w-3xl mx-auto px-6 md:px-10 pt-16 pb-24 md:pt-24 md:pb-32">
        <Breadcrumbs
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Resources', href: '/resources' },
            { label: kindLabel, href: doc.url },
          ]}
          className="mb-6"
        />
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-cyan font-mono hover:opacity-80"
        >
          <ArrowLeft size={12} aria-hidden /> All resources
        </Link>
        <div className="prose-implenix mt-8">
          <MDX components={mdxComponents} />
        </div>
        <aside className="mt-16 border-t border-brand-purple/20 pt-10 flex flex-col gap-4">
          <h2 className="font-heading text-2xl text-white">
            Put this to work on your own calls
          </h2>
          <p className="font-body text-white/70 leading-relaxed max-w-xl">
            Hear how Ron, our AI receptionist, handles a real call, or book a
            30-minute call and we will map this to your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <TestRonCTA ctaLocation={`resource-${doc.slug}`} />
            <Link
              href="/contact"
              data-cta-location={`resource-${doc.slug}`}
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan/70 text-brand-cyan font-medium px-6 py-3 rounded-sm transition-colors hover:bg-brand-cyan/10"
            >
              Book a 30-min call <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </aside>
      </article>
    </>
  );
}
