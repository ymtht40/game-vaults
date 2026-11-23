'use client';

import { useState } from 'react';
import { t } from '@/libs/utils/i18n';
import { analytics } from '@/libs/analytics/posthogAnalytics';
import {
  appConfig,
  getActivePrice,
  getActiveCycleTotal,
  calculateTierSeatsPrice,
  CYCLE_MONTHS,
} from '@/libs/config/appConfig';
import { getBillingDetails } from '@/libs/utils/pricingUtils';
import { roundCurrency, resolveSoloFeatures } from '@/libs/utils/pricingFormatters';
import Button from '@/components/ui/Button';
import RevealHeading from '@/components/motion/RevealHeading';
import FadeIn from '@/components/motion/FadeIn';
import { usePppTier } from '@/hooks/usePppGeo';
import { PricingCycleToggle } from '@/features/pricing/PricingCycleToggle';
import { SeatStepper } from '@/features/pricing/SeatStepper';
import { StudioSeatsFigure } from '@/features/pricing/StudioSeatsFigure';
import { MonthsFreeBadge } from '@/features/pricing/MonthsFreeBadge';
import { PlanPriceDisplay } from '@/features/pricing/PlanPriceDisplay';
import { PricingPlanCard } from '@/features/pricing/PricingPlanCard';
import { PlanFeatureList } from '@/features/pricing/PlanFeatureList';
import { PricingKitCard } from '@/features/pricing/PricingKitCard';
import {
  soloPlan,
  studioPlan,
  soloFig,
  revealFig,
  menuFig,
} from '@/features/pricing/utils/pricing.config';

// One hairline grid: the 1px gap shows the bg through as the divider.
// Below md the rail scrolls sideways, so each card draws its own borders instead.
const RAIL_CLASS = [
  'v3-rail grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3',
  'border border-foreground/15 bg-foreground/15 [--rail-gap:0px] [--rail-item:85%]',
  'max-md:border-0 max-md:bg-transparent',
  'max-md:*:border-y max-md:*:border-r max-md:*:border-foreground/15',
  'max-md:[&>:first-child]:border-l',
].join(' ');

const KITS_CLASS =
  'flex flex-col gap-px max-md:bg-foreground/15 max-md:bg-clip-padding md:col-span-2 xl:col-span-1';

