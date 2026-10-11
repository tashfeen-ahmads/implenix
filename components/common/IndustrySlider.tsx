'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { INDUSTRIES, industryUrl } from '@/lib/industries';

// Horizontal scroll-snap slider for industry cards. Renders all 25
// industries but compresses the visual footprint vs the previous grid.
// Prev/next buttons scroll one card-width at a time on desktop; touch
// scroll handles mobile.
export function IndustrySlider() {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const left = track.scrollLeft;
      const max = track.scrollWidth - track.clientWidth;
      setCanScrollLeft(left > 4);
      setCanScrollRight(left < max - 4);
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('li');
    const step = card ? (card as HTMLElement).getBoundingClientRect().width + 16 : 280;
    track.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/55">
          ▸ Scroll · {INDUSTRIES.length} industries
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            disabled={!canScrollLeft}
            onClick={() => scrollBy(-1)}
            className="w-9 h-9 border border-brand-purple/30 hover:border-brand-purple disabled:opacity-30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={14} className="text-brand-cyan" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            disabled={!canScrollRight}
            onClick={() => scrollBy(1)}
            className="w-9 h-9 border border-brand-purple/30 hover:border-brand-purple disabled:opacity-30 flex items-center justify-center transition-colors"
          >
            <ArrowRight size={14} className="text-brand-cyan" aria-hidden />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollPaddingLeft: 4 }}
      >
        {INDUSTRIES.map((industry) => (
          <li
            key={industry.slug}
            className="snap-start shrink-0 w-[240px] sm:w-[280px]"
          >
            <Link
              href={industryUrl(industry.slug)}
              data-cta-location="industries-slider"
              data-cta-type="industry"
              className="group h-full bg-black border border-brand-purple/20 hover:border-brand-purple p-5 flex flex-col gap-3 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-widest text-brand-cyan font-mono">
                ▸ Industry
              </span>
              <h3 className="font-heading text-xl text-white">
                {industry.name}
              </h3>
              <p className="text-white/65 text-sm font-body leading-relaxed flex-1">
                {industry.painPoint}
              </p>
              <span className="inline-flex items-center gap-1.5 text-brand-cyan text-sm font-medium">
                See solution
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
        <li className="snap-start shrink-0 w-[240px] sm:w-[280px]">
          <Link
            href="/industries"
            data-cta-location="industries-slider"
            data-cta-type="link"
            className="group h-full bg-brand-purple/10 border border-brand-purple hover:bg-brand-purple/20 p-5 flex flex-col gap-3 transition-colors"
          >
            <span className="text-[10px] uppercase tracking-widest text-white/55 font-mono">
              ▸ Browse all
            </span>
            <h3 className="font-heading text-xl text-white">
              See all {INDUSTRIES.length} industries
            </h3>
            <p className="text-white/70 text-sm font-body leading-relaxed flex-1">
              Grouped by category, with deep-dive playbooks for each.
            </p>
            <span className="inline-flex items-center gap-1.5 text-brand-cyan text-sm font-medium">
              All industries
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
