'use client';

/* Variable Mapping:
   e -> kits
   a -> shippedRecently
   l -> headingAs
   d -> headline
   y -> sub
   b -> defaultCycle
   w -> count
   k -> compact
   $ -> className
   E -> id
   M -> cycle
   S -> setCycle
   _ -> animationTrigger
   O -> seats
   L -> setSeats
   F -> pppTier
   K -> soloQuarterlyPpp
   D -> soloYearlyPpp
   V -> soloPricing
   H -> getStudioCycleTotal
   I -> studioPricing
   Q -> getMonthlyAmount
   Y -> createPlanSelectHandler
*/

import { useState } from 'react';
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import {
  pricingConfig,
  formatMonthlyPrice,
  formatCycleTotalPrice,
} from '@/libs/data/pricing'; // NOTE: module id: 516799 // UNRESOLVED: name guessed from usage
import { getPlanCyclePricing } from '@/features/marketing/Ppppricing'; // NOTE: module id: 397242 // UNRESOLVED: name guessed from usage
import {
  calculateTieredStudioTotalCents,
  CYCLE_MONTHS,
} from '@/libs/data/seat-prices'; // NOTE: module id: 59011 // UNRESOLVED: name guessed from usage
import { roundCurrency, resolveSoloFeatures } from '@/libs/config/pricingFormatters'; // NOTE: module id: 586818
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { BulletList } from '@/features/pricing/components/BulletList'; // NOTE: module id: 702954 // UNRESOLVED: unused import retained from bundle
import RevealHeading from '@/animations/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import AnimatedText from '@/animations/AnimatedText'; // NOTE: module id: 460391 // UNRESOLVED: name guessed from usage
import { usePppTier } from '@/hooks/usePppGeo'; // NOTE: module id: 12895 // UNRESOLVED: name guessed from usage
// import '@/lib/module-520237'; // NOTE: module id: 520237 // UNRESOLVED: unused side-effect import in 586818
// import '@/lib/module-101836'; // NOTE: module id: 101836 // UNRESOLVED: unused side-effect import in 586818
// import '@/lib/module-825740'; // NOTE: module id: 825740 // UNRESOLVED: unused side-effect import in 586818
// import '@/lib/module-245647'; // NOTE: module id: 245647 // UNRESOLVED: unused side-effect import in 586818
import { PricingCycleToggle } from '@/features/pricing/PricingCycleToggle'; // NOTE: module id: 821980
import { SeatStepper } from '@/features/pricing/SeatStepper'; // NOTE: module id: 69291
import { StudioSeatsFigure } from '@/features/pricing/StudioSeatsFigure'; // NOTE: module id: 586818
import { MonthsFreeBadge } from '@/features/pricing/MonthsFreeBadge'; // NOTE: module id: 586818
import { PlanPriceDisplay } from '@/features/pricing/PlanPriceDisplay'; // NOTE: module id: 586818
import { PricingPlanCard } from '@/features/pricing/PricingPlanCard'; // NOTE: module id: 586818
import { PlanFeatureList } from '@/features/pricing/PlanFeatureList'; // NOTE: module id: 586818
import { PricingKitCard } from '@/features/pricing/PricingKitCard'; // NOTE: module id: 586818
import {
  soloPlan,
  studioPlan,
  soloFig,
  revealFig,
  menuFig,
} from '@/features/pricing/utils/pricing.config'; // NOTE: module id: 586818

// NOTE: module id: 586818
export { revealFig };

