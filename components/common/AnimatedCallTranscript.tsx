'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Pause, Phone, Play } from 'lucide-react';

type Line = {
  speaker: 'agent' | 'caller';
  text: string;
};

type Props = {
  title?: string;
  caption?: string;
  lines: Line[];
  /** ms per character while typing. Lower = faster. */
  typingSpeedMs?: number;
  /** ms between completed turns. */
  turnPauseMs?: number;
  /** ms before the whole sequence restarts. */
  restartPauseMs?: number;
};

// Chat-thread style animated call transcript. Bubbles appear one
// turn at a time with a per-character typing animation, and the
// scroll container follows the newest bubble without scrolling the
// page. Loops back to start after finishing the last turn; a Pause control
// stops it (WCAG 2.2.2) and reduced-motion users get the full text. Designed
// to feel like a messaging app (WhatsApp / iMessage), not a terminal.
export function AnimatedCallTranscript({
  title = 'Live sample call',
  caption,
  lines,
  typingSpeedMs = 22,
  turnPauseMs = 700,
  restartPauseMs = 2200,
}: Props) {
  const [turnIndex, setTurnIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Reduced motion: show the whole conversation at once, no typing loop.
  const reduce = useReducedMotion();
  const animate = !reduce && !paused;

  useEffect(() => {
    if (reduce) {
      setTurnIndex(lines.length - 1);
      setCharIndex(lines[lines.length - 1]?.text.length ?? 0);
    }
  }, [reduce, lines]);

  useEffect(() => {
    if (!animate) return;
    const current = lines[turnIndex];
    if (!current) return;

    if (charIndex < current.text.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), typingSpeedMs);
      return () => clearTimeout(t);
    }

    const isLast = turnIndex === lines.length - 1;
    const wait = isLast ? restartPauseMs : turnPauseMs;
    const t = setTimeout(() => {
      if (isLast) {
        setTurnIndex(0);
        setCharIndex(0);
      } else {
        setTurnIndex((i) => i + 1);
        setCharIndex(0);
      }
    }, wait);
    return () => clearTimeout(t);
  }, [animate, turnIndex, charIndex, lines, typingSpeedMs, turnPauseMs, restartPauseMs]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turnIndex, charIndex]);

  return (
    <div className="bg-black border border-brand-cyan/25 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-brand-cyan/20 px-5 py-3 bg-brand-dark">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-brand-cyan/40 bg-black flex items-center justify-center rounded-full shrink-0">
            <Phone size={13} className="text-brand-cyan" aria-hidden />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-body text-white text-[13px] font-medium">
              Ron · Implenix agent
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan/80">
              {title}
            </span>
          </div>
        </div>
        {!reduce ? (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? 'Play the sample call' : 'Pause the sample call'}
            className="inline-flex items-center gap-1.5 min-h-10 px-2 -mr-2 font-mono text-[10px] uppercase tracking-widest text-brand-cyan hover:text-white transition-colors"
          >
            {paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
            {paused ? 'Play' : 'Pause'}
          </button>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label={`Sample call transcript: ${title}`}
        className="flex flex-col gap-3 p-4 sm:p-6 overflow-y-auto h-[320px] sm:h-[380px] md:h-[440px] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-cyan"
      >
        {lines.map((line, i) => {
          if (i > turnIndex) return null;
          const text =
            i < turnIndex ? line.text : line.text.slice(0, charIndex);
          const isAgent = line.speaker === 'agent';
          const isTyping = i === turnIndex && charIndex < line.text.length;

          return (
            <div
              key={i}
              className={`flex flex-col gap-1 max-w-[85%] ${
                isAgent ? 'items-start self-start' : 'items-end self-end'
              }`}
            >
              <span
                className={`px-1 font-mono text-[10px] uppercase tracking-widest ${
                  isAgent ? 'text-brand-cyan' : 'text-brand-violet'
                }`}
              >
                {isAgent ? 'Implenix' : 'Caller'}
              </span>
              <div
                className={`px-4 py-2.5 font-body text-sm leading-relaxed ${
                  isAgent
                    ? 'bg-brand-cyan/10 border border-brand-cyan/30 text-white rounded-r-lg rounded-tl-lg rounded-bl-sm'
                    : 'bg-brand-purple/12 border border-brand-purple/35 text-white rounded-l-lg rounded-tr-lg rounded-br-sm'
                }`}
              >
                {text}
                {isTyping ? (
                  <span className="inline-block w-2 h-4 bg-brand-cyan align-middle ml-0.5 motion-safe:animate-pulse" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {caption ? (
        <div className="border-t border-brand-cyan/15 px-5 py-3 bg-brand-dark flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full shrink-0" />
          <span className="font-body text-[12px] text-white/75 leading-snug">
            {caption}
          </span>
        </div>
      ) : null}
    </div>
  );
}
