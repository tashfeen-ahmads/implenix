import { SectionHeader } from '@/components/common/SectionHeader';
import { BookingWidget } from '@/components/common/BookingWidget';
import { TestRonCTA } from '@/components/ron/TestRonCTA';

export function DemoCTASection() {
  return (
    <section
      id="demo-form"
      className="bg-brand-dark border-t border-brand-purple/20"
    >
      <div className="max-w-content mx-auto px-6 py-28 md:px-10 md:py-36 lg:py-40 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="See it live"
            title="See the Implenix agent work in real time"
            compact
            description="Pick a 30-minute slot on the calendar, or talk to Ron right now, in your browser."
          />
          <div className="mt-10 flex flex-col gap-4">
            <TestRonCTA ctaLocation="homepage-demo-ron" variant="primary" />
            <p className="text-xs uppercase tracking-widest text-brand-cyan font-mono">
              ▸ Or pick a slot on the calendar →
            </p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <BookingWidget
            ctaLocation="homepage-demo-calendar"
            height={680}
          />
        </div>
      </div>
    </section>
  );
}
