'use client';

import { useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft as CaretLeftIcon, CaretRight as CaretRightIcon } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(CustomEase);
CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1');

const EASE_NAME = 'annnimateInOut';
const ASPECT_RATIO = 1280 / 804;
const TILT_TAN = Math.tan((15 * Math.PI) / 180);
const decaySum = (exponent) => (0.89 * (1 - Math.pow(0.89, exponent))) / (1 - 0.89);
const ABSOLUTE_TRANSFORM_CLASS = 'absolute inset-0 origin-top-left will-change-transform';

/* Variable Mapping:
   d -> containerRef, u -> baseGap, m -> cardRefs, v -> surfaceScaleRefs, y -> titleRefs,
   j -> overlayRefs, w -> scaleTweenRefs, N -> updateCardsRef, M -> syncActiveRef,
   k -> carouselStateRef, z -> router, $ -> repeatedItems, C -> tweenToOffset,
   E -> pointerStateRef, U -> getDragFactor, P -> handlePointerRelease
*/
// NOTE: module id: 619499
export function ShippedCascade({
  items = [],
  fill = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const baseGap = fill ? 16 : 80;
  const cardRefs = useRef([]);
  const surfaceScaleRefs = useRef([]);
  const titleRefs = useRef([]);
  const overlayRefs = useRef([]);
  const scaleTweenRefs = useRef([]);
  const updateCardsRef = useRef(() => {});
  const syncActiveRef = useRef(() => {});
  const carouselStateRef = useRef({
    offset: 0,
    w: 480,
    active: -1,
  });
  const router = useRouter();

  const repeatedItems = useMemo(() => {
    const list = [];
    while (items.length && list.length < 20) {
      list.push(...items);
    }
    return list;
  }, [items]);

  useGSAP(
    () => {
      const state = carouselStateRef.current;
      const count = repeatedItems.length;
      state.active = -1;

      gsap.set(titleRefs.current.filter(Boolean), {
        yPercent: 100,
      });

      scaleTweenRefs.current = Array.from({ length: count }, () => ({
        v: 0,
      }));

      const computeDimensions = () => {
        const container = containerRef.current;
        if (!container) return;

        const maxAvailableHeight = fill
          ? (container.clientHeight - 2 * (48 + baseGap + 40 + 48)) * ASPECT_RATIO
          : Infinity;
        const windowWidth = window.innerWidth;

        state.w = Math.max(
          280,
          Math.min(
            windowWidth *
              (windowWidth < 768 ? 0.75 : windowWidth < 1024 ? 0.55 : 0.4),
            maxAvailableHeight
          )
        );

        state.peek = Math.min(
          0.5,
          Math.max(
            0.18,
            (0.6 * windowWidth / state.w - 0.5) /
              decaySum(Math.min(8, Math.max(3, Math.round(windowWidth / 360))))
          )
        );

        container.style.setProperty('--ss-w', `${state.w}px`);
        container.style.setProperty('--ss-h', `${state.w / ASPECT_RATIO}px`);
      };

      const animateItem = (index, isActive) => {
        const scaleTarget = scaleTweenRefs.current[index];
        const titleElement = titleRefs.current[index];
        if (!scaleTarget || !titleElement) return;

        const duration =
          0.6 * !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        gsap.to(scaleTarget, {
          v: 32 * (isActive ? 1 : 0),
          duration,
          ease: EASE_NAME,
          overwrite: true,
          onUpdate: () => updateCardsRef.current(),
        });

        gsap.to(titleElement, {
          yPercent: 100 * (isActive ? 0 : 1),
          duration: isActive ? duration : 0.6 * duration,
          delay: isActive ? 0.25 * duration : 0,
          ease: EASE_NAME,
          overwrite: true,
        });
      };

      const updateCards = () => {
        const { w: width, offset, peek } = state;

        cardRefs.current.forEach((card, index) => {
          if (!card) return;

          const wrappedOffset = gsap.utils.wrap(
            -count / 2,
            count / 2,
            index - offset
          );
          const absOffset = Math.abs(wrappedOffset);
          const posX =
            Math.sign(wrappedOffset) *
            (0.5 + peek * decaySum(absOffset) - Math.pow(0.89, absOffset) / 2) *
            width;
          const scale = Math.pow(0.89, absOffset);

          card.style.transform = `translate(-50%, -50%) translate(${posX}px, ${posX * TILT_TAN}px) rotate(${
            0.5 * Math.sign(wrappedOffset) * (15 * (1 - Math.pow(0.7, absOffset)))
          }deg) scale(${scale})`;
          card.style.zIndex = String(100 - Math.round(10 * absOffset));

          const padding = 16 * Math.pow(0.55, absOffset);
          const cardHeight = width / ASPECT_RATIO;
          const scaleTransform = `translate(${-padding}px, ${-padding}px) scale(${
            (width + 2 * padding) / width
          }, ${
            (cardHeight + 2 * padding + (scaleTweenRefs.current[index]?.v || 0)) / cardHeight
          })`;

          const surfaceScaleElement = surfaceScaleRefs.current[index];
          if (surfaceScaleElement) {
            surfaceScaleElement.style.transform = scaleTransform;
          }

          const overlayElement = overlayRefs.current[index];
          if (overlayElement) {
            overlayElement.style.transform = scaleTransform;
            overlayElement.style.opacity = Math.min(
              1,
              absOffset < 1 ? 0.3 * absOffset : 0.2 + 0.1 * absOffset
            );
          }
        });
      };

      syncActiveRef.current = (shouldActivate, targetOffset = state.offset) => {
        if (!shouldActivate) {
          animateItem(state.active, false);
          state.active = -1;
          return;
        }

        const activeIndex = gsap.utils.wrap(0, count, Math.round(targetOffset));
        if (activeIndex !== state.active) {
          animateItem(state.active, false);
          animateItem(activeIndex, true);
          state.active = activeIndex;
        }
      };

      updateCardsRef.current = updateCards;
      computeDimensions();
      updateCards();
      syncActiveRef.current(true);

      const resizeObserver = new ResizeObserver(() => {
        computeDimensions();
        updateCards();
      });
      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    },
    {
      scope: containerRef,
      dependencies: [repeatedItems.length],
    }
  );

  const tweenToOffset = (targetOffset, duration = 0.7, ease = EASE_NAME) => {
    let hasSynced = false;
    carouselStateRef.current.target = targetOffset;

    const tween = gsap.to(carouselStateRef.current, {
      offset: targetOffset,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : duration,
      ease,
      overwrite: true,
      onUpdate: () => {
        updateCardsRef.current();
        if (!hasSynced && tween.progress() >= 0.3) {
          hasSynced = true;
          syncActiveRef.current(true, targetOffset);
        }
      },
      onComplete: () => syncActiveRef.current(true),
    });

    return tween;
  };

  const pointerStateRef = useRef({
    on: false,
    moved: false,
    x: 0,
    start: 0,
    v: 0,
    lastX: 0,
    lastT: 0,
  });

  const getDragFactor = () => 1 / (0.3 * carouselStateRef.current.w * 1.6);

  const handlePointerRelease = () => {
    const pointer = pointerStateRef.current;
    if (!pointer.on) return;
    pointer.on = false;
    if (!pointer.moved) return;

    const velocity = performance.now() - pointer.lastT < 80 ? pointer.v : 0;
    const targetOffset = Math.round(carouselStateRef.current.offset + 450 * velocity);
    const distance = Math.abs(targetOffset - carouselStateRef.current.offset);

    tweenToOffset(
      targetOffset,
      gsap.utils.clamp(0.5, 1.4, 0.45 + 0.25 * distance),
      'expo.out'
    );
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={(event) => {
        if (event.target.closest('button')) return;

        const now = performance.now();
        pointerStateRef.current = {
          on: true,
          moved: false,
          x: event.clientX,
          start: carouselStateRef.current.offset,
          v: 0,
          lastX: event.clientX,
          lastT: now,
        };
        gsap.killTweensOf(carouselStateRef.current);
      }}
      onPointerMove={(event) => {
        const pointer = pointerStateRef.current;
        if (!pointer.on) return;

        if (!pointer.moved && Math.abs(event.clientX - pointer.x) > 4) {
          pointer.moved = true;
          syncActiveRef.current(false);
        }

        carouselStateRef.current.offset =
          pointer.start - (event.clientX - pointer.x) * getDragFactor();

        const now = performance.now();
        const instantVelocity =
          (-(event.clientX - pointer.lastX) * getDragFactor()) /
          Math.max(1, now - pointer.lastT);

        pointer.v = 0.6 * pointer.v + 0.4 * instantVelocity;
        pointer.lastX = event.clientX;
        pointer.lastT = now;
        updateCardsRef.current();
      }}
      onPointerUp={handlePointerRelease}
      onPointerLeave={handlePointerRelease}
      style={
        fill
          ? {
              '--ss-gap': `${baseGap}px`,
            }
          : undefined
      }
      className={`relative w-full cursor-grab touch-pan-y select-none active:cursor-grabbing ${
        fill
          ? 'h-full'
          : 'h-[calc(var(--ss-h)_+_240px)] [--ss-gap:32px] lg:h-[calc(var(--ss-h)_+_336px)] lg:[--ss-gap:80px]'
      } ${className}`}
    >
      {repeatedItems.map((item, index) => (
        <a
          key={`${item.slug}-${index}`}
          ref={(element) => {
            cardRefs.current[index] = element;
          }}
          href={item.locked ? undefined : `/animations/${item.slug}`}
          aria-label={item.title}
          draggable={false}
          onClick={(event) => {
            event.preventDefault();
            if (pointerStateRef.current.moved) return;

            const state = carouselStateRef.current;
            const count = repeatedItems.length;
            const wrappedDistance = gsap.utils.wrap(
              -count / 2,
              count / 2,
              index - state.offset
            );
            const targetUrl = `/animations/${repeatedItems[index].slug}`;

            if (Math.abs(wrappedDistance) < 0.5) {
              if (repeatedItems[index].locked) return;
              if (router) {
                router.push(targetUrl);
              } else {
                window.location.href = targetUrl;
              }
            } else {
              syncActiveRef.current(false);
              tweenToOffset(Math.round(state.offset + wrappedDistance));
            }
          }}
          className="absolute top-1/2 left-1/2 block h-(--ss-h) w-(--ss-w) will-change-transform"
        >
          <span
            ref={(element) => {
              surfaceScaleRefs.current[index] = element;
            }}
            className={`${ABSOLUTE_TRANSFORM_CLASS} bg-surface`}
          />
          <span className="absolute inset-0 overflow-hidden bg-surface">
            {item.locked ? (
              <span className="absolute inset-0 flex flex-col justify-between p-16 text-foreground-muted lg:p-24">
                <span className="text-h3 tabular-nums">{item.number}</span>
                <span className="text-body-sm">{item.category}</span>
              </span>
            ) : (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                draggable={false}
                className="absolute inset-0 object-cover"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            )}
          </span>
          <span
            ref={(element) => {
              overlayRefs.current[index] = element;
            }}
            className={`${ABSOLUTE_TRANSFORM_CLASS} pointer-events-none bg-black opacity-0`}
          />
          <span className="absolute top-full right-0 left-0 flex h-48 items-center">
            <span className="block min-w-0 overflow-hidden">
              <span
                ref={(element) => {
                  titleRefs.current[index] = element;
                }}
                className="text-body-sm block truncate font-medium"
              >
                {item.title}
              </span>
            </span>
          </span>
        </a>
      ))}
      <div className="absolute top-[calc(50%_+_var(--ss-h)/2_+_48px_+_var(--ss-gap))] right-0 left-0 z-[200] flex items-center justify-center gap-8">
        {[
          {
            dir: -1,
            label: 'Previous',
            Icon: CaretLeftIcon,
          },
          {
            dir: 1,
            label: 'Next',
            Icon: CaretRightIcon,
          },
        ].map(({ dir, label, Icon }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => {
              syncActiveRef.current(false);
              const state = carouselStateRef.current;
              const isTweening = gsap.isTweening(state);
              const baseOffset = isTweening
                ? state.target ?? Math.round(state.offset)
                : Math.round(state.offset);
              tweenToOffset(baseOffset + dir, 0.7, isTweening ? 'expo.out' : EASE_NAME);
            }}
            className="inline-flex size-40 cursor-pointer items-center justify-center bg-surface text-foreground transition-[background-color,scale] duration-200 ease-(--ease-expo-out) hover:bg-surface/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/60 active:scale-90"
          >
            <Icon className="size-16" />
          </button>
        ))}
      </div>
    </div>
  );
}

// NOTE: module id: 619499
export default ShippedCascade;
