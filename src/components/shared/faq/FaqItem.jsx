'use client';

// Variable Mapping: o -> FaqItem, e -> q, n -> a, i -> isOpen, l -> onToggle, u -> isDesktop, d -> duration, h -> ease, f -> contentRef, m -> iconRef, p -> verticalLineRef, g -> timelineRef, x -> splitInstanceRef, y -> linesTweenRef, b -> prevIsOpenRef, w -> scrambleRef, v -> scramble

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useMultilineScrambleText } from '@/hooks/useMultilineScrambleText'; // NOTE: module id: 798851 // UNRESOLVED: name guessed from usage

gsap.registerPlugin(SplitText);

// NOTE: module id: 752362
export function FaqItem({
  q,
  a,
  isOpen,
  onToggle,
  isDesktop,
  duration = 0.8,
  ease = 'expo.inOut',
}) {
  const contentRef = useRef(null);
  const iconRef = useRef(null);
  const verticalLineRef = useRef(null);
  const timelineRef = useRef(null);
  const splitInstanceRef = useRef(null);
  const linesTweenRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  const { ref: scrambleRef, scramble } = useMultilineScrambleText({
    duration: 0.5,
    speed: 1,
    firstColorClass: 'scramble-brand',
    secondColorClass: 'scramble-inherit',
  });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const contentEl = contentRef.current;
    if (!contentEl) return;

    gsap.set(contentEl, { height: 0, overflow: 'hidden', force3D: true });

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration, ease },
    });

    tl.to(contentEl, { height: 'auto', duration, ease }, 0);

    if (iconRef.current) {
      tl.to(iconRef.current, { rotation: -180, duration, ease }, 0);
    }

    if (verticalLineRef.current) {
      tl.to(
        verticalLineRef.current,
        { opacity: 0, duration: 0.5 * duration, ease: 'power2.inOut' },
        0.25 * duration
      );
    }

    timelineRef.current = tl;

    return () => {
      tl.kill();
      linesTweenRef.current?.kill();
      splitInstanceRef.current?.revert();
    };
  }, [duration, ease]);

  useEffect(() => {
    if (timelineRef.current && isOpen !== prevIsOpenRef.current) {
      prevIsOpenRef.current = isOpen;

      if (isOpen) {
        timelineRef.current.play();

        if (isDesktop) {
          scramble();
        }

        if (isDesktop && contentRef.current) {
          const timerId = window.setTimeout(() => {
            document.fonts?.ready.then(() => {
              const contentEl = contentRef.current;
              if (contentEl) {
                contentEl.querySelectorAll('p').forEach((paragraph) => {
                  if (paragraph.querySelector('.faq-split-line')) return;

                  splitInstanceRef.current = SplitText.create(paragraph, {
                    type: 'lines',
                    mask: 'lines',
                    linesClass: 'faq-split-line',
                  });

                  const lines = splitInstanceRef.current.lines;
                  gsap.set(lines, { yPercent: 110, force3D: true });
                  linesTweenRef.current = gsap.to(lines, {
                    yPercent: 0,
                    duration: 0.6,
                    stagger: 0.06,
                    ease: 'expo.out',
                    force3D: true,
                  });
                });
              }
            });
          }, 180);

          return () => window.clearTimeout(timerId);
        }
      } else {
        timelineRef.current.reverse();
        linesTweenRef.current?.kill();
        linesTweenRef.current = null;
        splitInstanceRef.current?.revert();
        splitInstanceRef.current = null;
      }
    }
  }, [isOpen, isDesktop]);

  return (
    <div className="faq-item border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`group flex w-full cursor-pointer items-start justify-between gap-16 border-0 bg-transparent py-24 text-left transition-colors duration-300 lg:items-center ${isOpen ? 'text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
      >
        <span ref={scrambleRef} className="text-body-lg">
          {q}
        </span>
        <svg
          ref={iconRef}
          className="h-12 w-12 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            ref={verticalLineRef}
            d="M8 1V15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          <path
            d="M1 8H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>
      <div ref={contentRef}>
        <div className="text-body max-w-[96ch] pb-24 text-foreground-muted">
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}
