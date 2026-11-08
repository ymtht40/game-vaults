// NOTE: module id: 397242

// Variable Mapping: e -> PRODUCT_PRICING, i -> ADDON_PRICING, V -> getProductTierPrice, s -> getSoloQuarterlyDiscount, q -> getBillingDetails, t -> getAddonTierPrice

const PRODUCT_PRICING = {
  solo: {
    quarterly: { list: 87, T2: 42, T3: 30 },
    yearly: { list: 240, T2: 139, T3: 99 }
  },
  studio: {
    quarterly: { list: 237, T2: 115, T3: 85 },
    yearly: { list: 699, T2: 385, T3: 275 }
  },
  'studio-plus': {
    quarterly: { list: 507, T2: 249, T3: 179 },
    yearly: { list: 1499, T2: 839, T3: 599 }
  }
};

export const ADDON_PRICING = {
  reveal: { list: 149, T2: 105, T3: 75 },
  menu: { list: 149, T2: 105, T3: 75 }
};

// Original Export: V (or n)
export function getProductTierPrice(product, cycle, tier) {
  const productData = PRODUCT_PRICING[product]?.[cycle];
  return productData && (tier === 'T2' || tier === 'T3') ? productData[tier] ?? null : null;
}

// Original Export: s
export function getSoloQuarterlyDiscount(tier) {
  const soloQuarterly = PRODUCT_PRICING.solo.quarterly;
  const price = tier === 'T2' || tier === 'T3' ? soloQuarterly[tier] : null;
  return price ? Math.round(100 * (soloQuarterly.list - price) / soloQuarterly.list) : null;
}

// Original Export: q
export function getBillingDetails(product, cycle, tier) {
  const price = getProductTierPrice(product, cycle, tier);
  
  if (price == null) {
    return null;
  }
  
  if (cycle === 'quarterly') {
    return { price: Math.ceil(price / 3), cycleTotal: price };
  }
  
  return { price, cycleTotal: null };
}

// Original Export: t
export function getAddonTierPrice(addon, tier) {
  const addonData = ADDON_PRICING[addon];
  return addonData && (tier === 'T2' || tier === 'T3') ? addonData[tier] ?? null : null;
}
