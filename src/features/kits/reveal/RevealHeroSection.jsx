'use client';

// Variable Mapping: h -> RevealHeroSection?, e -> kit, n -> owns, g -> priceId, p -> images, v -> sectionRef, b -> previewWrapperRef, t -> yOffset

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391 // UNRESOLVED: name guessed from usage
import SplitTextReveal from '@/features/demos/SplitTextReveal'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import HtmlIcon from '@/assets/icons/HtmlIcon'; // NOTE: module id: 514162 // UNRESOLVED: name guessed from usage
import ReactIcon from '@/assets/icons/ReactIcon'; // NOTE: module id: 989080 // UNRESOLVED: name guessed from usage
import VueIcon from '@/assets/icons/VueIcon'; // NOTE: module id: 667024 // UNRESOLVED: name guessed from usage
import { KitPurchaseCta } from '@/features/kits/components/Kitpurchasecta'; // NOTE: module id: 787160 // UNRESOLVED: name guessed from usage
import { RevealHeroPreview } from '@/features/kits/reveal/RevealHeroPreview'; // NOTE: module id: 301900
import { TAGLINE_REVEAL_PROPS } from '@/features/kits/utils/reveal-kit.config'; // NOTE: module id: 301900

gsap.registerPlugin(ScrollTrigger, useGSAP);

// NOTE: module id: 301900
export function RevealHeroSection({
  kit,
  owns = false,
  priceId = null,
  images = [],
}) {
  const sectionRef = useRef(null);
  const previewWrapperRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isMotionOk: '(prefers-reduced-motion: no-preference)',
          isDesktop: '(min-width: 1024px)',
        },
        (context) => {
          if (!context.conditions.isMotionOk) return;
          const yOffset = context.conditions.isDesktop ? 220 : 120;
          gsap.fromTo(
            previewWrapperRef.current,
            {
              y: 0,
              opacity: 1,
            },
            {
              y: yOffset,
              opacity: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }
      );
      return () => mm.revert();
    },
    {
      scope: sectionRef,
    }
  );

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="relative flex min-h-svh flex-col overflow-hidden bg-background pb-0 pt-96 text-foreground lg:pt-128"
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
              {kit.title}
            </RevealHeading>
            <SplitTextReveal
              tag="p"
              className="text-body-lg mx-auto mt-16 max-w-[42ch] text-foreground-muted"
              {...TAGLINE_REVEAL_PROPS}
              delay={0.2}
            >
              {kit.tagline
                ? `${kit.tagline} You pair any cover with any hero, in WebGL or GSAP, so the moment a site loads and opens runs as a single move.`
                : 'A deep, stand-alone Kit. One purchase, every project, forever.'}
            </SplitTextReveal>
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
      <div
        ref={previewWrapperRef}
        className="relative pt-40 mb-[-80px] will-change-transform lg:pt-56 lg:mb-[-120px]"
      >
        <div className="v2-container">
          <div className="grid grid-cols-12 gap-x-24 lg:gap-x-32">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2">
              <FadeIn y={24} delay={0.5}>
                <RevealHeroPreview />
              </FadeIn>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[320px] lg:h-[440px]"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, var(--background) 85%)',
          }}
        />
      </div>
    </section>
  );
}
