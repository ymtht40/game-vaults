'use client';

// Variable Mapping: e -> caption, s -> options, l -> easeName, o -> duration, c -> containerRef, u -> dotRectRef, f -> scanLineRef, d -> previewDotRef, m -> timelineRef, h -> buildTimelineRef, x -> reducedMotion, p -> setReducedMotion, g -> easeFn, b -> lo, v -> hi, A -> projectY, y -> svgPathData, E -> gridSteps, k -> contextSafe

import { useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { CustomEase } from 'gsap/CustomEase'; // NOTE: module id: 563208
import { CustomBounce } from 'gsap/CustomBounce'; // NOTE: module id: 885067
import { RoughEase, SlowMo } from 'gsap/EasePack'; // NOTE: module id: 757760
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';

gsap.registerPlugin(useGSAP, CustomEase, CustomBounce, RoughEase, SlowMo);

function formatEaseLabel(input) {
  const trimmed = String(input).trim();
  if (/^m[\s\d.,-]/i.test(trimmed)) return 'custom ease';
  const baseName = trimmed.replace(/\(.*\)/, '').trim();
  return baseName === 'none' || baseName === 'linear' ? 'linear' : baseName;
}

// NOTE: module id: 576142
export default function EasingGraph({ caption, options = {} }) {
  const easeName =
    options.ease ||
    (Array.isArray(options.eases) && options.eases[0]) ||
    'expo.out';
  const duration = options.duration || 0.8;

  const containerRef = useRef(null);
  const dotRectRef = useRef(null);
  const scanLineRef = useRef(null);
  const previewDotRef = useRef(null);
  const timelineRef = useRef(null);
  const buildTimelineRef = useRef(null);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const onChange = (event) => setReducedMotion(event.matches);
    mediaQuery.addEventListener?.('change', onChange);
    return () => mediaQuery.removeEventListener?.('change', onChange);
  }, []);

  const easeFn = useMemo(
    () => gsap.parseEase(easeName) || gsap.parseEase('none'),
    [easeName]
  );

  const { lo, hi } = useMemo(() => {
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let step = 0; step <= 64; step++) {
      const val = easeFn(step / 64);
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    }
    const padding = Math.max(0.06, (maxVal - minVal) * 0.12);
    return {
      lo: Math.min(-0.12, minVal - padding),
      hi: Math.max(1.12, maxVal + padding),
    };
  }, [easeFn]);

  const projectY = (val) => 94 - ((val - lo) / (hi - lo)) * 88;

  const svgPathData = useMemo(() => {
    let dStr = '';
    for (let step = 0; step <= 64; step++) {
      const progress = step / 64;
      dStr += `${step === 0 ? 'M' : 'L'}${(100 * progress).toFixed(2)} ${projectY(easeFn(progress)).toFixed(2)} `;
    }
    return dStr.trim();
  }, [easeFn, lo, hi]);

  const gridSteps = useMemo(
    () => Array.from({ length: 9 }, (_, index) => (100 * index) / 8),
    []
  );

  const { contextSafe } = useGSAP(() => {}, { scope: containerRef });

  buildTimelineRef.current = contextSafe(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;

    const applyProgress = (progress) => {
      const xPos = 100 * progress;
      const yPos = projectY(easeFn(progress));
      dotRectRef.current?.setAttribute('x', (xPos - 2.1).toFixed(2));
      dotRectRef.current?.setAttribute('y', (yPos - 2.1).toFixed(2));
      scanLineRef.current?.setAttribute('x1', xPos.toFixed(2));
      scanLineRef.current?.setAttribute('x2', xPos.toFixed(2));
      if (previewDotRef.current) {
        previewDotRef.current.style.top = `${yPos.toFixed(2)}%`;
      }
    };

    if (reducedMotion) {
      applyProgress(1);
      return;
    }

    const playhead = { t: 0 };
    applyProgress(0);

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.6,
      paused: true,
    });

    tl.to(playhead, {
      t: 1,
      duration,
      ease: 'none',
      onUpdate: () => applyProgress(playhead.t),
    });

    timelineRef.current = tl;
  });

  useEffect(() => {
    buildTimelineRef.current?.();
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (timelineRef.current) {
          if (entry?.isIntersecting) {
            timelineRef.current.play();
          } else {
            timelineRef.current.pause();
          }
        }
      },
      { rootMargin: '0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, easeName]);

  return (
    <figure ref={containerRef} className="not-prose my-12 flex flex-col gap-12">
      {caption ? (
        <figcaption className="text-mono-sm text-foreground-muted">
          {caption}
        </figcaption>
      ) : null}
      <div
        aria-label={`Easing graph for ${formatEaseLabel(easeName)}`}
        className="relative border border-foreground/12 bg-surface px-24 py-32 lg:px-32"
      >
        <button
          type="button"
          onClick={() => {
            buildTimelineRef.current?.();
            timelineRef.current?.restart(true);
          }}
          aria-label="Replay the graph"
          className="absolute right-12 top-12 z-10 inline-flex size-28 items-center justify-center text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50"
        >
          <ArrowCounterClockwiseIcon className="size-16" />
        </button>
        <div className="mx-auto flex h-[min(300px,70vw)] items-stretch justify-center gap-16">
          <div className="aspect-square h-full">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="block h-full w-full overflow-visible"
            >
              {gridSteps.map((step) => (
                <line
                  key={`v${step}`}
                  x1={step}
                  y1={0}
                  x2={step}
                  y2={100}
                  className="stroke-foreground/10"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {gridSteps.map((step) => (
                <line
                  key={`h${step}`}
                  x1={0}
                  y1={step}
                  x2={100}
                  y2={step}
                  className="stroke-foreground/10"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <line
                x1={0}
                y1={projectY(0)}
                x2={100}
                y2={projectY(1)}
                className="stroke-foreground/20"
                strokeWidth={1}
                strokeDasharray="2 3"
                vectorEffect="non-scaling-stroke"
              />
              <line
                ref={scanLineRef}
                x1={0}
                y1={0}
                x2={0}
                y2={100}
                className="stroke-foreground/20"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={svgPathData}
                fill="none"
                className="stroke-brand"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                ref={dotRectRef}
                x={-4.2}
                y={projectY(0) - 2.1}
                width={4.2}
                height={4.2}
                className="fill-brand"
              />
            </svg>
          </div>
          <div className="relative h-full w-12 shrink-0">
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 top-0 -ml-px w-px bg-foreground/15"
            />
            <span
              ref={previewDotRef}
              aria-hidden="true"
              className="absolute left-1/2 -ml-5 -mt-5 block size-10 bg-brand"
              style={{ top: `${projectY(0)}%` }}
            />
          </div>
        </div>
      </div>
    </figure>
  );
}
