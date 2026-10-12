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
    'AI Receptionist that answers, qualifies, and books every inbound call 24/7. Custom pricing for your call flow. Live in 72 hours. Built by voice AI operators.',
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
      'Implenix is a custom build, so pricing depends on your business: call volume, integrations, and how your calls need to be handled. Book a short call with a lead specialist at /contact. They review your call flow and recommend the best solution and price for your needs. Every deployment includes 24/7 coverage, unlimited concurrent calls, two-way CRM sync, and live calendar booking, with no per-minute billing that punishes growth.',
  },
  {
    question: 'How is Implenix different from a traditional answering service?',
    answer:
      'Implenix answers within one ring, holds unlimited concurrent calls, books directly against your calendar system, and writes to your CRM in real time, all at fixed monthly cost. Traditional answering services bill per-minute (cost scales with volume), rely on human operator turnover, and typically send next-morning email summaries instead of live CRM sync. See the full side-by-side at /ai-receptionist-vs-answering-service.',
  },
  {
    question: 'How long does deployment take?',
    answer:
      'Implenix deployments go live in 72 hours from kickoff. Hours 0-24: discovery and script draft (we listen to 20-40 of your recent inbound calls to learn your vocabulary). Hours 24-48: build, plus calendar and CRM integrations. Hours 48-72: test calls, your sign-off, and go-live, followed by silent monitoring and tuning over the first weeks. Legal, healthcare, and financial deployments run on the same 72-hour timeline; your own compliance sign-off is scheduled before kickoff.',
  },
  {
    question: 'Does the AI actually replace a human receptionist?',
    answer:
      'For routine inbound, booking, rescheduling, qualification, intake, recurring service, yes, at production quality that most callers cannot distinguish from a well-trained receptionist. For calls requiring real human judgment (crisis intake, angry customer resolution, complex negotiation, bereavement, medical emergencies) the AI detects the sensitivity and transfers to a human on your team within 30 seconds. The pattern that works: AI handles the 70-90% that is repeatable, humans handle the 10-30% that needs judgment.',
  },
  {
    question: 'Is an AI receptionist worth it for a small business?',
    answer:
      'It is worth it when missed calls are costing you booked work: calls that ring out during jobs, after hours, or on weekends, where the caller dials the next business instead of leaving a voicemail. Multiply your missed calls by your average job value and close rate to see the monthly loss (the formula is in our missed-call cost guide on the blog). If you take very few calls and personally answer and close every one of them, an AI receptionist adds little and we will tell you so on the call.',
  },
  {
    question: 'Can an AI receptionist transfer calls to my team?',
    answer:
      'Yes. Implenix transfers live calls to the right person based on rules you set: by caller type, urgency, time of day, or a direct request to speak with a human. Emergencies can go to an on-call phone, VIP or existing clients to a named staff member, and anything outside the script to your front desk. When nobody is free, the caller gets a booked callback instead of voicemail, and the transcript and intake notes are already in your CRM.',
  },
  {
    question: 'What are the limitations of an AI receptionist?',
    answer:
      'An AI receptionist is built for the repeatable part of your phone line: answering, intake, booking, rescheduling, and routing. It should not give legal, medical, or financial advice, negotiate prices, or handle a genuinely upset customer on its own, so those calls are routed to a person. It also needs the right setup: if it does not learn your services, vocabulary, and transfer rules during discovery, it will sound generic. That is why every Implenix deployment starts by reviewing your recent calls.',
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
          softwareApplicationSchema(),
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
                <span className="text-white font-medium">custom pricing
                set around your call flow</span>, and handles unlimited
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
