'use client';

/* Variable Mapping:
   M -> CycleTextSwap
   e -> cycle
   l -> texts
   n -> align
   i -> className
   s -> spansRef
   o -> prevCycleRef
*/

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ANNNIMATE_IN_OUT_EASE } from '@/components/motion/IsometricFigure'; // NOTE: module id: 576720 // UNRESOLVED: name guessed from usage

// NOTE: module id: 586818
export function CycleTextSwap({
  cycle,
  texts,
  align = 'start',
  className = '',
}) {
  const spansRef = useRef({});
  const prevCycleRef = useRef(cycle);

  useLayoutEffect(() => {
    Object.entries(spansRef.current).forEach(([key, el]) =>
      gsap.set(el, { y: 0, yPercent: 110 * (key !== cycle) })
    );
  }, []);

  useEffect(() => {
    const prevCycle = prevCycleRef.current;
    prevCycleRef.current = cycle;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prevCycle === cycle) {
      Object.entries(spansRef.current).forEach(([key, el]) =>
        gsap.set(el, { yPercent: 110 * (key !== cycle) })
      );
      return;
    }
    const direction = cycle === 'yearly' ? -1 : 1;
    const duration = 0.6 * !isReducedMotion;
    gsap.to(spansRef.current[prevCycle], {
      yPercent: 110 * direction,
      duration,
      ease: ANNNIMATE_IN_OUT_EASE,
      overwrite: true,
    });
    gsap.fromTo(
      spansRef.current[cycle],
      { yPercent: -110 * direction },
      { yPercent: 0, duration, ease: ANNNIMATE_IN_OUT_EASE, overwrite: true }
    );
  }, [cycle]);

  return (
    <span className={`grid overflow-hidden ${className}`}>
      {Object.entries(texts).map(([key, text]) => (
        <span
          key={key}
          ref={(el) => (spansRef.current[key] = el)}
          className={`[grid-area:1/1] whitespace-nowrap ${
            align === 'end' ? 'justify-self-start sm:justify-self-end' : 'justify-self-start'
          }`}
        >
          {text}
        </span>
      ))}
    </span>
  );
}
