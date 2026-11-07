'use client';

/* Variable Mapping:
   B -> PlanPriceDisplay
   e -> amount
   r -> plan
   a -> cycle
   n -> muted
   i -> was
   s -> wholeEuros
   o -> cents
*/

import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { formatEuro } from '@/libs/config/pricingFormatters'; // NOTE: module id: 586818
import RollerNumber from '@/animations/AnimatedNumber'; // NOTE: module id: 162387
import { CycleTextSwap } from '@/features/pricing/CycleTextSwap'; // NOTE: module id: 586818

// NOTE: module id: 586818
export function PlanPriceDisplay({ amount, plan, cycle, muted, was }) {
  const wholeEuros = Math.floor(amount + 1e-6);
  const cents = Math.round((amount - wholeEuros) * 100);

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-16 gap-y-4">
      <div className="text-h2 inline-flex items-baseline font-medium">
        <span>€</span>
        <RollerNumber
          value={wholeEuros}
          minDigits={1}
          triggerMode="immediate"
          duration={1.2}
          valueChangeDuration={0.8}
          className="text-h2 font-medium leading-none"
        />
        {cents > 0 ? (
          <>
            <span>.</span>
            <RollerNumber
              value={cents}
              minDigits={2}
              triggerMode="immediate"
              duration={1.2}
              valueChangeDuration={0.8}
              className="text-h2 font-medium leading-none"
            />
          </>
        ) : null}
        {was ? (
          <span className={`text-body ml-8 font-normal tracking-normal line-through ${muted}`}>
            {formatEuro(was)}
          </span>
        ) : null}
        <span className={`text-body ml-4 font-normal tracking-normal ${muted}`}>
          {t('home-v3.pricing.perMonth')}
        </span>
      </div>
      <CycleTextSwap
        cycle={cycle}
        align="end"
        texts={{
          quarterly: t('home-v3.pricing.billedQuarterly', { total: formatEuro(plan.quarter) }),
          yearly: t('home-v3.pricing.billedYearly', { total: formatEuro(plan.year) }),
        }}
        className={`text-body-sm basis-full sm:basis-auto ${muted}`}
      />
    </div>
  );
}
