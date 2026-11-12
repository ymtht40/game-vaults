'use client';
import { useRef, useState, useMemo, useEffect } from "react";
import { usePauseOffscreenAnimations } from "@/hooks/usePauseOffscreenAnimations";
import { formatImageUrl } from "@/libs/utils/formatImageUrl";

export const DEFAULT_HEIGHT = 66;

const MOBILE_RING_SIZE = "calc(min(95vw, 480px) + 64px)";
const DESKTOP_BASE_SIZE = "calc(max(32px, (100vw - 1920px) / 2) + 3 * (min(1920px, 100vw - 64px) - 264px) / 12 + 48px - 32px)";

function getRingDimensions(overshootRaw, pushRaw = 0) {
  const overshoot = `var(--ring-overshoot, ${overshootRaw})`;
  const baseDiameter = `calc(${DESKTOP_BASE_SIZE} * ${overshoot} / 1.1)`;
  const tileWidth = `calc(${baseDiameter} * 0.32)`;
  return {
    ringDiameterCss: `calc(${baseDiameter} * 2)`,
    centerOffsetCss: `calc(${DESKTOP_BASE_SIZE} * (${overshoot} - 1 + var(--ring-push, ${pushRaw})))`,
    tileWidthCss: tileWidth,
    tileHeightCss: `calc(${tileWidth} * 0.625)`
  };
}

export function CtaRing({ side, images = [], overshoot = 1.5, push = 0 }) {
  const containerRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const isCenter = side === "center";

  const {
    ringDiameterCss,
    centerOffsetCss,
    tileWidthCss,
    tileHeightCss
  } = getRingDimensions(overshoot, push);

  const tileCount = isCenter ? 12 : 24;
  const ringDiameter = isCenter ? MOBILE_RING_SIZE : ringDiameterCss;
  const tileWidth = isCenter ? `calc(${ringDiameter} / 2 * 0.26)` : tileWidthCss;
  const tileHeight = isCenter ? `calc(${tileWidth} * 0.625)` : tileHeightCss;

  const angles = useMemo(() => {
    let arr = [];
    for (let i = 0; i < tileCount; i++) {
      arr.push((i / tileCount) * 360);
    }
    return arr;
  }, [tileCount]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timing = { duration: 90000, iterations: Infinity, easing: "linear" };
    
    const createAnimation = (target, degrees) =>
      target.animate([
        { transform: "rotate(0deg)" },
        { transform: `rotate(${degrees}deg)` }
      ], timing);

    const animations = [createAnimation(el, 360)];

    if (isCenter) {
      el.querySelectorAll("[data-ring-face]").forEach(face => {
        animations.push(createAnimation(face, -360));
      });
    }

    return () => animations.forEach(anim => anim.cancel());
  }, [isCenter]);

  usePauseOffscreenAnimations(containerRef);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, { rootMargin: "25% 0px" });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const containerStyle = isCenter
    ? {
        width: ringDiameter,
        height: ringDiameter,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)"
      }
    : {
        width: ringDiameter,
        height: ringDiameter,
        left: side === "left" ? 0 : "auto",
        right: side === "right" ? 0 : "auto",
        top: "50%",
        transform: side === "left"
          ? `translate(calc(-50% - ${centerOffsetCss}), -50%)`
          : `translate(calc(50% + ${centerOffsetCss}), -50%)`
      };

  const visibilityClass = isCenter ? "block sm:hidden" : "hidden sm:block";
  const opacityClass = isCenter ? "opacity-40" : "";

  return (
    <div
      className={`pointer-events-none absolute ${visibilityClass} ${opacityClass}`}
      style={containerStyle}
      aria-hidden="true"
    >
      <div ref={containerRef} className="relative h-full w-full">
        {angles.map((angle, index) => {
          const image = images[index % Math.max(images.length, 1)];
          const counterRotate = isCenter ? -angle : (side === "left" ? -90 : -270);

          return (
            <div
              key={index}
              className="absolute left-1/2 top-1/2"
              style={{
                width: tileWidth,
                height: tileHeight,
                marginLeft: `calc(${tileWidth} / -2)`,
                marginTop: `calc(${tileHeight} / -2)`,
                transform: `rotate(${angle}deg) translateY(calc(${ringDiameter} / -2)) rotate(${counterRotate}deg)`
              }}
            >
              <div
                data-ring-face=""
                className={`block h-full w-full${image ? "" : " bg-foreground/[0.06]"}`}
              >
                {image && isIntersecting ? (
                  <img
                    src={formatImageUrl(image, { width: 480 })}
                    alt=""
                    decoding="async"
                    className="block object-cover"
                    style={{ width: "100%", height: "100%" }}
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
