import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, X } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ComparisonTable } from '@/components/common/ComparisonTable';
import { CodeWindow } from '@/components/common/CodeWindow';
import { DividedStats } from '@/components/common/DividedStats';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  faqSchema,
  articleSchema,
  serviceSchema,
  speakableSchema,
} from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';
import {
  COMPARISON_PROFILES,
  COMPARISON_SLUGS,
  getComparisonProfile,
} from '@/lib/seo/comparisons';
import { COMPETITOR_PROFILES } from '@/lib/seo/competitors';

type Params = { slug: string };

// Every valid slug is prebuilt; anything else is a real 404 (not a
// streamed 200 that renders the not-found UI).
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISON_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const profile = getComparisonProfile(params.slug);
  if (!profile) return {};
  return buildMetadata({
    title: profile.metaTitle,
    description: profile.metaDescription,
    path: `/ai-receptionist-vs-${profile.slug}`,
  });
}

// Lowercase for mid-sentence use, but keep acronyms ("IVR system").
function lowerName(name: string): string {
  return name
    .split(' ')
    .map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w.toLowerCase()))
    .join(' ');
}

// "an IVR", "a voicemail box"; acronyms read by letter name.
function withArticle(noun: string): string {
  const first = noun.trim();
  // Mass nouns read better bare: "the honest case for voicemail".
  if (/^voicemail$/i.test(first)) return first;
  const acronym = /^[A-Z]{2,}/.test(first);
  const vowelSound = acronym
    ? /^[AEFHILMNORSX]/.test(first)
    : /^[aeiou]/i.test(first);
  return `${vowelSound ? 'an' : 'a'} ${first}`;
}

