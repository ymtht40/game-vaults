'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { useRevealTimeline } from '@/hooks/useRevealTimeline'; // NOTE: module id: 228414

// NOTE: module id: 460391
export default function PageEnterAnimation({
  as: Component = 'div',
  children,
  className = '',
  y = 16,
  duration = 0.7,
  ease = 'power2.out',
  delay = 0,
  stagger = 0,
  trigger = 'pageEnter',
  start = 'top 85%',
  enabled = true,
  onReady,
  ...restProps
}) {
  const containerRef = useRef(null);

  const { play } = useRevealTimeline(containerRef, {
    mode: trigger === 'pageEnter' ? 'hero' : trigger === 'manual' ? 'manual' : 'scroll',
    build: enabled
      ? (el) => {
          const targets = stagger > 0 ? Array.from(el.children) : [el];
          return gsap
            .timeline({ paused: true })
            .fromTo(
              targets,
              { autoAlpha: 0, y },
              { autoAlpha: 1, y: 0, duration, ease, delay, stagger }
            );
        }
      : null,
    start,
    deps: [enabled, y, duration, ease, delay, stagger],
  });

  useEffect(() => {
    if (trigger === 'manual' && enabled && onReady) {
      onReady(play);
    }
  }, [trigger, enabled, onReady, play]);

  return (
    <Component ref={containerRef} className={className} {...restProps}>
      {children}
    </Component>
  );
}

