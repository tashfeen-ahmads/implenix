import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { allIndustries } from 'contentlayer/generated';
import { BookingWidget } from '@/components/common/BookingWidget';
import { StatCard } from '@/components/common/StatCard';
import { TestimonialCard } from '@/components/common/TestimonialCard';
import { Badge } from '@/components/common/Badge';
import { CodeWindow } from '@/components/common/CodeWindow';
import { IPhoneMock } from '@/components/common/IPhoneMock';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { TESTIMONIALS } from '@/components/sections/TestimonialsSection';
import { buildMetadata } from '@/lib/seo';
import { INDUSTRIES } from '@/lib/industries';
import { getIndustryProfile } from '@/lib/seo/industries';

type Variant = 'a' | 'b';
type Testimonial = (typeof TESTIMONIALS)[number];
type LandingConfig = {
  slug: string;
  variant: Variant;
  industryName: string;
  headline: string;
  subhead: string;
  benefits?: string[];
  testimonial?: Testimonial;
  stat?: { number: string; label: string };
};

// Per-industry copy comes from the same sources as the SEO industry
// pages: MDX for the 8 original industries, INDUSTRY_PROFILES for the
// rest. Ads match on the industry keyword, so the page must too.
function industryCopy(slug: string, fallbackName: string, painPoint: string) {
  const mdx = allIndustries.find((d) => d.slug === slug);
  if (mdx) {
    const solutions = mdx.solutions as { title: string }[];
    return {
      headline: mdx.title,
      pain: (mdx.painPoints as { title: string }[])[0]?.title ?? painPoint,
      benefits: solutions.slice(0, 3).map((x) => x.title),
      stat: { number: mdx.heroStat, label: mdx.heroStatLabel },
    };
  }
  const profile = getIndustryProfile(slug);
  if (profile) {
    return {
      headline: `AI Receptionist for ${profile.name}`,
      pain: profile.painPoints[0]?.title ?? painPoint,
      benefits: profile.useCases.slice(0, 3).map((x) => x.title),
      stat: { number: profile.heroStat, label: profile.heroStatLabel },
    };
  }
  return {
    headline: `AI Receptionist for ${fallbackName}`,
    pain: painPoint,
    benefits: [
      '24/7 inbound coverage with custom call scripts',
      'Live calendar booking and CRM sync',
      'Live transfer to your team when needed',
    ],
    stat: { number: '<1 ring', label: 'average pickup time' },
  };
}

// Show the closest real, named client. Never a generic attribution.
const TESTIMONIAL_FOR: Record<string, string> = {
  dentists: 'Ohio Dental',
  'real-estate': 'Columbus Property',
  'mortgage-brokers': 'Columbus Property',
  'auto-repair': 'Parnell Motors',
  'marketing-agencies': 'Franklin Agency',
  contractors: 'GTR Improvements',
  roofers: 'GTR Improvements',
  landscapers: 'GTR Improvements',
};
const testimonialFor = (slug: string) =>
  TESTIMONIALS.find((t) => t.businessName === (TESTIMONIAL_FOR[slug] ?? 'PA HVAC Experts'));

// PRIMARY KEYWORD-MATCHED LANDING PAGES (Variant A, Google Search Ad)
const variantA: LandingConfig[] = INDUSTRIES.map((i) => {
  const copy = industryCopy(i.slug, i.name, i.painPoint);
  return {
    slug: `ai-receptionist-${i.slug}`,
    variant: 'a' as const,
    industryName: i.name,
    headline: copy.headline,
    subhead: `${copy.pain}. Implenix answers every call in one ring, books the appointment on your calendar, and logs it to your CRM.`,
    benefits: copy.benefits,
    testimonial: testimonialFor(i.slug),
    stat: copy.stat,
  };
});

// META AWARENESS LANDING PAGES (Variant B)
const variantB: LandingConfig[] = [
  {
    slug: 'never-miss-a-call',
    variant: 'b',
    industryName: 'Local Business',
    headline: 'You missed 6 calls today. We can fix that.',
    subhead:
      'Implenix deploys an AI receptionist that answers every inbound call for your business. Hear it yourself, then book a free 30-minute audit.',
  },
];

const ALL: LandingConfig[] = [...variantA, ...variantB];

type Params = { slug: string };

// Every valid slug is prebuilt; anything else is a real 404 (not a
// streamed 200 that renders the not-found UI).
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const cfg = ALL.find((c) => c.slug === params.slug);
  if (!cfg) return {};
  return buildMetadata({
    title: `${cfg.headline}: Free Audit | Implenix`,
    description: cfg.subhead,
    path: `/lp/${cfg.slug}`,
    noindex: true,
  });
}

export default function LandingPage({ params }: { params: Params }) {
  const cfg = ALL.find((c) => c.slug === params.slug);
  if (!cfg) notFound();
  return cfg.variant === 'a' ? <VariantA cfg={cfg} /> : <VariantB cfg={cfg} />;
}

const SAMPLE_LP_CALL = [
  { ts: '00:00', speaker: 'system' as const, text: 'Inbound · Implenix agent' },
  { ts: '00:02', speaker: 'agent' as const, text: 'Thanks for calling, how can I help?' },
  { ts: '00:05', speaker: 'caller' as const, text: 'I need a quote and the soonest opening.' },
  { ts: '00:08', speaker: 'agent' as const, text: 'Booking you in now. Confirmation by text.' },
  { ts: '00:12', speaker: 'system' as const, text: 'Booking confirmed · CRM updated' },
];

