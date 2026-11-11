'use client';

// Variable Mapping: K -> RevealPricingSection?, e -> kit, a -> owns, n -> priceId, s -> sectionRef, l -> priceFallback

import { useRef } from 'react';
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import { KitPurchaseCta } from '@/features/kits/components/Kitpurchasecta'; // NOTE: module id: 787160 // UNRESOLVED: name guessed from usage
import KitPrice from '@/features/pricing/components/KitPrice'; // NOTE: module id: 597274 // UNRESOLVED: name guessed from usage
import { hasKitPricing, KIT_LICENSE_NOTE } from '@/features/kits/utils/menuKits'; // NOTE: module id: 12426 // UNRESOLVED: name guessed from usage
import { ScrollTrackedFeatureList } from '@/features/kits/reveal/ScrollTrackedFeatureList'; // NOTE: module id: 301900
import { PRICING_FEATURES } from '@/features/kits/utils/reveal-kit.config'; // NOTE: module id: 301900

// NOTE: module id: 301900
export function RevealPricingSection({ kit, owns = false, priceId = null }) {
  const sectionRef = useRef(null);
  const priceFallback =
    kit?.metadata?.price_display ||
    (hasKitPricing(kit) ? null : 'Announced at launch');

  return (
    <section
      ref={sectionRef}
      data-theme="light"
      className="bg-background text-foreground"
    >
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <div className="grid grid-cols-12 gap-x-24 gap-y-40 lg:items-start">
              <div className="col-span-12 lg:col-span-5">
                <span className="text-mono-sm text-foreground-muted">
                  Pricing
                </span>
                <RevealHeading
                  as="h2"
                  sizeClass="text-h2"
                  trigger="scroll"
                  className="mt-16 max-w-[16ch] font-medium"
                >
                  One purchase. Yours forever.
                </RevealHeading>
                <div className="mt-32">
                  <p className="text-h3 font-medium text-foreground">
                    <KitPrice
                      kitSlug={kit?.slug}
                      fallback={priceFallback || 'See checkout'}
                      struckClassName="text-body font-normal text-foreground-muted"
                    />
                  </p>
                  <p className="text-body-sm mt-8 text-foreground-muted">
                    One-time. No subscription, no seats.
                  </p>
                </div>
                <KitPurchaseCta
                  kit={kit}
                  owns={owns}
                  priceId={priceId}
                  className="mt-24"
                />
                <div className="mt-20 flex flex-col gap-8">
                  <span className="flex items-center gap-8 text-mono-sm text-foreground-muted">
                    <span
                      aria-hidden="true"
                      className="size-6 shrink-0 bg-brand"
                    />
                    Final sale, so no refunds
                  </span>
                  <span className="text-body-sm text-foreground-muted">
                    {KIT_LICENSE_NOTE}
                  </span>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                <ScrollTrackedFeatureList
                  items={PRICING_FEATURES}
                  eyebrow="What you get"
                  triggerRef={sectionRef}
                  itemClassName="text-h4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
