import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, Check } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { breadcrumbListSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing | Custom AI Receptionist Quote | Implenix',
  description:
    'Every Implenix AI receptionist is a custom build, so pricing is set per business. Book a call with a lead specialist for the right solution and price.',
  path: '/pricing',
});

const COVERED = [
  'How your calls come in today and where they get missed',
  'What the agent needs to do: book, qualify, route, follow up',
  'Your calendar, CRM, and phone setup',
  'The solution and price that fit your business',
];

// No published price list: every deployment is a custom build, so the page
// sends visitors to a lead specialist for a quote.
export default function PricingPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          breadcrumbListSchema([
            { label: 'Home', href: '/' },
            { label: 'Pricing', href: '/pricing' },
          ]),
        ]}
      />
      <section className="grid-bg border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="max-w-3xl flex flex-col gap-5">
            <Badge label="Pricing · Custom build" variant="cyan" />
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.04]">
              Priced for your business,{' '}
              <span className="text-brand-violet">not a template</span>.
            </h1>
            <p className="font-body text-white/80 text-lg max-w-2xl leading-relaxed">
              Every Implenix AI receptionist is built around how your business
              takes calls, so there is no one-size price list.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black">
        <div className="max-w-content mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto border border-brand-purple/40 bg-brand-dark p-8 md:p-12 flex flex-col gap-6">
            <span className="w-12 h-12 border border-brand-cyan/40 bg-black flex items-center justify-center rounded-full">
              <CalendarCheck size={20} className="text-brand-cyan" aria-hidden />
            </span>
            <h2 className="font-heading text-3xl md:text-4xl text-white leading-tight">
              Book a call with a lead specialist
            </h2>
            <p className="font-body text-white/80 text-lg leading-relaxed">
              A lead specialist will go over your issue, then recommend the
              best solution and the best price for what you need. Once you
              go ahead, your AI receptionist is live in 72 hours.
            </p>
            <ul className="flex flex-col gap-3">
              {COVERED.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2.5 font-body text-white/85"
                >
                  <Check size={16} className="text-brand-cyan mt-1 shrink-0" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <Link
                href="/contact#book"
                data-cta-location="pricing-book-specialist"
                data-cta-type="calendar"
                className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3.5 rounded-sm hover:opacity-90"
              >
                Book an appointment <ArrowRight size={16} aria-hidden />
              </Link>
              <span className="font-body text-sm text-white/60">
                30 minutes · free · no commitment
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
