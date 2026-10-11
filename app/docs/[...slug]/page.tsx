import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import { allDocs } from 'contentlayer/generated';
import { mdxComponents } from '@/components/docs/MdxComponents';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { techArticleSchema } from '@/lib/schema';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { docsNeighbors, docsSectionStart } from '@/lib/docsNav';
import { TestRonCTA } from '@/components/ron/TestRonCTA';

type Params = { slug: string[] };

// Every valid slug is prebuilt; anything else is a real 404 (not a
// streamed 200 that renders the not-found UI).
export const dynamicParams = false;

export function generateStaticParams() {
  return allDocs.map((d) => ({ slug: d.slug.split('/') }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const slug = params.slug.join('/');
  const doc = allDocs.find((d) => d.slug === slug);
  if (!doc) return {};
  return buildMetadata({
    title: `${doc.title} | Implenix Docs`,
    description: doc.description,
    path: `/docs/${slug}`,
  });
}

export default function DocPage({ params }: { params: Params }) {
  const slug = params.slug.join('/');
  const doc = allDocs.find((d) => d.slug === slug);
  if (!doc) notFound();
  const MDX = useMDXComponent(doc.body.code);
  const { prev, next } = docsNeighbors(doc.url);
  const sectionHref = docsSectionStart(doc.section) ?? '/docs';
  return (
    <>
      <SchemaOrg
        schema={[
          techArticleSchema({
            title: doc.title,
            description: doc.description,
            url: doc.url,
          }),
        ]}
      />
      <Breadcrumbs
        crumbs={[
          { label: 'Docs', href: '/docs' },
          { label: doc.section, href: sectionHref },
          { label: doc.title, href: doc.url },
        ]}
        className="mb-4"
      />
      <div className="prose-implenix">
        <MDX components={mdxComponents} />
      </div>

      <nav
        aria-label="Previous and next page"
        className="mt-16 grid sm:grid-cols-2 gap-4"
      >
        {prev ? (
          <Link
            href={prev.href}
            className="group border border-brand-purple/25 hover:border-brand-purple p-5 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-white/55">
              <ArrowLeft size={12} aria-hidden /> Previous
            </span>
            <span className="mt-2 block font-heading text-white">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="group border border-brand-purple/25 hover:border-brand-purple p-5 transition-colors sm:text-right"
          >
            <span className="flex items-center gap-1.5 sm:justify-end text-xs font-mono uppercase tracking-widest text-white/55">
              Next <ArrowRight size={12} aria-hidden />
            </span>
            <span className="mt-2 block font-heading text-white">{next.title}</span>
          </Link>
        ) : null}
      </nav>

      <aside className="mt-12 border-t border-brand-purple/20 pt-10 flex flex-col gap-4">
        <h2 className="font-heading text-2xl text-white">
          Want to see it on your own calls?
        </h2>
        <p className="font-body text-white/70 leading-relaxed max-w-xl">
          Talk to Ron, our AI receptionist, in your browser, or book a
          30-minute call and we will walk through your setup.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <TestRonCTA ctaLocation={`docs-${doc.slug}`} />
          <Link
            href="/contact"
            data-cta-location={`docs-${doc.slug}`}
            className="inline-flex items-center justify-center gap-2 border border-brand-cyan/70 text-brand-cyan font-medium px-6 py-3 rounded-sm transition-colors hover:bg-brand-cyan/10"
          >
            Book a 30-min call <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </aside>
    </>
  );
}
