'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';

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
// page. Loops back to start after finishing the last turn. Designed
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
  }, [turnIndex, charIndex, lines, typingSpeedMs, turnPauseMs, restartPauseMs]);

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
            <Phone size={13} className="text-brand-cyan" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-body text-white text-[13px] font-medium">
              Implenix agent · live
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan/80">
              {title}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
          <span className="relative flex h-2 w-2">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-70" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan" />
          </span>
          Live
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col gap-3 p-4 sm:p-6 overflow-y-auto h-[320px] sm:h-[380px] md:h-[440px]"
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
                  isAgent ? 'text-brand-cyan' : 'text-brand-purple'
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
