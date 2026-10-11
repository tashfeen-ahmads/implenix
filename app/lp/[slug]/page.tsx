import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Play, ShieldCheck } from 'lucide-react';
import { BookingWidget } from '@/components/common/BookingWidget';
import { StatCard } from '@/components/common/StatCard';
import { TestimonialCard } from '@/components/common/TestimonialCard';
import { Badge } from '@/components/common/Badge';
import { CodeWindow } from '@/components/common/CodeWindow';
import { buildMetadata } from '@/lib/seo';
import { INDUSTRIES } from '@/lib/industries';

type Variant = 'a' | 'b';
type LandingConfig = {
  slug: string;
  variant: Variant;
  industryName: string;
  headline: string;
  subhead: string;
  benefits?: string[];
  testimonialQuote?: string;
  stat?: { number: string; label: string };
  hookHeadline?: string;
};

// PRIMARY KEYWORD-MATCHED LANDING PAGES (Variant A, Google Search Ad)
const variantA: LandingConfig[] = INDUSTRIES.map((i) => ({
  slug: `ai-receptionist-${i.slug}`,
  variant: 'a' as const,
  industryName: i.name,
  headline: `AI Receptionist for ${i.name} Businesses`,
  subhead:
    'Answer every inbound call. Qualify the lead. Book the appointment. Built for your industry, deployed in 7–14 days.',
  benefits: [
    '24/7 inbound coverage with custom call scripts',
    'Live calendar booking and CRM sync',
    'Live transfer to your team when needed',
  ],
  testimonialQuote:
    'We stopped losing after-hours calls overnight. The agent books while we sleep.',
  stat: { number: '<60s', label: 'average pickup time' },
}));

// META AWARENESS LANDING PAGES (Variant B)
const variantB: LandingConfig[] = [
  {
    slug: 'never-miss-a-call',
    variant: 'b',
    industryName: 'Local Business',
    hookHeadline: 'You missed 6 calls today. We can fix that.',
    headline: 'You missed 6 calls today. We can fix that.',
    subhead:
      'Implenix deploys an AI voice agent that answers every inbound call for your business. Free 30-minute audit.',
  },
];

const ALL: LandingConfig[] = [...variantA, ...variantB];

type Params = { slug: string };

export function generateStaticParams() {
  return ALL.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const cfg = ALL.find((c) => c.slug === params.slug);
  if (!cfg) return {};
  return buildMetadata({
    title: `${cfg.headline} | Implenix`,
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

// Variant A, Google Search Ad: form above the fold, single focused CTA.
function VariantA({ cfg }: { cfg: LandingConfig }) {
  return (
    <>
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-16 pb-16 md:pt-20 md:pb-20 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Badge label={`Built for ${cfg.industryName}`} variant="cyan" />
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
              {cfg.headline}
            </h1>
            <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
              {cfg.subhead}
            </p>
            <ul className="grid sm:grid-cols-3 gap-3 mt-2">
              {cfg.benefits?.map((b) => (
                <li
                  key={b}
                  className="border border-brand-purple/20 bg-black p-4 flex items-start gap-2 font-body text-white text-sm"
                >
                  <ShieldCheck size={16} className="text-brand-cyan mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <CodeWindow
                title={`${cfg.industryName.toLowerCase().replace(/\s+/g, '-')}.call.log`}
                lines={SAMPLE_LP_CALL}
                caption={`Sample ${cfg.industryName} inbound call · 12s`}
              />
            </div>
            {cfg.testimonialQuote && (
              <div className="mt-8">
                <TestimonialCard
                  businessName={`${cfg.industryName} Operator`}
                  ownerName="Operations lead"
                  industry={cfg.industryName}
                  quote={cfg.testimonialQuote}
                />
              </div>
            )}
            {cfg.stat && (
              <div className="mt-2 max-w-sm">
                <StatCard
                  number={cfg.stat.number}
                  label={cfg.stat.label}
                  accent="cyan"
                />
              </div>
            )}
          </div>

          <aside
            id="lp-form"
            className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col gap-4"
          >
            <div className="border border-brand-purple/30 bg-black p-6 flex flex-col gap-4">
              <Badge label="Free audit · 30 min" variant="purple" />
              <h2 className="font-heading text-2xl text-white leading-snug">
                Get a free audit
              </h2>
              <p className="text-sm text-white/70 font-body leading-relaxed">
                We will run an Implenix audit on your inbound calls and book a
                30-minute walkthrough.
              </p>
            </div>
            <BookingWidget ctaLocation={`lp-${cfg.slug}-top`} height={620} />
          </aside>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <Badge label="Last chance" variant="purple" />
            <h2 className="font-heading text-2xl md:text-4xl mt-5">
              One more time, let’s book it.
            </h2>
            <p className="mt-3 text-white/70 font-body">
              30 seconds. We will call you back today.
            </p>
          </div>
          <BookingWidget ctaLocation={`lp-${cfg.slug}-bottom`} height={620} />
        </div>
      </section>
    </>
  );
}

// Variant B, Meta Awareness: hook headline + minimal form.
function VariantB({ cfg }: { cfg: LandingConfig }) {
  return (
    <>
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-24 text-center flex flex-col items-center gap-6">
          <Badge label="Implenix · 60-second pitch" variant="purple" />
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl max-w-3xl mx-auto leading-[1.04]">
            {cfg.hookHeadline ?? cfg.headline}
          </h1>
          <p className="font-body text-white/80 max-w-2xl mx-auto text-lg">
            {cfg.subhead}
          </p>
          <div className="mt-4 w-full max-w-2xl mx-auto border border-brand-purple/30 bg-black aspect-video flex items-center justify-center relative">
            <div className="absolute top-3 left-3 flex gap-1.5">
              <span className="w-2 h-2 bg-brand-purple rounded-full" />
              <span className="w-2 h-2 bg-brand-cyan rounded-full" />
              <span className="w-2 h-2 bg-white/40 rounded-full" />
            </div>
            <button
              type="button"
              className="w-16 h-16 bg-brand-purple flex items-center justify-center rounded-sm hover:opacity-90"
              aria-label="Play video"
            >
              <Play size={28} className="text-white" />
            </button>
            <span className="absolute bottom-3 right-3 text-[11px] font-mono uppercase tracking-widest text-white/40">
              implenix.demo.mp4
            </span>
          </div>
          <div className="flex justify-center gap-3 flex-wrap font-mono text-xs uppercase tracking-widest text-white/60 mt-2">
            <span className="border border-brand-cyan/40 px-3 py-1">10 specialists</span>
            <span className="border border-brand-cyan/40 px-3 py-1">7–14 day deploy</span>
            <span className="border border-brand-cyan/40 px-3 py-1">24/7 coverage</span>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-16 flex flex-col items-center gap-6">
          <Badge label="Free audit" variant="cyan" />
          <h2 className="font-heading text-2xl md:text-3xl text-center max-w-xl">
            We will call you back within one business hour.
          </h2>
          <div className="w-full max-w-md">
            <BookingWidget ctaLocation={`lp-${cfg.slug}`} height={620} />
          </div>
        </div>
      </section>
    </>
  );
}
