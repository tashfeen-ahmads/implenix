'use client';

import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  // Position in a group; each step adds a short stagger.
  index?: number;
  className?: string;
  as?: 'div' | 'li';
};

const EASE = [0.16, 1, 0.3, 1] as const;

// Fades content up as it enters the viewport, once. Used on section
// headers and card groups so each section lands in reading order.
export function Reveal({ children, index = 0, className, as = 'div' }: Props) {
  const Tag = as === 'li' ? motion.li : motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: Math.min(index, 6) * 0.08, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
