import { SectionHeader } from '@/components/common/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Spotlight } from '@/components/motion/Spotlight';
import { TestimonialCard } from '@/components/common/TestimonialCard';

const RECORDING_HVAC =
  'https://storage.vapi.ai/019dd11a-08f4-7001-be5e-9138391c69f7-1777329860916-1f64e293-9d0f-4aa7-b388-359b12052bbd-mono.mp3';
const RECORDING_REAL_ESTATE =
  'https://storage.vapi.ai/019d5386-d076-7995-9f11-00e17cc6c065-1775222981308-169a281a-d8cf-4a47-83bb-3a398c88d1a7-mono.mp3';
const RECORDING_IMPROVEMENT =
  'https://storage.vapi.ai/019d44c4-320d-799d-9aa1-e7b20b6a25ea-1774975462085-72a7c940-a44b-4c69-819f-09d6e6d163a9-mono.mp3';

export const TESTIMONIALS = [
  {
    businessName: 'PA HVAC Experts',
    ownerName: 'Alex',
    industry: 'HVAC',
    quote:
      'The best AI employee I have ever hired. It talks to every incoming call, nurtures my leads, books appointments, and sends follow-ups to me and the customer. Thank you Implenix.',
    recordingSrc: RECORDING_HVAC,
    caseStudyHref: '/case-studies/pa-hvac-experts',
  },
  {
    businessName: 'Columbus Property',
    ownerName: 'Yessy',
    industry: 'Real Estate',
    quote:
      'We juggle deals, appointments, and follow-ups all day. Implenix books and follows up, we just close. That is the operation now.',
    recordingSrc: RECORDING_REAL_ESTATE,
    caseStudyHref: '/case-studies/columbus-property',
  },
  {
    businessName: 'GTR Improvements',
    ownerName: 'Lexi',
    industry: 'Home Improvements',
    quote:
      'Urgent calls, building team comms, scheduling assessments, quality checks across roof, kitchen, and bath, the day was gone. Implenix runs the communication now and it sounds like a full professional team.',
    recordingSrc: RECORDING_IMPROVEMENT,
    caseStudyHref: '/case-studies/gtr-improvements-lexi',
  },
  {
    businessName: 'Ohio Dental',
    ownerName: 'Hyder',
    industry: 'Dental',
    quote:
      'The team was spending 2-3 hours a day answering the phone and our in-house attention was slipping. Implenix handles the phone amazingly and the team is back focused on patients.',
    caseStudyHref: '/case-studies/ohio-dental',
  },
  {
    businessName: 'Parnell Motors',
    ownerName: 'Parnell',
    industry: 'Auto Dealer',
    quote:
      'Very good experience with Implenix. I appreciate the communication and how organized the whole deployment was.',
    caseStudyHref: '/case-studies/parnell-motors',
  },
  {
    businessName: 'Franklin Agency',
    ownerName: 'Franklin',
    industry: 'Marketing Agency',
    quote:
      'Our job is to grow our clients with more leads, but we were drowning in our own inbound. Implenix handles our inbound completely so the team stays on client work.',
    caseStudyHref: '/case-studies/franklin-agency',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-brand-dark border-t border-brand-purple/15">
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
        <SectionHeader
          title="From real businesses"
          description="Six clients, six different industries, all still deployed. The first three include the real call recording, tap play to hear the agent live."
        />
        <div className="mt-16 md:mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.businessName} index={i % 3} className="h-full">
              <Spotlight className="h-full">
                <TestimonialCard {...t} />
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
