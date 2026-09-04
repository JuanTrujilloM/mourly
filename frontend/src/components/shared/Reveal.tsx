'use client';

import type { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

// Only a fade: the brand allows no movement outside the weekly reveal.
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-opacity ${inView ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}
