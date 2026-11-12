'use client';

// Variable Mapping: g -> MenuHeroSection?, e -> kit, p -> owns, f -> priceId, x -> videoRef, H -> prefersReducedMotion, v -> setPrefersReducedMotion, y -> isShowreelReady, b -> setIsShowreelReady

import { useEffect, useRef, useState } from 'react';
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391 // UNRESOLVED: name guessed from usage
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import HtmlIcon from '@/assets/icons/HtmlIcon'; // NOTE: module id: 514162 // UNRESOLVED: name guessed from usage
import ReactIcon from '@/assets/icons/ReactIcon'; // NOTE: module id: 989080 // UNRESOLVED: name guessed from usage
import VueIcon from '@/assets/icons/VueIcon'; // NOTE: module id: 667024 // UNRESOLVED: name guessed from usage
import { KitPurchaseCta } from '@/features/kits/components/Kitpurchasecta'; // NOTE: module id: 787160 // UNRESOLVED: name guessed from usage
import { usePageEnterAnimation } from '@/providers/AnimationProvider'; // NOTE: module id: 488463
import {
  HERO_TAGLINE_REVEAL_PROPS,
  MENU_SHOWREEL_POSTER_URL,
  MENU_SHOWREEL_VIDEO_URL,
} from '@/features/kits/utils/menu-kit.config'; // NOTE: module id: 37418

// NOTE: module id: 37418
export function MenuHeroSection({ kit, owns = false, priceId = null }) {
  const videoRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isShowreelReady, setIsShowreelReady] = useState(false);

  usePageEnterAnimation(() => setIsShowreelReady(true), [], 'menu-showreel');

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return;
    const updateMotionPreference = () =>
      setPrefersReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener?.('change', updateMotionPreference);
    return () =>
      mediaQuery.removeEventListener?.('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      if (prefersReducedMotion) {
        videoEl.pause();
      } else {
        videoEl.play?.().catch(() => {});
      }
    }
  }, [prefersReducedMotion]);

  return (
    <section
      data-theme="dark"
      className="relative flex flex-col overflow-hidden bg-background pb-0 pt-96 text-foreground lg:pt-128"
    >
      <div className="v2-container">
        <div className="grid grid-cols-12 gap-x-24 lg:gap-x-32">
          <div className="col-span-12 text-center lg:col-span-8 lg:col-start-3">
            <FadeIn
              className="flex items-center justify-center gap-8 text-mono-sm text-foreground-muted"
              delay={0.1}
            >
              <span aria-hidden="true" className="inline-block size-8 bg-brand" />
              Landmark Kit
            </FadeIn>
            <RevealHeading
              as="h1"
              sizeClass="text-display"
              className="mt-16 font-medium"
              trigger="pageEnter"
            >
              {`${kit.title} Kit`}
            </RevealHeading>
            <AnimatedText
              tag="p"
              className="text-body-lg mx-auto mt-16 max-w-[46ch] text-foreground-muted"
              {...HERO_TAGLINE_REVEAL_PROPS}
              delay={0.2}
            >
              Every site has one, and it is the first thing anyone touches. Ten
              complete navigation surfaces, each one art-directed on its own,
              all built on the same contract.
            </AnimatedText>
            <FadeIn
              className="mt-32 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 text-mono-sm text-foreground-muted"
              delay={0.35}
            >
              <span
                aria-label="React, Vue, and HTML / CSS / JS"
                className="flex items-center gap-12 text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="flex size-20 items-center justify-center"
                >
                  <ReactIcon />
                </span>
                <span
                  aria-hidden="true"
                  className="flex size-20 items-center justify-center"
                >
                  <VueIcon />
                </span>
                <span
                  aria-hidden="true"
                  className="flex size-20 items-center justify-center"
                >
                  <HtmlIcon />
                </span>
              </span>
              <span aria-hidden="true" className="inline-block size-6 bg-brand" />
              <span>One-time</span>
            </FadeIn>
            <FadeIn className="mt-32 flex justify-center" delay={0.45}>
              <KitPurchaseCta kit={kit} owns={owns} priceId={priceId} />
            </FadeIn>
          </div>
        </div>
      </div>
      <div className="relative mt-56 lg:mt-80">
        <div className="v2-container">
          <div className="grid grid-cols-12 gap-x-24 lg:gap-x-32">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2">
              <FadeIn y={24} delay={0.5}>
                <div className="relative overflow-hidden border border-foreground/15 bg-surface shadow-[0_24px_64px_-24px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-12 border-b border-foreground/15 px-16 py-12">
                    <div className="flex items-center gap-8" aria-hidden="true">
                      <span className="size-8 bg-foreground/15" />
                      <span className="size-8 bg-foreground/15" />
                      <span className="size-8 bg-foreground/15" />
                    </div>
                    <div className="mx-auto flex w-full max-w-[280px] items-center justify-center bg-foreground/[0.06] px-12 py-4">
                      <span className="text-accent-xs text-foreground-muted/70">
                        yourstudio.com
                      </span>
                    </div>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden bg-background">
                    {MENU_SHOWREEL_VIDEO_URL ? (
                      <video
                        ref={videoRef}
                        className="absolute inset-0 object-cover"
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        src={
                          isShowreelReady ? MENU_SHOWREEL_VIDEO_URL : undefined
                        }
                        poster={MENU_SHOWREEL_POSTER_URL || undefined}
                        autoPlay={!prefersReducedMotion}
                        muted={true}
                        loop={true}
                        playsInline={true}
                        preload="metadata"
                        aria-label={`${kit.title} Kit showreel`}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-mono-sm text-foreground-muted">
                          Showreel
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] lg:h-[180px]"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, var(--background) 90%)',
          }}
        />
      </div>
    </section>
  );
}
