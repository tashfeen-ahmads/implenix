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
import { SITE_NAME } from '@/lib/seo';
import {
  COMPETITOR_PROFILES,
  type CompetitorProfile,
} from '@/lib/seo/competitors';
import { COMPARISON_PROFILES } from '@/lib/seo/comparisons';

type Props = {
  profile: CompetitorProfile;
};

// Shared rendering template for all "X alternative" pages. The 3 static
// page routes (smith-ai-alternative, goodcall-alternative,
// ruby-receptionists-alternative) each import this template and pass
// the matching profile.
export function CompetitorAlternativePage({ profile }: Props) {
  const url = `/${profile.routeSlug}`;
  const headline = `${profile.competitorName} Alternative`;
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: `${headline}, Implenix AI Receptionist`,
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
              { label: 'Alternatives', href: url },
              { label: profile.competitorName, href: url },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label={`Alternative · vs ${profile.competitorName}`} variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                <span className="text-brand-purple">{profile.competitorName}</span>{' '}
                alternative
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                {profile.metaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="alternative-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my free audit <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  data-cta-location="alternative-hero"
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
                <p className="font-heading text-5xl md:text-6xl text-brand-cyan mt-3 leading-none">
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
              eyebrow="The honest framing"
              title={`Why people search for a ${profile.competitorName} alternative`}
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
            title={`Where Implenix shows up differently`}
            description={`A representative call demonstrating where the architecture difference lands. The same flow ships in every Implenix deployment.`}
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
                  ▸ The architecture difference
                </span>
                <p className="mt-3 font-body text-white/85 text-sm leading-relaxed">
                  {profile.competitorName} is human-anchored, every minute on
                  the call is billable headcount. Implenix is AI-first, the
                  same call carries no marginal cost and runs in parallel with
                  every other call hitting your line.
                </p>
              </div>
              <div className="border border-brand-cyan/25 bg-black p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-purple">
                  ▸ Punchline
                </span>
                <p className="mt-3 font-heading text-3xl text-white leading-tight">
                  {profile.punchlineStat}
                </p>
                <p className="mt-2 font-body text-white/70 text-sm">
                  {profile.punchlineLabel}
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
            title={`Implenix vs ${profile.competitorName}: Key Differences`}
            description="Where each option lands on the dimensions that drive a real buying decision."
            badgeVariant="purple"
          />
          <div className="mt-12">
            <ComparisonTable
              highlightColumn={0}
              columns={[
                'Implenix · AI Receptionist',
                profile.competitorName,
              ]}
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
            eyebrow="Honest assessment"
            title={`What ${profile.competitorName} does well, and where Implenix differs`}
            description={`Not every business needs an AI receptionist. Here is the honest read on both sides.`}
          />
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <div className="border border-brand-cyan/30 bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
                <Check size={11} /> What {profile.competitorName} does well
              </span>
              <ul className="flex flex-col gap-2.5 mt-2">
                {profile.whatTheyDoWell.map((pro) => (
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
                <ArrowRight size={11} /> Where Implenix differs
              </span>
              <ul className="flex flex-col gap-2.5 mt-2">
                {profile.whereWeDiffer.map((diff) => (
                  <li
                    key={diff}
                    className="flex items-start gap-2 font-body text-sm text-white/85"
                  >
                    <ArrowRight
                      size={14}
                      className="text-brand-purple mt-0.5 shrink-0"
                    />
                    {diff}
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
            description="The same buyer can reasonably land on either side depending on call profile, volume, and brand positioning."
            badgeVariant="purple"
          />
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <article className="border-l-[3px] border-white/15 bg-black p-6 flex flex-col gap-4">
              <h3 className="font-heading text-2xl text-white">
                {profile.whenChooseThem.headline}
              </h3>
              <ul className="flex flex-col gap-3">
                {profile.whenChooseThem.reasons.map((r) => (
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
                {profile.whenChooseUs.headline}
              </h3>
              <ul className="flex flex-col gap-3">
                {profile.whenChooseUs.reasons.map((r) => (
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
              <div
                key={f.question}
                className="border border-brand-purple/20 bg-black p-6"
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
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <Badge label="Compare with real numbers" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Run the audit. Then decide.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              Free 60-second audit gives you the missed-call cost for your
              specific business. Use it to compare Implenix and{' '}
              {profile.competitorName} on real numbers, not marketing.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="alternative-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} />
            </Link>
            <Link
              href="/try-it"
              data-cta-location="alternative-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Test Ron now
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16 grid lg:grid-cols-2 gap-10">
          <RelatedContent
            topic="Other alternatives"
            type="resource"
            links={COMPETITOR_PROFILES.filter(
              (p) => p.slug !== profile.slug,
            ).map((p) => ({
              href: `/${p.routeSlug}`,
              label: `${p.competitorName} alternative`,
            }))}
          />
          <RelatedContent
            topic="Compare to category"
            type="resource"
            links={COMPARISON_PROFILES.slice(0, 3).map((c) => ({
              href: `/ai-receptionist-vs-${c.slug}`,
              label: `AI Receptionist vs ${c.alternativeName}`,
            }))}
          />
        </div>
      </section>
    </>
  );
}
