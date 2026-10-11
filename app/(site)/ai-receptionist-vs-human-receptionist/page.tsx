import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  X,
  Clock,
  DollarSign,
  Users,
  Heart,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ComparisonTable } from '@/components/common/ComparisonTable';
import { DividedStats } from '@/components/common/DividedStats';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  faqSchema,
  articleSchema,
  serviceSchema,
} from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist vs Human Receptionist | Cost Math | Implenix',
  description:
    'AI receptionist vs human receptionist: real cost math, coverage, concurrency, and quality. The hybrid pattern most businesses end up running.',
  path: '/ai-receptionist-vs-human-receptionist',
});

const FAQS = [
  {
    question: 'Is an AI receptionist actually cheaper than hiring?',
    answer:
      'Yes, on cash cost and substantially. A full-time receptionist runs $3,500-$5,000/month for 40 hours of coverage plus benefits and HR overhead. Implenix is $297-$997/month for 24/7 unlimited concurrency. The annualized difference is typically $40,000-$60,000.',
  },
  {
    question: 'Can an AI replace a real human at the front desk?',
    answer:
      'For routine calls, booking, qualification, intake, recurring requests, yes. For nuanced emotional calls or premium-brand human-warmth requirements, a human still has an edge. Most businesses run a hybrid: AI handles 80-90% of inbound, a smaller in-house role handles the rest.',
  },
  {
    question: 'What about the human element, does it matter?',
    answer:
      "It matters in specific contexts. If your competitive positioning depends on a human voice answering, keep one. If your customers care that the call gets answered fast and the booking gets made, the AI wins on every measurable dimension and the human element doesn't move the needle.",
  },
  {
    question: 'How does the AI handle nights, weekends, and holidays?',
    answer:
      'Continuously, at the same fixed monthly cost. A human receptionist works 40 hours and takes time off. The AI covers 168 hours per week with no sick days, vacation, or turnover.',
  },
  {
    question: 'What happens when the AI hits a call it cannot handle?',
    answer:
      'Live transfer rules route the call to a human in real time, you, your team, or a backup human service. We define the transfer triggers during onboarding (urgent keywords, frustration detection, VIP allow-list).',
  },
  {
    question: 'Can I run both, AI for volume and a part-time human for premium calls?',
    answer:
      'Yes. This is the most common pattern. The AI takes 80-90% of inbound at fixed cost; a smaller part-time role handles the calls flagged for human attention. Net cost still drops dramatically vs full-time hire.',
  },
  {
    question: 'How long does an AI take to deploy vs hiring a human?',
    answer:
      'AI deployment runs 7-14 business days end-to-end. Hiring a receptionist runs 2-6 weeks plus 4-8 weeks of training. The AI is faster to live and stays consistent, no ramp.',
  },
  {
    question: 'Will my callers know the difference?',
    answer:
      'For routine calls, most callers do not notice. The voice is tuned for warmth and natural pacing. Where genuine human warmth is the explicit value of the call, the AI transfers to your team in real time.',
  },
];

const ANNUAL_COSTS = [
  {
    label: 'Salary',
    ai: ', ',
    human: '$36,000 - $54,000',
  },
  {
    label: 'Payroll taxes + benefits',
    ai: ', ',
    human: '$8,000 - $14,000',
  },
  {
    label: 'Recruiting & training',
    ai: ', ',
    human: '$3,000 - $6,000',
  },
  {
    label: 'Phone system + tools',
    ai: 'included',
    human: '$1,200 - $3,000',
  },
  {
    label: 'Sick days / turnover risk',
    ai: 'none',
    human: '$2,000 - $5,000',
  },
  {
    label: 'Implenix subscription',
    ai: '$3,564 - $11,964',
    human: ', ',
  },
];

export default function AIReceptionistVsHumanReceptionistPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: 'AI Receptionist vs Human Receptionist',
            description:
              'AI receptionist vs human receptionist: real cost math, coverage, concurrency, quality, and the hybrid pattern most businesses run.',
            url: '/ai-receptionist-vs-human-receptionist',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist',
            description:
              'AI receptionist as an alternative to hiring a human receptionist, 24/7, fixed cost, no HR overhead.',
            serviceType: 'AI Receptionist',
            url: '/ai-receptionist-vs-human-receptionist',
          }),
        ]}
      />

      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-20 pb-20 md:pt-24 md:pb-24">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Compare', href: '/ai-receptionist-vs-answering-service' },
              {
                label: 'vs Human Receptionist',
                href: '/ai-receptionist-vs-human-receptionist',
              },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Badge label="Comparison · vs Human Receptionist" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
                AI Receptionist <span className="text-white/55">vs</span>{' '}
                <span className="text-brand-violet">Human Receptionist</span>
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Real cost math, real coverage tradeoffs, and the hybrid
                pattern most businesses end up running. The AI replaces 80-90%
                of routine front-desk work for under 10% of the cost.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="vs-human-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Get my free missed-call audit <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  data-cta-location="vs-human-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  See pricing
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="border border-brand-cyan/30 bg-black p-8">
                <span className="text-xs uppercase tracking-widest text-white/55 font-mono">
                  ▸ Annualized
                </span>
                <p className="font-heading text-5xl md:text-6xl text-brand-cyan mt-3 leading-none">
                  $40K+
                </p>
                <p className="mt-3 font-body text-white/80 max-w-xs">
                  typical annual cost difference between hiring a full-time
                  receptionist and deploying Implenix.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <SectionHeader
              eyebrow="The decision"
              title="When to hire a human, when to deploy the AI, when to run both"
            />
            <div className="mt-8 flex flex-col gap-5 font-body text-white/80 text-base lg:text-lg leading-relaxed">
              <p>
                Hiring a receptionist is the default move for any business
                that has outgrown answering its own phones. It works, within
                tight constraints. A full-time receptionist covers 40 hours
                a week at $3,500-$5,000/month plus benefits and HR overhead.
                They take vacation, get sick, eventually leave. Concurrent
                calls hit voicemail because one person can answer one phone.
                Everything outside business hours is uncovered unless you
                pay for a second shift or an answering service. For most
                businesses, this math is uncomfortable from day one.
              </p>
              <p>
                An AI receptionist replaces the routine majority of front-desk
                work, booking, qualification, intake, recurring customer
                requests, after-hours coverage, concurrent peaks, at a fixed
                monthly cost typically below 10% of a full-time hire. There
                are no sick days, no turnover, no HR overhead, and no
                concurrent-call ceiling. Coverage is 24/7. Where the AI does
                not match a human is in the genuinely nuanced calls: a long-
                term VIP client in distress, a high-touch sales conversation
                where warmth is the product, a sensitive intake that needs
                human judgment. For those calls the AI transfers to a human
                in real time.
              </p>
              <p>
                The honest answer for most businesses is a hybrid. The AI
                handles 80-90% of inbound at fixed cost. A smaller human role
