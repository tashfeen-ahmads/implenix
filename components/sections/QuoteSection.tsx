import { SectionHeader } from '@/components/common/SectionHeader';
import { QuoteBlock } from '@/components/common/QuoteBlock';

export function QuoteSection() {
  return (
    <section className="bg-black border-t border-brand-purple/15">
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-5">
          <SectionHeader
            title="What deploying Implenix actually feels like."
            compact
          />
        </div>
        <div className="lg:col-span-7">
          <QuoteBlock
            quote="The best AI employee I have ever hired. It talks to every incoming call, nurtures my leads, books appointments, and sends follow-ups to me and the customer. Thank you Implenix."
            author="Alex"
            role="PA HVAC Experts · 5 trucks, 1 front-desk operator"
          />
        </div>
      </div>
    </section>
  );
}
