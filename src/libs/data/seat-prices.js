// Variable Mapping: r -> CYCLE_MONTHS, a -> TIER_DISCOUNT_PERCENT, o -> calculateStudioTotalCents, Z -> MAX_STUDIO_SEATS, E -> MIN_STUDIO_SEATS, C -> calculateTieredStudioTotalCents, I -> calculateStudioTotalCents

export const CYCLE_MONTHS = {
  quarterly: 3,
  yearly: 12,
};

export const MIN_STUDIO_SEATS = 2;
export const MAX_STUDIO_SEATS = 20;

const TIER_DISCOUNT_PERCENT = {
  T2: 30,
  T3: 50,
};

function calculatePerSeatCents(seats, soloCents, cycleMonths = 1) {
  const discountSteps = Math.min(+Math.max(0, seats - 1), 4);
  const discountedRate = (10 - discountSteps) / 10;
  return (
    100 *
    Math.floor(((soloCents / cycleMonths) * discountedRate) / 100 + 1e-9) *
    cycleMonths
  );
}

// NOTE: module id: 59011
export function calculateStudioTotalCents(seats, soloCents, cycleMonths = 1) {
  return calculatePerSeatCents(seats, soloCents, cycleMonths) * seats;
}

export function calculateTieredStudioTotalCents(
  seats,
  soloCents,
  tierKey,
  cycleMonths = 1
) {
  const tierDiscount = TIER_DISCOUNT_PERCENT[tierKey];
  const baseTotalCents = calculateStudioTotalCents(seats, soloCents, cycleMonths);
  return tierDiscount
    ? Math.round((baseTotalCents * (100 - tierDiscount)) / 100)
    : baseTotalCents;
}

export {
  CYCLE_MONTHS as r,
  MAX_STUDIO_SEATS as Z,
  MIN_STUDIO_SEATS as E,
  calculateTieredStudioTotalCents as C,
  calculateStudioTotalCents as I,
};
