'use client';

import { motion } from 'framer-motion';
import { Phone, PhoneIncoming, Calendar, Database } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
};

// Step 1: Incoming call interface, phone ringing pulse, accept/decline,
// "AI answering" status. The pulsing rings communicate the "<1 ring"
// answer time at a glance.
export function StepOneVisual() {
  return (
    <div className="relative aspect-[5/4] bg-black border border-brand-purple/25 p-6 overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan motion-safe:animate-pulse" />
          Incoming
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/45">
          00:00:01
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 m-auto w-24 h-24 rounded-full border border-brand-cyan/40"
              animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4 }}
            className="relative w-24 h-24 rounded-full bg-brand-purple flex items-center justify-center"
          >
            <PhoneIncoming size={36} className="text-white" />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between text-[11px] font-body text-white/85">
          <span>+1 (415) 555-0184</span>
          <span className="text-brand-cyan font-mono uppercase tracking-widest text-[10px]">
            Ring 1 · answered
          </span>
        </div>
        <div className="mt-2 h-1 bg-brand-purple/20 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-brand-cyan"
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Calendar booking, day grid with a slot animating into the
// booked state.
export function StepTwoVisual() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const slots = ['9:00', '10:30', '12:00', '1:30', '3:00', '4:30'];
  const bookedIndex = 14;
  return (
    <div className="aspect-[5/4] bg-black border border-brand-purple/25 p-6 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
          <Calendar size={12} /> Booking · live
        </span>
        <span className="text-[10px] font-mono text-white/45">
          Apr 28 · Tue
        </span>
      </header>
      <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono text-white/55 uppercase tracking-widest">
        {days.map((d) => (
          <span key={d} className="text-center">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5 flex-1">
        {slots.flatMap((s, sIdx) =>
          days.map((d, dIdx) => {
            const idx = sIdx * 5 + dIdx;
            const isBooked = idx === bookedIndex;
            const isFilled = idx < bookedIndex && (idx + sIdx) % 3 === 0;
            return (
              <motion.div
                key={`${s}-${d}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.02 * idx, duration: 0.2 }}
                className={`text-[9px] font-mono flex items-center justify-center border ${
                  isBooked
                    ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                    : isFilled
                      ? 'border-brand-purple/40 text-white/30 bg-brand-purple/5'
                      : 'border-brand-purple/20 text-white/40'
                }`}
              >
                {isBooked ? (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                  >
                    BOOKED
                  </motion.span>
                ) : (
                  s
                )}
              </motion.div>
            );
          }),
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="border-l-[3px] border-brand-cyan bg-brand-dark px-3 py-2 text-[11px] font-body text-white/85 flex items-center justify-between"
      >
        <span>Maria L · Wed 1:30 PM</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-brand-cyan">
          ▸ Confirmed
        </span>
      </motion.div>
    </div>
  );
}

// Step 3: CRM update, record fields populating in sequence with a
// "synced" stamp at the end.
export function StepThreeVisual() {
  const fields = [
    { key: 'name', label: 'Name', value: 'Maria L.' },
    { key: 'phone', label: 'Phone', value: '+1 (415) 555-0184' },
    { key: 'service', label: 'Service', value: 'AC outage · emergency' },
    { key: 'address', label: 'Address', value: '1420 Cedar Lane' },
    { key: 'window', label: 'Window', value: 'Wed · 2-4 PM' },
    { key: 'job', label: 'Job ID', value: '#44129' },
  ];
  return (
    <div className="aspect-[5/4] bg-black border border-brand-purple/25 p-6 flex flex-col gap-3">
      <header className="flex items-center justify-between border-b border-brand-purple/20 pb-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
          <Database size={12} /> CRM · contact
        </span>
        <span className="text-[10px] font-mono text-white/45">
          northwind-hvac
        </span>
      </header>
      <ul className="flex-1 flex flex-col gap-1.5">
        {fields.map((f, i) => (
          <motion.li
            key={f.key}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.18, duration: 0.3 }}
            className="grid grid-cols-[80px_1fr] items-center text-[11px] font-mono"
          >
            <span className="text-white/40 uppercase tracking-widest">
              {f.label}
            </span>
            <span className="text-white truncate border-l border-brand-purple/20 pl-3 py-1">
              {f.value}
            </span>
          </motion.li>
        ))}
      </ul>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: fields.length * 0.18 + 0.2, duration: 0.3 }}
        className="border-l-[3px] border-brand-cyan bg-brand-dark p-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest"
      >
        <span className="text-brand-cyan flex items-center gap-1.5">
          <Phone size={11} /> Synced
        </span>
        <span className="text-white/55">just now</span>
      </motion.div>
    </div>
  );
}
