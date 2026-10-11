import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import { allIndustries } from 'contentlayer/generated';
import { publishedBlogPosts } from '@/lib/blog';
import { CaseStudyCard } from '@/components/common/CaseStudyCard';
import { BookingWidget } from '@/components/common/BookingWidget';
import { RelatedContent } from '@/components/common/RelatedContent';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { DividedStats } from '@/components/common/DividedStats';
import { mdxComponents } from '@/components/docs/MdxComponents';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  localBusinessSchema,
  faqSchema,
  serviceSchema,
  speakableSchema,
  aggregateRatingSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { industryUrl } from '@/lib/industries';
import { getBlogLinksForIndustry } from '@/lib/industryToBlog';
import {
  INDUSTRY_PROFILES,
  INDUSTRY_PROFILE_SLUGS,
  getIndustryProfile,
} from '@/lib/seo/industries';

type Params = { slug: string };

type UnifiedIndustry = {
  slug: string;
  industryName: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro?: string;
  heroStat: string;
  heroStatLabel: string;
  painPoints: { title: string; description: string }[];
  useCases: { title: string; description: string }[];
  stats: { number: string; label: string }[];
  testimonialQuote: string;
  testimonialAuthor: string;
  faqs: { question: string; answer: string }[];
  caseStudySlug: string;
  url: string;
  related: string[];
  mdxCode?: string;
};

const MDX_SLUGS = allIndustries.map((d) => d.slug);
const ALL_VALID_SLUGS = Array.from(
  new Set([...MDX_SLUGS, ...INDUSTRY_PROFILE_SLUGS]),
);

// Every valid slug is prebuilt; anything else is a real 404 (not a
// streamed 200 that renders the not-found UI).
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_VALID_SLUGS.map((slug) => ({ slug }));
}

function loadIndustry(slug: string): UnifiedIndustry | null {
  // Prefer rich MDX content when present.
  const mdxDoc = allIndustries.find((d) => d.slug === slug);
  if (mdxDoc) {
    return {
      slug: mdxDoc.slug,
      industryName: mdxDoc.industry,
      title: mdxDoc.title,
      metaTitle: mdxDoc.metaTitle,
      metaDescription: mdxDoc.metaDescription,
      heroStat: mdxDoc.heroStat,
      heroStatLabel: mdxDoc.heroStatLabel,
      painPoints: mdxDoc.painPoints as { title: string; description: string }[],
      useCases: mdxDoc.solutions as { title: string; description: string }[],
      stats: mdxDoc.stats as { number: string; label: string }[],
      testimonialQuote: mdxDoc.testimonialQuote,
      testimonialAuthor: mdxDoc.testimonialAuthor,
      faqs: mdxDoc.faq as { question: string; answer: string }[],
      caseStudySlug: mdxDoc.caseStudySlug,
      url: mdxDoc.url,
      related: [],
      mdxCode: mdxDoc.body.code,
    };
  }
  const profile = getIndustryProfile(slug);
  if (profile) {
    return {
      slug: profile.slug,
      industryName: profile.name,
      title: `AI Receptionist for ${profile.name}`,
      metaTitle: profile.metaTitle,
      metaDescription: profile.metaDescription,
      intro: profile.intro,
      heroStat: profile.heroStat,
      heroStatLabel: profile.heroStatLabel,
      painPoints: profile.painPoints,
      useCases: profile.useCases,
      stats: profile.stats,
      testimonialQuote: profile.testimonialQuote,
      testimonialAuthor: profile.testimonialAuthor,
      faqs: profile.faqs,
      caseStudySlug: profile.caseStudySlug,
      url: industryUrl(profile.slug),
      related: profile.related,
    };
  }
  return null;
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const data = loadIndustry(params.slug);
  if (!data) return {};
  return buildMetadata({
    title: data.metaTitle,
    description: data.metaDescription,
    path: data.url,
  });
}

