'use client';

import { useRef } from 'react';

// Card wrapper whose border and surface light up under the cursor.
// Writes two CSS variables on pointer move; no React state involved.
export function Spotlight({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onPointerMove={onMove} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
