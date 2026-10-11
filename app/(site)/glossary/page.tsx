import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { articleSchema } from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';
import { GLOSSARY_ENTRIES } from '@/lib/seo/glossary';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist Glossary | Voice AI Terms | Implenix',
  description:
    'Definitions for AI receptionist, voice AI, call routing, SIP trunk, IVR, and the rest of the voice-AI vocabulary.',
  path: '/glossary',
});

export default function GlossaryIndexPage() {
  // Group entries alphabetically for the index
  const sorted = [...GLOSSARY_ENTRIES].sort((a, b) =>
    a.term.localeCompare(b.term),
  );

  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: 'AI Receptionist Glossary',
            description:
              'Definitions for AI receptionist, voice AI, call routing, and the rest of the voice-AI vocabulary.',
            url: '/glossary',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Glossary', href: '/glossary' },
            ]}
            className="mb-8"
          />
          <div className="max-w-3xl flex flex-col gap-6">
            <Badge label="Glossary · Voice AI vocabulary" variant="cyan" />
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
              The voice AI{' '}
              <span className="text-brand-violet">vocabulary</span>, defined.
            </h1>
            <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
              The terms that come up when you research AI receptionists,
              voice agents, and modern call infrastructure, defined
              clearly, with cross-links to the relevant pages on this
              site.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="The terms"
            title={`${GLOSSARY_ENTRIES.length} entries, alphabetical`}
            badgeVariant="purple"
          />
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/glossary/${entry.slug}`}
                  className="group h-full bg-black border border-brand-purple/20 hover:border-brand-purple p-5 flex flex-col gap-3 transition-colors"
                >
                  <span className="w-9 h-9 border border-brand-cyan/30 bg-brand-dark flex items-center justify-center">
                    <BookOpen size={14} className="text-brand-cyan" aria-hidden />
                  </span>
                  <p className="font-heading text-white text-lg">{entry.term}</p>
                  <p className="font-body text-sm text-white/65 leading-relaxed flex-1">
                    {entry.shortDefinition}
                  </p>
                  <span className="inline-flex items-center gap-1 text-brand-cyan text-xs font-mono uppercase tracking-widest">
                    Read <ArrowRight size={12} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <Badge label="Beyond the vocabulary" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Run the audit. Find out what missed calls actually cost.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              Definitions are useful. Real numbers from your business are
              useful. The 60-second audit gives you the latter.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="glossary-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/"
              data-cta-location="glossary-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              See the product
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
