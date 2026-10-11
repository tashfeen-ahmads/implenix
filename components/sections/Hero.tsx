import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { IPhoneMock } from '@/components/common/IPhoneMock';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { TiltStage } from '@/components/motion/TiltStage';

export function Hero() {
  return (
    <section className="relative overflow-hidden grid-bg border-b border-brand-purple/15">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="orb orb-a w-[560px] h-[560px] -right-24 top-10 bg-brand-purple/25" />
        <div className="orb orb-b w-[420px] h-[420px] -left-32 -top-24 bg-brand-cyan/10" />
        <div className="orb orb-a w-[320px] h-[320px] right-1/4 bottom-0 bg-[#5b2bff]/20" />
      </div>
      <div className="relative max-w-content mx-auto px-6 md:px-10 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="self-start enter" style={{ ['--i' as string]: 0 }}>
              <Badge label="Implenix · AI Receptionist for Local Business" variant="cyan" />
            </div>
            <h1 className="enter font-heading text-[2.5rem] sm:text-5xl lg:text-[3.4rem] xl:text-[3.9rem] leading-[1.06] tracking-tight" style={{ ['--i' as string]: 1 }}>
              The <span className="text-brand-cyan">AI Receptionist</span>{' '}
              that stops missing{' '}
              <span className="text-brand-violet">client calls</span>.
            </h1>
            <p className="enter font-body text-white/75 text-lg md:text-xl max-w-[34rem] leading-relaxed" style={{ ['--i' as string]: 2 }}>
              Implenix answers every call in one ring, 24/7. It qualifies
              the caller, books them on your live calendar, and logs it to
              your CRM before they hang up.
            </p>
            <div className="enter flex flex-col sm:flex-row gap-4 pt-2" style={{ ['--i' as string]: 3 }}>
              <Link
                href="/audit"
                data-cta-location="hero"
                data-cta-type="primary"
                className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium text-base px-7 py-4 rounded-sm shadow-[0_10px_40px_-10px_rgba(187,0,255,0.6)] transition hover:opacity-90 active:translate-y-px"
              >
                Get my free missed-call audit <ArrowRight size={16} aria-hidden />
              </Link>
              <TestRonCTA
                ctaLocation="hero"
                variant="secondary"
                size="lg"
              />
            </div>
            <div className="enter mt-4 pt-10 border-t border-white/10" style={{ ['--i' as string]: 4 }}>
              <dl className="grid grid-cols-3 gap-6 md:gap-10 max-w-lg">
                <Stat label="Pickup" value="<1 ring" />
                <Stat label="Coverage" value="24 / 7" />
                <Stat label="Live in" value="7-14 d" />
              </dl>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center enter" style={{ ['--i' as string]: 2 }}>
            <TiltStage>
              <IPhoneMock />
            </TiltStage>
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
      <dd className="mt-2 font-heading text-xl sm:text-2xl md:text-3xl text-white tabular-nums whitespace-nowrap">{value}</dd>
    </div>
  );
}
