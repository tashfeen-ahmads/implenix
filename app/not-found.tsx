import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export const metadata: Metadata = {
  title: 'Page not found (404) | Implenix',
  description: 'The page you are looking for does not exist or has moved.',
  robots: { index: false, follow: true },
};

const POPULAR_PAGES = [
  { href: '/', label: 'AI Receptionist, the pillar' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/audit', label: 'Free missed-call audit' },
  { href: '/case-studies', label: 'Verified case studies' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Book a 30-minute call' },
];

const INDUSTRIES = [
  { href: '/ai-receptionist-for-hvac-companies', label: 'HVAC' },
  { href: '/ai-receptionist-for-dentists', label: 'Dental' },
  { href: '/ai-receptionist-for-real-estate', label: 'Real Estate' },
  { href: '/ai-receptionist-for-law-firms', label: 'Law Firms' },
  { href: '/ai-receptionist-for-plumbers', label: 'Plumbers' },
  { href: '/ai-receptionist-for-med-spas', label: 'Med Spas' },
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] px-6 grid-bg py-20 md:py-28">
      <div className="max-w-content mx-auto grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 border border-brand-purple/20 bg-black p-8 md:p-10 flex flex-col gap-6">
          <Badge label="404 · Not found" variant="purple" />
          <h1 className="font-heading text-6xl md:text-7xl text-brand-purple leading-none">
            404
          </h1>
          <p className="text-white/80 font-body text-lg leading-relaxed">
            The page you are looking for does not exist or has moved.
            Below are the highest-traffic pages on the site, one of
            them probably has what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm hover:opacity-90"
            >
              Back to Implenix <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-brand-cyan text-brand-cyan font-medium px-6 py-3 rounded-sm hover:bg-brand-cyan/10"
            >
              Book a 30-min call
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-5 flex flex-col gap-6">
          <div className="border border-brand-purple/20 bg-black p-6 flex flex-col gap-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
              <Search size={11} /> Popular pages
            </span>
            <ul className="flex flex-col gap-2 mt-1">
              {POPULAR_PAGES.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-brand-cyan font-body transition-colors"
                  >
                    <ArrowRight
                      size={12}
                      className="text-brand-cyan transition-transform group-hover:translate-x-0.5"
                    />
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-l-[3px] border-brand-cyan bg-black p-6 flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
              ▸ By industry
            </span>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {INDUSTRIES.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    className="text-sm text-white/85 hover:text-brand-cyan font-body transition-colors"
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/industries"
              className="mt-2 inline-flex items-center gap-1 text-brand-cyan text-xs font-mono uppercase tracking-widest hover:opacity-80"
            >
              See all 25 industries <ArrowRight size={11} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
