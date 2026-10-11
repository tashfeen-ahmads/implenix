'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CaseStudyCard } from '@/components/common/CaseStudyCard';

type CaseStudyItem = {
  slug: string;
  industry: string;
  resultHeadline: string;
  summary: string;
};

export function CaseStudiesClient({ studies }: { studies: CaseStudyItem[] }) {
  const [filter, setFilter] = useState('All');
  // Chips come from the studies themselves: no dead filters, none missing.
  const FILTERS = useMemo(
    () => ['All', ...Array.from(new Set(studies.map((s) => s.industry))).sort()],
    [studies],
  );

  const filtered = useMemo(() => {
    if (filter === 'All') return studies;
    return studies.filter((s) => s.industry === filter);
  }, [studies, filter]);

  return (
    <>
      <div className="max-w-content mx-auto px-6 pt-10">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-body rounded-sm transition-colors ${
                  active
                    ? 'bg-brand-purple text-white'
                    : 'border border-brand-purple/30 text-white/80 hover:border-brand-purple'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>
      <div className="max-w-content mx-auto px-6 py-12">
        {/* POPULATE WITH REAL CASE STUDIES WHEN AVAILABLE */}
        {filtered.length === 0 ? (
          <div className="border border-brand-purple/20 p-10 text-center text-white/70 font-body">
            No case studies match this filter yet.{' '}
            <Link href="/contact" className="text-brand-cyan underline">
              Talk to Implenix
            </Link>
            .
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <CaseStudyCard
                key={s.slug}
                industry={s.industry}
                resultHeadline={s.resultHeadline}
                summary={s.summary}
                href={`/case-studies/${s.slug}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
