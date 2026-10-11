import { SectionHeader } from '@/components/common/SectionHeader';
import { ComparisonTable } from '@/components/common/ComparisonTable';

export function ComparisonSection() {
  return (
    <section className="bg-brand-dark border-t border-brand-purple/15">
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40">
        <SectionHeader
          title="Implenix vs the alternatives"
          description="Voicemail loses leads. Hiring a receptionist is expensive and only covers business hours. Generic chatbots cannot pick up a phone."
        />
        <div className="mt-16 md:mt-20">
          <ComparisonTable
            highlightColumn={0}
            columns={['Implenix', 'Voicemail', 'Hired Receptionist', 'Generic IVR']}
            rows={[
              {
                label: '24/7 inbound coverage',
                cells: [true, false, false, true],
              },
              {
                label: 'Books to your calendar live',
                cells: [true, false, true, false],
              },
              {
                label: 'Two-way CRM sync',
                cells: [true, false, 'partial', false],
              },
              {
                label: 'Industry-specific call script',
                cells: [true, false, 'partial', false],
              },
              {
                label: 'Live transfer to a human',
                cells: [true, false, true, true],
              },
              {
                label: 'Recordings + transcripts',
                cells: [true, 'partial', false, 'partial'],
              },
              {
                label: 'Time to deploy',
                cells: ['7-14 days', 'Instant', '4-8 weeks', '2-4 weeks'],
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
