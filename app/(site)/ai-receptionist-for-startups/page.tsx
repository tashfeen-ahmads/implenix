import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Rocket,
  TrendingUp,
  Database,
  PhoneForwarded,
  Filter,
  Globe2,
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
  title: 'AI Receptionist for Startups | Implenix',
  description:
    'AI receptionist for startups. Qualify inbound leads, screen vendor pitches, and look like an established business, for $297/mo, no hire needed.',
  path: '/ai-receptionist-for-startups',
});

const FAQS = [
  {
    question: 'Why would a startup need an AI receptionist?',
    answer:
      'Startups deal with the same inbound problems established businesses have, lead qualification, partner inquiries, vendor solicitation noise, customer support routing, without the headcount or runway to hire a receptionist. The AI handles all of it for $297/month.',
  },
  {
    question: 'Doesn\'t a startup just use voicemail or a Google Voice number?',
    answer:
      'Most do, and most lose meaningful pipeline because of it. A B2B startup gets fewer inbound calls than a service business, but each one matters more, a partnership inquiry or a customer demo request that goes to voicemail rarely converts. The AI captures all of them.',
  },
  {
    question: 'Will it screen out cold pitches and vendor solicitations?',
    answer:
      'Yes. Pattern-matched solicitations route to a callback queue your ops reviews weekly. Real prospect calls and partnership inquiries route to founders. This alone is worth the subscription for most startups.',
  },
  {
    question: 'Can it integrate with our modern stack, HubSpot, Linear, Notion?',
    answer:
      'HubSpot, Salesforce, and most modern CRMs integrate natively. Linear and Notion integrations are configurable via webhook. We typically wire startup deployments end-to-end during onboarding.',
  },
  {
    question: 'How does this make us "look established"?',
    answer:
      'A natural-sounding professional voice picking up your business number signals operational maturity. The agent runs your industry-specific intake, books real meetings, and delivers a brand-consistent experience on every call. Buyers and investors notice.',
  },
  {
    question: 'When should we switch to a real receptionist?',
    answer:
      'Most startups never need to. The AI scales with the business. Some hit a point where a brand-tier human receptionist becomes part of their positioning, at that point, the hybrid model (AI for volume, human for premium calls) typically wins.',
  },
];

const FEATURES = [
  {
    Icon: Rocket,
    title: 'Live in 7-14 days',
    description:
      'Deploy fast, no PBX, no IT project, no hire. Your business number forwards to our cloud agent, you\'re live in two weeks.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Filter,
    title: 'Cold-pitch screening',
    description:
      'Vendor solicitations route to an ops queue. Founders only see calls that actually matter.',
  },
  {
    Icon: TrendingUp,
    title: 'Lead qualification at the front',
    description:
      'Industry, role, deal size, decision-maker captured before the founder takes a discovery call.',
  },
  {
    Icon: PhoneForwarded,
    title: 'Founder-only routing',
    description:
      'Allow-listed investors, partners, and warm referrals route directly to your mobile in seconds.',
  },
  {
    Icon: Database,
    title: 'Live HubSpot / Salesforce sync',
    description:
      'Lead, source, transcript, and outcome write to your CRM during the call. No fact-finding callbacks.',
    span: 'lg' as const,
    accent: 'purple' as const,
  },
  {
    Icon: Globe2,
    title: 'Multi-language for international',
    description:
      'EN + ES out of the box. Useful for startups serving multilingual markets from day one.',
  },
];

export default function AIReceptionistForStartupsPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: 'AI Receptionist for Startups',
            description:
              'AI receptionist for early-stage startups handling inbound qualification, vendor screening, and founder routing.',
            url: '/ai-receptionist-for-startups',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist for Startups',
            description:
              'AI receptionist purpose-built for early-stage and growth-stage startups.',
            serviceType: 'AI Receptionist',
            url: '/ai-receptionist-for-startups',
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
                label: 'For Startups',
                href: '/ai-receptionist-for-startups',
              },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label="Built for · Startups" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
                AI receptionist for{' '}
                <span className="text-brand-violet">startups</span>.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Look established on day one. Qualify inbound leads,
                screen vendor pitches, and route partner calls to
                founders, without the headcount or the runway to hire
                a receptionist.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="startups-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my missed-call audit <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  data-cta-location="startups-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  See startup plan
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
              eyebrow="The startup phone problem"
              title="Every inbound call matters more, but no one has time to take them"
            />
            <div className="mt-8 flex flex-col gap-5 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              <p>
                Startups deal with a particular phone problem: lower
                inbound volume than a service business, but every call
                matters more. A partnership inquiry from someone who's
                already in your TAM. A customer prospect ready to demo.
                A late-stage candidate calling about the role. An
                investor warm-intro. Each one is high-stakes, and each
                one usually goes to voicemail because the founder is in
                a customer call, the team is in a sprint review, and no
                one has time to staff the phone.
              </p>
              <p>
                The traditional answer is to skip phones entirely, use
                a Slack channel for partners, an Intercom widget for
                customers, ATS for candidates. That works for some of
                the inbound, but every business eventually has phone
                calls coming in, and the ones that come in are
                disproportionately important. The other answer is hiring
                a receptionist or office manager, usually after Series
                A, often as overhead that doesn't scale linearly with
                the actual phone load.
              </p>
              <p>
                Implenix sits between those options. The AI takes every
                inbound call, runs your defined qualification logic
                (role, deal size, decision-maker, anti-fit signals),
                routes founders only the calls that need them, and
                screens out the rest. Cost is $297-$597/month flat.
                Setup is 7-14 days, no PBX or IT involvement. For most
                pre-Series-A startups, this is the right answer until
                you're large enough that a dedicated office manager
                makes sense, at which point the AI typically stays
                deployed for volume and the human role focuses on the
                premium calls.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="What it does"
            title="The work an office manager would do, without the hire"
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
            eyebrow="The math"
            title="Startup-tier outcomes"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '7-14d', label: 'time to live with full integrations' },
                { number: '$297', label: 'flat monthly cost vs $50K+ for a hire' },
                { number: '-89%', label: 'cold-pitch calls kept off founders' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Startup questions" />
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
            <Badge label="Look established on day 1" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              Stop sending partner calls to voicemail.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. We estimate your specific missed-call
              cost and the deployment plan for an early-stage startup.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="startups-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/try-it"
              data-cta-location="startups-bottom"
              data-cta-type="secondary"
              className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Test Ron now
            </Link>
          </div>
        </div>
        <div className="max-w-content mx-auto px-6 pb-16">
          <RelatedContent
            topic="Keep reading"
            type="resource"
            links={[
              {
                href: '/ai-receptionist-for-agencies',
                label: 'AI Receptionist for Agencies',
              },
              {
                href: '/ai-receptionist-for-marketing-agencies',
                label: 'AI Receptionist for Marketing Agencies',
              },
              { href: '/pricing', label: 'AI Receptionist pricing' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
