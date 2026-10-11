import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { IPhoneMock } from '@/components/common/IPhoneMock';
import { TestRonCTA } from '@/components/ron/TestRonCTA';

export function Hero() {
  return (
    <section className="relative overflow-hidden grid-bg border-b border-brand-purple/15">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_45%,rgba(187,0,255,0.18),transparent_70%),radial-gradient(ellipse_40%_40%_at_10%_10%,rgba(61,250,255,0.08),transparent_70%)]"
      />
      <div className="relative max-w-content mx-auto px-6 md:px-10 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="self-start">
              <Badge label="Implenix · AI Receptionist for Local Business" variant="cyan" />
            </div>
            <h1 className="font-heading text-[2.5rem] sm:text-5xl lg:text-[3.4rem] xl:text-[3.9rem] leading-[1.06] tracking-tight">
              The <span className="text-brand-cyan">AI Receptionist</span>{' '}
              that stops missing{' '}
              <span className="text-brand-purple">client calls</span>.
            </h1>
            <p className="font-body text-white/75 text-lg md:text-xl max-w-[34rem] leading-relaxed">
              Implenix answers every call in one ring, 24/7. It qualifies
              the caller, books them on your live calendar, and logs it to
              your CRM before they hang up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/audit"
                data-cta-location="hero"
                data-cta-type="primary"
                className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium text-base px-7 py-4 rounded-sm shadow-[0_10px_40px_-10px_rgba(187,0,255,0.6)] transition hover:opacity-90 active:translate-y-px"
              >
                Get my free missed-call audit <ArrowRight size={16} />
              </Link>
              <TestRonCTA
                ctaLocation="hero"
                variant="secondary"
                size="lg"
              />
            </div>
            <div className="mt-4 pt-10 border-t border-white/10">
              <dl className="grid grid-cols-3 gap-6 md:gap-10 max-w-lg">
                <Stat label="Pickup" value="<1 ring" />
                <Stat label="Coverage" value="24 / 7" />
                <Stat label="Live in" value="7-14 d" />
              </dl>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <IPhoneMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-1">
      <dt className="text-xs uppercase tracking-widest text-white/55 font-mono">
        {label}
      </dt>
      <dd className="mt-2 font-heading text-2xl md:text-3xl text-white">{value}</dd>
    </div>
  );
}
