'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Variable Mapping: e -> share, s -> className, n -> barRef, i -> normalizedShare
// NOTE: module id: 23692
export function AnimatedBar({ share, className = '' }) {
  const barRef = useRef(null);
  const normalizedShare = Math.max(0.02, share);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      gsap.to(barRef.current, {
        scaleY: normalizedShare,
        duration: 0.5 * !prefersReducedMotion,
        ease: 'expo.out',
        overwrite: true,
      });
    },
    {
      dependencies: [normalizedShare],
    }
  );

  return (
    <div
      ref={barRef}
      className={`h-full w-full origin-bottom ${className}`}
      style={{
        transform: `scaleY(${normalizedShare})`,
      }}
    />
  );
}

// NOTE: module id: 23692
export default AnimatedBar;
