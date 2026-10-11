'use client';

import { MotionConfig } from 'framer-motion';

// Every framer-motion animation on the site honors the visitor's
// "reduce motion" OS setting: transforms are skipped, opacity still fades.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
