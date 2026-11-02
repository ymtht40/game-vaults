

// NOTE: module id: 59011
export const cycleMonths = { quarterly: 3, yearly: 12 };
export const Z = 20;
export const E = 2;

const tierDiscounts = { T2: 30, T3: 50 };

export function calculateSeatPrice(seats, price, multiplier = 1) {
  const discountSteps = Math.min(Math.max(0, seats - 1), 4);
  const factor = (10 - discountSteps) / 10;
  const unitPrice =
    100 * Math.floor((price / multiplier * factor) / 100 + 1e-9) * multiplier;
  return unitPrice * seats;
}

export function applyTierDiscount(seats, price, tier, multiplier = 1) {
  const discountPercent = tierDiscounts[tier];
  const base = calculateSeatPrice(seats, price, multiplier);
  return discountPercent ? Math.round((base * (100 - discountPercent)) / 100) : base;
}

export const r = cycleMonths;
export const I = calculateSeatPrice;
export const C = applyTierDiscount;
