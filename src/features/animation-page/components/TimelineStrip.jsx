'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Repeat } from '@phosphor-icons/react';

import { gsap, useGSAP } from '@/libs/utils/vendor';
import { cx } from '@/libs/utils/className';
import { analytics } from '@/libs/analytics/posthogAnalytics';
import {
  pricingConfig,
  formatMonthlyPrice,
} from '@/libs/data/pricing';

import Button from '@/components/ui/Button'; // module id: 687989
import { CaretDown } from '@phosphor-icons/react'; // module id: 815330
import LearnConceptLink from '@/features/animation-page/components/LearnConceptLink'; // module id: 506935
import TimelineRow from '@/features/animation-page/components/TimelineRow'; // module id: 444230
import TimelineRowTooltip from '@/features/animation-page/components/TimelineRowTooltip'; // module id: 444230

function getTimelineConcepts(rows, axis) {
  const concepts = [
    {
      category: 'timeline',
      slug: 'gsap-timeline',
      label: 'Timelines',
    },
  ];

  if (rows.some((row) => row.staggerSpread > 0)) {
    concepts.push({
      category: 'timeline',
      slug: 'stagger',
      label: 'Stagger',
    });
  }

  if (rows.some((row) => row.kind === 'nested')) {
    concepts.push({
      category: 'timeline',
      slug: 'nested-timelines',
      label: 'Nested timelines',
    });
  }

  if (axis === 'scroll') {
    concepts.push({
      category: 'scroll',
      slug: 'scrolltrigger',
      label: 'ScrollTrigger',
    });

    if (rows.some((row) => row.kind === 'scrub')) {
      concepts.push({
        category: 'scroll',
        slug: 'scrub',
        label: 'Scrub',
      });
    }
  }

  return concepts;
}

