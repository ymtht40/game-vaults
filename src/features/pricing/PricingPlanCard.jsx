'use client';

/* Variable Mapping:
   U -> PricingPlanCard
   e -> fig
   a -> figure
   l -> featured
   n -> compact
   i -> label
   s -> children
   o -> cardRef
   c -> rest
   u -> onEnter
   d -> onLeave
   m -> renderedFigure
   f -> featuredSvgClass
*/

import { useRef } from 'react';
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { IsometricFigure, useIsometricFigureAnimation } from '@/components/motion/IsometricFigure'; // NOTE: module id: 576720 // UNRESOLVED: name guessed from usage
import { emptyFig } from '@/features/pricing/utils/pricing.config'; // NOTE: module id: 586818

// NOTE: module id: 586818
export function PricingPlanCard({
  fig = emptyFig,
  figure,
  featured = false,
  compact = false,
  label,
  children,
}) {
  const cardRef = useRef(null);
  const { rest, onEnter, onLeave } = useIsometricFigureAnimation(cardRef, fig);
  const renderedFigure = figure ?? <IsometricFigure boxes={rest} />;
  const featuredSvgClass = featured ? '[&_g]:fill-transparent [&_g]:text-white' : '';

  return (
    <article
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`relative flex flex-col gap-24 overflow-hidden p-24 lg:p-32 ${
        featured ? 'bg-black text-white' : 'bg-background'
      }`}
    >
      <div
        className={`relative grid grid-cols-[1fr_auto] items-start gap-x-16 ${
          compact ? '' : 'lg:gap-y-24'
        }`}
      >
        <div className="flex flex-col items-start gap-8">
          <p className={`text-body-sm ${featured ? 'text-white/75' : 'text-foreground-muted'}`}>
            {label}
          </p>
          {featured && (
            <span className={`text-body-sm bg-white/15 px-8 py-4 ${compact ? '' : 'lg:hidden'}`}>
              {t('home-v3.pricing.popular')}
            </span>
          )}
        </div>
        {featured && !compact && (
          <span className="text-body-sm hidden bg-white/15 px-8 py-4 lg:col-start-2 lg:row-start-1 lg:block">
            {t('home-v3.pricing.popular')}
          </span>
        )}
        <div
          aria-hidden="true"
          className={`col-start-2 row-start-1 flex h-[72px] w-[104px] items-center justify-center sm:w-[136px] ${
            compact
              ? ''
              : 'lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:h-[120px] lg:w-auto'
          } ${featuredSvgClass}`}
        >
          {renderedFigure}
        </div>
      </div>
      <div className="relative flex flex-1 flex-col gap-24">{children}</div>
    </article>
  );
}
