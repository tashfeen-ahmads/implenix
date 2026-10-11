import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { CostOfNothingSection } from '@/components/sections/CostOfNothingSection';
import { LiveCallsSection } from '@/components/sections/LiveCallsSection';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { IndustriesGrid } from '@/components/sections/IndustriesGrid';
import { IntegrationStrip } from '@/components/sections/IntegrationStrip';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CaseStudiesPreview } from '@/components/sections/CaseStudiesPreview';
import { ComparisonSection } from '@/components/sections/ComparisonSection';
import { QuoteSection } from '@/components/sections/QuoteSection';
import { DemoCTASection } from '@/components/sections/DemoCTASection';
import { ROICalculator } from '@/components/common/ROICalculator';
import { StickyDemoCTA } from '@/components/common/StickyDemoCTA';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AIReceptionistFlow } from '@/components/common/AIReceptionistFlow';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import {
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  faqSchema,
  serviceSchema,
  speakableSchema,
} from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI Receptionist for Local Business | Implenix',
  description:
    'AI Receptionist that answers, qualifies, and books every inbound call 24/7. Fixed monthly pricing. Deployed in 7-14 days. Built by voice AI operators.',
  path: '/',
  author: 'Tashfeen Ahmad',
});

const HOME_FAQS = [
  {
    question: 'What is an AI receptionist?',
    answer:
      'An AI receptionist is a voice AI that answers your business phone within one ring, 24/7, holds a natural conversation with the caller, qualifies the lead against your intake criteria, books appointments live against your calendar system (Google, Outlook, Boulevard, ServiceTitan, Clio, etc.), and writes every call to your CRM in real time. Implenix is a production AI receptionist deployed for HVAC, dental, legal, real estate, medspa, home improvement, and 20+ other industries.',
  },
  {
    question: 'How much does an AI receptionist cost?',
    answer:
      'Implenix AI Receptionist pricing starts at $297/month for single-location businesses handling 100-500 calls/month, $497/month for growing multi-line operations, and $697-$1,497/month for multi-location deployments. All tiers include 24/7 coverage, unlimited concurrent calls, two-way CRM sync, and live calendar booking at fixed monthly cost, no per-minute billing that punishes growth.',
  },
  {
    question: 'How is Implenix different from a traditional answering service?',
    answer:
      'Implenix answers within one ring, holds unlimited concurrent calls, books directly against your calendar system, and writes to your CRM in real time, all at fixed monthly cost. Traditional answering services bill per-minute (cost scales with volume), rely on human operator turnover, and typically send next-morning email summaries instead of live CRM sync. See the full side-by-side at /ai-receptionist-vs-answering-service.',
  },
  {
    question: 'How long does deployment take?',
    answer:
      'Most Implenix deployments ship in 7-14 business days: 1-2 days discovery (we listen to 20-40 of your recent inbound calls to learn your vocabulary), 3-7 days script build and integration wiring, 3-5 days parallel testing against a shadow number, then cutover with 48-hour silent monitor. Legal, healthcare, and financial deployments run 14-28 days because of compliance review cycles.',
  },
  {
    question: 'Does the AI actually replace a human receptionist?',
    answer:
      'For routine inbound, booking, rescheduling, qualification, intake, recurring service, yes, at production quality that most callers cannot distinguish from a well-trained receptionist. For calls requiring real human judgment (crisis intake, angry customer resolution, complex negotiation, bereavement, medical emergencies) the AI detects the sensitivity and transfers to a human on your team within 30 seconds. The pattern that works: AI handles the 70-90% that is repeatable, humans handle the 10-30% that needs judgment.',
  },
  {
    question: 'Will my customers know it is AI?',
    answer:
      'Some will, some will not. In deployments we measure, roughly 20-30% of callers realize they are speaking to an AI at some point in the call. Rather than hiding it, Implenix identifies itself clearly on the greeting ("virtual assistant for [your business]"), hidden AI erodes trust when discovered, and clear disclosure improves caller acceptance. Voice quality in 2026 is natural enough that identification is inconsistent even with disclosure.',
  },
  {
    question: 'Which industries do you support?',
    answer:
      'Implenix ships tuned playbooks for 25 industries: HVAC, dental, real estate, law firms, plumbers, med spas, auto repair, roofers, medical practices, electricians, contractors, salons, accountants, marketing agencies, cleaning services, mortgage brokers, insurance agents, veterinarians, chiropractors, therapists, spas, landscapers, pest control, moving companies, and personal trainers.',
  },
  {
    question: 'What is the compliance posture for regulated industries?',
    answer:
      'Healthcare deployments run under HIPAA with signed BAAs across the vendor stack, access-controlled transcript storage, and minimum-necessary intake, the agent does not diagnose or handle clinical decisions. Legal deployments include conflict-check webhook integration and a "hard stop" list (no legal advice, no fee quotes, no case-strength opinions). Financial services deployments enforce licensing-state gates and prohibit rate quotes over the phone. Every deployment includes recording notification in the greeting.',
  },
];

