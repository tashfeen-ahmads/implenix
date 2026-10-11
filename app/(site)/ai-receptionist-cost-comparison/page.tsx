import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Check } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ComparisonTable } from '@/components/common/ComparisonTable';
import { DividedStats } from '@/components/common/DividedStats';
import { RelatedContent } from '@/components/common/RelatedContent';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { faqSchema, articleSchema, serviceSchema } from '@/lib/schema';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist Cost Comparison (2026) | Implenix',
  description:
    'AI receptionist cost vs in-house hire, live answering service, IVR, and voicemail. Real annualized math, hidden costs surfaced, and the break-even point.',
  path: '/ai-receptionist-cost-comparison',
});

const FAQS = [
  {
    question: 'How much does an AI receptionist cost?',
    answer:
      'Implenix is a custom build, so pricing depends on your business. Book a short call with a lead specialist at /contact; they review your call flow and recommend the best solution and price for your needs. There is no per-minute billing, and implementation includes script tuning, voice selection, integrations, and a deployment engineer.',
  },
  {
    question: 'Why is the AI fixed-cost when other options bill per minute?',
    answer:
      'Concurrency is unbounded, one virtual agent can handle a hundred calls at once at the same compute cost as one. Live human services bill per minute or per call because human labor scales linearly with usage.',
  },
  {
    question: 'What is the real cost of voicemail?',
    answer:
      'Voicemail looks free but typically costs local-services SMBs $5,000-$30,000/month in lost pipeline. ~75% of callers do not leave a message. Of the 25% who do, conversion drops sharply with response delay.',
  },
  {
    question: 'Is hiring a part-time receptionist cheaper than the AI?',
    answer:
      'Only on the headline number, and only barely. A part-time hire runs $1,800-$2,400/month for 20 hours of coverage. The AI covers all 168 hours a week with unlimited concurrent calls, so per hour of coverage it costs a fraction of the hire.',
  },
  {
    question: 'What hidden costs should I factor in for a human hire?',
    answer:
      'Payroll taxes and benefits ($8K-$14K/year), recruiting and training ($3K-$6K), phone system and software ($1.2K-$3K), sick days and turnover risk ($2K-$5K). Add 30-40% to base salary for the fully loaded number.',
  },
  {
    question: 'When does the AI receptionist pay for itself?',
    answer:
      'For most local businesses, inside the first 30 days. The break-even is typically at $1,500/month of recovered missed-call pipeline. Most SMBs recover several times that.',
  },
  {
    question: 'Are there hidden costs in the AI option?',
    answer:
      'No. Your price is set up front on a short call with a lead specialist, based on your call flow: no per-minute charges, no after-hours upcharges, no overage fees. Anything optional, such as custom voice cloning, is scoped and quoted before you commit.',
  },
];

const COSTS = [
  {
    label: 'Voicemail',
    monthly: '$0',
    annual: '$0',
    hiddenCost: '$60K-$360K/yr lost pipeline',
    coverage: '24/7 (silent)',
    realRanking: 'Most expensive option',
  },
  {
    label: 'IVR / phone tree',
    monthly: '$30-$200',
    annual: '$360-$2,400',
    hiddenCost: '40-60% caller hangup rate',
    coverage: '24/7 routing only',
    realRanking: 'Cheap, hated by customers',
  },
  {
    label: 'Live answering service',
    monthly: '$300-$1,500',
    annual: '$3,600-$18,000',
    hiddenCost: 'Per-minute scales with volume',
    coverage: 'Business hours, premium for after',
    realRanking: 'Mid-range, usage-bound',
  },
  {
    label: 'Implenix · AI Receptionist',
    monthly: 'Custom quote',
    annual: 'Custom quote',
    hiddenCost: 'None, no per-minute billing',
    coverage: '24/7 unlimited concurrent',
    realRanking: 'Best per-hour cost',
    highlight: true,
  },
  {
    label: 'Part-time receptionist',
    monthly: '$1,800-$2,400',
    annual: '$21,600-$28,800',
    hiddenCost: 'Benefits + HR + 20hr cap',
    coverage: '20 hours/week, no after-hours',
    realRanking: 'Premium for limited coverage',
  },
  {
    label: 'Full-time receptionist',
    monthly: '$3,500-$5,000',
    annual: '$50,200-$82,000 fully loaded',
    hiddenCost: 'Benefits, training, turnover',
    coverage: '40 hours/week, no concurrent',
    realRanking: 'Best for premium-brand only',
  },
  {
    label: 'Outsourced call center',
    monthly: '$1,500-$5,000',
    annual: '$18,000-$60,000',
    hiddenCost: 'Operator turnover, training drift',
    coverage: 'Configurable, premium for 24/7',
    realRanking: 'Heavy, for complex sales ops',
  },
];

export default function AIReceptionistCostComparisonPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          articleSchema({
            title: 'AI Receptionist Cost Comparison',
            description:
              'Annualized cost comparison: AI receptionist vs in-house hire, answering service, IVR, voicemail, call center.',
            url: '/ai-receptionist-cost-comparison',
            datePublished: new Date().toISOString().slice(0, 10),
            author: SITE_NAME,
          }),
          faqSchema(FAQS),
          serviceSchema({
            name: 'AI Receptionist',
            description:
              'AI receptionist priced at fixed monthly cost regardless of call volume.',
            serviceType: 'AI Receptionist',
            url: '/ai-receptionist-cost-comparison',
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
                label: 'Cost Comparison',
                href: '/ai-receptionist-cost-comparison',
              },
            ]}
            className="mb-8"
          />
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Badge label="Guide · Cost comparison" variant="cyan" />
              <h1 className="font-heading text-4xl md:text-6xl leading-[1.04]">
                AI receptionist{' '}
                <span className="text-brand-violet">cost comparison</span>{' '}
every option, real numbers.
              </h1>
              <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
                Voicemail looks free. Hiring looks expensive. Live services
                look manageable. The honest annualized math tells a
                different story, including the hidden costs each option
                hides on the P&L.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  data-cta-location="cost-hero"
                  data-cta-type="primary"
                  className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Run my cost audit <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  data-cta-location="cost-hero"
                  data-cta-type="secondary"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
                >
                  See Implenix pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="The framing"
            title="The cheapest option on paper is rarely the cheapest in practice"
          />
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <div className="border-l-[3px] border-brand-purple bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet">
                ▸ Hidden cost 1
              </span>
              <p className="font-heading text-4xl md:text-5xl text-brand-violet leading-none">
                $5-30k
              </p>
              <p className="font-body text-sm text-white/80 leading-tight">
                Lost pipeline per month
              </p>
              <p className="font-body text-xs text-white/60 leading-relaxed">
                Voicemail is "free" until you count the pipeline it
                leaks. Roughly 75% of callers hang up without leaving a
                message and call the next business on Google.
              </p>
            </div>
            <div className="border-l-[3px] border-brand-purple bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet">
                ▸ Hidden cost 2
              </span>
              <p className="font-heading text-4xl md:text-5xl text-brand-violet leading-none">
                148 hrs
              </p>
              <p className="font-body text-sm text-white/80 leading-tight">
                Uncovered per week
              </p>
              <p className="font-body text-xs text-white/60 leading-relaxed">
                Part-time hire = 20 hrs of coverage. That leaves 148
                hrs/week with the phone answered by voicemail, an
                after-hours service, or nobody.
              </p>
            </div>
            <div className="border-l-[3px] border-brand-purple bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet">
                ▸ Hidden cost 3
              </span>
              <p className="font-heading text-4xl md:text-5xl text-brand-violet leading-none">
                +$1,500
              </p>
              <p className="font-body text-sm text-white/80 leading-tight">
                Per-minute creep
              </p>
              <p className="font-body text-xs text-white/60 leading-relaxed">
                Live answering service "manageable", until volume
                scales and per-minute billing crosses $1,500/month with
                the same call volume you started at.
              </p>
            </div>
          </div>
          <div className="mt-10 max-w-3xl border-l-[3px] border-brand-cyan bg-black p-6">
            <p className="font-body text-white/85 text-base lg:text-lg leading-relaxed">
              The honest comparison runs on{' '}
              <span className="text-brand-cyan">three dimensions</span>:
              explicit subscription/labor cost, the hidden cost each
              option creates (lost pipeline, hangup rate, turnover, HR
              overhead), and the coverage actually delivered for that
              cost. The table below ranks every common option on all
              three. The verdict is consistent:{' '}
              <span className="text-white font-medium">AI receptionist
              delivers the best per-hour cost, the lowest hidden cost,
              and the highest coverage</span> for most businesses.
              Voicemail and full-time hires are usually the most
              expensive once you count what they actually cost.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The full table"
            title="Annualized cost across every option"
            description="Range columns reflect typical SMB volume and US-market pricing. Hidden cost is the line that does not appear on the invoice."
            badgeVariant="purple"
          />
          <div
            tabIndex={0}
            role="region"
            aria-label="Cost comparison table"
            className="mt-12 overflow-x-auto border border-brand-purple/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
          >
            <table className="w-full font-body text-sm min-w-[860px]">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b border-brand-purple/20 bg-black font-mono text-xs uppercase tracking-widest text-white/55">
                    Option
                  </th>
                  <th className="text-left p-4 border-b border-brand-purple/20 bg-black font-mono text-xs uppercase tracking-widest text-white/55">
                    Monthly
                  </th>
                  <th className="text-left p-4 border-b border-brand-purple/20 bg-black font-mono text-xs uppercase tracking-widest text-white/55">
                    Annualized
                  </th>
                  <th className="text-left p-4 border-b border-brand-purple/20 bg-black font-mono text-xs uppercase tracking-widest text-white/55">
                    Hidden cost
                  </th>
                  <th className="text-left p-4 border-b border-brand-purple/20 bg-black font-mono text-xs uppercase tracking-widest text-white/55">
                    Coverage
                  </th>
                </tr>
              </thead>
              <tbody>
                {COSTS.map((row) => (
                  <tr
                    key={row.label}
                    className={`border-b border-brand-purple/15 last:border-b-0 ${
                      row.highlight ? 'bg-brand-dark/40' : ''
                    }`}
                  >
                    <td
                      className={`p-4 font-medium ${
                        row.highlight
                          ? 'text-brand-cyan border-l-[3px] border-l-brand-cyan'
                          : 'text-white'
                      }`}
                    >
                      {row.label}
                    </td>
                    <td className="p-4 text-white/85 font-mono">{row.monthly}</td>
                    <td className="p-4 text-white/85 font-mono">{row.annual}</td>
                    <td className="p-4 text-white/65 text-xs">{row.hiddenCost}</td>
                    <td className="p-4 text-white/65 text-xs">{row.coverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-xs font-mono uppercase tracking-widest text-white/55">
            ▸ Hidden-cost column is what does not appear on the invoice
          </p>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="The real ranking"
            title="What this looks like once you sort by total cost"
            description="Total cost = explicit cost + hidden cost. The order changes."
          />
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <div className="border border-brand-cyan/30 bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
                <Check size={11} aria-hidden /> Best value
              </span>
              <ul className="flex flex-col gap-2.5 mt-2">
                {[
                  'Implenix AI Receptionist, best per-hour cost, no hidden cost',
                  'Outsourced call center, for businesses with complex sales ops only',
                  'Part-time hire, only if call volume is genuinely low',
                ].map((line, i) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 font-body text-sm text-white/85"
                  >
                    <span className="font-heading text-brand-cyan w-5 shrink-0">
                      {i + 1}.
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-brand-purple/30 bg-black p-6 flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-violet flex items-center gap-1.5">
                <AlertTriangle size={11} aria-hidden /> Most expensive in practice
              </span>
              <ul className="flex flex-col gap-2.5 mt-2">
                {[
                  'Voicemail, silently $5K-$30K/month in lost pipeline',
                  'Full-time receptionist, $50K-$82K/year, 40-hour ceiling',
                  'IVR-only, cheap on invoice, 40-60% hangup rate',
                ].map((line, i) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 font-body text-sm text-white/85"
                  >
                    <span className="font-heading text-brand-violet w-5 shrink-0">
                      {i + 1}.
                    </span>
                    {line}
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
            eyebrow="vs the 3 most-compared options"
            title="AI Receptionist vs the closest alternatives"
            badgeVariant="purple"
          />
          <div className="mt-12">
            <ComparisonTable
              highlightColumn={0}
              columns={['Implenix AI', 'Full-time hire', 'Live answering', 'Voicemail']}
              rows={[
                {
                  label: 'Annualized cost',
                  cells: ['Custom quote', '$50,200-$82,000', '$3,600-$18,000', '$0 (lost pipeline)'],
                },
                { label: 'Hours of coverage / week', cells: ['168', '40', '40+ (premium for 24/7)', '168 silent'] },
                { label: 'Concurrent calls', cells: ['unlimited', '1', 'staff-bound', 'n/a'] },
                { label: 'Books to your calendar live', cells: [true, true, 'partial', false] },
                { label: 'Two-way CRM sync', cells: [true, 'partial', 'partial', false] },
                { label: 'Pricing model', cells: ['custom, no per-minute', 'salary + benefits', 'per-minute', 'free'] },
                { label: 'Cost grows with volume', cells: [false, true, true, false] },
              ]}
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ai-receptionist-vs-human-receptionist"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              Deep-dive: vs Human Receptionist <ArrowRight size={14} aria-hidden />
            </Link>
            <Link
              href="/ai-receptionist-vs-answering-service"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              vs Answering Service <ArrowRight size={14} aria-hidden />
            </Link>
            <Link
              href="/ai-receptionist-vs-voicemail"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
            >
              vs Voicemail <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader
            eyebrow="Outcomes"
            title="What the numbers compound to"
          />
          <div className="mt-12">
            <DividedStats
              stats={[
                { number: '$50K+', label: 'fully loaded annual cost of a full-time hire' },
                { number: '<30 d', label: 'typical break-even on recovered pipeline' },
                { number: '$0/min', label: 'per-minute billing as call volume grows' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-24">
          <SectionHeader eyebrow="FAQ" title="Common cost questions" />
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
            <Badge label="Run your real numbers" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl mt-5 leading-[1.05]">
              The math is consistent. The magnitude is yours.
            </h2>
            <p className="mt-4 font-body text-white/75 max-w-xl">
              60-second audit. Industry-grade estimate of your missed-call
              cost, recoverable pipeline, and total cost of every phone
              option for your business.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link
              href="/audit"
              data-cta-location="cost-bottom"
              data-cta-type="primary"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/pricing"
              data-cta-location="cost-bottom"
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
              { href: '/benefits-of-ai-receptionist', label: 'Benefits of an AI receptionist' },
              {
                href: '/ai-receptionist-vs-human-receptionist',
                label: 'AI Receptionist vs Human Receptionist',
              },
              {
                href: '/ai-phone-answering-service',
                label: 'AI Phone Answering Service',
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
