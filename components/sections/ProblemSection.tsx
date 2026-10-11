import { SectionHeader } from '@/components/common/SectionHeader';
import { DividedStats } from '@/components/common/DividedStats';

export function ProblemSection() {
  return (
    <section className="bg-brand-dark border-t border-brand-purple/15">
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
        <SectionHeader
          eyebrow="The problem"
          title="Every missed call is a deal you already lost"
          description="Local businesses run on calls. Local businesses also miss most of them. The math is unforgiving."
        />
        <div className="mt-16 md:mt-20">
          <DividedStats
            stats={[
              { number: '62%', label: 'of calls to local businesses go unanswered (411 Locals study, 85 businesses)' },
              { number: '78%', label: 'of customers buy from the business that responds first (Lead Connect)' },
              { number: '168', label: 'hours a week your phone can ring. A front desk covers about 40' },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
