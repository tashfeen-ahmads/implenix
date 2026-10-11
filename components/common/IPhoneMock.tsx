'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mic, Calendar } from 'lucide-react';

type Bubble =
  | { from: 'caller'; text: string; ts: string }
  | { from: 'agent'; text: string; ts: string }
  | { from: 'system'; text: string; ts: string };

const CONVERSATION: Bubble[] = [
  { from: 'system', text: 'Inbound call · +1 (415) 555-0184', ts: '00:00' },
  { from: 'agent', text: 'Northwind HVAC, this is Ron. How can I help?', ts: '00:02' },
  { from: 'caller', text: 'My AC stopped. House is at 88°.', ts: '00:05' },
  { from: 'agent', text: 'Sorry to hear that. Sending a tech today. Address?', ts: '00:09' },
  { from: 'caller', text: '1420 Cedar Lane.', ts: '00:13' },
  { from: 'agent', text: 'Booked. Tech arrives 2-4pm. Confirmation sent.', ts: '00:17' },
];

// Stylized iPhone-shaped mock with a live AI conversation animating in.
// Uses Framer Motion for staggered bubble entry. SVG-based frame so it
// scales cleanly without raster assets.
export function IPhoneMock() {
  const [callEnded, setCallEnded] = useState(false);

  useEffect(() => {
    // Total animation runtime: CONVERSATION.length turns × 400ms + booking
    // card at +200ms + 800ms safety buffer to let the last bubble land.
    const totalMs = CONVERSATION.length * 400 + 200 + 1200;
    const t = setTimeout(() => setCallEnded(true), totalMs);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="relative rounded-[44px] bg-black border-[10px] border-black shadow-[0_0_0_1px_rgba(187,0,255,0.25)]">
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-10"
        />
        <div className="relative aspect-[9/19.5] bg-brand-dark rounded-[34px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-mono text-white/85">
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 border border-white/70 rounded-[2px]" />
              <span className="w-2 h-2 rounded-full bg-brand-cyan" />
            </span>
          </div>

          <header className="px-4 py-3 border-b border-brand-purple/20 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-brand-purple flex items-center justify-center font-heading text-white text-sm">
              R
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-white text-sm leading-none">
                Ron · Implenix Agent
              </p>
              <p className="text-[10px] uppercase tracking-widest text-brand-cyan font-mono mt-1 flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    callEnded ? 'bg-white/40' : 'bg-brand-cyan motion-safe:animate-pulse'
                  }`}
                />
                {callEnded ? 'Call wrapped' : 'Live call'}
              </p>
            </div>
            <Phone size={16} className="text-brand-cyan" aria-hidden />
          </header>

          <div className="flex-1 overflow-hidden px-4 py-4 space-y-3">
            {CONVERSATION.map((bubble, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.4, duration: 0.35 }}
                className={`flex flex-col ${
                  bubble.from === 'caller'
                    ? 'items-end'
                    : bubble.from === 'system'
                      ? 'items-center'
                      : 'items-start'
                }`}
              >
                {bubble.from === 'system' ? (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/55 border border-brand-purple/25 px-2 py-1">
                    {bubble.text}
                  </span>
                ) : (
                  <div
                    className={`max-w-[78%] px-3 py-2 text-[12px] leading-snug font-body rounded-sm ${
                      bubble.from === 'caller'
                        ? 'bg-brand-purple text-white rounded-br-none'
                        : 'bg-black border border-brand-cyan/30 text-white rounded-bl-none'
                    }`}
                  >
                    {bubble.text}
                  </div>
                )}
                {bubble.from !== 'system' ? (
                  <span className="mt-1 text-[9px] font-mono text-white/55">
                    {bubble.ts}
                  </span>
                ) : null}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: CONVERSATION.length * 0.4 + 0.2, duration: 0.35 }}
              className="border border-brand-cyan/40 bg-black p-3 flex items-start gap-2.5 mt-3"
            >
              <Calendar size={14} className="text-brand-cyan mt-0.5 shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-heading text-brand-cyan">
                  Booking confirmed
                </p>
                <p className="text-[10px] text-white/70 font-body mt-0.5 leading-snug">
                  Tomorrow · 2-4 PM · 1420 Cedar Ln
                </p>
                <p className="text-[9px] font-mono text-white/55 mt-1.5 uppercase tracking-widest">
                  ▸ CRM updated · job #44129
                </p>
              </div>
            </motion.div>
          </div>

          <footer className="px-4 py-3 border-t border-brand-purple/20 flex items-center gap-3">
            <span className="flex-1 h-8 border border-brand-purple/30 rounded-sm flex items-center px-3 text-[11px] text-white/55 font-body">
              Listening…
            </span>
            <span className="w-8 h-8 rounded-full bg-brand-cyan flex items-center justify-center">
              <Mic size={14} className="text-brand-dark" aria-hidden />
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
