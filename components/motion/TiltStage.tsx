'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

// Gives its child a gentle 3D tilt that follows the pointer, with a
// moving highlight. Motion values only, so React never re-renders on
// pointer move. Static under reduced motion and on touch screens.
export function TiltStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring);
  const glareX = useTransform(px, [-0.5, 0.5], ['20%', '80%']);
  const glareY = useTransform(py, [-0.5, 0.5], ['15%', '85%']);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.10), transparent 45%)`,
  );

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative w-full [perspective:1200px]"
    >
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative"
      >
        {children}
        {!reduce ? (
          <motion.div
            aria-hidden
            style={{ background: glare }}
            className="pointer-events-none absolute inset-0 mx-auto max-w-[340px] rounded-[44px]"
          />
        ) : null}
      </motion.div>
    </div>
  );
}
