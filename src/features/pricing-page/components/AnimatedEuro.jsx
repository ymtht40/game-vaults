'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// NOTE: module id: 314670
export const formatEuro = (value) => `€${Math.round(value).toLocaleString('en-US')}`;

// Variable Mapping: e -> value, n -> className, i -> spanRef, c -> prevValueRef, a -> prefersReducedMotion, r -> state
// NOTE: module id: 314670
export function AnimatedEuro({ value, className = '' }) {
  const spanRef = useRef(null);
  const prevValueRef = useRef(value);

  useGSAP(
    () => {
      const spanElement = spanRef.current;
      if (!spanElement) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const state = {
        v: prevValueRef.current,
      };

      gsap.to(state, {
        v: value,
        duration: 0.5 * !prefersReducedMotion,
        ease: 'expo.out',
        overwrite: true,
        onUpdate: () => {
          prevValueRef.current = state.v;
          spanElement.textContent = formatEuro(state.v);
        },
      });
    },
    {
      dependencies: [value],
    }
  );

  return (
    <span ref={spanRef} className={className}>
      {formatEuro(value)}
    </span>
  );
}

// NOTE: module id: 314670
export default AnimatedEuro;
