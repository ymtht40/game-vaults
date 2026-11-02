'use client';

// Variable Mapping: o -> STAGGER_BY_MODE, e -> caption, s -> options, c -> text, u -> modes, d -> containerRef, m -> textRef, f -> splitInstanceRef, g -> replayRef, p -> activeMode, h -> setActiveMode, x -> reducedMotion, b -> setReducedMotion, v -> contextSafe, A -> runReveal

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { SplitText } from 'gsap/SplitText'; // NOTE: module id: 875324
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'; // NOTE: module id: 949656

gsap.registerPlugin(useGSAP, SplitText);

const STAGGER_BY_MODE = {
  chars: 0.012,
  words: 0.06,
  lines: 0.12,
};

// NOTE: module id: 375403
export default function SplitTextReveal({ caption, options = {} }) {
  const text = options.text || 'Ship award-grade motion';
  const modes =
    Array.isArray(options.modes) && options.modes.length
      ? options.modes
      : ['chars', 'words', 'lines'];

  const containerRef = useRef(null);
  const textRef = useRef(null);
  const splitInstanceRef = useRef(null);
  const replayRef = useRef(null);

  const [activeMode, setActiveMode] = useState(modes[0]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const onChange = (event) => setReducedMotion(event.matches);
    mediaQuery.addEventListener?.('change', onChange);
    return () => mediaQuery.removeEventListener?.('change', onChange);
  }, []);

  const { contextSafe } = useGSAP(() => {}, { scope: containerRef });

  const runReveal = contextSafe((mode) => {
    const target = textRef.current;
    if (!target) return;

    splitInstanceRef.current?.revert();

    if (reducedMotion) {
      gsap.set(target, { opacity: 1 });
      return;
    }

    const split = new SplitText(target, {
      type: mode,
      linesClass: 'overflow-hidden',
    });
    splitInstanceRef.current = split;

    const elements = split[mode] || [];
    gsap.set(target, { opacity: 1 });
    gsap.from(elements, {
      yPercent: 100,
      opacity: 0,
      duration: 0.6,
      ease: 'expo.out',
      stagger: STAGGER_BY_MODE[mode] ?? 0.04,
      force3D: true,
    });
  });

  replayRef.current = () => runReveal(activeMode);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          runReveal(activeMode);
          observer.disconnect();
        }
      },
      { rootMargin: '-10% 0px' }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      splitInstanceRef.current?.revert();
    };
  }, [reducedMotion]);

  return (
    <figure ref={containerRef} className="not-prose my-12 flex flex-col gap-12">
      {caption ? (
        <figcaption className="text-mono-sm text-foreground-muted">
          {caption}
        </figcaption>
      ) : null}
      <div
        aria-label={`SplitText reveal by ${activeMode}`}
        className="relative border border-foreground/12 bg-surface px-24 py-40 lg:px-32"
      >
        <button
          type="button"
          onClick={() => runReveal(activeMode)}
          aria-label="Replay the reveal"
          className="absolute right-12 top-12 z-10 inline-flex size-28 items-center justify-center text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50"
        >
          <ArrowCounterClockwiseIcon className="size-16" />
        </button>
        <p
          ref={textRef}
          className="text-h4 m-0 mb-32 text-center font-medium text-foreground"
        >
          {text}
        </p>
        <div className="flex items-center justify-center gap-4">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setActiveMode(mode);
                runReveal(mode);
              }}
              data-active={mode === activeMode ? 'true' : undefined}
              className="text-mono-sm border border-foreground/15 px-12 py-6 text-foreground-muted transition-colors hover:text-foreground data-[active=true]:border-brand data-[active=true]:bg-brand data-[active=true]:text-white"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </figure>
  );
}
