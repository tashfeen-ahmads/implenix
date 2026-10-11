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
        {/* VERIFY THESE STATS BEFORE LAUNCH, replace with sourced data */}
        <div className="mt-16 md:mt-20">
          <DividedStats
            stats={[
              { number: '62%', label: 'of inbound calls to local businesses go unanswered' },
              { number: '78%', label: 'of leads go with the first business that calls them back' },
              { number: '$400+', label: 'average value of a single missed service call' },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