part-time, in-house, or on a small live answering service
                block, handles the calls our routing rules flag for human
                attention. Net cost vs a full-time hire still drops 60-80%,
                and quality goes up because the human now spends their hours
                on the calls that actually need them, not on confirming
                tomorrow's appointment for the third time today.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The cost math"
            title="Real annual cost, Implenix vs full-time hire"
            description="Conservative US-market figures for a single front-desk role. Numbers vary by region and seniority but the gap is consistent."
            badgeVariant="purple"
          />
          <div
            tabIndex={0}
            role="region"
            aria-label="Cost comparison table"
            className="mt-12 overflow-x-auto border border-brand-purple/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
          >
            <table className="w-full font-body text-sm min-w-[640px]">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b border-brand-purple/20 bg-black font-mono text-xs uppercase tracking-widest text-white/55">
                    Annual cost component
                  </th>
                  <th className="text-left p-4 border-b border-brand-purple/20 bg-black font-heading text-base text-brand-cyan border-x border-x-brand-cyan/40">
                    Implenix · AI Receptionist
                  </th>
                  <th className="text-left p-4 border-b border-brand-purple/20 bg-black font-heading text-base text-white/85">
                    Full-Time Human Receptionist
                  </th>
                </tr>
              </thead>
              <tbody>
                {ANNUAL_COSTS.map((row, i) => (
                  <tr
                    key={row.label}
                    className="border-b border-brand-purple/15 last:border-b-0"
                  >
                    <td className="p-4 text-white font-medium">{row.label}</td>
                    <td
                      className={`p-4 align-top text-white/85 border-x border-x-brand-cyan/40 ${
                        i === ANNUAL_COSTS.length - 1
                          ? 'border-b border-b-brand-cyan/40'
                          : ''
                      }`}
                    >
                      {row.ai}
                    </td>
                    <td className="p-4 align-top text-white/85">{row.human}</td>
                  </tr>
                ))}
                <tr className="bg-black">
                  <td className="p-4 font-heading text-white">Annual total</td>
                  <td className="p-4 font-heading text-2xl text-brand-cyan border-x border-x-brand-cyan/40 border-b border-b-brand-cyan/40">
                    $3,564 - $11,964
                  </td>
                  <td className="p-4 font-heading text-2xl text-white/85">
                    $50,200 - $82,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-xs font-mono uppercase tracking-widest text-white/55">
            ▸ Difference compounds further at multi-location operations
          </p>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="At a glance"
            title="AI Receptionist vs Human Receptionist: Key Differences"
            description="The dimensions that drive a real buying decision, beyond just cost."
          />
          <div className="mt-12">
            <ComparisonTable
              highlightColumn={0}
              columns={['Implenix · AI', 'Full-time hire']}
              rows={[
                { label: 'Hours of coverage / week', cells: ['168', '40'] },
                { label: 'Concurrent calls', cells: ['unlimited', '1'] },
                { label: 'Sick days / vacation', cells: ['none', 'standard'] },
                { label: 'Turnover risk', cells: ['none', 'high'] },
                { label: 'Live calendar booking', cells: [true, true] },
                { label: 'Two-way CRM sync', cells: [true, 'partial'] },
                { label: 'Industry-specific script', cells: [true, 'partial'] },
                { label: 'Time to live', cells: ['7-14 days', '6-14 weeks'] },
                {
                  label: 'Monthly cost',
                  cells: ['$297 - $997', '$3,500 - $5,000'],
                },
                {
                  label: 'Best for',
                  cells: [
                    'volume + after-hours',
                    'high-touch brand work',
                  ],
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Honest read"
            title="Where each option still wins"
            description="Not a sales pitch. The cases for each are real."
            badgeVariant="purple"
          />
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <div className="border border-brand-cyan/30 bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
                <Check size={11} aria-hidden /> When AI wins
              </span>
              <ul className="flex flex-col gap-2.5 mt-2">
                {[
                  '24/7 coverage including nights and weekends, no premium',
                  'Concurrent peaks, surge volume handled without staffing',
                  'Routine booking, qualification, and intake at fixed cost',
                  'Industries with industry-specific intake (HVAC, dental, law)',
                  'Multi-location operations where consistency matters',
                  'After-hours emergency dispatch with live triage rules',
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 font-body text-sm text-white/85"
                  >
                    <Check size={14} className="text-brand-cyan mt-0.5 shrink-0" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-brand-purple/30 bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet flex items-center gap-1.5">
                <Heart size={11} aria-hidden /> When a human still wins
              </span>
              <ul className="flex flex-col gap-2.5 mt-2">
                {[
                  'Premium-brand businesses where the receptionist is the brand',
                  'High-touch consultative work where warmth is the value',
                  'Sensitive intake (crisis lines, certain medical, certain legal)',
                  'Businesses too low-volume for AI deployment to make sense',
                  'Calls that need real-time judgment beyond defined rules',
                  'Long-term VIP clients who expect a familiar human voice',
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 font-body text-sm text-white/85"
                  >
                    <Heart size={14} className="text-brand-violet mt-0.5 shrink-0" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The hybrid pattern"
            title="What most growing businesses end up running"
            description="80% of inbound goes to the AI at fixed cost. The remaining 20%, the calls that actually need human attention, go to your in-house team or a small live block."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <HybridCard
              Icon={DollarSign}
              title="80% volume on the AI"
              description="Booking, qualification, intake, recurring customer questions, after-hours, concurrent peaks. Fixed cost, no overtime, no turnover."
            />
            <HybridCard
              Icon={Users}
              title="20% to a smaller human role"
              description="Premium-brand calls, sensitive intake, complex sales, long-term VIP relationships, flagged by transfer rules and routed live."
            />
            <HybridCard
              Icon={Clock}
              title="60-80% net cost reduction"
              description="vs a full-time receptionist, with quality up because the human now spends time on the calls that actually need them."
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Outcomes"
            title="What deployments tend to deliver vs the human-only baseline"
            badgeVariant="purple"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '4.2x', label: 'coverage hours / week vs a full-time hire' },
                { number: '60-80%', label: 'cost reduction in hybrid deployments' },
                { number: '0', label: 'sick days, vacation requests, or turnover' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Frequently asked" />
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
            <Badge label="Run the math on your business" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              See your real numbers before you hire, or before you don't.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. We estimate the missed-call cost for your
              business and show what an AI deployment would recover. Use it
              as the data point for your hiring decision.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="vs-human-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="vs-human-bottom"
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
                href: '/ai-receptionist-vs-answering-service',
                label: 'AI Receptionist vs Answering Service',
              },
              {
                href: '/ai-receptionist-for-small-business',
                label: 'AI Receptionist for Small Business',
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}

function HybridCard({
  Icon,
  title,
  description,
}: {
  Icon: typeof DollarSign;
  title: string;
  description: string;
}) {
  return (
    <article className="bg-black border border-brand-purple/20 p-6 flex flex-col gap-3">
      <span className="w-9 h-9 border border-brand-cyan/30 bg-brand-dark flex items-center justify-center">
        <Icon size={16} className="text-brand-cyan" aria-hidden />
      </span>
      <h3 className="font-heading text-lg text-white">{title}</h3>
      <p className="font-body text-sm text-white/75 leading-relaxed">
        {description}
      </p>
    </article>
  );
}
