// Variable Mapping: D -> PLAN_PRICES, e -> getPlanTierPrice, t -> PRODUCT_PRICES, s -> getPppDiscountPercent, q -> getPlanCyclePricing

const PLAN_PRICES = {
  solo: {
    quarterly: { list: 87, T2: 42, T3: 30 },
    yearly: { list: 240, T2: 139, T3: 99 },
  },
  studio: {
    quarterly: { list: 237, T2: 115, T3: 85 },
    yearly: { list: 699, T2: 385, T3: 275 },
  },
  'studio-plus': {
    quarterly: { list: 507, T2: 249, T3: 179 },
    yearly: { list: 1499, T2: 839, T3: 599 },
  },
};

// NOTE: module id: 397242
export function getPlanTierPrice(plan, cycle, tier) {
  const cyclePrices = PLAN_PRICES[plan]?.[cycle];
  return cyclePrices && (tier === 'T2' || tier === 'T3')
    ? (cyclePrices[tier] ?? null)
    : null;
}

export const PRODUCT_PRICES = {
  reveal: { list: 149, T2: 105, T3: 75 },
  menu: { list: 149, T2: 105, T3: 75 },
};

export function getPppDiscountPercent(tier) {
  const soloQuarterly = PLAN_PRICES.solo.quarterly;
  const tierPrice = tier === 'T2' || tier === 'T3' ? soloQuarterly[tier] : null;
  return tierPrice
    ? Math.round(((soloQuarterly.list - tierPrice) / soloQuarterly.list) * 100)
    : null;
}

export function getPlanCyclePricing(plan, cycle, tier) {
  const tierPrice = getPlanTierPrice(plan, cycle, tier);
  if (tierPrice == null) return null;

  return cycle === 'quarterly'
    ? { price: Math.ceil(tierPrice / 3), cycleTotal: tierPrice }
    : { price: tierPrice, cycleTotal: null };
}

export function getProductTierPrice(product, tier) {
  const productPrices = PRODUCT_PRICES[product];
  return productPrices && (tier === 'T2' || tier === 'T3')
    ? (productPrices[tier] ?? null)
    : null;
}