export default function TimelineStrip({
  animation,
  hasAccess = false,
  className = '',
}) {
  const [rows, setRows] = useState(null);
  const [isIdle, setIsIdle] = useState(false);
  const [axis, setAxis] = useState('time');
  const [cycleDuration, setCycleDuration] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const playheadRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const barRefs = useRef([]);
  const previewWindowRef = useRef(null);
  const rowsRef = useRef(null);
  const axisRef = useRef('time');
  const isScrubbingRef = useRef(false);
  const lastScrubAtRef = useRef(0);
  const tooltipTimerRef = useRef(null);
  const lastTooltipLeaveAtRef = useRef(0);
  const hasAnimatedRef = useRef(false);
  const hasTrackedRef = useRef(false);

  const cacheKey = animation?.slug
    ? `anm-tl-${animation.slug}`
    : null;

  function hideTooltip() {
    clearTimeout(tooltipTimerRef.current);
    lastTooltipLeaveAtRef.current = Date.now();
    setTooltip(null);
  }

  function highlightRow(index) {
    try {
      previewWindowRef.current?.postMessage(
        {
          type: 'anm:timeline:highlight',
          index,
        },
        '*',
      );
    } catch {}
  }

  function togglePlayPause() {
    setIsPlaying((playing) => !playing);

    try {
      previewWindowRef.current?.postMessage(
        { type: 'anm:timeline:playpause' },
        '*',
      );
    } catch {}
  }

  function scrubTo(clientX, element) {
    lastScrubAtRef.current = Date.now();

    const bounds = element.getBoundingClientRect();

    const progress = Math.max(
      0,
      Math.min((clientX - bounds.left) / bounds.width, 1),
    );

    const playhead = playheadRef.current;

    if (playhead) {
      playhead.style.setProperty('--tl-p', String(progress));
      playhead.style.opacity = '1';
    }

    try {
      previewWindowRef.current?.postMessage(
        {
          type: 'anm:timeline:scrub',
          progress,
        },
        '*',
      );
    } catch {}
  }

  useEffect(() => {
    if (!cacheKey || rowsRef.current) {
      return;
    }

    try {
      const cached = JSON.parse(
        localStorage.getItem(cacheKey) || 'null',
      );

      if (
        cached
        && Array.isArray(cached.rows)
        && cached.rows.length >= 2
      ) {
        rowsRef.current = cached.rows;
        axisRef.current = cached.axis === 'scroll' ? 'scroll' : 'time';

        setRows(cached.rows);
        setAxis(axisRef.current);
      }
    } catch {}
  }, [cacheKey]);

  useEffect(() => {
    function requestTimelineRows() {
      document.querySelectorAll('iframe').forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage(
            { type: 'anm:timeline:resend' },
            '*',
          );
        } catch {}
      });
    }

    requestTimelineRows();

    const resendTimer = setTimeout(requestTimelineRows, 800);

    return () => clearTimeout(resendTimer);
  }, []);

  useEffect(() => {
    function handleMessage(event) {
      const data = event?.data;

      if (
        !data
        || typeof data !== 'object'
        || event.source === window
      ) {
        return;
      }

      if (data.type === 'anm:timeline:idle') {
        previewWindowRef.current = event.source;

        if (!rowsRef.current) {
          setIsIdle(true);
        }

        return;
      }

      if (data.type === 'anm:timeline:rows') {
        if (Array.isArray(data.rows) && data.rows.length >= 2) {
          previewWindowRef.current = event.source;
          setIsIdle(false);

          rowsRef.current = data.rows;
          axisRef.current = data.axis === 'scroll' ? 'scroll' : 'time';

          setRows(data.rows);
          setAxis(axisRef.current);

          setCycleDuration(
            typeof data.cycle === 'number' && data.cycle > 0
              ? data.cycle
              : null,
          );

          clearTimeout(tooltipTimerRef.current);
          setTooltip(null);

          if (cacheKey) {
            try {
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  axis: data.axis,
                  rows: data.rows.map(
                    ({ full: omittedDetails, ...summary }) => summary,
                  ),
                }),
              );
            } catch {}
          }

          if (!hasTrackedRef.current) {
            hasTrackedRef.current = true;

            analytics.track('timeline_viewed', {
              animation_slug: animation?.slug,
              axis: data.axis,
              rows: data.rows.length,
            });
          }
        }

        return;
      }

      if (data.type === 'anm:timeline:playhead') {
        previewWindowRef.current = event.source;

        if (
          isScrubbingRef.current
          || Date.now() - lastScrubAtRef.current < 200
        ) {
          return;
        }

        const playhead = playheadRef.current;

        if (!playhead) {
          return;
        }

        const progress = Math.max(
          0,
          Math.min(Number(data.progress) || 0, 1),
        );

        playhead.style.setProperty('--tl-p', String(progress));

        setIsPlaying((playing) => (
          playing === Boolean(data.active)
            ? playing
            : Boolean(data.active)
        ));

        const isVisible = (
          axisRef.current === 'scroll'
          || data.active
        );

        playhead.style.opacity = isVisible ? '1' : '0';

        const currentRows = rowsRef.current || [];

        for (let index = 0; index < currentRows.length; index++) {
          const bar = barRefs.current[index];

          if (!bar) {
            continue;
          }

          const row = currentRows[index];

          if (
            isVisible
            && progress >= row.start
            && progress <= row.start + row.width
          ) {
            bar.setAttribute('data-active', 'true');
          } else {
            bar.removeAttribute('data-active');
          }
        }
      }
    }

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useGSAP(() => {
    if (!rows || hasAnimatedRef.current) {
      return;
    }

    hasAnimatedRef.current = true;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const bars = barRefs.current.filter(Boolean);

    if (bars.length) {
      gsap.fromTo(
        bars,
        {
          scaleX: 0,
          transformOrigin: 'left center',
        },
        {
          scaleX: 1,
          duration: 0.9,
          stagger: 0.07,
          ease: 'expo.out',
          force3D: true,
        },
      );
    }
  }, {
    dependencies: [rows],
  });

  useEffect(() => (
    () => clearTimeout(tooltipTimerRef.current)
  ), []);

  useEffect(() => {
    if (!rows || axis === 'scroll' || !hasAccess) {
      return;
    }

    function handleKeyDown(event) {
      if (
        event.code !== 'Space'
        || event.repeat
        || event.target.closest?.(
          'input, textarea, select, [contenteditable]',
        )
      ) {
        return;
      }

      event.preventDefault();
      togglePlayPause();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rows, axis, hasAccess]);

  if (!rows && !isIdle) {
    return null;
  }

  const visibilityClass = isExpanded
    ? 'block'
    : 'hidden lg:block';

  if (!rows) {
    return (
      <section
        className={cx('flex flex-col', className)}
        data-timeline-strip
      >
        <button
          type="button"
          className="lg:hidden mt-12 flex items-center justify-between border border-foreground/10 px-16 py-12 text-body-sm text-foreground"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
        >
          <span>Timeline</span>

          <CaretDown
            className={cx(
              'size-14 transition-transform duration-(--duration-quick) ease-(--ease-expo-out)',
              isExpanded && 'rotate-180',
            )}
          />
        </button>

        <div className={cx(visibilityClass, 'lg:mt-12')}>
          <div className="border border-foreground/10">
            <div className="relative h-24 border-b border-foreground/10">
              <span className="absolute left-0 top-0 flex h-full items-center pl-8">
                <span className="text-accent-2xs text-foreground-muted">
                  Timeline
                </span>
              </span>

              {Array.from({ length: 11 }, (unused, index) => (
                <span
                  key={index}
                  className="pointer-events-none absolute bottom-0 h-8 w-px bg-foreground/10"
                  style={{ left: `${10 * index}%` }}
                />
              ))}
            </div>

            <div
              className="flex items-center px-12"
              style={{ height: 56 }}
            >
              <p className="text-body-sm text-foreground-muted">
                Interact with the preview to capture its timeline.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hoveredRow = tooltip ? rows[tooltip.index] : null;
  const visibleRows = hasAccess ? rows : rows.slice(0, 1);
  const gatedRows = hasAccess ? [] : rows.slice(1, 3);

  const monthlyPrice = formatMonthlyPrice(
    pricingConfig.stripe?.landingPlans
      ?.find((plan) => plan.key === 'solo')
      ?.quarterly,
  );

  return (
    <section
      className={cx('flex flex-col', className)}
      data-timeline-strip
    >
      <button
        type="button"
        className="lg:hidden mt-12 flex items-center justify-between border border-foreground/10 px-16 py-12 text-body-sm text-foreground"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
      >
        <span>Timeline</span>

        <CaretDown
          className={cx(
            'size-14 transition-transform duration-(--duration-quick) ease-(--ease-expo-out)',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      <div className={cx(visibilityClass, 'lg:mt-12')}>
        <div className="border border-foreground/10">
          <div className="relative">
            {hoveredRow && (
              <div
                className="absolute z-30 -translate-y-full"
                style={{
                  left: `${Math.min(100 * hoveredRow.start, 60)}%`,
                  top: (
                    24
                    + 28 * tooltip.index
                    - (scrollContainerRef.current?.scrollTop || 0)
                    - 4
                  ),
                }}
              >
                <TimelineRowTooltip
                  row={hoveredRow}
                  hasAccess={hasAccess}
                />
              </div>
            )}

            <div
              className={cx(
                'relative h-24 touch-none border-b border-foreground/10',
                hasAccess && 'cursor-ew-resize',
              )}
              onPointerDown={hasAccess ? (event) => {
                isScrubbingRef.current = true;

                event.currentTarget.setPointerCapture(event.pointerId);

                scrubTo(event.clientX, event.currentTarget);
              } : undefined}
              onPointerMove={hasAccess ? (event) => {
                if (isScrubbingRef.current) {
                  scrubTo(event.clientX, event.currentTarget);
                }
              } : undefined}
              onPointerUp={hasAccess ? () => {
                isScrubbingRef.current = false;
              } : undefined}
              onPointerCancel={hasAccess ? () => {
                isScrubbingRef.current = false;
              } : undefined}
            >
              <span className="absolute left-0 top-0 flex h-full items-center gap-8 pl-8">
                {hasAccess && axis !== 'scroll' && (
                  <>
                    <button
                      type="button"
                      aria-label={
                        isPlaying
                          ? 'Pause the animation'
                          : 'Play the animation'
                      }
                      title="Play/pause (Space)"
                      className="pointer-events-auto flex size-18 cursor-pointer items-center justify-center text-foreground-muted transition-colors duration-(--duration-quick) hover:text-foreground"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="size-12" />
                      ) : (
                        <Play className="size-12" />
                      )}
                    </button>

                    <button
                      type="button"
                      aria-label={
                        isLooping
                          ? 'Stop looping'
                          : 'Loop the animation'
                      }
                      aria-pressed={isLooping}
                      title="Loop"
                      className={cx(
                        'pointer-events-auto flex size-18 cursor-pointer items-center justify-center transition-colors duration-(--duration-quick)',
                        isLooping
                          ? 'text-brand'
                          : 'text-foreground-muted hover:text-foreground',
                      )}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => {
                        const nextIsLooping = !isLooping;
                        setIsLooping(nextIsLooping);

                        try {
                          previewWindowRef.current?.postMessage(
                            {
                              type: 'anm:timeline:loop',
                              on: nextIsLooping,
                            },
                            '*',
                          );
                        } catch {}
                      }}
                    >
                      <Repeat className="size-12" />
                    </button>
                  </>
                )}

                <span className="pointer-events-none text-accent-2xs text-foreground-muted">
                  Timeline
                </span>
              </span>

              {Array.from({ length: 11 }, (unused, index) => (
                <span
                  key={index}
                  className="pointer-events-none"
                >
                  <span
                    className="absolute bottom-0 h-8 w-px bg-foreground/10"
                    style={{ left: `${10 * index}%` }}
                  />

                  {index > 0
                    && index < 10
                    && hasAccess
                    && (cycleDuration || axis === 'scroll')
                    && (
                      <span
                        className="absolute bottom-6 -translate-x-1/2 text-accent-2xs text-foreground-muted/60"
                        style={{ left: `${10 * index}%` }}
                      >
                        {axis === 'scroll'
                          ? `${10 * index}%`
                          : `${(cycleDuration * index / 10).toFixed(1)}s`}
                      </span>
                    )}
                </span>
              ))}
            </div>

            <div
              ref={scrollContainerRef}
              className={cx(
                !hasAccess && 'overflow-hidden',
                hasAccess && 'overflow-x-hidden overflow-y-auto',
              )}
              style={hasAccess ? { maxHeight: 140 } : undefined}
            >
              {visibleRows.map((row, index) => (
                <TimelineRow
                  key={`${row.label}-${index}`}
                  row={row}
                  index={index}
                  barRef={(element) => (
                    barRefs.current[index] = element
                  )}
                  onEnter={() => highlightRow(index)}
                  onLeave={() => highlightRow(null)}
                  onBarEnter={() => {
                    clearTimeout(tooltipTimerRef.current);

                    if (
                      Date.now() - lastTooltipLeaveAtRef.current < 300
                    ) {
                      setTooltip({ index });
                    } else {
                      tooltipTimerRef.current = setTimeout(() => {
                        setTooltip({ index });
                      }, 300);
                    }
                  }}
                  onBarLeave={hideTooltip}
                />
              ))}

              {gatedRows.length > 0 && (
                <div className="relative min-h-[132px]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none select-none"
                  >
                    {gatedRows.map((row, index) => (
                      <TimelineRow
                        key={`${row.label}-gated-${index}`}
                        row={row}
                        index={1 + index}
                        barRef={(element) => (
                          barRefs.current[1 + index] = element
                        )}
                        inert
                      />
                    ))}
                  </div>

                  <div
                    className="absolute inset-0 flex flex-col items-start justify-end gap-10 p-12"
                    style={{
                      background: 'linear-gradient(to bottom, color-mix(in srgb, var(--background) 45%, transparent) 0%, var(--background) 55%)',
                    }}
                  >
                    <p className="text-body-sm text-foreground">
                      {'Members see every tween'}
                      {rows.length - 1 > 1
                        ? ` - ${rows.length - 1} more in this animation.`
                        : '.'}
                    </p>

                    <Button
                      href={`/checkout?plan=solo&cycle=quarterly${animation?.slug ? `&component=${animation.slug}` : ''}`}
                      onClick={() => {
                        analytics.track('timeline_unlock_clicked', {
                          animation_slug: animation?.slug,
                        });
                      }}
                      theme="surface"
                      size="xs"
                    >
                      {monthlyPrice
                        ? `Unlock everything - €${monthlyPrice}/mo`
                        : 'Unlock everything'}
                    </Button>

                    <p className="text-accent-xs text-foreground-muted">
                      Cancel anytime · 14-day money-back
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              ref={playheadRef}
              className="pointer-events-none absolute inset-0 transition-opacity duration-(--duration-quick)"
              style={{
                '--tl-p': 0,
                opacity: 0,
              }}
            >
              <div
                className="absolute inset-y-0 w-px bg-brand"
                style={{
                  left: 'calc(var(--tl-p) * 100%)',
                }}
              >
                <span className="absolute -left-[2.5px] top-0 size-6 bg-brand" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 border-t border-foreground/10 px-12 py-8">
            <span className="mr-8 text-accent-2xs text-foreground-muted">
              Concepts
            </span>

            {getTimelineConcepts(rows, axis).map((concept) => (
              <LearnConceptLink
                key={`${concept.category}/${concept.slug}`}
                category={concept.category}
                slug={concept.slug}
              >
                {concept.label}
              </LearnConceptLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}