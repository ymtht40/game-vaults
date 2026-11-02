'use client';

// Variable Mapping: a -> isRefreshScheduled, f -> useRevealTimeline, e -> scopeRef, r -> mode, o -> build, u -> start, c -> inView, d -> deps, h -> whenRevealed, p -> hasPlayedRef, g -> buildRef, m -> inViewRef, x -> checkInView, b -> triggerPlay

import { useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { useAnimation } from '@/contexts/AnimationProvider'; // NOTE: module id: 488463
import { perfMeasure } from '@/libs/utils/perf'; // NOTE: module id: 991763

gsap.registerPlugin(ScrollTrigger);

let isRefreshScheduled = false;

// NOTE: module id: 228414
export function useRevealTimeline(
  scopeRef,
  {
    mode = 'scroll',
    build,
    start = 'top 85%',
    inView,
    deps = []
  } = {}
) {
  const { whenRevealed } = useAnimation();
  const timelineRef = useRef(null);
  const hasPlayedRef = useRef(false);
  const buildRef = useRef(build);
  buildRef.current = build;

  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const checkInView = useCallback(() => {
    if (inViewRef.current) return inViewRef.current();
    const element = scopeRef.current;
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 0;
    return rect.top < 0.9 * viewportHeight && rect.bottom > 0;
  }, [scopeRef]);

  const triggerPlay = useCallback(() => {
    if (!hasPlayedRef.current && scopeRef.current) {
      hasPlayedRef.current = true;
      if (timelineRef.current) {
        timelineRef.current.restart(true);
      }
    }
  }, [scopeRef]);

  useGSAP(
    () => {
      const element = scopeRef.current;
      if (!element || !buildRef.current) return;
      const timeline = buildRef.current(element);
      timelineRef.current = timeline;
      if (hasPlayedRef.current) {
        timeline.restart(true);
      }
      return () => {
        timeline?.kill();
        timelineRef.current = null;
      };
    },
    { scope: scopeRef, dependencies: [mode, start, ...deps] }
  );

  useEffect(() => {
    if (mode === 'manual') return;

    let scrollTriggerInstance = null;
    let rafId = 0;

    const unsubscribe = whenRevealed(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        hasPlayedRef.current = true;
        if (timelineRef.current) {
          timelineRef.current.progress(1);
        }
        return;
      }

      if (mode === 'hero' || checkInView()) {
        triggerPlay();
      } else {
        rafId = requestAnimationFrame(() => {
          if (scopeRef.current) {
            if (checkInView()) {
              triggerPlay();
              return;
            }
            scrollTriggerInstance = ScrollTrigger.create({
              trigger: scopeRef.current,
              start,
              once: true,
              onEnter: triggerPlay
            });
            if (!isRefreshScheduled) {
              isRefreshScheduled = true;
              requestAnimationFrame(() => {
                isRefreshScheduled = false;
                perfMeasure(
                  `ScrollTrigger.refresh (${ScrollTrigger.getAll().length} triggers)`,
                  () => ScrollTrigger.refresh()
                );
              });
            }
          }
        });
      }
    });

    return () => {
      unsubscribe();
      if (rafId) cancelAnimationFrame(rafId);
      scrollTriggerInstance?.kill();
    };
  }, [whenRevealed, mode, start]);

  return {
    play: triggerPlay,
    reveal: triggerPlay
  };
}

