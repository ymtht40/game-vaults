// NOTE: module id: 825740

// Variable Mapping: 
// e -> NEXT_PUBLIC_FORCE_PRODUCTION check
// t -> isForceProduction
// r -> isProdEnv (hardcoded true)
// a -> isProduction
// o -> LEGACY_PRICES_TEST
// l -> LEGACY_PRICES_PROD
// n -> SUBSCRIPTION_PRICES_TEST
// i -> SUBSCRIPTION_PRICES_PROD
// s -> LAUNCH_OFFER_PRICES_TEST
// u -> LAUNCH_OFFER_PRICES_PROD
// m -> QUARTERLY_PRICES_TEST
// y -> QUARTERLY_PRICES_PROD
// h -> STUDIO_SEATS_PRICES_TEST
// K -> STUDIO_SEATS_PRICES_PROD
// c -> legacyPrices (Export: b)
// d -> subscriptionPrices (Export: k)
// p -> launchOfferPrices
// f -> quarterlyPrices (Export: P)
// v -> studioSeatsPrices (Export: x)
// g -> DISCOUNT_CODES_TEST
// _ -> DISCOUNT_CODES_PROD
// R -> mapPricesToDiscount
// b -> ADDON_PRICES_TEST
// P -> ADDON_PRICES_PROD

const isForceProduction = process.env.NEXT_PUBLIC_FORCE_PRODUCTION === 'true';
const isProdEnv = true;
const isProduction = isProdEnv || isForceProduction;

const LEGACY_PRICES_TEST = {
  pro: 'price_1SmdgaRvKRKuKXmGKUEtcEIW',
  team: 'price_1Sme0wRvKRKuKXmGxvFcJSSH',
  lifetimePro: 'price_1So4YrRvKRKuKXmGGv53ZBWU'
};

const LEGACY_PRICES_PROD = {
  pro: 'price_1SgkfFRvKRKuKXmGBrzPYauv',
  team: 'price_1SgkfDRvKRKuKXmGDhPp0Iex',
  lifetimePro: 'price_1So4WaRvKRKuKXmGYkYZt35Z'
};

const SUBSCRIPTION_PRICES_TEST = {
  soloYearly: 'price_1UOGTcRvKRKuKXmGggrvYhSG',
  soloYearly249: 'price_1TdFEoRvKRKuKXmGEiYeo97J',
  soloMonthly: 'price_1TdFEoRvKRKuKXmGV7jD9iQh',
  studioYearly: 'price_1TdFEpRvKRKuKXmGRymGG43K',
  studioMonthly: 'price_1TdFEqRvKRKuKXmGB65QEdGD',
  studioPlusYearly: 'price_1TdFErRvKRKuKXmGK0DYsOMB',
  studioPlusMonthly: 'price_1TdFErRvKRKuKXmGxGTqkdgI'
};

const SUBSCRIPTION_PRICES_PROD = {
  soloYearly: 'price_1UOGTpRvKRKuKXmGKNOYxyHk',
  soloYearly249: 'price_1TdFH5RvKRKuKXmGDXlyHBFY',
  soloMonthly: 'price_1TdFH5RvKRKuKXmGV7QKmzVy',
  studioYearly: 'price_1TdFH6RvKRKuKXmGo7qkBvqi',
  studioMonthly: 'price_1TdFH7RvKRKuKXmGyVfG3wrm',
  studioPlusYearly: 'price_1TdFH8RvKRKuKXmGJOKCdxYD',
  studioPlusMonthly: 'price_1TdFH8RvKRKuKXmGss4l59Cn'
};

const LAUNCH_OFFER_PRICES_TEST = {
  soloYearly: null,
  soloMonthly: null,
  studioYearly: null,
  studioMonthly: null,
  studioPlusYearly: null,
  studioPlusMonthly: null
};

const LAUNCH_OFFER_PRICES_PROD = {
  soloYearly: 'price_1TfRAbRvKRKuKXmGrVbCZJxA',
  soloMonthly: 'price_1TfRKuRvKRKuKXmGFpW9zSaJ',
  studioYearly: 'price_1TfRAcRvKRKuKXmG0pFVPJWM',
  studioMonthly: 'price_1TfRKvRvKRKuKXmG8QnoNbJw',
  studioPlusYearly: 'price_1TfRAcRvKRKuKXmG7hO4XkFp',
  studioPlusMonthly: 'price_1TfRKxRvKRKuKXmGR4qWpnDv'
};

export const legacyPrices = isProduction ? LEGACY_PRICES_PROD : LEGACY_PRICES_TEST;
export const subscriptionPrices = isProduction ? SUBSCRIPTION_PRICES_PROD : SUBSCRIPTION_PRICES_TEST;
export const launchOfferPrices = isProduction ? LAUNCH_OFFER_PRICES_PROD : LAUNCH_OFFER_PRICES_TEST;