function PricingSection({
  kits = [],
  shippedRecently = 0,
  headingAs = 'h2',
  headline,
  sub,
  defaultCycle = 'quarterly',
  count,
  compact = false,
  className = 'py-64 lg:py-160',
  id = 'pricing',
}) {
  const [cycle, setCycle] = useState(defaultCycle);
  const [seats, setSeats] = useState(studioPlan?.minSeats ?? 2);
  const pppTier = usePppTier();

  const isQuarterly = cycle === 'quarterly';
  const isYearly = cycle === 'yearly';
  const animationTrigger = headingAs === 'h1' ? 'pageEnter' : 'scroll';

  // Solo: PPP-adjusted billing when a tier applies, list prices otherwise
  const soloPpp = (period) => (pppTier ? getBillingDetails('solo', period, pppTier) : null);
  const soloQuarterlyPpp = soloPpp('quarterly');
  const soloYearlyPpp = soloPpp('yearly');

  const soloPricing = {
    quarterMonth: soloQuarterlyPpp ? soloQuarterlyPpp.price : getActivePrice(soloPlan.quarterly),
    quarter: soloQuarterlyPpp ? soloQuarterlyPpp.cycleTotal : getActiveCycleTotal(soloPlan.quarterly),
    year: soloYearlyPpp ? soloYearlyPpp.price : getActivePrice(soloPlan.yearly),
  };

  const soloFeatures = resolveSoloFeatures(soloPlan.features, {
    shippedRecently,
    ...(count ? { count } : {}),
  });

  // Studio: tiered per-seat pricing, computed in cents
  const getStudioCycleTotal = (period) => {
    if (!studioPlan) return 0;

    const cents = calculateTierSeatsPrice(
      seats,
      studioPlan.soloCents[period],
      pppTier,
      CYCLE_MONTHS[period],
    );

    return cents / 100;
  };

  const studioQuarter = getStudioCycleTotal('quarterly');
  const studioPricing = {
    quarter: studioQuarter,
    year: getStudioCycleTotal('yearly'),
    quarterMonth: roundCurrency(studioQuarter / 3),
  };

  const getMonthlyAmount = (pricing) =>
    isQuarterly ? pricing.quarterMonth : roundCurrency(pricing.year / 12);

  const trackPlanSelected = (plan, price, extra) => () =>
    analytics.track('pricing_plan_selected', {
      plan,
      cycle,
      price,
      ...extra,
      ...(pppTier ? { ppp_tier: pppTier } : {}),
    });

  const trackSolo = trackPlanSelected(
    'solo',
    isQuarterly ? soloPricing.quarterMonth : soloPricing.year,
  );

  const trackStudio =
    studioPlan &&
    trackPlanSelected(
      studioPlan.key,
      isQuarterly ? studioPricing.quarter : studioPricing.year,
      { seats },
    );

  return (
    <section
      id={id}
      data-theme="light"
      className={`scroll-mt-96 bg-background text-foreground ${className}`}
    >
      <div className={`v2-container flex flex-col ${compact ? 'gap-40' : 'gap-48 lg:gap-64'}`}>
        <div className="flex flex-wrap items-end justify-between gap-24">
          <div className="flex flex-col gap-16">
            <RevealHeading
              as={headingAs}
              sizeClass="text-h2"
              className="max-w-[20ch] font-medium text-balance"
              trigger={animationTrigger}
            >
              {headline ?? t('home-v3.pricing.headline')}
            </RevealHeading>
            {sub && (
              <FadeIn
                as="p"
                trigger={animationTrigger}
                delay={0.3}
                className="text-body-lg max-w-[46ch] text-foreground-muted"
              >
                {sub}
              </FadeIn>
            )}
          </div>
          <PricingCycleToggle cycle={cycle} onChange={setCycle} hint={false} />
        </div>

        <div className={RAIL_CLASS}>
          <PricingPlanCard
            fig={soloFig}
            featured
            compact={compact}
            label={t('home-v3.pricing.soloLabel')}
          >
            <div className="flex flex-col gap-8">
              <PlanPriceDisplay
                amount={getMonthlyAmount(soloPricing)}
                plan={soloPricing}
                cycle={cycle}
                muted="text-white/75"
                was={isYearly ? soloPricing.quarterMonth : null}
              />
              <MonthsFreeBadge plan={soloPricing} cycle={cycle} />
            </div>
            <p className="text-body-sm text-white/85">{soloPlan.pitch}</p>
            <PlanFeatureList items={soloFeatures} featured />
            <div className="mt-auto flex flex-col gap-12">
              <Button
                href={`/checkout?plan=solo&cycle=${cycle}`}
                onClick={trackSolo}
                theme="brand"
                className="w-full justify-center"
              >
                {soloPlan.cta}
              </Button>
            </div>
          </PricingPlanCard>

          {studioPlan && (
            <PricingPlanCard
              figure={<StudioSeatsFigure seats={seats} />}
              compact={compact}
              label={t('home-v3.pricing.studioLabel')}
            >
              <div className="flex flex-col gap-12">
                <PlanPriceDisplay
                  amount={getMonthlyAmount(studioPricing)}
                  plan={studioPricing}
                  cycle={cycle}
                  muted="text-foreground-muted"
                  was={isYearly ? studioPricing.quarterMonth : null}
                />
                <MonthsFreeBadge plan={studioPricing} cycle={cycle} />
                <SeatStepper
                  seats={seats}
                  onChange={setSeats}
                  min={studioPlan.minSeats}
                  max={studioPlan.maxSeats}
                />
              </div>
              <p className="text-body-sm text-foreground-muted">{studioPlan.pitch}</p>
              <PlanFeatureList items={studioPlan.features} strong={2} />
              <div className="mt-auto flex flex-col gap-12">
                <p className="text-body-sm text-foreground-muted">
                  <a href={`mailto:${appConfig.resend.supportEmail}`} className="underline underline-offset-2">
                    {t('home-v3.pricing.moreSeats', { max: studioPlan.maxSeats })}
                  </a>
                </p>
                <Button
                  href={`/checkout?plan=${studioPlan.key}&cycle=${cycle}&seats=${seats}`}
                  onClick={trackStudio}
                  theme="surface"
                  className="w-full justify-center"
                >
                  {studioPlan.cta}
                </Button>
              </div>
            </PricingPlanCard>
          )}

          <div className={KITS_CLASS}>
            {kits.map((kit) => (
              <PricingKitCard
                key={kit.slug}
                kit={kit}
                compact={compact}
                fig={kit.slug === 'menu' ? menuFig : revealFig}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { revealFig };
export default PricingSection;
