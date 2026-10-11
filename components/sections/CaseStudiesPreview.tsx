import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Spotlight } from '@/components/motion/Spotlight';
import { CaseStudyCard } from '@/components/common/CaseStudyCard';

const FEATURED = [
  {
    industry: 'HVAC',
    resultHeadline: '+31% booked jobs and every call answered live',
    summary:
      'PA HVAC Experts replaced voicemail with a 24/7 AI dispatcher. Capture rate moved 58% → 97% and pipeline grew 31% in 90 days.',
    href: '/case-studies/pa-hvac-experts',
  },
  {
    industry: 'Real Estate',
    resultHeadline: '+28% deals closed with AI-run booking + follow-up',
    summary:
      'Columbus Property handed inbound qualification and follow-up to Implenix. Closers stay on closing, the AI runs everything before it.',
    href: '/case-studies/columbus-property',
  },
  {
    industry: 'Dental',
    resultHeadline: '+26% new patients and 12 hrs/week per FTE reclaimed',
    summary:
      'Ohio Dental was burning 2-3 hours per team member per day on phones. Front desk is back to in-chair patient attention.',
    href: '/case-studies/ohio-dental',
  },
];

export function CaseStudiesPreview() {
  return (
    <section className="bg-black border-t border-brand-purple/15">
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <SectionHeader
            eyebrow="Case studies"
            title="Real businesses. Real revenue captured."
            badgeVariant="purple"
          />
          <Link
            href="/case-studies"
            data-cta-location="case-studies-preview"
            className="inline-flex items-center gap-2 text-brand-cyan font-medium text-sm hover:underline"
          >
            See all case studies <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {FEATURED.map((cs, i) => (
            <Reveal key={cs.href} index={i} className="h-full min-w-0">
              <Spotlight className="h-full">
                <CaseStudyCard {...cs} />
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
