'use client';

// Variable Mapping: l -> CENTER_RING_DIAMETER_CSS, s -> SIDE_COLUMN_SPAN_CSS, e -> side, a -> images, c -> overshoot, o -> push, u -> ringRef, d -> isVisible, h -> setIsVisible, f -> isCenter, m -> ringDiameterCss, p -> centerOffsetCss, g -> tileWidthCss, x -> tileHeightCss, y -> tileCount, b -> activeDiameterCss, w -> activeTileWidthCss, v -> activeTileHeightCss, j -> tileAngles, C -> containerStyle, k -> visibilityClass, N -> opacityClass

import { useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import { formatImageUrl } from '@/libs/utils/formatImageUrl'; // NOTE: module id: 632021
import { usePauseOffscreenAnimations } from '@/hooks/usePauseOffscreenAnimations'; // NOTE: module id: 771267

const CENTER_RING_DIAMETER_CSS = 'calc(min(95vw, 480px) + 64px)';
const SIDE_COLUMN_SPAN_CSS =
  'calc(max(32px, (100vw - 1920px) / 2) + 3 * (min(1920px, 100vw - 64px) - 264px) / 12 + 48px - 32px)';

function computeSideRingDimensions(overshoot, push = 0) {
  const overshootCss = `var(--ring-overshoot, ${overshoot})`;
  const radiusCss = `calc(${SIDE_COLUMN_SPAN_CSS} * ${overshootCss} / 1.09)`;
  const tileWidthCss = `calc(${radiusCss} * 0.32)`;

  return {
    ringDiameterCss: `calc(${radiusCss} * 2)`,
    centerOffsetCss: `calc(${SIDE_COLUMN_SPAN_CSS} * (${overshootCss} - 1 + var(--ring-push, ${push})))`,
    tileWidthCss,
    tileHeightCss: `calc(${tileWidthCss} * 9 / 16)`,
  };
}

// NOTE: module id: 809214
export const RING_DEFAULT_OFFSET = 66;

export function ImageRing({
  side,
  images = [],
  overshoot = 1.5,
  push = 0,
}) {
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const isCenter = side === 'center';
  const {
    ringDiameterCss,
    centerOffsetCss,
    tileWidthCss,
    tileHeightCss,
  } = computeSideRingDimensions(overshoot, push);

  const tileCount = isCenter ? 12 : 24;
  const activeDiameterCss = isCenter ? CENTER_RING_DIAMETER_CSS : ringDiameterCss;
  const activeTileWidthCss = isCenter
    ? `calc(${activeDiameterCss} / 2 * 0.26)`
    : tileWidthCss;
  const activeTileHeightCss = isCenter
    ? `calc(${activeTileWidthCss} * 9 / 16)`
    : tileHeightCss;

  const tileAngles = useMemo(() => {
    const angles = [];
    for (let index = 0; index < tileCount; index++) {
      angles.push((index / tileCount) * 360);
    }
    return angles;
  }, [tileCount]);

  useEffect(() => {
    const ringEl = ringRef.current;
    if (
      !ringEl ||
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

    const animations = [animateRotation(ringEl, 360)];

    if (isCenter) {
      ringEl
        .querySelectorAll('[data-ring-face]')
        .forEach((faceEl) => animations.push(animateRotation(faceEl, -360)));
    }

    return () => animations.forEach((anim) => anim.cancel());
  }, [isCenter]);

  usePauseOffscreenAnimations(ringRef);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '25% 0px' }
    );

    observer.observe(ringRef.current);
    return () => observer.disconnect();
  }, []);

  const containerStyle = isCenter
    ? {
        width: activeDiameterCss,
        height: activeDiameterCss,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }
    : {
        width: activeDiameterCss,
        height: activeDiameterCss,
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
      style={containerStyle}
      aria-hidden="true"
    >
      <div ref={ringRef} className="relative h-full w-full">
        {tileAngles.map((angle, index) => {
          const imageSrc = images[index % Math.max(images.length, 1)];
          const counterRotation = isCenter
            ? -angle
            : side === 'left'
              ? -90
              : -270;

          return (
            <div
              key={index}
              className="absolute left-1/2 top-1/2"
              style={{
                width: activeTileWidthCss,
                height: activeTileHeightCss,
                marginLeft: `calc(${activeTileWidthCss} / -2)`,
                marginTop: `calc(${activeTileHeightCss} / -2)`,
                transform: `rotate(${angle}deg) translateY(calc(${activeDiameterCss} / -2)) rotate(${counterRotation}deg)`,
              }}
            >
              <div
                data-ring-face=""
                className={`block h-full w-full${imageSrc ? '' : ' bg-foreground/[0.06]'}`}
              >
                {imageSrc && isVisible ? (
                  <img
                    src={formatImageUrl(imageSrc, { width: 480 })}
                    alt=""
                    decoding="async"
                    className="block object-cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ImageRing;