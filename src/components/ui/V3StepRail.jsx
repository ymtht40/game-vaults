'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
// UNRESOLVED: cn is a usage-based name for the class-name helper.

/* Variable Mapping:
 * n -> gridColumns, s -> arcPath, i -> arcSegments,
 * props e/o -> steps/className, c/d -> activeIndex/setActiveIndex, u -> railId, h -> railRef,
 * effect e/t/a/l -> rail/mediaQuery/observer/updateObserver,
 * observer setup l/r -> items/intersectionRatios,
 * map e/a/r/n/o -> title/body/Icon/index/isActive
 */
const gridColumns = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
};
const arcPath = 'M 1 100 A 99 99 0 0 1 199 100';
const arcSegments = ['M 100 1 A 99 99 0 0 0 1 100', 'M 100 1 A 99 99 0 0 1 199 100'];

// NOTE: module id: 838507
export default function V3StepRail({ steps = [], className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const railId = useId().replace(/:/g, '');
  const railRef = useRef(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    let observer = null;

    const updateObserver = () => {
      observer?.disconnect();
      observer = null;
      if (!mediaQuery.matches) return;

      const items = [...rail.children];
      const intersectionRatios = new Map();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => intersectionRatios.set(entry.target, entry.intersectionRatio));
          const index = items.findIndex((item) => (intersectionRatios.get(item) ?? 0) >= 0.6);
          if (index >= 0) setActiveIndex(index);
        },
        { root: rail, threshold: 0.6 },
      );
      items.forEach((item) => observer.observe(item));
    };

    updateObserver();
    mediaQuery.addEventListener('change', updateObserver);
    return () => {
      observer?.disconnect();
      mediaQuery.removeEventListener('change', updateObserver);
    };
  }, [steps.length]);

  return (
    <ol
      ref={railRef}
      className={cn(
        'v3-rail grid grid-cols-1 gap-y-48 [--rail-gap:0px] [--rail-item:78%] sm:grid-cols-2 sm:[--rail-item:46%]',
        gridColumns[steps.length],
        className,
      )}
    >
      {steps.map(({ title, body, icon: Icon }, index) => {
        const isActive = index === activeIndex;

        return (
          <li
            key={title}
            data-active={isActive ? 'true' : undefined}
            onPointerEnter={() => setActiveIndex(index)}
            className="group flex flex-col border-l border-dashed border-foreground/20 px-16 lg:px-20"
          >
            <div className="flex items-center gap-8">
              <span className="text-body-sm tabular-nums text-foreground-muted">
                {String(index + 1).padStart(2, '0')}{'.'}
              </span>
              <h3 className="text-body-sm font-medium text-foreground">{title}</h3>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-14 scale-0 text-brand transition-transform duration-300 ease-(--ease-drift) group-data-[active=true]:scale-100 motion-reduce:transition-none"
              />
            </div>
            {body ? (
              <p className="text-body-sm mt-8 max-w-[30ch] text-foreground-muted">{body}</p>
            ) : null}
            <div className="relative mt-auto -mx-16 w-[calc(100%+32px)] self-center pt-56 lg:-mx-20 lg:w-[calc(100%+40px)]">
              <div className="relative">
                <svg
                  viewBox="0 0 200 102"
                  className="block h-auto w-full overflow-visible"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={`arc-fill-${railId}-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopOpacity="0.16" className="[stop-color:var(--brand)]" />
                      <stop offset="1" stopOpacity="0" className="[stop-color:var(--brand)]" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${arcPath} Z`}
                    fill={`url(#arc-fill-${railId}-${index})`}
                    className="opacity-0 transition-opacity duration-500 ease-(--ease-drift) group-data-[active=true]:opacity-100 motion-reduce:transition-none"
                  />
                  <path
                    d={arcPath}
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="1.5 4"
                    vectorEffect="non-scaling-stroke"
                    className="text-foreground/30"
                  />
                  {arcSegments.map((segment) => (
                    <path
                      key={segment}
                      d={segment}
                      fill="none"
                      strokeWidth="1.25"
                      pathLength="1"
                      strokeDasharray="1"
                      style={{ strokeDashoffset: +!isActive }}
                      className="stroke-brand transition-[stroke-dashoffset] duration-500 ease-(--ease-drift) motion-reduce:transition-none"
                    />
                  ))}
                  <rect
                    x="0"
                    y="99"
                    width="3"
                    height="3"
                    className={isActive ? 'fill-brand' : 'fill-foreground/40'}
                  />
                  <rect
                    x="197"
                    y="99"
                    width="3"
                    height="3"
                    className={isActive ? 'fill-brand' : 'fill-foreground/40'}
                  />
                </svg>
                <span className="absolute top-0 left-1/2 flex size-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-foreground/20 bg-background text-foreground-muted transition-colors duration-300 ease-(--ease-drift) group-data-[active=true]:text-brand">
                  {Icon ? <Icon className="size-16" aria-hidden="true" /> : null}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
