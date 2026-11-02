'use client';

// Variable Mapping: p -> containerRef, d -> pillRef, f -> isInitializedRef, m -> updatePillPosition, g -> animatePillTo

import { useCallback, useEffect, useRef } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { Flip } from 'gsap/Flip'; // NOTE: module id: 433965
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

gsap.registerPlugin(Flip);

// NOTE: module id: 876355
export default function PillContainer({
  activeId,
  pillClassName,
  containerClassName,
  duration = 0.4,
  ease = 'expo.inOut',
  children,
  ...restProps
}) {
  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const isInitializedRef = useRef(false);

  const updatePillPosition = useCallback((targetElement, opacity = 1) => {
    if (!pillRef.current || !targetElement || !containerRef.current) return;
    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    gsap.set(pillRef.current, {
      width: targetRect.width,
      height: targetRect.height,
      x: targetRect.left - containerRect.left,
      y: targetRect.top - containerRect.top,
      opacity,
    });
  }, []);

  const animatePillTo = useCallback(
    (targetElement) => {
      if (!pillRef.current || !targetElement || !containerRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updatePillPosition(targetElement, 1);
        return;
      }
      const state = Flip.getState(pillRef.current);
      updatePillPosition(targetElement, 1);
      Flip.from(state, {
        duration,
        ease,
        absolute: true,
      });
    },
    [updatePillPosition, duration, ease]
  );

  useEffect(() => {
    let timeoutId;
    const update = () => {
      const activeElement = containerRef.current?.querySelector(`[data-flip-id="${activeId}"]`);
      if (activeElement) {
        updatePillPosition(activeElement, 1);
      }
    };

    update();
    isInitializedRef.current = true;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(update, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    const activeElement = containerRef.current?.querySelector(`[data-flip-id="${activeId}"]`);
    if (activeElement) {
      animatePillTo(activeElement);
    }
  }, [activeId, animatePillTo]);

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex', containerClassName)}
      {...restProps}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-0 top-0 bg-foreground/10 opacity-0',
          pillClassName
        )}
        style={{ zIndex: 1 }}
      />
      {children}
    </div>
  );
}

export { PillContainer };
