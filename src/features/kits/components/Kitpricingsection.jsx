'use client';

// Variable Mapping: e -> kit / videoRef, d -> owns, h -> priceId, f -> included, p -> media, m -> videoRef, C -> prefersReducedMotion, g -> setPrefersReducedMotion, v -> hasLoadedVideo, x -> fallbackPriceDisplay, y -> pppTier, w -> pppPrice

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import { getAddonTierPrice } from '@/libs/utils/pricingUtils'; // NOTE: module id: 397242
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import KitPrice from '@/features/pricing/components/KitPrice'; // NOTE: module id: 597274
import { usePppTier } from '@/hooks/usePppGeo'; // NOTE: module id: 12895
import { KitPurchaseCta } from '@/features/kits/components/Kitpurchasecta'; // NOTE: module id: 787160
import { KIT_LICENSE_NOTE, hasKitPricing } from '@/features/kits/utils/menuKits'; // NOTE: module id: 12426

function useLazyViewportVideo(videoRef, isDisabled = false) {
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEnteredViewport(true);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, [videoRef]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && hasEnteredViewport) {
      if (isIntersecting && !isDisabled) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    }
  }, [videoRef, hasEnteredViewport, isIntersecting, isDisabled]);

  return hasEnteredViewport;
}

// NOTE: module id: 509259
export default function KitPricingSection({
  kit,
  owns = false,
  priceId = null,
  included = [],
  media = null,
}) {
  const videoRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return;

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const hasLoadedVideo = useLazyViewportVideo(videoRef, prefersReducedMotion);
  const fallbackPriceDisplay =
    kit?.metadata?.price_display ||
    (hasKitPricing(kit) ? null : 'Announced at launch');
  const pppTier = usePppTier();
  const pppPrice = pppTier ? getAddonTierPrice(kit?.slug, pppTier) : null;

  return (
    <section data-theme="light" className="bg-background text-foreground">
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">Pricing</span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[18ch] font-medium"
            >
              One purchase. Yours forever.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[54ch] leading-relaxed text-foreground-muted"
            >
              No subscription, no seats, no renewal. The whole Kit, owned.
            </AnimatedText>
            <FadeIn trigger="scroll" y={24} className="mt-40">
              <div
                data-theme="dark"
                className="relative grid grid-cols-1 overflow-hidden border border-foreground/15 bg-background text-foreground lg:grid-cols-[1.1fr_1fr]"
              >
                <div className="relative min-h-[240px] overflow-hidden border-b border-foreground/15 lg:absolute lg:inset-y-0 lg:left-0 lg:m-0 lg:w-[52.381%] lg:min-h-0 lg:border-b-0 lg:border-r">
                  {media?.type === 'image' && media.src ? (
                    <img
                      src={media.src}
                      alt={`${kit.title} Kit preview`}
                      className="absolute inset-0 object-cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : media?.src ? (
                    <video
                      ref={videoRef}
                      className="absolute inset-0 object-cover"
                      style={{ width: '100%', height: '100%' }}
                      src={hasLoadedVideo ? media.src : undefined}
                      poster={media.poster || undefined}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={`${kit.title} Kit showreel`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/[0.04]">
                      <span className="text-mono-sm text-foreground-muted">
                        Showreel
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-24 p-24 lg:col-start-2 lg:p-40">
                  <div className="flex items-center gap-8 text-mono-sm text-foreground-muted">
                    <span
                      aria-hidden="true"
                      className="size-6 shrink-0 bg-brand"
                    />
                    {kit.title} Kit
                  </div>
                  <div>
                    <p className="text-h2 font-medium text-foreground">
                      <KitPrice
                        kitSlug={kit?.slug}
                        fallback={fallbackPriceDisplay || 'See checkout'}
                        struckClassName="text-body font-normal text-foreground-muted"
                      />
                    </p>
                    <p className="text-body-sm mt-4 text-foreground-muted">
                      One-time. No subscription, no seats.
                    </p>
                  </div>
                  <ul className="flex flex-col divide-y divide-foreground/10 border-y border-foreground/10">
                    {included.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-10 py-12 text-body-sm leading-relaxed text-foreground-muted"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-6 size-6 shrink-0 bg-brand"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-16">
                    <KitPurchaseCta
                      kit={kit}
                      owns={owns}
                      priceId={priceId}
                      buyLabel={
                        pppPrice
                          ? `Buy for €${pppPrice}`
                          : kit?.metadata?.price_display
                            ? `Buy for ${kit.metadata.price_display.replace(/^EUR\s*/, '€')}`
                            : undefined
                      }
                    />
                    <span className="text-body-sm text-foreground-muted">
                      {KIT_LICENSE_NOTE}
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}