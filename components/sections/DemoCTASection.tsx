import { SectionHeader } from '@/components/common/SectionHeader';
import { BookingWidget } from '@/components/common/BookingWidget';
import { PhoneCTA } from '@/components/common/PhoneCTA';

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
            description="Pick a 30-minute slot on the calendar, or call our agent right now and hear it run a live conversation."
          />
          <div className="mt-10 flex flex-col gap-4">
            <PhoneCTA ctaLocation="homepage-demo-phone" variant="primary" />
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