export default function IndustryPage({ params }: { params: Params }) {
  const data = loadIndustry(params.slug);
  if (!data) notFound();

  const MDX = data.mdxCode ? useMDXComponent(data.mdxCode) : null;
  const relatedLinks = data.related
    .map((slug) => {
      const profile = INDUSTRY_PROFILES.find((p) => p.slug === slug);
      const mdx = allIndustries.find((d) => d.slug === slug);
      if (profile)
        return {
          href: industryUrl(profile.slug),
          label: `AI Receptionist for ${profile.name}`,
        };
      if (mdx)
        return {
          href: industryUrl(mdx.slug),
          label: `AI Receptionist for ${mdx.industry}`,
        };
      return null;
    })
    .filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <SchemaOrg
        schema={[
          localBusinessSchema(data.industryName, data.url),
          faqSchema(data.faqs),
          serviceSchema({
            name: `AI Receptionist for ${data.industryName}`,
            description: data.metaDescription,
            serviceType: 'AI Receptionist',
            url: data.url,
          }),
          aggregateRatingSchema({
            ratingValue: 5,
            reviewCount: 6,
            itemName: `Implenix AI Receptionist for ${data.industryName}`,
            itemUrl: data.url,
          }),
          speakableSchema(['h1', '[data-speakable]', '.faq-question', '.faq-answer']),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Industries', href: industryUrl('hvac-companies') },
              { label: data.industryName, href: data.url },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label={`Industry · ${data.industryName}`} variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                {data.title}
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                {data.metaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="#demo"
                  data-cta-location="industry-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get a Demo <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/case-studies/${data.caseStudySlug}`}
                  data-cta-location="industry-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  Read the case study
                </Link>
              </div>
            </div>
            <aside className="lg:col-span-5">
              <div className="border border-brand-cyan/30 bg-black p-8">
                <span className="text-xs uppercase tracking-widest text-white/55 font-mono">
                  ▸ result snapshot
                </span>
                <p className="font-heading text-6xl md:text-7xl text-brand-cyan mt-3 leading-none">
                  {data.heroStat}
                </p>
                <p className="mt-3 font-body text-white/80 max-w-xs">
                  {data.heroStatLabel}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {data.intro ? (
        <section className="bg-brand-dark border-t border-brand-purple/15">
          <div className="max-w-content mx-auto px-6 py-20">
            <div className="max-w-3xl">
              <SectionHeader
                eyebrow="The state of the line"
                title={`How ${data.industryName.toLowerCase()} actually answer their phones today`}
              />
              <p className="mt-6 font-body text-white/80 text-base lg:text-lg leading-relaxed">
                {data.intro}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Pain points"
            title="What is broken today"
            badgeVariant="purple"
          />
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {data.painPoints.map((pp, idx) => (
              <div
                key={pp.title}
                className="bg-black border border-brand-purple/20 p-6 flex flex-col gap-3"
              >
                <span className="font-mono text-xs text-brand-purple uppercase tracking-widest">
                  Problem 0{idx + 1}
                </span>
                <h3 className="font-heading text-xl text-white">{pp.title}</h3>
                <p className="font-body text-sm text-white/75 leading-relaxed">
                  {pp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="The fix" title="How Implenix solves it" />
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {data.useCases.map((s, i) => (
              <div
                key={s.title}
                className="bg-black border border-brand-purple/20 p-6 flex flex-col gap-3"
              >
                <span className="font-mono text-xs text-brand-cyan uppercase tracking-widest">
                  Step 0{i + 1}
                </span>
                <h3 className="font-heading text-xl text-white">{s.title}</h3>
                <p className="font-body text-sm text-white/75 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Outcomes"
            title="By the numbers"
            badgeVariant="purple"
          />
          <div className="mt-12">
            <DividedStats stats={data.stats} />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-2 gap-6 items-stretch">
          <CaseStudyCard
            industry={data.industryName}
            resultHeadline={`${data.industryName}: ${data.heroStat} ${data.heroStatLabel}`}
            summary="Read the full case study to see the deployment timeline, integrations, and verified results."
            href={`/case-studies/${data.caseStudySlug}`}
          />
          <blockquote className="bg-black border border-brand-purple/25 p-6 flex flex-col gap-4">
            <p className="font-body italic text-white/85 leading-relaxed">
              “{data.testimonialQuote}”
            </p>
            <footer className="mt-auto text-sm font-body text-white/55">
{data.testimonialAuthor}
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Frequently asked" />
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {data.faqs.map((f) => (
              <div key={f.question} className="border border-brand-purple/20 p-6">
                <p className="font-heading text-white text-lg">{f.question}</p>
                <p className="mt-3 font-body text-sm text-white/75 leading-relaxed">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="demo"
        className="bg-brand-dark border-t border-brand-purple/15"
      >
        <div className="max-w-content mx-auto px-6 py-24 grid lg:grid-cols-2 gap-10">
          <SectionHeader
            eyebrow="Get started"
            title={`Get a custom demo for your ${data.industryName} business`}
            description="We will set up a live test against your business and walk you through the agent end to end."
            badgeVariant="purple"
          />
          <BookingWidget
            ctaLocation={`industry-${params.slug}`}
            height={620}
          />
        </div>
        {MDX ? (
          <div className="max-w-content mx-auto px-6 pb-16">
            <div className="prose-implenix max-w-3xl">
              <MDX components={mdxComponents} />
            </div>
          </div>
        ) : null}
        {(() => {
          const blogLinks = getBlogLinksForIndustry(params.slug)
            .map((bl) => {
              const post = publishedBlogPosts.find((p) => p.slug === bl.slug);
              return post ? { href: post.url, label: bl.label } : null;
            })
            .filter(Boolean) as { href: string; label: string }[];
          return blogLinks.length > 0 ? (
            <div className="max-w-content mx-auto px-6 pb-16">
              <RelatedContent
                topic={`Deeper reading for ${data.industryName}`}
                type="blog"
                links={blogLinks}
              />
            </div>
          ) : null;
        })()}
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent
            topic={`More for ${data.industryName}`}
            type="industry"
            links={relatedLinks.length ? relatedLinks : undefined}
          />
        </div>
      </section>
    </>
  );
}
