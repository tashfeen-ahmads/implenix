import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ComparisonTable } from '@/components/common/ComparisonTable';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import {
  productWithOffersSchema,
  breadcrumbListSchema,
  faqSchema,
  speakableSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing, Outcome-Based AI Receptionist Plans | Implenix',
  description:
    'Implenix plans priced against a human receptionist ($3,500-$5,000/mo). Solo, Growing, Established tiers, revenue captured per tier.',
  path: '/pricing',
});

const TIERS = [
  {
    name: 'Solo Operator',
    target: 'For owners who answer their own phones',
    price: 297,
    capture: '$15,000+',
    captureLabel: 'estimated revenue captured / month',
    inclusions: [
      'Up to 100 inbound calls / month',
      '24/7 answering · custom industry script',
      'Calendar booking · Google / Outlook / Calendly',
      'CRM sync via webhook',
      'Call recordings + transcripts',
    ],
    cta: 'Start with Solo Operator',
    href: '/contact',
    accent: 'cyan' as const,
  },
  {
    name: 'Growing Agency',
    target: 'For teams of 2-10 with real call volume',
    price: 597,
    highlight: true,
    capture: '$60,000+',
    captureLabel: 'estimated revenue captured / month',
    inclusions: [
      'Up to 500 inbound calls / month',
      'Everything in Solo Operator',
      'GoHighLevel + HubSpot + Salesforce native',
      'Configurable handoff to human',
      'Outbound follow-up sequences',
      'Multi-language support (EN / ES)',
    ],
    cta: 'Start with Growing Agency',
    href: '/contact',
    accent: 'purple' as const,
  },
  {
    name: 'Established Firm',
    target: 'For high-volume operations · multi-location',
    price: 997,
    capture: '$150,000+',
    captureLabel: 'estimated revenue captured / month',
    inclusions: [
      'Unlimited inbound calls',
      'Everything in Growing Agency',
      'Multi-location routing',
      'Branded voice (custom voice cloning)',
      'Dedicated implementation engineer',
      'Quarterly business review',
    ],
    cta: 'Book a 30-min call',
    href: '/contact',
    accent: 'cyan' as const,
  },
];

const WHITE_GLOVE = {
  price: 497,
  inclusions: [
    'We configure scripts, voice, and routing for you',
    'CRM + calendar + phone routing wired end-to-end',
    'Live test against your business before go-live',
    'Live in 72 hours, not weeks',
  ],
};

