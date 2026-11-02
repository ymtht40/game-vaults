'use client';

// Variable Mapping: e -> caption, i -> options, u -> smoothing, o -> containerRef, c -> previewTrackRef, d -> previewBoxRef, f -> sliderTrackRef, m -> sliderHandleRef, h -> quickToXRef, p -> draggableRef, g -> sweepTweenRef, x -> progress, b -> setProgress, v -> reducedMotion, A -> setReducedMotion, w -> getMaxSliderTravel, y -> applyPreviewPosition, j -> runSweepRef

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { Draggable } from 'gsap/Draggable'; // NOTE: module id: 919619
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'; // NOTE: module id: 949656

gsap.registerPlugin(useGSAP, Draggable);

// NOTE: module id: 446416
export default function ScrubDemo({ caption, options = {} }) {
  const smoothing = options.smoothing ?? 0.4;

  const containerRef = useRef(null);
  const previewTrackRef = useRef(null);
  const previewBoxRef = useRef(null);
  const sliderTrackRef = useRef(null);
  const sliderHandleRef = useRef(null);
  const quickToXRef = useRef(null);
  const draggableRef = useRef(null);
  const sweepTweenRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  function getMaxSliderTravel() {
    const track = sliderTrackRef.current;
    const handle = sliderHandleRef.current;
    return track && handle
      ? Math.max(1, track.clientWidth - handle.offsetWidth)
      : 1;
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const onChange = (event) => setReducedMotion(event.matches);
    mediaQuery.addEventListener?.('change', onChange);
    return () => mediaQuery.removeEventListener?.('change', onChange);
  }, []);

  const applyPreviewPosition = (percent) => {
    const track = previewTrackRef.current;
    const box = previewBoxRef.current;
    const maxPreviewTravel =
      !track || !box ? 0 : Math.max(0, track.clientWidth - box.offsetWidth);
    return quickToXRef.current?.((maxPreviewTravel * percent) / 100);
  };

  const runSweepRef = useRef(null);

  useGSAP(
    () => {
      quickToXRef.current = gsap.quickTo(previewBoxRef.current, 'x', {
        duration: reducedMotion ? 0 : smoothing,
        ease: 'power3',
      });
      quickToXRef.current?.(0);
      gsap.set(sliderHandleRef.current, { x: 0 });

      draggableRef.current?.[0]?.kill();
      draggableRef.current = Draggable.create(sliderHandleRef.current, {
        type: 'x',
        bounds: sliderTrackRef.current,
        inertia: false,
        onPress() {
          sweepTweenRef.current?.kill();
          this.update();
        },
        onDrag() {
          const nextPercent = gsap.utils.clamp(
            0,
            100,
            (this.x / getMaxSliderTravel()) * 100
          );
          setProgress(nextPercent);
          applyPreviewPosition(nextPercent);
        },
      });

      runSweepRef.current = () => {
        sweepTweenRef.current?.kill();
        if (reducedMotion) {
          setProgress(0);
          applyPreviewPosition(0);
          return;
        }
        const proxy = { p: 0 };
        setProgress(0);
        gsap.set(sliderHandleRef.current, { x: 0 });
        applyPreviewPosition(0);

        sweepTweenRef.current = gsap.to(proxy, {
          p: 100,
          duration: 1.3,
          ease: 'power1.inOut',
          onUpdate: () => {
            setProgress(proxy.p);
            gsap.set(sliderHandleRef.current, {
              x: (getMaxSliderTravel() * proxy.p) / 100,
            });
            applyPreviewPosition(proxy.p);
          },
          onComplete: () => draggableRef.current?.[0]?.update(),
        });
      };
    },
    { scope: containerRef, dependencies: [reducedMotion, smoothing] }
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          runSweepRef.current?.();
          observer.disconnect();
        }
      },
      { rootMargin: '-10% 0px' }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      sweepTweenRef.current?.kill();
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
        aria-label="Scrub - drag the handle to advance the animation both ways"
        className="relative border border-foreground/12 bg-surface px-24 py-32 lg:px-32"
      >
        <button
          type="button"
          onClick={() => runSweepRef.current?.()}
          aria-label="Replay the scrub sweep"
          className="absolute right-12 top-12 z-10 inline-flex size-28 items-center justify-center text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50"
        >
          <ArrowCounterClockwiseIcon className="size-16" />
        </button>
        <div
          ref={previewTrackRef}
          className="relative mb-32 flex h-24 items-center overflow-visible"
        >
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-foreground/12"
          />
          <span
            ref={previewBoxRef}
            aria-hidden="true"
            className="relative z-10 block size-24 shrink-0 bg-brand"
          />
        </div>
        <div className="flex items-center gap-16">
          <span className="text-mono-sm shrink-0 text-foreground-muted">
            scroll
          </span>
          <div ref={sliderTrackRef} className="relative h-24 flex-1">
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-foreground/15"
            />
            <div
              ref={sliderHandleRef}
              role="slider"
              tabIndex={0}
              aria-label="Scroll position"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 10 : 2;
                let nextPercent = null;
                if (
                  event.key === 'ArrowRight' ||
                  event.key === 'ArrowUp'
                ) {
                  nextPercent = progress + step;
                }
                if (
                  event.key === 'ArrowLeft' ||
                  event.key === 'ArrowDown'
                ) {
                  nextPercent = progress - step;
                }
                if (nextPercent != null) {
                  event.preventDefault();
                  sweepTweenRef.current?.kill();
                  nextPercent = gsap.utils.clamp(0, 100, nextPercent);
                  setProgress(nextPercent);
                  gsap.set(sliderHandleRef.current, {
                    x: (getMaxSliderTravel() * nextPercent) / 100,
                  });
                  draggableRef.current?.[0]?.update();
                  applyPreviewPosition(nextPercent);
                }
              }}
              className="absolute left-0 top-1/2 -mt-8 flex h-16 cursor-grab touch-none select-none items-center gap-6 active:cursor-grabbing focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className="h-0 w-0 border-y-4 border-r-6 border-y-transparent border-r-current text-foreground-muted"
              />
              <span
                aria-hidden="true"
                className="block size-16 rounded-full bg-brand ring-2 ring-surface"
              />
              <span
                aria-hidden="true"
                className="h-0 w-0 border-y-4 border-l-6 border-y-transparent border-l-current text-foreground-muted"
              />
            </div>
          </div>
          <span className="text-mono-sm w-[44px] shrink-0 text-right tabular-nums text-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </figure>
  );
}
