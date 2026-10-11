'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

type Props = {
  value: number;
  prefix?: string;
  className?: string;
};

const fmt = new Intl.NumberFormat('en-US');

// Counts up to `value` the first time it scrolls into view. Server HTML
// and reduced-motion visitors get the final number directly.
export function CountUp({ value, prefix = '', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${fmt.format(Math.round(v))}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, prefix]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {prefix}
      {fmt.format(value)}
    </span>
  );
}
