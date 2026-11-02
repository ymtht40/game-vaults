'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

function ArcsIcon({ width, height, strokeWidth = 26, ...restProps }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 255 129"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      {...restProps}
    >
      <path d="M13 129C13 105.252 32.0279 86 55.5 86C78.9721 86 98 105.252 98 129" />
      <path d="M13 129C13 89.7878 44.3401 58 83 58C121.66 58 153 89.7878 153 129" />
      <path d="M13 129C13 64.935 64.2634 13 127.5 13C190.737 13 242 64.935 242 129" />
    </svg>
  );
}

// NOTE: module id: 503433
export const AnimatedStrokeIcon = forwardRef(function AnimatedStrokeIcon(
  {
    className,
    strokeWidth = 26,
    fit = 'height',
    tone = 'default',
    playOnView = false,
    ...restProps
  },
  ref
) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  const getPassElements = () => {
    const el = containerRef.current;
    return {
      brand: Array.from(el?.querySelectorAll('[data-pass="brand"] path') || []),
      fg: Array.from(el?.querySelectorAll('[data-pass="fg"] path') || []),
    };
  };

  const preparePaths = (paths) =>
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });

  const play = () => {
    const { brand, fg } = getPassElements();
    if (!brand.length) return;

    timelineRef.current?.kill();
    preparePaths(brand);
    preparePaths(fg);

    const staggerConfig = { each: 0.1 };
    const tl = gsap.timeline();
    tl.to(
      brand,
      {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: 'expo.inOut',
        stagger: staggerConfig,
      },
      0
    );
    tl.to(
      fg,
      {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: 'expo.inOut',
        stagger: staggerConfig,
      },
      0.12
    );
    timelineRef.current = tl;
  };

  useImperativeHandle(ref, () => ({ play }), []);

  useGSAP(
    () => {
      const { brand, fg } = getPassElements();
      [...brand, ...fg].forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 });
      });
      return () => timelineRef.current?.kill();
    },
    { scope: containerRef }
  );

  useEffect(() => {
    if (!playOnView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let hasExited = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (hasExited) play();
          hasExited = false;
        } else if (entry.boundingClientRect.top > 0 && !hasExited) {
          timelineRef.current?.kill();
          const { brand, fg } = getPassElements();
          preparePaths(brand);
          preparePaths(fg);
          hasExited = true;
        }
      },
      { rootMargin: '0px 0px -20% 0px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [playOnView]);

  const fitClasses = cn(
    'col-start-1 row-start-1',
    fit === 'width' ? 'h-auto w-full' : 'h-full w-auto'
  );
  const isMuted = tone === 'muted';

  return (
    <span
      ref={containerRef}
      className={cn('grid place-items-center', className)}
      {...restProps}
    >
      <ArcsIcon
        data-pass="brand"
        strokeWidth={strokeWidth}
        className={cn(fitClasses, isMuted ? 'text-foreground' : 'text-brand')}
      />
      <ArcsIcon
        data-pass="fg"
        strokeWidth={strokeWidth}
        className={cn(
          fitClasses,
          isMuted
            ? 'text-[color-mix(in_srgb,var(--foreground)_10%,var(--background))]'
            : 'text-foreground'
        )}
      />
    </span>
  );
});

