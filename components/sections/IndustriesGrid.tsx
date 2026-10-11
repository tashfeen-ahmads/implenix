import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/common/SectionHeader';
import { IndustrySlider } from '@/components/common/IndustrySlider';

// Renamed conceptually to "industries section", uses the slider now
// instead of a 4-col grid. Keeps the export name so existing imports
// continue to work.
export function IndustriesGrid() {
  return (
    <section className="bg-brand-dark border-t border-brand-purple/15">
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <SectionHeader
            eyebrow="Built for"
            title="The businesses that run on calls"
            description="Each Implenix deployment ships with an industry-specific call script, intake logic, and CRM mapping. 25 industries with shipped playbooks."
            badgeVariant="purple"
          />
          <Link
            href="/industries"
            data-cta-location="industries-section"
            className="inline-flex items-center gap-2 text-brand-cyan font-medium text-sm hover:underline shrink-0"
          >
            See all industries <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        <div className="mt-16 md:mt-20">
          <IndustrySlider />
        </div>
      </div>
    </section>
  );
}
