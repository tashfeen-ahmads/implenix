'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { TestRonCTA } from '@/components/ron/TestRonCTA';

// Hidden where it would repeat the page: the audit / booking / Ron
// destinations themselves, and pages that already close with their own
// audit band (same headline, same two buttons).
const HIDDEN_ON = new Set([
  '/audit',
  '/contact',
  '/try-it',
  '/24-7-ai-receptionist',
  '/ai-phone-answering-service',
  '/ai-receptionist-cost-comparison',
  '/ai-receptionist-for-agencies',
  '/ai-receptionist-for-multi-location-businesses',
  '/ai-receptionist-for-small-business',
  '/ai-receptionist-for-solopreneurs',
  '/ai-receptionist-for-startups',
  '/ai-receptionist-vs-human-receptionist',
  '/benefits-of-ai-receptionist',
  '/glossary',
  '/how-does-an-ai-receptionist-work',
  '/industries',
  '/preview/dashboard',
  '/virtual-ai-receptionist',
  '/what-is-an-ai-receptionist',
]);

const hasOwnClosingCta = (path: string) =>
  HIDDEN_ON.has(path) ||
  path.startsWith('/ai-receptionist-vs-') ||
  path.endsWith('-alternative');

export function FooterCta() {
  const pathname = usePathname();
  if (pathname && hasOwnClosingCta(pathname)) return null;
  return (
      <section className="bg-brand-dark border-t border-brand-purple/20">
        <div className="max-w-content mx-auto px-6 md:px-10 py-24 md:py-28 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Badge label="Find out what you’re losing" variant="purple" />
            <h2 className="font-heading text-3xl md:text-5xl text-white leading-[1.05] max-w-2xl">
              See what missed calls cost you last month.
            </h2>
            <p className="font-body text-white/70 max-w-xl">
              Free 60-second audit. Industry-grade estimate of your lost
              pipeline, then a deployment plan to recover it.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            <Link
              href="/audit"
              data-cta-location="footer-cta"
              data-cta-type="primary"
              className="inline-flex sm:w-56 items-center justify-center gap-2 bg-brand-purple text-white font-medium px-6 py-3 rounded-sm transition hover:opacity-90 active:translate-y-px"
            >
              Get my free audit <ArrowRight size={16} aria-hidden />
            </Link>
            <TestRonCTA
              ctaLocation="footer-cta"
              variant="secondary"
              className="sm:w-56"
            />
          </div>
        </div>
      </section>
  );
}