const QUARTERLY_PRICES_TEST = {
  soloQuarterly: 'price_1U1UGJRvKRKuKXmGM8VegBXN',
  studioQuarterly: 'price_1U1UGKRvKRKuKXmGRpBeCyzG',
  studioPlusQuarterly: 'price_1U1UGMRvKRKuKXmGBf0wcs7Y'
};

const QUARTERLY_PRICES_PROD = {
  soloQuarterly: 'price_1U1UHGRvKRKuKXmGFm3YYFT2',
  studioQuarterly: 'price_1U1UHHRvKRKuKXmGQjtP5l3d',
  studioPlusQuarterly: 'price_1U1UHJRvKRKuKXmG3vkO8i8k'
};

export const quarterlyPrices = isProduction ? QUARTERLY_PRICES_PROD : QUARTERLY_PRICES_TEST;

const STUDIO_SEATS_PRICES_TEST = {
  studioSeatsQuarterly: 'price_1UOGYARvKRKuKXmGElIa5dg4',
  studioSeatsYearly: 'price_1UOGYARvKRKuKXmG8nxsS6Eh'
};

const STUDIO_SEATS_PRICES_PROD = {
  studioSeatsQuarterly: 'price_1UQ4ynRvKRKuKXmGt2iM71AC',
  studioSeatsYearly: 'price_1UQ4ynRvKRKuKXmG4NBjw67v'
};

export const studioSeatsPrices = isProduction ? STUDIO_SEATS_PRICES_PROD : STUDIO_SEATS_PRICES_TEST;

const DISCOUNT_CODES_TEST = { T2: '7hAlupjR', T3: 'aSe5S8ch' };
const DISCOUNT_CODES_PROD = { T2: '0L8QOlX4', T3: 'FFbRaEuc' };

// Helper function to map a group of price IDs to a specific discount code tier
function mapPricesToDiscount(pricesObj, discountCodesObj, tier) {
  return Object.fromEntries(
    Object.values(pricesObj)
      .filter(Boolean)
      .filter(() => discountCodesObj[tier])
      .map(priceId => [priceId, discountCodesObj[tier]])
  );
}

const ADDON_PRICES_TEST = {
  reveal: 'price_1TlTU4RvKRKuKXmGzj8ym0l2',
  menu: 'price_1U8HC9RvKRKuKXmGSeaIMCbI',
  'landing-pack': 'price_1UBAN6RvKRKuKXmGsqHMpbEY'
};

const ADDON_PRICES_PROD = {
  reveal: 'price_1TlTXHRvKRKuKXmGl62rlPoa',
  menu: 'price_1U8HFfRvKRKuKXmGVBlPxC8O',
  'landing-pack': 'price_1UBANXRvKRKuKXmG8FC9WzzA'
};

export const activeKitPrices = isProduction ? ADDON_PRICES_PROD : ADDON_PRICES_TEST;

// IIFE to validate/pre-warm price lists (Original code ran this for side effects)
(function validatePrices({
  prices = {},
  landingPricesTest = {},
  landingPricesProd = {},
  launchOfferTest = {},
  launchOfferProd = {},
  kitPricesTest = {},
  kitPricesProd = {},
  extra = []
} = {}) {
  let validPricesSet = new Set();
  const addPrice = (priceId) => {
    if (typeof priceId === 'string' && priceId.startsWith('price_')) {
      validPricesSet.add(priceId);
    }
  };

  for (let group of [prices, landingPricesTest, landingPricesProd, launchOfferTest, launchOfferProd, kitPricesTest, kitPricesProd]) {
    for (let priceId of Object.values(group || {})) {
      addPrice(priceId);
    }
  }
  for (let priceId of extra) {
    addPrice(priceId);
  }
})({
  prices: { ...LEGACY_PRICES_TEST, ...LEGACY_PRICES_PROD },
  landingPricesTest: SUBSCRIPTION_PRICES_TEST,
  landingPricesProd: SUBSCRIPTION_PRICES_PROD,
  launchOfferTest: LAUNCH_OFFER_PRICES_TEST,
  launchOfferProd: LAUNCH_OFFER_PRICES_PROD,
  kitPricesTest: ADDON_PRICES_TEST,
  kitPricesProd: ADDON_PRICES_PROD,
  extra: [
    ...Object.values(QUARTERLY_PRICES_TEST),
    ...Object.values(QUARTERLY_PRICES_PROD),
    ...Object.values(STUDIO_SEATS_PRICES_TEST),
    ...Object.values(STUDIO_SEATS_PRICES_PROD)
  ].filter(Boolean)
});

// Exports mapped from original module definition
export const ADDON_PACKS = ['landing-pack']; // Original Export: f

export function getKitPriceId(slug) {
  return activeKitPrices[slug] || null;
}

export function isOfferActive(date = Date.now()) { // Original Export: L
  return date < Date.parse('2026-09-18T22:00:00Z');
}
