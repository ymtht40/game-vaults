'use client';

// Variable Mapping: l -> CENTER_RING_DIAMETER_CSS, a -> SIDE_RING_BASE_SPAN_CSS, e -> side, i -> images, s -> overshoot, o -> push, c -> ringRef, u -> isCenter, d -> ringDiameterCss, h -> centerOffsetCss, f -> tileWidthCss, m -> tileHeightCss, p -> tileCount, g -> diameterCss, b -> widthCss, y -> heightCss, x -> angles, v -> positionStyle, w -> visibilityClass, A -> opacityClass

import { useEffect, useMemo, useRef } from 'react'; // NOTE: module id: 271645
import { f as usePauseOffscreenAnimation } from '@/hooks/usePauseOffscreenAnimations'; // NOTE: module id: 771267

const CENTER_RING_DIAMETER_CSS = 'calc(min(95vw, 480px) + 64px)';
const SIDE_RING_BASE_SPAN_CSS =
  'calc(max(32px, (100vw - 1920px) / 2) + 3 * (min(1920px, 100vw - 64px) - 264px) / 12 + 48px - 32px)';

function getSideRingMetrics(overshoot, push = 0) {
  const resolvedOvershoot = `var(--ring-overshoot, ${overshoot})`;
  const radiusCss = `calc(${SIDE_RING_BASE_SPAN_CSS} * ${resolvedOvershoot} / 1.09)`;
  const tileWidthCss = `calc(${radiusCss} * 0.32)`;

  return {
    ringDiameterCss: `calc(${radiusCss} * 2)`,
    centerOffsetCss: `calc(${SIDE_RING_BASE_SPAN_CSS} * (${resolvedOvershoot} - 1 + var(--ring-push, ${push})))`,
    tileWidthCss,
    tileHeightCss: `calc(${tileWidthCss} * 9 / 16)`,
  };
}

// NOTE: module id: 809214
export const L = 66;

export function EndCtaRing({ side, images = [], overshoot = 1.5, push = 0 }) {
  const ringRef = useRef(null);
  const isCenter = side === 'center';
  const { ringDiameterCss, centerOffsetCss, tileWidthCss, tileHeightCss } =
    getSideRingMetrics(overshoot, push);

  const tileCount = isCenter ? 12 : 24;
  const diameterCss = isCenter ? CENTER_RING_DIAMETER_CSS : ringDiameterCss;
  const widthCss = isCenter ? `calc(${diameterCss} / 2 * 0.26)` : tileWidthCss;
  const heightCss = isCenter ? `calc(${widthCss} * 9 / 16)` : tileHeightCss;

  const angles = useMemo(() => {
    const result = [];
    for (let index = 0; index < tileCount; index++) {
      result.push((index / tileCount) * 360);
    }
    return result;
  }, [tileCount]);

  useEffect(() => {
    const ringElement = ringRef.current;
    if (
      !ringElement ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timing = {
      duration: 90000,
      iterations: Infinity,
      easing: 'linear',
    };
    const animateRotation = (element, degrees) =>
      element.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${degrees}deg)` }],
        timing
      );

    const animations = [animateRotation(ringElement, 360)];

    if (isCenter) {
      ringElement
        .querySelectorAll('[data-ring-face]')
        .forEach((faceElement) => animations.push(animateRotation(faceElement, -360)));
    }

    return () => animations.forEach((animation) => animation.cancel());
  }, [isCenter]);

  usePauseOffscreenAnimation(ringRef);

  const positionStyle = isCenter
    ? {
        width: diameterCss,
        height: diameterCss,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }
    : {
        width: diameterCss,
        height: diameterCss,
        left: side === 'left' ? 0 : 'auto',
        right: side === 'right' ? 0 : 'auto',
        top: '50%',
        transform:
          side === 'left'
            ? `translate(calc(-50% - ${centerOffsetCss}), -50%)`
            : `translate(calc(50% + ${centerOffsetCss}), -50%)`,
      };

  const visibilityClass = isCenter ? 'block sm:hidden' : 'hidden sm:block';
  const opacityClass = isCenter ? 'opacity-40' : '';

  return (
    <div
      className={`pointer-events-none absolute ${visibilityClass} ${opacityClass}`}
      style={positionStyle}
      aria-hidden="true"
    >
      <div ref={ringRef} className="relative h-full w-full">
        {angles.map((angle, index) => {
          const imageSrc = images[index % Math.max(images.length, 1)];
          const counterRotation = isCenter ? -angle : side === 'left' ? -90 : -270;

          return (
            <div
              key={index}
              className="absolute left-1/2 top-1/2"
              style={{
                width: widthCss,
                height: heightCss,
                marginLeft: `calc(${widthCss} / -2)`,
                marginTop: `calc(${heightCss} / -2)`,
                transform: `rotate(${angle}deg) translateY(calc(${diameterCss} / -2)) rotate(${counterRotation}deg)`,
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt=""
                  decoding="async"
                  data-ring-face=""
                  className="block object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <div
                  data-ring-face=""
                  className="block h-full w-full bg-foreground/[0.06]"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