// Variant A, Google Search Ad. Mobile order: pitch, booking form, proof.
// Desktop: pitch + proof on the left, sticky form on the right.
function VariantA({ cfg }: { cfg: LandingConfig }) {
  return (
    <>
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 pt-12 pb-20 md:pt-20 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-12 items-start">
          <div className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-1 flex flex-col gap-6">
            <div className="self-start">
              <Badge label={`Built for ${cfg.industryName}`} variant="cyan" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              {cfg.headline}
            </h1>
            <p className="font-body text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed">
              {cfg.subhead} Live in{' '}
              <span className="whitespace-nowrap">7-14 days</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#lp-form"
                data-cta-location={`lp-${cfg.slug}-hero`}
                data-cta-type="primary"
                className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-7 py-4 rounded-sm transition hover:opacity-90 active:translate-y-px"
              >
                Book my free audit <ArrowRight size={16} aria-hidden />
              </a>
              <TestRonCTA ctaLocation={`lp-${cfg.slug}-hero`} variant="secondary" size="lg" />
            </div>
            <ul className="flex flex-col gap-3 mt-2">
              {cfg.benefits?.map((b) => (
                <li key={b} className="flex items-start gap-3 font-body text-white/85">
                  <ShieldCheck size={18} className="text-brand-cyan mt-0.5 shrink-0" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <aside
            id="lp-form"
            className="min-w-0 scroll-mt-20 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6 flex flex-col gap-4"
          >
            <div className="border border-brand-purple/30 bg-black p-6 flex flex-col gap-3">
              <h2 className="font-heading text-2xl text-white leading-snug">
                Book your free 30-minute audit
              </h2>
              <p className="text-sm text-white/70 font-body leading-relaxed">
                Pick a time. We review your inbound calls and show you what an
                AI receptionist would capture, on a video call.
              </p>
            </div>
            <BookingWidget ctaLocation={`lp-${cfg.slug}-top`} height={620} />
          </aside>

          <div className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-2 flex flex-col gap-8">
            <CodeWindow
              title={`${cfg.industryName.toLowerCase().replace(/\s+/g, '-')}.call.log`}
              lines={SAMPLE_LP_CALL}
              caption={`Sample ${cfg.industryName} inbound call · 12s`}
            />
            {cfg.stat ? (
              <div className="max-w-sm">
                <StatCard number={cfg.stat.number} label={cfg.stat.label} accent="cyan" />
              </div>
            ) : null}
            {cfg.testimonial ? <TestimonialCard {...cfg.testimonial} /> : null}
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-6 lg:sticky lg:top-6">
            <h2 className="font-heading text-3xl md:text-4xl leading-tight">
              Still deciding? Hear it first.
            </h2>
            <p className="text-white/70 font-body text-lg leading-relaxed">
              Talk to Ron, our AI receptionist, right in your browser. Then
              pick a time for your free 30-minute audit.
            </p>
            <ul className="flex flex-col gap-3">
              {['Free, no commitment', '30 minutes on a video call', 'Live in 7-14 days if you go ahead'].map((x) => (
                <li key={x} className="flex items-center gap-3 font-body text-white/85">
                  <Check size={16} className="text-brand-cyan shrink-0" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
            <div className="self-start">
              <TestRonCTA ctaLocation={`lp-${cfg.slug}-bottom`} />
            </div>
          </div>
          <BookingWidget ctaLocation={`lp-${cfg.slug}-bottom`} height={620} />
        </div>
      </section>
    </>
  );
}

// Variant B, Meta awareness: hook headline, hear Ron, book.
function VariantB({ cfg }: { cfg: LandingConfig }) {
  return (
    <>
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 pt-12 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              {cfg.headline}
            </h1>
            <p className="font-body text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed">
              {cfg.subhead}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <TestRonCTA ctaLocation={`lp-${cfg.slug}-hero`} size="lg" />
              <a
                href="#lp-form"
                data-cta-location={`lp-${cfg.slug}-hero`}
                data-cta-type="secondary"
                className="inline-flex items-center justify-center gap-2 border border-brand-cyan/70 text-brand-cyan font-medium px-7 py-4 rounded-sm transition hover:bg-brand-cyan/10"
              >
                Book my free audit <ArrowRight size={16} aria-hidden />
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 font-body text-white/70 text-sm">
              {['Answers in one ring, 24/7', 'Live in 7-14 days', 'Fixed monthly price'].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check size={14} className="text-brand-cyan" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <IPhoneMock />
          </div>
        </div>
      </section>

      <section id="lp-form" className="scroll-mt-6 bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 md:px-10 py-20 md:py-28 flex flex-col items-center gap-8">
          <h2 className="font-heading text-3xl md:text-4xl text-center max-w-xl leading-tight">
            Pick a time for your free 30-minute audit.
          </h2>
          <div className="w-full max-w-md">
            <BookingWidget ctaLocation={`lp-${cfg.slug}`} height={620} />
          </div>
        </div>
      </section>
    </>
  );
}
