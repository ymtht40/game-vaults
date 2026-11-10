'use client';
import React, { useRef, Children } from 'react';
import gsap from 'gsap';
import { useRevealTimeline } from '@/hooks/useRevealTimeline';

export default function ListSlider({
  children,
  className = '',
  tag: Tag = 'ul',
  itemClassName = '',
  duration = 0.6,
  stagger = 0.08,
  delay = 0,
  ease = 'power2.out',
  start = 'top 80%',
  trigger = 'scroll',
}) {
  let containerRef = useRef(null);

  useRevealTimeline(containerRef, {
    mode: trigger === 'pageEnter' ? 'hero' : 'scroll',
    build: (element) => {
      let targets = element.querySelectorAll('[data-anm-list-slider]');
      let tl = gsap.timeline({ paused: true });

      if (targets.length) {
        tl.from(targets, {
          yPercent: 100,
          duration,
          stagger,
          delay,
          ease,
        });
      }

      return tl;
    },
    start,
    deps: [duration, stagger, delay, ease, trigger],
  });

  let validChildren = Children.toArray(children).filter(Boolean);

  return (
    <Tag
      ref={containerRef}
      className={className}>
      {validChildren.map((child, index) => (
        <li
          key={index}
          className={`overflow-hidden ${itemClassName}`.trim()}>
          <span
            data-anm-list-slider={true}
            className="block">
            {child}
          </span>
        </li>
      ))}
    </Tag>
  );
}
