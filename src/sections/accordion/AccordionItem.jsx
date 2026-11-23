'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useMultilineScrambleText } from '@/hooks/useMultilineScrambleText';

gsap.registerPlugin(SplitText);

const BUTTON_BASE_CLASS =
  'group flex w-full cursor-pointer items-start justify-between gap-16 border-0 bg-transparent py-24 text-left transition-colors duration-300 lg:items-center';
const BUTTON_OPEN_CLASS = 'text-foreground';
const BUTTON_CLOSED_CLASS = 'text-foreground-muted hover:text-foreground';

function animateParagraph(paragraph, splitInstanceRef, linesTweenRef) {
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
}

function animateContentLines(contentRef, splitInstanceRef, linesTweenRef) {
  const contentEl = contentRef.current;
  if (!contentEl) return;

  contentEl.querySelectorAll('p').forEach((paragraph) => {
    animateParagraph(paragraph, splitInstanceRef, linesTweenRef);
  });
}

function revealContentLines(contentRef, splitInstanceRef, linesTweenRef) {
  document.fonts?.ready.then(() => {
    animateContentLines(contentRef, splitInstanceRef, linesTweenRef);
  });
}

function AccordionIcon({ iconRef, verticalLineRef }) {
  return (
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
  );
}

function AccordionItem({
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

  const buttonClassName = `${BUTTON_BASE_CLASS} ${
    isOpen ? BUTTON_OPEN_CLASS : BUTTON_CLOSED_CLASS
  }`;

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
        0.25 * duration,
      );
    }

    timelineRef.current = tl;

    return function cleanup() {
      tl.kill();
      linesTweenRef.current?.kill();
      splitInstanceRef.current?.revert();
    };
  }, [duration, ease]);

  useEffect(() => {
    if (!timelineRef.current || isOpen === prevIsOpenRef.current) return;

    prevIsOpenRef.current = isOpen;

    if (!isOpen) {
      timelineRef.current.reverse();
      linesTweenRef.current?.kill();
      linesTweenRef.current = null;
      splitInstanceRef.current?.revert();
      splitInstanceRef.current = null;
      return;
    }

    timelineRef.current.play();

    if (isDesktop) {
      scramble();
    }

    if (!isDesktop || !contentRef.current) return;

    const timerId = window.setTimeout(() => {
      revealContentLines(contentRef, splitInstanceRef, linesTweenRef);
    }, 180);

    return function cleanup() {
      window.clearTimeout(timerId);
    };
  }, [isOpen, isDesktop]);

  return (
    <div className="faq-item border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={buttonClassName}
      >
        <span ref={scrambleRef} className="text-body-lg">
          {q}
        </span>
        <AccordionIcon iconRef={iconRef} verticalLineRef={verticalLineRef} />
      </button>
      <div ref={contentRef}>
        <div className="text-body max-w-[96ch] pb-24 text-foreground-muted">
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}

export { AccordionItem };
