'use client';

import { useCallback, useEffect, useRef } from 'react';

import { gsap, Flip } from '@/libs/utils/vendor';
import { cx } from '@/libs/utils/className';

gsap.registerPlugin(Flip);

export default function FlipPill({
  activeId,
  pillClassName,
  containerClassName,
  duration = 0.4,
  ease = 'expo.inOut',
  children,
  ...props
}) {
  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const isMountedRef = useRef(false);

  const positionPill = useCallback((target, opacity = 1) => {
    if (!pillRef.current || !target || !containerRef.current) {
      return;
    }

    const targetBounds = target.getBoundingClientRect();
    const containerBounds = containerRef.current.getBoundingClientRect();

    gsap.set(pillRef.current, {
      width: targetBounds.width,
      height: targetBounds.height,
      x: targetBounds.left - containerBounds.left,
      y: targetBounds.top - containerBounds.top,
      opacity,
    });
  }, []);

  const animatePill = useCallback(
    (target) => {
      if (!pillRef.current || !target || !containerRef.current) {
        return;
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        positionPill(target, 1);
        return;
      }

      const previousState = Flip.getState(pillRef.current);

      positionPill(target, 1);

      Flip.from(previousState, {
        duration,
        ease,
        absolute: true,
      });
    },
    [positionPill, duration, ease],
  );

  useEffect(() => {
    let resizeTimeout;

    const updatePosition = () => {
      const target = containerRef.current?.querySelector(
        `[data-flip-id="${activeId}"]`,
      );

      if (target) {
        positionPill(target, 1);
      }
    };

    updatePosition();
    isMountedRef.current = true;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updatePosition, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) {
      return;
    }

    const target = containerRef.current?.querySelector(
      `[data-flip-id="${activeId}"]`,
    );

    if (target) {
      animatePill(target);
    }
  }, [activeId, animatePill]);

  return (
    <div
      ref={containerRef}
      className={cx('relative inline-flex', containerClassName)}
      {...props}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute left-0 top-0 bg-foreground/10 opacity-0',
          pillClassName,
        )}
        style={{ zIndex: 1 }}
      />

      {children}
    </div>
  );
}
