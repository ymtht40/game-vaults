'use client';
import React, { useMemo, useEffect, useRef } from 'react';
import { translate as t } from '@/libs/utils/i18n';
import { preloadSharedImages } from '@/libs/utils/loadSharedImage';
import { perfLog } from '@/libs/utils/perf';
import { useAnimation } from '@/providers/AnimationProvider';
import HeroSection from '@/features/landing/HeroSection';
import ProblemSection from '@/features/landing/ProblemSection';

import OneComponentSection from '@/features/landing/OneComponentSection';
import TwoWaysSection from '@/features/landing/TwoWaysSection';
import PricingSection from '@/components/shared/pricing/PricingSection';
import CustomCursor from '@/features/landing/CustomCursor';
import LibraryPreview from '@/components/ui/LibraryPreview';
import TestimonialsSlider from '@/components/shared/testimonials/TestimonialsSlider';
import StarterPackSection from '@/features/landing/StarterPackSection';

import Accordion from '@/components/shared/accordion/Accordion';
import BottomCTA from '@/features/landing/BottomCTA';

const PREFERRED_SLUGS = [
  'circular-slider',
  'image-fly-in',
  'card-fan',
  'step-wipe',
  'wipe-slider',
  'multi-flip',
  'mega-menu',
  'dual-scramble',
  'radial-gallery',
];

export default function LandingClient({
  animations = [],
  shippedRecently = 0,
}) {
  let imagesOnly = useMemo(
    () => animations.filter((a) => a.preview_image_url),
    [animations],
  );
  let imageUrls = useMemo(
    () => imagesOnly.map((a) => a.preview_image_url),
    [imagesOnly],
  );

  let heroAnimations = useMemo(() => {
    let map = new Map(imagesOnly.map((a) => [a.slug, a]));
    let preferred = PREFERRED_SLUGS.map((slug) => map.get(slug)).filter(
      Boolean,
    );
    let usedSlugs = new Set(preferred.map((a) => a.slug));

    for (let anim of imagesOnly) {
      if (preferred.length >= 9) break;
      if (!usedSlugs.has(anim.slug)) {
        preferred.push(anim);
      }
    }
    return preferred.slice(0, 9);
  }, [imagesOnly]);

  useEffect(() => {
    if (imageUrls.length === 0) return;
    let handle =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(
            () => preloadSharedImages(imageUrls, { maxWidth: 384 }),
            { timeout: 2000 },
          )
        : setTimeout(
            () => preloadSharedImages(imageUrls, { maxWidth: 384 }),
            1000,
          );

    return () => {
      if (typeof cancelIdleCallback === 'function') {
        try {
          cancelIdleCallback(handle);
        } catch (e) {
          clearTimeout(handle);
        }
      } else {
        clearTimeout(handle);
      }
    };
  }, [imageUrls]);

  let cursorRef = useRef(null);
  let { addReadyGate } = useAnimation();

  useEffect(() => {
    perfLog('LandingClient mounted; holding cover on landing-fonts gate');
    let releaseGate = addReadyGate('landing-fonts');

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        perfLog('fonts ready -> releasing landing-fonts gate');
        releaseGate();
      });
    } else {
      releaseGate();
    }

    return () => releaseGate();
  }, [addReadyGate]);

  return (
    <CustomCursor ref={cursorRef}>
      <div className="landing">
        <HeroSection
          animations={heroAnimations}
          count={animations.length}
          pool={animations}
        />
        <ProblemSection />
        <OneComponentSection />
        <TwoWaysSection
          images={imageUrls}
          animations={animations}
          cursorRef={cursorRef}
        />
        <LibraryPreview
          items={animations}
          count={animations.length}
        />
        <TestimonialsSlider images={imageUrls} />
        <PricingSection
          shippedRecently={60}
          count={185}
          kits={[
            {
              slug: 'reveal',
              title: 'Reveal',
              tagline: 'Preloaders and hero sections, built as one system.',
              priceDisplay: 'EUR 149',
              componentCount: 13,
            },
            {
              slug: 'menu',
              title: 'Menu',
              tagline: 'Site navigation, built as one system.',
              priceDisplay: 'EUR 149',
              componentCount: 10,
            },
          ]}
        />
       <StarterPackSection theme="dark" />
        <Accordion />
        <BottomCTA
          images={imageUrls}
          bleed={true}
        />
      </div>
    </CustomCursor>
  );
}
