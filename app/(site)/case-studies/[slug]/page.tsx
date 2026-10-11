import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import { allCaseStudies } from 'contentlayer/generated';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { DividedStats } from '@/components/common/DividedStats';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { RelatedContent } from '@/components/common/RelatedContent';
import { mdxComponents } from '@/components/docs/MdxComponents';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  articleSchema,
  reviewSchema,
  aggregateRatingSchema,
  speakableSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

// Per-case-study client review used to generate Review + AggregateRating
// schema. Every quote is from the actual client and verified at five
// stars. Surface in SERPs as rich result with stars.
const REVIEWS: Record<
  string,
  { reviewer: string; reviewBody: string; itemName: string }
> = {
  'pa-hvac-experts': {
    reviewer: 'Alex',
    reviewBody:
      'The best AI employee I have ever hired. It talks to every incoming call, nurtures my leads, books appointments, and sends follow-ups to me and the customer.',
    itemName: 'Implenix AI Receptionist for HVAC',
  },
  'columbus-property': {
    reviewer: 'Yessy',
    reviewBody:
      'We juggle deals, appointments, and follow-ups all day. Implenix books and follows up, we just close. That is the operation now.',
    itemName: 'Implenix AI Receptionist for Real Estate',
  },
  'ohio-dental': {
    reviewer: 'Hyder',
    reviewBody:
      'The team was spending 2-3 hours a day answering the phone and our in-house attention was slipping. Implenix handles the phone amazingly and the team is back focused on patients.',
    itemName: 'Implenix AI Receptionist for Dental',
  },
  'gtr-improvements-lexi': {
    reviewer: 'Lexi',
    reviewBody:
      'Urgent calls, building team comms, scheduling assessments, quality checks across roof, kitchen, and bath, the day was gone. Implenix runs the communication now and it sounds like a full professional team.',
    itemName: 'Implenix AI Receptionist for Home Improvement',
  },
  'parnell-motors': {
    reviewer: 'Parnell',
    reviewBody:
      'Very good experience with Implenix. I appreciate the communication and how organized the whole deployment was.',
    itemName: 'Implenix AI Receptionist for Auto Dealers',
  },
  'franklin-agency': {
    reviewer: 'Franklin',
    reviewBody:
      'Our job is to grow our clients with more leads, but we were drowning in our own inbound. Implenix handles our inbound completely so the team stays on client work.',
    itemName: 'Implenix AI Receptionist for Marketing Agencies',
  },
};

const RECORDINGS: Record<string, { src: string; label: string }> = {
  'pa-hvac-experts': {
    src: 'https://storage.vapi.ai/019dd11a-08f4-7001-be5e-9138391c69f7-1777329860916-1f64e293-9d0f-4aa7-b388-359b12052bbd-mono.mp3',
    label: 'Real call from this deployment, home-improvement intake (names redacted)',
  },
  'columbus-property': {
    src: 'https://storage.vapi.ai/019d5386-d076-7995-9f11-00e17cc6c065-1775222981308-169a281a-d8cf-4a47-83bb-3a398c88d1a7-mono.mp3',
    label: 'Real call from this deployment, seller acquisitions intake (names redacted)',
  },
  'gtr-improvements-lexi': {
    src: 'https://storage.vapi.ai/019d44c4-320d-799d-9aa1-e7b20b6a25ea-1774975462085-72a7c940-a44b-4c69-819f-09d6e6d163a9-mono.mp3',
    label: 'Real call from this deployment, sliding-door assessment booking (names redacted)',
  },
};

type Params = { slug: string };

// Every valid slug is prebuilt; anything else is a real 404 (not a
// streamed 200 that renders the not-found UI).
export const dynamicParams = false;

export function generateStaticParams() {
  return allCaseStudies.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const doc = allCaseStudies.find((c) => c.slug === params.slug);
  if (!doc) return {};
  return buildMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: `/case-studies/${doc.slug}`,
  });
}

