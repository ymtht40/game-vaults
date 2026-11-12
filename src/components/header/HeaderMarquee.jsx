// Variable Mapping: e -> scrolled, i -> shiftY, o -> trackRef, s -> animStateRef, l -> containerRef, a -> scrolledRef, c -> isIntersectingRef, h -> updatePlayState, d -> setPlaybackRate
'use client';

import { Fragment, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836
import { MARQUEE_ITEMS } from '@/components/header/header.config'; // NOTE: module id: 76624
import { isOfferActive } from '@/libs/utils/packSlugs'; // NOTE: module id: 825740

// NOTE: module id: 76624
export function HeaderMarquee({ scrolled = false, shiftY = 0 }) {
  const trackRef = useRef(null);
  const animStateRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const docEl = document.documentElement;
    const updateHeight = () => docEl.style.setProperty('--anm-marquee-h', `${el.offsetHeight}px`);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => {
      observer.disconnect();
      docEl.style.removeProperty('--anm-marquee-h');
    };
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const getKeyframes = () => [
      { transform: 'translateX(0px)' },
      { transform: `translateX(${-el.scrollWidth / 2}px)` },
    ];

    const animation = el.animate(getKeyframes(), {
      duration: 150000,
      iterations: Infinity,
      easing: 'linear',
    });

    const observer = new ResizeObserver(() => animation.effect.setKeyframes(getKeyframes()));
    observer.observe(el);

    animStateRef.current = {
      anim: animation,
      rate: 1,
    };

    return () => {
      observer.disconnect();
      gsap.killTweensOf(animStateRef.current);
      animation.cancel();
      animStateRef.current = null;
    };
  }, []);

  const scrolledRef = useRef(scrolled);
  const isIntersectingRef = useRef(true);

  const updatePlayState = () => {
    const animation = animStateRef.current?.anim;
    if (animation) {
      if (scrolledRef.current && isIntersectingRef.current) {
        animation.play();
      } else {
        animation.pause();
      }
    }
  };

  useEffect(() => {
    scrolledRef.current = scrolled;
    updatePlayState();
  }, [scrolled]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      isIntersectingRef.current = entry.isIntersecting;
      updatePlayState();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const setPlaybackRate = (targetRate) => {
    const animState = animStateRef.current;
    if (animState) {
      gsap.to(animState, {
        rate: targetRate,
        duration: targetRate === 0 ? 0.6 : 0.9,
        ease: 'power3.out',
        overwrite: true,
        onUpdate: () => {
          animState.anim.playbackRate = animState.rate;
        },
      });
    }
  };

  return (
    <div
      data-visible={scrolled}
      aria-hidden={!scrolled}
      className="invisible absolute inset-x-0 top-full z-[290] hidden opacity-0 transition-[opacity,visibility] duration-(--duration-quick) ease-(--ease-power3-out) data-[visible=true]:visible data-[visible=true]:opacity-100 lg:block"
    >
      <div
        style={{ transform: `translateY(${shiftY}px)` }}
        className="transition-transform duration-(--duration-snap) ease-(--ease-expo-out)"
      >
        <div className="mx-auto w-[calc(100%-2*var(--v2-header-pad,0px))] max-w-[calc(var(--v2-max,1920px)-2*var(--v2-header-pad,0px))] transition-[width,max-width] duration-(--duration-quick) ease-(--ease-power3-out)">
          <div
            ref={containerRef}
            onMouseEnter={() => setPlaybackRate(0)}
            onMouseLeave={() => setPlaybackRate(1)}
            className="overflow-hidden border-y border-foreground/10 bg-background-muted text-foreground"
          >
            <div ref={trackRef} className="flex w-max items-center">
              {Array.from({ length: 20 }).map((_, repeatIndex) => {
                const isFirstRepeat = repeatIndex === 0;
                return (
                  <Fragment key={repeatIndex}>
                    {MARQUEE_ITEMS.filter((item) => !item.offer || isOfferActive()).map((item, itemIndex) => (
                      <Fragment key={itemIndex}>
                        <TransitionLink
                          href={item.href}
                          aria-hidden={!isFirstRepeat || undefined}
                          tabIndex={isFirstRepeat ? undefined : -1}
                          className="text-mono-sm inline-flex items-center gap-10 whitespace-nowrap px-32 py-8 transition-colors duration-(--duration-quick) hover:text-brand"
                        >
                          {item.square ? (
                            <span aria-hidden="true" className="size-8 shrink-0 bg-brand" />
                          ) : null}
                          {item.label}
                        </TransitionLink>
                        <span
                          aria-hidden="true"
                          className="size-3 shrink-0 rounded-full bg-foreground/30"
                        />
                      </Fragment>
                    ))}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
