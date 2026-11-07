'use client';

/* Variable Mapping:
   R -> MonthsFreeBadge
   e -> plan
   r -> cycle
   a -> monthsFree
*/

import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { CycleTextSwap } from '@/features/pricing/CycleTextSwap'; // NOTE: module id: 586818

// NOTE: module id: 586818
export function MonthsFreeBadge({ plan, cycle }) {
  const monthsFree = Math.floor((4 * plan.quarter - plan.year) / (plan.quarter / 3));

  return monthsFree > 0 ? (
    <CycleTextSwap
      cycle={cycle}
      texts={{
        quarterly: ' ',
        yearly: t('home-v3.pricing.monthsFree', { months: monthsFree }),
      }}
      className="text-body-sm text-brand"
    />
  ) : null;
}