export default function HomePage() {
  return (
    <>
      <SchemaOrg
        schema={[
          organizationSchema(),
          websiteSchema(),
          softwareApplicationSchema({ ratingValue: 5, ratingCount: 6 }),
          serviceSchema({
            name: 'AI Receptionist',
            description:
              'AI Receptionist for local business, answers, qualifies, and books every inbound call 24/7 at fixed monthly cost.',
            serviceType: 'AI Receptionist',
            url: '/',
          }),
          faqSchema(HOME_FAQS),
          speakableSchema(),
        ]}
      />
      <Hero />

      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
          <div className="grid lg:grid-cols-12 gap-14 lg:gap-16 items-center">
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <h2
                data-answer
                data-speakable
                className="font-heading text-4xl md:text-5xl text-white leading-[1.05] tracking-tight"
              >
                What is an AI receptionist?
              </h2>
              <p
                data-answer
                data-speakable
                className="font-body text-white/80 leading-relaxed text-lg md:text-xl"
              >
                A voice AI that answers your business phone{' '}
                <span className="text-brand-cyan">within one ring</span>,{' '}
                24/7, holds a natural conversation, qualifies the caller
                against your intake criteria, books appointments{' '}
                <span className="text-brand-cyan">live against your
                calendar</span>, and writes every call to your CRM before
                the caller hangs up.
              </p>
              <p className="font-body text-white/60 leading-relaxed text-base">
                Implenix replaces voicemail and per-minute answering
                services with{' '}
                <span className="text-white font-medium">fixed monthly
                pricing, $297-$697/month</span>, and handles unlimited
                concurrent calls.
              </p>
            </div>
            <div className="lg:col-span-7">
              <AIReceptionistFlow />
            </div>
          </div>
        </div>
      </section>

      <CostOfNothingSection />
      <LiveCallsSection />
      <HowItWorks />
      <ComparisonSection />
      <IndustriesGrid />
      <IntegrationStrip />
      <QuoteSection />
      <TestimonialsSection />
      <CaseStudiesPreview />
      <section className="bg-brand-dark border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
          <SectionHeader
            title="Calculate what missed calls are costing you"
            description="Plug in your numbers. See the monthly cost. Talk to the team about a real deployment."
            badgeVariant="purple"
          />
          <div className="mt-16 md:mt-20">
            <ROICalculator />
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
          <SectionHeader
            title="Questions owners ask first"
            description="Straight answers before you book a call."
          />
          <div className="mt-16 md:mt-20 max-w-4xl border-t border-white/10">
            {HOME_FAQS.map((f) => (
              <details
                key={f.question}
                className="group border-b border-white/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 md:py-8 [&::-webkit-details-marker]:hidden">
                  <span
                    className="font-heading text-white text-xl md:text-2xl leading-snug faq-question"
                    data-speakable
                  >
                    {f.question}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 w-9 h-9 flex items-center justify-center border border-white/20 text-brand-cyan text-xl transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p
                  className="pb-8 -mt-1 font-body text-base md:text-lg text-white/70 leading-relaxed max-w-[65ch] faq-answer"
                  data-speakable
                >
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <DemoCTASection />
      <StickyDemoCTA />
    </>
  );
}
