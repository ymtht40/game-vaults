// Variable Mapping: r -> cycleMonths, a -> discountTiers, I -> calculateBaseVolumePrice, C -> calculateDiscountedPrice
// NOTE: module id: 59011

export const cycleMonths = { quarterly: 3, yearly: 12 };
const discountTiers = { T2: 30, T3: 50 };

export function calculateBaseVolumePrice(e, t, r = 1) {
  return (function(e, t, r = 1) {
    return 100 * Math.floor((t / r) * (10 - Math.min(+Math.max(0, e - 1), 4)) / 10 / 100 + 1e-9) * r;
  })(e, t, r) * e;
}

export function calculateDiscountedPrice(e, t, r, l = 1) {
  let tierDiscount = discountTiers[r];
  let calculatedPrice = calculateBaseVolumePrice(e, t, l);
  return tierDiscount ? Math.round(calculatedPrice * (100 - tierDiscount) / 100) : calculatedPrice;
}

export const Z = 20;
export const E = 2;
