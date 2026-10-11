'use client';

import { useRef, useState } from 'react';
import { Play, Pause, ShieldCheck, Quote, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Props = {
  businessName: string;
  ownerName: string;
  industry: string;
  quote: string;
  recordingSrc?: string;
  caseStudyHref?: string;
};

// Testimonial card with optional inline call-recording player. If
// recordingSrc is provided, the card renders an embedded play/pause
// control that plays the real call. Otherwise the card falls back to a
// "view case study" link.
export function TestimonialCard({
  businessName,
  ownerName,
  industry,
  quote,
  recordingSrc,
  caseStudyHref,
}: Props) {
  const initials = ownerName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      void el.play();
    }
    setPlaying(!playing);
  };

  return (
    <article className="min-w-0 bg-black border border-brand-purple/25 hover:border-brand-purple p-6 flex flex-col gap-5 h-full transition-colors">
      <header className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-brand-cyan border border-brand-cyan/35 px-2 py-1">
          <ShieldCheck size={11} /> Verified
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/45">
          {industry}
        </span>
      </header>

      <Quote size={18} className="text-brand-purple" />

      <p className="font-body text-white/85 text-base leading-relaxed flex-1">
        “{quote}”
      </p>

      {recordingSrc ? (
        <div className="border border-brand-cyan/30 bg-brand-dark p-3 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              playing
                ? `Pause recording from ${businessName}`
                : `Play recording from ${businessName}`
            }
            data-cta-location="testimonial-recording"
            data-cta-type="audio"
            className="w-9 h-9 flex items-center justify-center bg-brand-purple text-white rounded-sm hover:opacity-90 shrink-0"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
              {playing ? '▸ Playing live call' : '▸ Real call recording'}
            </p>
            <p className="text-xs text-white/65 font-body truncate mt-0.5">
              From this deployment · names redacted in audio
            </p>
          </div>
          <audio
            ref={audioRef}
            src={recordingSrc}
            preload="none"
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
        </div>
      ) : null}

      <footer className="flex items-center gap-3 border-t border-brand-purple/15 pt-4">
        <span className="w-9 h-9 bg-brand-purple text-white flex items-center justify-center font-heading text-sm">
          {initials}
        </span>
        <div className="flex-1 min-w-0 leading-tight">
          <p className="font-heading text-white text-sm">{businessName}</p>
          <p className="text-xs text-white/55 font-body mt-0.5">{ownerName}</p>
        </div>
        {caseStudyHref ? (
          <Link
            href={caseStudyHref}
            data-cta-location="testimonial-case-study"
            className="inline-flex items-center gap-1.5 text-brand-cyan text-xs font-mono uppercase tracking-widest hover:opacity-80"
          >
            Case study <ArrowRight size={12} />
          </Link>
        ) : null}
      </footer>
    </article>
  );
}
