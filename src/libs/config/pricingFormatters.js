/* Variable Mapping:
   A -> roundCurrency
   S -> formatEuro
*/

import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { DEFAULT_COMPONENT_COUNT } from '@/features/pricing/utils/pricing.config'; // NOTE: module id: 586818

// NOTE: module id: 586818
export const roundCurrency = (amount) => Math.round(100 * amount) / 100;

// NOTE: module id: 586818
export const formatEuro = (amount) => `€${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;

// NOTE: module id: 586818
export function resolveSoloFeatures(
  features,
  { shippedRecently = 0, count = DEFAULT_COMPONENT_COUNT } = {}
) {
  return features
    .map((item) =>
      typeof item === 'string'
        ? item
        : item?.componentCount
          ? { label: t('pricing.tiers.allComponents', { count }), highlight: true }
          : item?.shippedRecently
            ? shippedRecently >= 2
              ? { label: t('pricing.tiers.shippedRecently', { count: shippedRecently }), solid: true }
              : null
            : item?.label || ''
    )
    .filter(Boolean);
}
