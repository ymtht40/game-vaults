'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

import { useRevealTimeline } from '@/hooks/useRevealTimeline'; // module id: 228414

export default function FadeIn({
  as: Tag = 'div',
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
  ...props
}) {
  const containerRef = useRef(null);

  const { play } = useRevealTimeline(containerRef, {
    mode:
      trigger === 'pageEnter'
        ? 'hero'
        : trigger === 'manual'
          ? 'manual'
          : 'scroll',
    build: enabled
      ? (element) => {
          const targets =
            stagger > 0 ? Array.from(element.children) : [element];

          return gsap.timeline({ paused: true }).fromTo(
            targets,
            {
              autoAlpha: 0,
              y,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration,
              ease,
              delay,
              stagger,
            },
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
    <Tag ref={containerRef} className={className} {...props}>
      {children}
    </Tag>
  );
}