export default function ComparisonPage({ params }: { params: Params }) {
  const profile = getComparisonProfile(params.slug);
  if (!profile) notFound();

  const url = `/ai-receptionist-vs-${profile.slug}`;
  const headline = `AI Receptionist vs ${profile.alternativeName}`;

  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: headline,
            description: profile.metaDescription,
            url,
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(profile.faqs),
          serviceSchema({
            name: 'AI Receptionist',
            description: profile.metaDescription,
            serviceType: 'AI Receptionist',
            url,
          }),
          speakableSchema(['h1', '[data-speakable]', '.faq-question', '.faq-answer']),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Compare', href: url },
              { label: profile.alternativeName, href: url },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label={`Comparison · vs ${profile.alternativeName}`} variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                AI Receptionist <span className="text-white/55">vs</span>{' '}
                <span className="text-brand-purple">{profile.alternativeName}</span>
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                {profile.metaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="compare-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my free audit <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  data-cta-location="compare-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  See pricing
                </Link>
              </div>
            </div>
            <aside className="lg:col-span-5">
              <div className="border border-brand-cyan/30 bg-black p-8">
                <span className="text-xs uppercase tracking-widest text-white/55 font-mono">
                  ▸ Punchline
                </span>
                <p className="font-heading text-6xl md:text-7xl text-brand-cyan mt-3 leading-none">
                  {profile.punchlineStat}
                </p>
                <p className="mt-3 font-body text-white/80 max-w-xs">
                  {profile.punchlineLabel}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <SectionHeader
              eyebrow="The decision"
              title={`Choosing between AI Receptionist and ${profile.alternativeName}`}
            />
            <p className="mt-6 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              {profile.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Hear it"
            title={`Same call, AI vs ${lowerName(profile.alternativeName)}`}
            description={`A real example of where the difference shows up. The transcript below is illustrative, the underlying flow ships in every Implenix deployment.`}
            badgeVariant="purple"
          />
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <CodeWindow
                title={`vs-${profile.slug}.log`}
                lines={profile.sampleCall}
                caption={profile.sampleCallCaption}
              />
            </div>
            <aside className="lg:col-span-4 flex flex-col gap-4">
              <div className="border border-brand-purple/25 bg-brand-dark p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ What changed
                </span>
                <p className="mt-3 font-body text-white/85 text-sm leading-relaxed">
                  The AI takes the call live, books the appointment, and writes
                  it back to your CRM in under two minutes. The{' '}
                  {profile.alternativeShort} flow is slower, needs a person, or
                  loses the call entirely.
                </p>
              </div>
            </aside>
          </div>
          <div className="mt-16">
            <DividedStats stats={profile.outcomes} />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="At a glance"
            title={`AI Receptionist vs ${profile.alternativeName}: Key Differences`}
            description="Where each option lands on the dimensions that drive a real buying decision."
            badgeVariant="purple"
          />
          <div className="mt-12">
            <ComparisonTable
              highlightColumn={0}
              columns={['Implenix · AI Receptionist', profile.alternativeName]}
              rows={profile.comparisonRows.map((r) => ({
                label: r.label,
                cells: r.cells,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow={`What ${lowerName(profile.alternativeName)} does well`}
            title={`The honest case for ${withArticle(profile.alternativeShort)}`}
            description={`Not every business needs an AI receptionist. Here is where a ${profile.alternativeShort} is the right answer, and where it falls short.`}
          />
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <div className="border border-brand-cyan/30 bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
                <Check size={11} /> Where it wins
              </span>
              <ul className="flex flex-col gap-2.5 mt-2">
                {profile.alternativePros.map((pro) => (
                  <li
                    key={pro}
                    className="flex items-start gap-2 font-body text-sm text-white/85"
                  >
                    <Check size={14} className="text-brand-cyan mt-0.5 shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-brand-purple/30 bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-purple flex items-center gap-1.5">
                <X size={11} /> Where it falls short
              </span>
              <ul className="flex flex-col gap-2.5 mt-2">
                {profile.alternativeCons.map((con) => (
                  <li
                    key={con}
                    className="flex items-start gap-2 font-body text-sm text-white/85"
                  >
                    <X size={14} className="text-brand-purple mt-0.5 shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Pick the right tool"
            title="Decision framework"
            description="The same buyer can reasonably land on either side depending on their actual call profile. Here is the honest split."
            badgeVariant="purple"
          />
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <article className="border-l-[3px] border-white/15 bg-black p-6 flex flex-col gap-4">
              <h3 className="font-heading text-2xl text-white">
                {profile.whenAlternative.headline}
              </h3>
              <ul className="flex flex-col gap-3">
                {profile.whenAlternative.reasons.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 font-body text-sm text-white/80 leading-relaxed"
                  >
                    <ArrowRight size={14} className="text-white/45 mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </article>
            <article className="border-l-[3px] border-brand-cyan bg-black p-6 flex flex-col gap-4">
              <h3 className="font-heading text-2xl text-brand-cyan">
                {profile.whenImplenix.headline}
              </h3>
              <ul className="flex flex-col gap-3">
                {profile.whenImplenix.reasons.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 font-body text-sm text-white leading-relaxed"
                  >
                    <ArrowRight size={14} className="text-brand-cyan mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Frequently asked" />
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {profile.faqs.map((f) => (
              <div key={f.question} className="border border-brand-purple/20 bg-black p-6">
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
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <Badge label="Find out what you're losing" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              See exactly what missed calls cost you last month.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              Run the free audit. Then decide between AI receptionist and{' '}
              {lowerName(profile.alternativeName)} with real numbers.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="compare-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} />
            </Link>
            <Link
              href="/try-it"
              data-cta-location="compare-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Test Ron now
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16 grid lg:grid-cols-2 gap-10">
          <RelatedContent
            topic="Other comparisons"
            type="resource"
            links={COMPARISON_PROFILES.filter((p) => p.slug !== profile.slug)
              .slice(0, 3)
              .map((p) => ({
                href: `/ai-receptionist-vs-${p.slug}`,
                label: `AI Receptionist vs ${p.alternativeName}`,
              }))}
          />
          <RelatedContent
            topic="Specific brand alternatives"
            type="resource"
            links={COMPETITOR_PROFILES.map((c) => ({
              href: `/${c.routeSlug}`,
              label: `${c.competitorName} alternative`,
            }))}
          />
        </div>
      </section>
    </>
  );
}
