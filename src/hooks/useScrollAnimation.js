'use client';

import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { useAnimation } from '@/contexts/AnimationProvider'; // NOTE: module id: 488463
import { perfLog } from '@/libs/utils/perf'; // NOTE: module id: 991763

gsap.registerPlugin(ScrollTrigger);

let isRefreshScheduled = false;

// NOTE: module id: 228414
export function useScrollAnimation(
  targetRef,
  { mode = 'scroll', build, start = 'top 85%', inView, deps = [] } = {}
) {
  const { whenRevealed } = useAnimation();
  const timelineRef = useRef(null);
  const isRevealedRef = useRef(false);
  const buildRef = useRef(build);
  buildRef.current = build;

  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const checkInView = useCallback(() => {
    if (inViewRef.current) {
      return inViewRef.current();
    }
    const el = targetRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || 0;
    return rect.top < 0.9 * windowHeight && rect.bottom > 0;
  }, [targetRef]);

  const play = useCallback(() => {
    if (!isRevealedRef.current && targetRef.current) {
      isRevealedRef.current = true;
      if (timelineRef.current) {
        timelineRef.current.restart(true);
      }
    }
  }, [targetRef]);

  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el || !buildRef.current) return;
      const tl = buildRef.current(el);
      timelineRef.current = tl;
      if (isRevealedRef.current) {
        tl.restart(true);
      }
      return () => {
        tl?.kill();
        timelineRef.current = null;
      };
    },
    { scope: targetRef, dependencies: [mode, start, ...deps] }
  );

  useEffect(() => {
    if (mode === 'manual') return;

    let triggerInstance = null;
    let animationFrameId = 0;

    const cancelReveal = whenRevealed(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        isRevealedRef.current = true;
        if (timelineRef.current) {
          timelineRef.current.progress(1);
        }
        return;
      }

      if (mode === 'hero' || checkInView()) {
        play();
      } else {
        animationFrameId = requestAnimationFrame(() => {
          if (targetRef.current) {
            if (checkInView()) {
              play();
              return;
            }
            triggerInstance = ScrollTrigger.create({
              trigger: targetRef.current,
              start,
              once: true,
              onEnter: play,
            });

            if (!isRefreshScheduled) {
              isRefreshScheduled = true;
              requestAnimationFrame(() => {
                isRefreshScheduled = false;
                perfLog(`ScrollTrigger.refresh (${ScrollTrigger.getAll().length} triggers)`, () =>
                  ScrollTrigger.refresh()
                );
              });
            }
          }
        });
      }
    });

    return () => {
      cancelReveal();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      triggerInstance?.kill();
    };
  }, [whenRevealed, mode, start, checkInView, play, targetRef]);

  return { play, reveal: play };
}

