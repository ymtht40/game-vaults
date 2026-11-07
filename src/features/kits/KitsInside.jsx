'use client';

// Variable Mapping: C -> insideTextAnimation, i -> activeSlug, n -> visibleSlug, f -> kitRefs, b -> animateIn, j -> handleTabChange

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
// UNRESOLVED: original source path or export names are absent from this chunk.
import RevealHeading from '@/animations/RevealHeading'; // NOTE: module id: 963160
// UNRESOLVED: original source path or export names are absent from this chunk.
import Reveal from '@/animations/FadeIn'; // NOTE: module id: 460391

// UNRESOLVED: original source path or export names are absent from this chunk.
import SplitTextReveal from '@/animations/AnimatedText'; // NOTE: module id: 218091
// UNRESOLVED: original source path or export names are absent from this chunk.
import {
  ANNNIMATE_IN_OUT_EASE,
  ANNNIMATE_EASE,
  prefersReducedMotion
} from '@/features/common/IsometricFigure'; // NOTE: module id: 576720
// UNRESOLVED: original source path or export names are absent from this chunk.
import { Tabs } from '@/features/docs/components/Tabs'; // NOTE: module id: 512922
// UNRESOLVED: original source path or export names are absent from this chunk.
import gsap from 'gsap'; // NOTE: module id: 989970
// UNRESOLVED: original source path or export names are absent from this chunk.
import { formatImageUrl } from '@/libs/utils/formatImageUrl'; // NOTE: module id: 632021
import CircularSlider from '@/features/kits/CircularSlider'; // NOTE: module id: 8545
import { getVisibleSliderImages } from '@/features/kits/utils/getVisibleSliderImages'; // NOTE: module id: 8545
import { repeatKitComponents } from '@/features/kits/utils/repeatKitComponents'; // NOTE: module id: 8545
import { useKitPreviewVideos } from '@/hooks/useKitPreviewVideos'; // NOTE: module id: 8545

const insideTextAnimation = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
};
// NOTE: module id: 8545
export default function KitsInside({ headline, sub, kits = [] }) {
  const [activeSlug, setActiveSlug] = useState(kits[0]?.slug);
  const [visibleSlug, setVisibleSlug] = useState(kits[0]?.slug);
  const kitRefs = useRef({});
  const requestedSlugRef = useRef(activeSlug);
  const visibleSlugRef = useRef(visibleSlug);
  const isSwitchingRef = useRef(false);
  const playEnterRef = useRef(false);
  const animateIn = (slug) => {
    const kitPanel = kitRefs.current[slug];
    const visibleImages = getVisibleSliderImages(kitPanel);
    const otherImages = [
      ...(kitPanel?.querySelectorAll('.circular_slider_image') || []),
    ].filter((image) => !visibleImages.includes(image));
    gsap.set(otherImages, {
      y: 0,
      opacity: 1,
      overwrite: true,
    });
    gsap.fromTo(
      visibleImages,
      {
        y: 32,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.5 * !prefersReducedMotion(),
        ease: ANNNIMATE_EASE,
        overwrite: true,
        force3D: true,
      },
    );
  };
  const { contextSafe } = useGSAP(
    () => {
      playEnterRef.current && ((playEnterRef.current = false), animateIn(visibleSlug));
    },
    {
      dependencies: [visibleSlug],
    },
  );
  const handleTabChange = contextSafe((slug) => {
    if ((setActiveSlug(slug), (requestedSlugRef.current = slug), isSwitchingRef.current))
      return;
    isSwitchingRef.current = true;
    const kitPanel = kitRefs.current[visibleSlugRef.current];
    kitPanel?.querySelectorAll('.kits-inside-video').forEach((video) => {
      video.pause();
      delete video.dataset.playing;
    });
    gsap.to(getVisibleSliderImages(kitPanel), {
      y: 32,
      opacity: 0,
      duration: 0.5 * !prefersReducedMotion(),
      ease: ANNNIMATE_EASE,
      overwrite: true,
      force3D: true,
      onComplete: () => {
        ((isSwitchingRef.current = false), requestedSlugRef.current === visibleSlugRef.current)
          ? animateIn(visibleSlugRef.current)
          : ((playEnterRef.current = true),
            (visibleSlugRef.current = requestedSlugRef.current),
            setVisibleSlug(requestedSlugRef.current));
      },
    });
  });
  useKitPreviewVideos(kits, kitRefs);
  return kits.length ? (
    <section
      data-theme="light"
      className="overflow-hidden bg-background pb-96 text-foreground lg:pb-160"
    >
      <div className="v2-container relative z-10 flex flex-col items-center gap-16 text-center">
        <RevealHeading
          as="h2"
          sizeClass="text-h2"
          className="max-w-[22ch] font-medium text-balance"
          trigger="scroll"
        >
          {headline}
        </RevealHeading>
        {sub ? (
          <SplitTextReveal
            tag="p"
            className="text-body-lg max-w-[46ch] text-foreground-muted"
            {...insideTextAnimation}
            triggerMode="scroll"
            delay={0.2}
          >
            {sub}
          </SplitTextReveal>
        ) : null}
        <Reveal trigger="scroll" delay={0.3} className="mt-16">
          <Tabs
            tabs={kits.map((kit) => ({
              id: kit.slug,
              label: kit.title,
            }))}
            activeId={activeSlug}
            onChange={handleTabChange}
            ariaLabel="Kits"
          />
        </Reveal>
      </div>
      <Reveal
        trigger="scroll"
        delay={0.4}
        className="mt-[calc(20vw-112px)] md:mt-[calc(24px-7.65vw)]"
      >
        <div className="relative">
          {kits.map((kit) => {
            const components = repeatKitComponents(kit.components);
            const isVisible = kit.slug === visibleSlug;
            return (
              <div
                ref={(node) => (kitRefs.current[kit.slug] = node)}
                aria-hidden={!isVisible || undefined}
                className={
                  isVisible ? '' : 'pointer-events-none invisible absolute inset-x-0 top-0'
                }
                style={{
                  '--kits-ring': (1.12 * components.length) / Math.PI,
                }}
                key={kit.slug}
              >
                <CircularSlider
                  type="snap"
                  ease={ANNNIMATE_IN_OUT_EASE}
                  className="kits-inside-carousel"
                  images={components.map((component) => ({
                    src: formatImageUrl(component.preview_image_url, {
                      width: 960,
                      format: 'auto',
                    }),
                    alt: component.title,
                  }))}
                />
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  ) : null;
}
