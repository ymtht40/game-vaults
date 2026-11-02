'use client';

// Variable Mapping: f -> Divider, e -> orientation, i -> thickness, o -> length, s -> color, l -> duration, a -> delay, c -> ease, h -> start, d -> triggerMode, u -> skip, f (prop) -> className, p -> ref, v -> dividerRef, g -> isHorizontal, x -> scaleAxis, b -> transformOrigin, w -> reveal, y -> sizeStyle, k -> computedStyle

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { gsap } from '@/libs/utils/vendor'; // NOTE: module id: 989970
import { useRevealTimeline } from '@/hooks/useRevealTimeline'; // NOTE: module id: 228414

// NOTE: module id: 297428
const Divider = forwardRef(function Divider(
  {
    orientation = 'horizontal',
    thickness = 1,
    length = 'full',
    color,
    duration = 0.8,
    delay = 0,
    ease = 'power3.out',
    start = 'top 85%',
    triggerMode = 'scroll',
    skip = false,
    className = '',
  },
  ref
) {
  const dividerRef = useRef(null);
  const isHorizontal = orientation === 'horizontal';
  const scaleAxis = isHorizontal ? 'scaleX' : 'scaleY';
  const transformOrigin = isHorizontal ? 'left center' : 'top center';

  const { reveal } = useRevealTimeline(dividerRef, {
    mode: triggerMode === 'scroll' ? 'scroll' : 'manual',
    build: skip
      ? null
      : (el) =>
          gsap
            .timeline({ paused: true })
            .fromTo(
              el,
              {
                [scaleAxis]: 0,
                transformOrigin,
              },
              {
                [scaleAxis]: 1,
                duration,
                delay,
                ease,
              }
            ),
    start,
    deps: [isHorizontal, duration, delay, ease, skip],
  });

  useImperativeHandle(
    ref,
    () => ({
      reveal,
    }),
    [reveal]
  );

  useEffect(() => {
    if (triggerMode === 'immediate' && !skip) {
      reveal();
    }
  }, [triggerMode, skip, reveal]);

  const sizeStyle = isHorizontal
    ? {
        height: `${thickness}px`,
        width: length === 'full' ? '100%' : length,
      }
    : {
        width: `${thickness}px`,
        height: length === 'full' ? '100%' : length,
      };

  const computedStyle = color
    ? {
        ...sizeStyle,
        backgroundColor: color,
      }
    : sizeStyle;

  return (
    <div
      ref={dividerRef}
      role="separator"
      aria-orientation={orientation}
      className={`landing-divider ${className}`.trim()}
      style={computedStyle}
    />
  );
});

export default Divider;

