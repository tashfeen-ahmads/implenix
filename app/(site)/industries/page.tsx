import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Wrench,
  Stethoscope,
  Home as HomeIcon,
  Scale,
  Droplets,
  Sparkles,
  Car,
  HardHat,
  Zap,
  Scissors,
  Calculator,
  Megaphone,
  SprayCan,
  Banknote,
  Umbrella,
  PawPrint,
  Bone,
  Brain,
  Flower2,
  Trees,
  Bug,
  Truck,
  Dumbbell,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  articleSchema,
  itemListSchema,
  collectionPageSchema,
} from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';
import { INDUSTRIES, industryUrl } from '@/lib/industries';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist Industries, 25 Tuned Playbooks | Implenix',
  description:
    'Browse all 25 industries with tuned AI receptionist playbooks, local services, health and wellness, beauty, professional services. Pick yours.',
  path: '/industries',
});

const ICONS: Record<string, LucideIcon> = {
  'hvac-companies': Wrench,
  dentists: Stethoscope,
  'real-estate': HomeIcon,
  'law-firms': Scale,
  plumbers: Droplets,
  'med-spas': Sparkles,
  'auto-repair': Car,
  roofers: HardHat,
  'medical-practices': Stethoscope,
  electricians: Zap,
  contractors: HardHat,
  salons: Scissors,
  accountants: Calculator,
  'marketing-agencies': Megaphone,
  'cleaning-services': SprayCan,
  'mortgage-brokers': Banknote,
  'insurance-agents': Umbrella,
  veterinarians: PawPrint,
  chiropractors: Bone,
  therapists: Brain,
  spas: Flower2,
  landscapers: Trees,
  'pest-control': Bug,
  'moving-companies': Truck,
  'personal-trainers': Dumbbell,
};

// Group definitions for browse-by-category. Each group lists slugs from
// INDUSTRIES; missing slugs are skipped silently to keep this resilient
// to future industry additions.
const GROUPS: Array<{
  heading: string;
  description: string;
  slugs: string[];
}> = [
  {
    heading: 'Local services',
    description:
      'Trade businesses with after-hours emergencies, dispatch, and recurring service. The largest category by deployment volume.',
    slugs: [
      'hvac-companies',
      'plumbers',
      'electricians',
      'roofers',
      'contractors',
      'auto-repair',
      'cleaning-services',
      'pest-control',
      'landscapers',
      'moving-companies',
    ],
  },
  {
    heading: 'Health & wellness',
    description:
      'Practices with appointment-heavy intake, insurance verification, and HIPAA-aware data handling.',
    slugs: [
      'medical-practices',
      'dentists',
      'chiropractors',
      'veterinarians',
      'therapists',
    ],
  },
  {
    heading: 'Beauty & lifestyle',
    description:
      'Booking-density businesses where the front desk competes with the chair, the room, and the client in person.',
    slugs: ['salons', 'spas', 'med-spas', 'personal-trainers'],
  },
  {
    heading: 'Professional services',
    description:
      'Consultative businesses with high-value intake, decision-maker qualification, and document collection.',
    slugs: [
      'law-firms',
      'accountants',
      'marketing-agencies',
      'mortgage-brokers',
      'insurance-agents',
      'real-estate',
    ],
  },
];

export default function IndustriesIndexPage() {
  // Build a quick lookup so missing slugs don't crash the page.
  const bySlug = Object.fromEntries(
    INDUSTRIES.map((i) => [i.slug, i] as const),
  );

  return (
    <>
      <SchemaOrg
        schema={[
          collectionPageSchema({
            name: 'AI Receptionist Industries',
            description:
              'Browse 25 tuned industry playbooks for the Implenix AI receptionist.',
            url: '/industries',
          }),
          itemListSchema({
            name: 'AI Receptionist by Industry',
            description:
              '25 industry-specific AI receptionist playbooks with real deployment case studies.',
            url: '/industries',
            items: INDUSTRIES.map((i) => ({
              name: `AI Receptionist for ${i.name}`,
              url: industryUrl(i.slug),
              description: i.painPoint,
            })),
          }),
          articleSchema({
            title: 'AI Receptionist Industries',
            description:
              'Browse 25 tuned industry playbooks for the Implenix AI receptionist.',
            url: '/industries',
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
              { label: 'Industries', href: '/industries' },
            ]}
            className="mb-8"
          />
          <div className="max-w-3xl flex flex-col gap-6">
            <Badge label="Industries · 25 playbooks" variant="cyan" />
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
              Pick your{' '}
              <span className="text-brand-purple">industry</span>. We have a
              tuned playbook.
            </h1>
            <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
              Each industry below ships with industry-specific call scripts,
              intake logic, transfer rules, and CRM mapping. Tap any card to
              read the deep-dive page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/audit"
                data-cta-location="industries-index-hero"
                data-cta-type="primary"
                className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
              >
                Get my missed-call audit <ArrowRight size={16} />
              </Link>
              <Link
                href="/try-it"
                data-cta-location="industries-index-hero"
                data-cta-type="secondary"
                className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
              >
                Hear the agent live
              </Link>
            </div>
          </div>
        </div>
      </section>

      {GROUPS.map((group, idx) => {
        const items = group.slugs.map((slug) => bySlug[slug]).filter(Boolean);
        if (items.length === 0) return null;
        return (
          <section
            key={group.heading}
            className={`${idx % 2 === 0 ? 'bg-black' : 'bg-brand-dark'} border-t border-brand-purple/15`}
          >
            <div className="max-w-content mx-auto px-6 py-20">
              <SectionHeader
                eyebrow={`${items.length} industries`}
                title={group.heading}
                description={group.description}
                badgeVariant={idx % 2 === 0 ? 'purple' : 'cyan'}
              />
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((i) => {
                  const Icon = ICONS[i.slug] ?? Wrench;
                  return (
                    <Link
                      key={i.slug}
                      href={industryUrl(i.slug)}
                      data-cta-location="industries-index"
                      data-cta-type="industry"
                      className="group bg-black border border-brand-purple/20 hover:border-brand-purple p-5 flex flex-col gap-3 transition-colors min-h-[200px]"
                    >
                      <span className="w-9 h-9 border border-brand-cyan/30 bg-brand-dark flex items-center justify-center">
                        <Icon size={16} className="text-brand-cyan" />
                      </span>
                      <h3 className="font-heading text-xl text-white">
                        {i.name}
                      </h3>
                      <p className="text-white/65 text-sm font-body leading-relaxed flex-1">
                        {i.painPoint}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-brand-cyan text-sm font-medium">
                        See playbook
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <Badge label="Don't see your industry?" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              We deploy beyond this list.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              These are the 25 industries with shipped, tuned playbooks. We
              regularly deploy for industries outside this list, if your
              call profile fits, we'll build the playbook with you.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/contact"
              data-cta-location="industries-index-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Talk to our team <ArrowRight size={16} />
            </Link>
            <Link
              href="/audit"
              data-cta-location="industries-index-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Get my free audit
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent
            topic="Keep reading"
            type="resource"
            links={[
              { href: '/', label: 'AI Receptionist, main pillar' },
              { href: '/pricing', label: 'AI Receptionist pricing' },
              {
                href: '/ai-receptionist-vs-human-receptionist',
                label: 'AI Receptionist vs Human Receptionist',
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