// NOTE: module id: 586818
export default function PricingSection({
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
  const animationTrigger = headingAs === 'h1' ? 'pageEnter' : 'scroll';
  const [seats, setSeats] = useState(studioPlan?.minSeats ?? 2);
  const pppTier = usePppTier();

  const soloQuarterlyPpp = pppTier ? getPlanCyclePricing('solo', 'quarterly', pppTier) : null;
  const soloYearlyPpp = pppTier ? getPlanCyclePricing('solo', 'yearly', pppTier) : null;

  const soloPricing = {
    quarterMonth: soloQuarterlyPpp
      ? soloQuarterlyPpp.price
      : formatMonthlyPrice(soloPlan.quarterly),
    quarter: soloQuarterlyPpp
      ? soloQuarterlyPpp.cycleTotal
      : formatCycleTotalPrice(soloPlan.quarterly),
    year: soloYearlyPpp ? soloYearlyPpp.price : formatMonthlyPrice(soloPlan.yearly),
  };

  const getStudioCycleTotal = (targetCycle) =>
    studioPlan
      ? calculateTieredStudioTotalCents(
          seats,
          studioPlan.soloCents[targetCycle],
          pppTier,
          CYCLE_MONTHS[targetCycle]
        ) / 100
      : 0;

  const studioPricing = {
    quarter: getStudioCycleTotal('quarterly'),
    year: getStudioCycleTotal('yearly'),
  };
  studioPricing.quarterMonth = roundCurrency(studioPricing.quarter / 3);

  const getMonthlyAmount = (planPricing) =>
    cycle === 'quarterly' ? planPricing.quarterMonth : roundCurrency(planPricing.year / 12);

  const createPlanSelectHandler = (planKey, price, extraProps) => () =>
    analytics.track('pricing_plan_selected', {
      plan: planKey,
      cycle,
      price,
      ...extraProps,
      ...(pppTier ? { ppp_tier: pppTier } : {}),
    });

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
            {sub ? (
              <AnimatedText
                as="p"
                trigger={animationTrigger}
                delay={0.3}
                className="text-body-lg max-w-[46ch] text-foreground-muted"
              >
                {sub}
              </AnimatedText>
            ) : null}
          </div>
          <PricingCycleToggle cycle={cycle} onChange={setCycle} hint={false} />
        </div>

        <div className="v3-rail grid grid-cols-1 gap-px border border-foreground/15 bg-foreground/15 [--rail-gap:0px] [--rail-item:85%] max-md:border-0 max-md:bg-transparent max-md:*:border-y max-md:*:border-r max-md:*:border-foreground/15 max-md:[&>:first-child]:border-l md:grid-cols-2 xl:grid-cols-3">
          <PricingPlanCard
            fig={soloFig}
            featured={true}
            compact={compact}
            label={t('home-v3.pricing.soloLabel')}
          >
            <div className="flex flex-col gap-8">
              <PlanPriceDisplay
                amount={getMonthlyAmount(soloPricing)}
                plan={soloPricing}
                cycle={cycle}
                muted="text-white/75"
                was={cycle === 'yearly' ? soloPricing.quarterMonth : null}
              />
              <MonthsFreeBadge plan={soloPricing} cycle={cycle} />
            </div>
            <p className="text-body-sm text-white/85">{soloPlan.pitch}</p>
            <PlanFeatureList
              items={resolveSoloFeatures(soloPlan.features, {
                shippedRecently,
                ...(count ? { count } : {}),
              })}
              featured={true}
            />
            <div className="mt-auto flex flex-col gap-12">
              <Button
                href={`/checkout?plan=solo&cycle=${cycle}`}
                onClick={createPlanSelectHandler(
                  'solo',
                  cycle === 'quarterly' ? soloPricing.quarterMonth : soloPricing.year
                )}
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
                  was={cycle === 'yearly' ? studioPricing.quarterMonth : null}
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
                  <a
                    href={`mailto:${pricingConfig.resend.supportEmail}`}
                    className="underline underline-offset-2"
                  >
                    {t('home-v3.pricing.moreSeats', { max: studioPlan.maxSeats })}
                  </a>
                </p>
                <Button
                  href={`/checkout?plan=${studioPlan.key}&cycle=${cycle}&seats=${seats}`}
                  onClick={createPlanSelectHandler(
                    studioPlan.key,
                    cycle === 'quarterly' ? studioPricing.quarter : studioPricing.year,
                    { seats }
                  )}
                  theme="surface"
                  className="w-full justify-center"
                >
                  {studioPlan.cta}
                </Button>
              </div>
            </PricingPlanCard>
          )}

          <div className="flex flex-col gap-px max-md:bg-foreground/15 max-md:bg-clip-padding md:col-span-2 xl:col-span-1">
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
