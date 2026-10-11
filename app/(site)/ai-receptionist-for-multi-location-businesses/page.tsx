import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Database,
  PhoneForwarded,
  Building2,
  ShieldCheck,
  BarChart,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BentoCard } from '@/components/common/BentoCard';
import { DividedStats } from '@/components/common/DividedStats';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, articleSchema, serviceSchema } from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist for Multi-Location Businesses | Implenix',
  description:
    'AI receptionist for multi-location operations and franchises. Geofenced routing, per-location reporting, brand-consistent intake across 2-50+ locations.',
  path: '/ai-receptionist-for-multi-location-businesses',
});

const FAQS = [
  {
    question: 'How does the AI route calls across multiple locations?',
    answer:
      'Geofenced routing by area code or zip lookup. The agent identifies the caller\'s service area on the first turn and routes to the right location\'s schedule, dispatch, and team, with brand-consistent intake across all of them.',
  },
  {
    question: 'Can each location have its own script and schedule?',
    answer:
      'Yes. We tune per-location overrides on top of a shared brand script, service hours, capacity rules, on-call rotations, holiday schedules. Brand consistency stays; operational specifics flex per location.',
  },
  {
    question: 'How does reporting work across locations?',
    answer:
      'Per-location dashboards plus a roll-up. Call volume, capture rate, booking rate, and revenue attribution split by location. Operations and ownership both see the data they need.',
  },
  {
    question: 'What about franchises with separate ownership per location?',
    answer:
      'Supported. Each franchisee can have its own CRM, calendar, and dispatch integration on the same brand-consistent agent. Centralized standards, decentralized operations.',
  },
  {
    question: 'How long does multi-location deployment take?',
    answer:
      '14-28 business days depending on location count and per-location customization. The shared brand script is built once; per-location config layers on after.',
  },
  {
    question: 'What plan tier is required for multi-location?',
    answer:
      'The Established Firm tier ($997/month) supports unlimited inbound calls and multi-location routing. Larger operations (15+ locations) typically work on a custom enterprise quote.',
  },
];

const FEATURES = [
  {
    Icon: MapPin,
    title: 'Geofenced routing',
    description:
      'Caller area code or zip identifies the right location. Routing happens on the first turn, no menu, no friction.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Building2,
    title: 'Per-location schedules',
    description:
      'Service hours, capacity rules, on-call rotations, holiday schedules, each location overrides the shared defaults.',
  },
  {
    Icon: ShieldCheck,
    title: 'Brand-consistent intake',
    description:
      'Same script, same voice, same qualification logic across every location. Customers can\'t tell if you have 3 or 30 locations.',
  },
  {
    Icon: PhoneForwarded,
    title: 'Per-location transfer rules',
    description:
      'VIP allow-lists, urgent-criteria triggers, and on-call routing all configurable per location.',
  },
  {
    Icon: Database,
    title: 'Multi-CRM, multi-calendar',
    description:
      'Each location can run its own CRM and calendar. The agent integrates with all of them and writes back to the right one.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: BarChart,
    title: 'Per-location reporting',
    description:
      'Roll-up dashboard plus per-location split. Capture rate, booking rate, revenue attribution by location.',
  },
];

export default function AIReceptionistForMultiLocationPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: 'AI Receptionist for Multi-Location Businesses',
            description:
              'AI receptionist for multi-location operations with geofenced routing and per-location reporting.',
            url: '/ai-receptionist-for-multi-location-businesses',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist for Multi-Location Businesses',
            description:
              'AI receptionist purpose-built for franchise and multi-location operations.',
            serviceType: 'AI Receptionist',
            url: '/ai-receptionist-for-multi-location-businesses',
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'AI Receptionist', href: '/' },
              {
                label: 'For Multi-Location',
                href: '/ai-receptionist-for-multi-location-businesses',
              },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label="Built for · Multi-Location" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
                AI receptionist for{' '}
                <span className="text-brand-violet">multi-location</span>{' '}
                businesses.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Centralize the brand. Decentralize the operations.
                Geofenced routing, per-location schedules, multi-CRM
                integration, every caller routed to the right location
                in the first turn, every location reporting roll-up
                visible to ownership.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/contact"
                  data-cta-location="multi-loc-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Talk to enterprise <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/audit"
                  data-cta-location="multi-loc-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  Get my free audit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <SectionHeader
              eyebrow="The multi-location problem"
              title="Brand consistency vs operational specifics, most businesses pick one and lose the other"
            />
            <div className="mt-8 flex flex-col gap-5 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              <p>
                Multi-location operations face an unusual phone
                challenge: the brand wants consistent intake across
                every location (same voice, same qualification, same
                customer experience), but each location has different
                operational specifics (service hours, capacity, on-call
                rotations, dispatch tools). Most businesses end up
                picking one and losing the other, either every
                location runs its own front desk with drift in
                experience, or a centralized call center loses the
                operational nuance each location needs.
              </p>
              <p>
                Implenix is built to handle both. The shared brand
                script, voice, qualification logic, transfer rules,
                customer experience, runs across every location. On
                top of that, per-location config layers in: service
                hours, capacity rules, holiday schedules, on-call
                rotations, location-specific transfer rules, and
                location-specific CRM and dispatch integrations.
                Geofenced routing identifies the caller's service area
                on the first turn and routes accordingly, no menu, no
                "press 1 for Boston, press 2 for Chicago."
              </p>
              <p>
                Reporting follows the same shape: per-location
                dashboards visible to that location's manager, plus a
                roll-up dashboard for ownership showing capture rate,
                booking rate, and revenue attribution split across
                every location. Multi-location operations on Implenix
                typically see consistent capture rates above 90% across
                all locations, vs the 50-70% range typical for
                operations without centralized intake handling.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Capabilities"
            title="What multi-location requires from an AI receptionist"
            description="Geofencing, per-location config, multi-CRM, and roll-up reporting, all on one agent."
            badgeVariant="purple"
          />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <BentoCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Outcomes"
            title="What multi-location deployments tend to deliver"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '90%+', label: 'consistent capture rate across all locations' },
                { number: 'Per-loc', label: 'reporting + roll-up to ownership' },
                { number: '14-28 d', label: 'deployment timeline (location count dependent)' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Multi-location questions" />
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {FAQS.map((f) => (
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
            <Badge label="Multi-location enterprise" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Centralize the brand. Decentralize the operations.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              Talk to our enterprise team. We'll scope the
              multi-location deployment, integrations, and reporting
              tier for your operation.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/contact"
              data-cta-location="multi-loc-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Talk to enterprise <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="multi-loc-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              See pricing
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent
            topic="Keep reading"
            type="resource"
            links={[
              { href: '/', label: 'How Implenix answers your calls' },
              {
                href: '/ai-receptionist-for-small-business',
                label: 'AI Receptionist for Small Business',
              },
              { href: '/pricing', label: 'AI Receptionist pricing' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