export default function CaseStudyPage({ params }: { params: Params }) {
  const doc = allCaseStudies.find((c) => c.slug === params.slug);
  if (!doc) notFound();

  const MDX = useMDXComponent(doc.body.code);
  const overview = doc.clientOverview as {
    industry: string;
    size: string;
    challenge: string;
  };
  const primary = doc.primaryMetric as { number: string; label: string };
  const secondary = doc.secondaryMetric as { number: string; label: string };
  const time = doc.timeToResults as { number: string; label: string };

  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: doc.title,
            description: doc.metaDescription,
            url: doc.url,
            datePublished: doc.publishedAt,
          }), ...(REVIEWS[doc.slug]
            ? [
                reviewSchema({
                  reviewer: REVIEWS[doc.slug].reviewer,
                  reviewBody: REVIEWS[doc.slug].reviewBody,
                  rating: 5,
                  datePublished: doc.publishedAt,
                  itemName: REVIEWS[doc.slug].itemName,
                  itemUrl: doc.url,
                }),
                aggregateRatingSchema({
                  ratingValue: 5,
                  reviewCount: 1,
                  itemName: REVIEWS[doc.slug].itemName,
                  itemUrl: doc.url,
                }),
              ]
            : []),
          speakableSchema(['h1', '[data-speakable]']),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-16 md:pt-24 md:pb-20">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Case Studies', href: '/case-studies' },
              { label: doc.industry, href: `/case-studies/${doc.slug}` },
            ]}
            className="mb-6"
          />
          <Link
            href="/case-studies"
            data-cta-location="case-study-back"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-cyan font-mono mb-8 hover:opacity-80"
          >
            <ArrowLeft size={12} /> All case studies
          </Link>
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label={`Case Study · ${doc.industry}`} variant="purple" />
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-[1.04]">
                {doc.resultHeadline}
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                {doc.summary}
              </p>
            </div>
            <aside className="lg:col-span-4">
              <dl className="border border-brand-cyan/30 bg-black divide-y divide-brand-purple/15">
                <Item label="Industry" value={overview.industry} />
                <Item label="Size" value={overview.size} />
                <Item label="Challenge" value={overview.challenge} />
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="Outcomes"
            title="The numbers from this deployment"
          />
          <div className="mt-12">
            <DividedStats
              stats={[primary, secondary, time]}
            />
          </div>
        </div>
      </section>

      <div className="max-w-content mx-auto px-6 py-20 grid lg:grid-cols-[1fr_320px] gap-10 items-start border-t border-brand-purple/15">
        <div className="min-w-0 flex flex-col gap-16">
          <section>
            <SectionHeader eyebrow="The problem" title="What broke" badgeVariant="purple" />
            <p className="mt-6 font-body text-white/80 leading-relaxed">
              {doc.summary}
            </p>
            <ul className="mt-6 space-y-3 font-body text-white/85">
              {doc.painPoints.map((pp) => (
                <li
                  key={pp}
                  className="flex items-start gap-3 border-l-[3px] border-brand-purple bg-black p-4"
                >
                  <span>{pp}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeader eyebrow="The solution" title="What we shipped" />
            <p className="mt-6 font-body text-white/80 leading-relaxed">
              {doc.solutionSummary}
            </p>
            <div className="mt-8 border border-brand-cyan/30 bg-black p-6">
              <span className="text-xs uppercase tracking-widest text-brand-cyan font-mono">
                ▸ Integrations
              </span>
              <ul className="mt-4 flex flex-wrap gap-2">
                {doc.integrations.map((i) => (
                  <li
                    key={i}
                    className="border border-brand-cyan/40 text-brand-cyan text-xs px-3 py-1.5 font-mono"
                  >
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {RECORDINGS[doc.slug] ? (
            <section>
              <SectionHeader
                eyebrow="Listen"
                title="Real call from this deployment"
                description="Live recording from post-go-live traffic. Names and addresses redacted in the audio."
                badgeVariant="purple"
              />
              <div className="mt-6">
                <AudioPlayer
                  src={RECORDINGS[doc.slug].src}
                  label={RECORDINGS[doc.slug].label}
                />
              </div>
            </section>
          ) : null}

          <section className="prose-implenix">
            <MDX components={mdxComponents} />
          </section>

          <RelatedContent topic="More case studies" type="case-study" />
        </div>

        <aside className="lg:sticky lg:top-24 border border-brand-purple/30 bg-black p-6 flex flex-col gap-4">
          <Badge label="Get the same result" variant="cyan" />
          <h3 className="font-heading text-xl text-white leading-snug">
            Run this playbook for your business
          </h3>
          <p className="text-sm text-white/70 font-body leading-relaxed">
            We will scope a deployment for your team in 30 minutes.
          </p>
          <div className="flex flex-col gap-3">
            <TestRonCTA
              ctaLocation={`case-study-${doc.slug}-ron`}
              variant="primary"
            />
            <Link
              href="/contact"
              data-cta-location={`case-study-${doc.slug}-calendar`}
              data-cta-type="calendar"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-5 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Book a 30-min call <ArrowRight size={14} />
            </Link>
          </div>
          <Link
            href="/case-studies"
            data-cta-location="case-study-sidebar"
            className="inline-flex items-center gap-1.5 text-brand-cyan text-sm hover:underline mt-2"
          >
            Browse other case studies <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <dt className="text-xs uppercase tracking-widest text-white/55 font-mono">
        {label}
      </dt>
      <dd className="mt-1 font-body text-white text-sm">{value}</dd>
    </div>
  );
}
