import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, articleSchema } from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';
import {
  GLOSSARY_SLUGS,
  GLOSSARY_ENTRIES,
  getGlossaryEntry,
} from '@/lib/seo/glossary';

type Params = { slug: string };

// Every valid slug is prebuilt; anything else is a real 404 (not a
// streamed 200 that renders the not-found UI).
export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const entry = getGlossaryEntry(params.slug);
  if (!entry) return {};
  return buildMetadata({
    title: entry.metaTitle,
    description: entry.metaDescription,
    path: `/glossary/${entry.slug}`,
  });
}

const GLOSSARY_PUBLISHED = '2026-05-07';

// Long definitions read as a wall of text; break them roughly every
// three sentences.
function splitParagraphs(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    out.push(sentences.slice(i, i + 3).join('').trim());
  }
  return out;
}

export default function GlossaryEntryPage({ params }: { params: Params }) {
  const entry = getGlossaryEntry(params.slug);
  if (!entry) notFound();

  const url = `/glossary/${entry.slug}`;

  // The next three terms in the list (wrapping), so every entry links to
  // a different set instead of always the first three.
  const at = GLOSSARY_ENTRIES.findIndex((e) => e.slug === entry.slug);
  const siblings = [1, 2, 3]
    .map((n) => GLOSSARY_ENTRIES[(at + n) % GLOSSARY_ENTRIES.length])
    .filter((e) => e.slug !== entry.slug)
    .map((e) => ({
      href: `/glossary/${e.slug}`,
      label: e.term,
    }));

  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: entry.term,
            description: entry.metaDescription,
            url,
            // Fixed date: a build-time "today" tells Google the page
            // changed on every deploy.
            datePublished: GLOSSARY_PUBLISHED,
            author: SITE_NAME,
          }),
          faqSchema(entry.faqs),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-16 md:pt-24 md:pb-20">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Glossary', href: '/glossary' },
              { label: entry.term, href: url },
            ]}
            className="mb-6"
          />
          <Link
            href="/glossary"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-cyan font-mono mb-8 hover:opacity-80"
          >
            <ArrowLeft size={12} aria-hidden /> All terms
          </Link>
          <div className="max-w-3xl flex flex-col gap-6">
            <Badge label="Glossary entry" variant="cyan" />
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
              {entry.term}
            </h1>
            <p className="font-body text-white/80 text-lg leading-relaxed">
              {entry.shortDefinition}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="max-w-3xl">
            <SectionHeader eyebrow="Definition" title={`What ${entry.term} means`} />
            <div className="mt-8 flex flex-col gap-5 font-body text-white/80 text-base lg:text-lg leading-relaxed max-w-[65ch]">
              {splitParagraphs(entry.intro).map((para) => (
                <p key={para.slice(0, 32)}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="max-w-3xl">
            <SectionHeader
              eyebrow="At a glance"
              title="Key points"
              badgeVariant="purple"
            />
            <ul className="mt-8 flex flex-col gap-3">
              {entry.keyPoints.map((point, i) => (
                <li
                  key={point}
                  className="flex items-start gap-3 border-l-[3px] border-brand-cyan bg-black p-4"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan w-6 shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-body text-sm text-white/85 leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="max-w-3xl">
            <SectionHeader eyebrow="Related" title="Related pages on Implenix" />
            <ul className="mt-8 grid sm:grid-cols-2 gap-3">
              {entry.related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-3 border border-brand-purple/20 hover:border-brand-purple bg-black p-4 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen size={14} className="text-brand-cyan" aria-hidden />
                      <span className="font-body text-sm text-white">
                        {link.label}
                      </span>
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-brand-cyan transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 py-24 md:py-32">
          <SectionHeader eyebrow="FAQ" title="Common questions" badgeVariant="purple" />
          <div className="mt-12 max-w-3xl flex flex-col gap-5">
            {entry.faqs.map((f) => (
              <div
                key={f.question}
                className="border border-brand-purple/20 bg-black p-6 md:p-8"
              >
                <p className="font-heading text-white text-lg">{f.question}</p>
                <p className="mt-3 font-body text-sm text-white/75 leading-relaxed">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 pb-24">
          <RelatedContent topic="More from the glossary" type="resource" links={siblings} />
        </div>
      </section>
    </>
  );
}
