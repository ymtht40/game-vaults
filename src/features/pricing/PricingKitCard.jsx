'use client';

/* Variable Mapping:
   T -> PricingKitCard
   e -> kit
   a -> fig
   l -> compact
   n -> rawPriceDisplay
   i -> cardRef
   o -> rest
   c -> onEnter
   u -> onLeave
   f -> pppTier
*/

import { useRef } from 'react';
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { IsometricFigure, useIsometricFigureAnimation } from '@/features/common/IsometricFigure'; // NOTE: module id: 576720 // UNRESOLVED: name guessed from usage
import { usePppTier } from '@/hooks/usePppGeo'; // NOTE: module id: 12895 // UNRESOLVED: name guessed from usage
import KitPrice from '@/features/pricing/components/KitPrice'; // NOTE: module id: 597274
import { PlanFeatureList } from '@/features/pricing/PlanFeatureList'; // NOTE: module id: 586818

// NOTE: module id: 586818
export function PricingKitCard({ kit, fig, compact = false }) {
  let rawPriceDisplay;
  const cardRef = useRef(null);
  const { rest, onEnter, onLeave } = useIsometricFigureAnimation(cardRef, fig);
  const pppTier = usePppTier();

  return (
    <article
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex flex-1 flex-col gap-16 bg-background p-24 lg:p-32"
    >
      <div className="flex items-start justify-between gap-16">
        <div className="flex flex-col gap-8">
          <p className="text-body-sm text-foreground-muted">
            {t('home-v3.pricing.kitLabel', { title: kit.title })}
          </p>
          <p className="text-h3 font-medium">
            <KitPrice
              kitSlug={kit.slug}
              fallback={
                typeof (rawPriceDisplay = kit.priceDisplay) === 'string'
                  ? rawPriceDisplay.replace(/^EUR\s*/, '€')
                  : rawPriceDisplay
              }
              struckClassName="text-body tracking-normal text-foreground-muted"
            />
            <span className="text-body-sm block font-normal tracking-normal text-foreground-muted sm:inline">
              {' '}
              {t('home-v3.pricing.oneTime')}
            </span>
          </p>
        </div>
        <div
          aria-hidden="true"
          className="flex h-[88px] w-[88px] shrink-0 items-center justify-center sm:w-[120px]"
        >
          <IsometricFigure boxes={rest} />
        </div>
      </div>
      <div className="flex flex-col gap-12">
        <p className="text-body-sm">{kit.tagline}</p>
        {!compact && (
          <PlanFeatureList
            strong={1}
            items={[
              t('home-v3.pricing.kitComponents', { count: kit.componentCount }),
              t('home-v3.pricing.kitFormats'),
              t('home-v3.pricing.kitOwned'),
            ]}
          />
        )}
      </div>
      <div className="mt-auto">
        <Button
          href={`/checkout?kit=${kit.slug}`}
          onClick={() =>
            analytics.track('kit_checkout_cta_clicked', {
              kit: kit.title,
              ...(pppTier ? { ppp_tier: pppTier } : {}),
            })
          }
          theme="surface"
          className="w-full justify-center"
        >
          {t('home-v3.pricing.kitCta', { title: kit.title })}
        </Button>
      </div>
    </article>
  );
}
