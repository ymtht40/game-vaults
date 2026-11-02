'use client';

// Variable Mapping: e -> caption, s -> options, i -> count, o -> min, c -> max, u -> initialValue, m -> containerRef, d -> itemsRef, f -> replayRef, g -> staggerValue, p -> setStaggerValue, h -> reducedMotion, x -> setReducedMotion, b -> contextSafe, v -> runStagger

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'; // NOTE: module id: 949656

gsap.registerPlugin(useGSAP);

// NOTE: module id: 322240
export default function StaggerDemo({ caption, options = {} }) {
  const count = options.count || 8;
  const min = options.min ?? 0;
  const max = options.max ?? 0.15;
  const initialValue = options.value ?? 0.06;

  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const replayRef = useRef(null);

  const [staggerValue, setStaggerValue] = useState(initialValue);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const onChange = (event) => setReducedMotion(event.matches);
    mediaQuery.addEventListener?.('change', onChange);
    return () => mediaQuery.removeEventListener?.('change', onChange);
  }, []);

  const { contextSafe } = useGSAP(() => {}, { scope: containerRef });

  const runStagger = contextSafe((staggerAmount) => {
    const targets = itemsRef.current.filter(Boolean);
    if (targets.length) {
      if (reducedMotion) {
        gsap.set(targets, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        targets,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'expo.out',
          stagger: staggerAmount,
          overwrite: true,
          force3D: true,
        }
      );
    }
  });

  replayRef.current = () => runStagger(staggerValue);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const targets = itemsRef.current.filter(Boolean);
    gsap.set(targets, {
      y: 28 * !reducedMotion,
      opacity: +!!reducedMotion,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          runStagger(staggerValue);
          observer.disconnect();
        }
      },
      { rootMargin: '-10% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <figure ref={containerRef} className="not-prose my-12 flex flex-col gap-12">
      {caption ? (
        <figcaption className="text-mono-sm text-foreground-muted">
          {caption}
        </figcaption>
      ) : null}
      <div
        aria-label={`Stagger of ${count} elements`}
        className="relative border border-foreground/12 bg-surface px-24 py-32 lg:px-32"
      >
        <button
          type="button"
          onClick={() => runStagger(staggerValue)}
          aria-label="Replay the stagger"
          className="absolute right-12 top-12 z-10 inline-flex size-28 items-center justify-center text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50"
        >
          <ArrowCounterClockwiseIcon className="size-16" />
        </button>
        <div className="flex items-end justify-center gap-8 pb-32">
          {Array.from({ length: count }).map((_, index) => (
            <span
              key={index}
              ref={(el) => (itemsRef.current[index] = el)}
              aria-hidden="true"
              className="block size-24 shrink-0 bg-brand"
            />
          ))}
        </div>
        <div className="flex items-center gap-16">
          <span className="text-mono-sm shrink-0 text-foreground-muted">
            stagger
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step={0.01}
            value={staggerValue}
            onChange={(event) => {
              const nextValue = parseFloat(event.target.value);
              setStaggerValue(nextValue);
              runStagger(nextValue);
            }}
            aria-label="Stagger amount in seconds"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-none bg-foreground/15 accent-brand"
          />
          <span className="text-mono-sm w-[52px] shrink-0 text-right tabular-nums text-foreground">
            {staggerValue.toFixed(2)}s
          </span>
        </div>
      </div>
    </figure>
  );
}