export default function PricingPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          productWithOffersSchema({
            name: 'Implenix AI Receptionist',
            description:
              'AI Receptionist for local business, three tiers with fixed monthly pricing. Solo Operator, Growing Agency, Established Firm.',
            url: '/pricing',
            offers: TIERS.map((t) => ({
              name: t.name,
              price: String(t.price),
              description: t.target,
            })),
          }),
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'Pricing', href: '/pricing' },
          ]),
          speakableSchema(),
        ]}
      />
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="max-w-3xl flex flex-col gap-5">
            <Badge label="Pricing · Outcome-based" variant="cyan" />
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
              Cheaper than a receptionist.{' '}
              <span className="text-brand-violet">Better at the job</span>.
            </h1>
            <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
              A full-time human receptionist runs $3,500-$5,000 per month
              and works 40 hours a week. Implenix runs 24/7, never misses a
              call, never takes lunch, and starts at $297/month.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <div className="border border-brand-purple/20 bg-black px-6 py-5 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/55">
              ▸ Anchor · Cost of a human receptionist
            </span>
            <span className="font-mono text-white text-sm">
              <span className="text-white/55">Mid-market US salary</span>{' '}
              <span className="text-white/85">$3,500-$5,000</span>{' '}
              <span className="text-white/55">/ month · 40 hrs / week · no nights</span>
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {TIERS.map((tier) => (
              <article
                key={tier.name}
                className={`relative bg-black border p-7 flex flex-col gap-5 ${
                  tier.highlight
                    ? 'border-brand-purple ring-2 ring-brand-purple/40 ring-offset-2 ring-offset-black lg:-translate-y-2'
                    : 'border-brand-purple/20 hover:border-brand-purple/60 transition-colors'
                }`}
              >
                {tier.highlight ? (
                  <span className="inline-flex items-center gap-1 self-start bg-brand-purple text-white text-[10px] uppercase tracking-widest font-mono px-2 py-1 -mt-1 -ml-1">
                    <Sparkles size={10} aria-hidden /> Most picked
                  </span>
                ) : null}
                <header className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-brand-cyan">
                    ▸ {tier.target}
                  </span>
                  <h2 className="font-heading text-2xl text-white mt-1">
                    {tier.name}
                  </h2>
                </header>

                <div className="border-t border-brand-purple/15 pt-5">
                  <p className="font-heading text-5xl text-white leading-none">
                    ${tier.price}
                    <span className="font-body text-base text-white/55"> / mo</span>
                  </p>
                </div>

                <div className="border-l-[3px] border-brand-cyan bg-brand-dark px-4 py-3">
                  <p className="font-heading text-2xl text-brand-cyan leading-none">
                    {tier.capture}
                  </p>
                  <p className="text-[11px] text-white/65 font-body mt-1">
                    {tier.captureLabel}
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5 flex-1">
                  {tier.inclusions.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 font-body text-sm text-white/80"
                    >
                      <Check size={14} className="text-brand-cyan mt-0.5 shrink-0" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  data-cta-location={`pricing-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}
                  data-cta-type={tier.highlight ? 'primary' : 'secondary'}
                  className={`mt-2 inline-flex items-center justify-center gap-2 font-medium px-5 py-3 rounded-sm ${
                    tier.highlight
                      ? 'bg-brand-purple text-white hover:opacity-90'
                      : 'border border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10'
                  }`}
                >
                  {tier.cta} <ArrowRight size={14} aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 border border-brand-cyan/30 bg-black p-8 flex flex-col gap-5">
              <Badge label="White-glove setup · optional" variant="cyan" />
              <h2 className="font-heading text-3xl md:text-4xl text-white leading-tight">
                Don’t have 15 minutes? We will set it up for you.
              </h2>
              <p className="font-body text-white/75 leading-relaxed">
                One-time fee. Our implementation engineer configures your
                scripts, voice, routing, calendar, and CRM end-to-end, live in 72 hours.
              </p>
              <ul className="flex flex-col gap-2 mt-2">
                {WHITE_GLOVE.inclusions.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 font-body text-sm text-white/85"
                  >
                    <ShieldCheck
                      size={14}
                      className="text-brand-cyan mt-0.5 shrink-0" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact?intent=white-glove"
                data-cta-location="pricing-white-glove"
                data-cta-type="primary"
                className="mt-2 inline-flex items-center gap-2 bg-brand-purple text-white font-medium px-5 py-3 rounded-sm hover:opacity-90 self-start"
              >
                Book white-glove setup · ${WHITE_GLOVE.price}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>

            <div className="lg:col-span-5 border border-brand-purple/20 bg-black p-8 flex flex-col gap-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/55">
                ▸ Or · do it yourself
              </span>
              <p className="font-heading text-xl text-white leading-snug">
                Our self-serve setup wizard takes about 15 minutes.
              </p>
              <ol className="flex flex-col gap-2 text-sm font-body text-white/80 list-decimal pl-5 marker:text-brand-violet">
                <li>Paste your website URL, we auto-build the knowledge base</li>
                <li>Upload existing FAQs (optional)</li>
                <li>Answer 5 voice prompts to capture tone</li>
                <li>Connect your calendar</li>
                <li>Set your average client value</li>
              </ol>
              <Link
                href="/contact?intent=self-serve"
                data-cta-location="pricing-self-serve"
                data-cta-type="secondary"
                className="mt-3 inline-flex items-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-5 py-3 rounded-sm hover:bg-brand-cyan/10 self-start"
              >
                Set it up myself <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="Compared"
            title="Implenix vs the alternatives"
            description="Implenix Growing Agency: $597/mo. A human receptionist: $3,500+/mo, only 40 hours of coverage. Generic IVR: cheap, terrible."
            badgeVariant="purple"
          />
          <div className="mt-12">
            <ComparisonTable
              highlightColumn={0}
              columns={['Implenix', 'Receptionist', 'Voicemail', 'Generic IVR']}
              rows={[
                { label: '24/7 coverage', cells: [true, false, false, true] },
                { label: 'Custom industry script', cells: [true, true, false, false] },
                { label: 'Books to your calendar live', cells: [true, true, false, false] },
                { label: 'Two-way CRM sync', cells: [true, 'partial', false, false] },
                { label: 'Multi-language', cells: [true, 'partial', false, 'partial'] },
                { label: 'Recordings + transcripts', cells: [true, false, 'partial', 'partial'] },
                {
                  label: 'Monthly cost',
                  cells: ['from $297', '$3,500-$5,000', '$0', '$80-$200'],
                },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
