// Variable Mapping: t -> forceProduction, r -> isNodeProduction, a -> isProduction, o -> legacyPricesTest, l -> legacyPricesProd, n -> landingPricesTest, i -> landingPricesProd, s -> launchOfferTest, u -> launchOfferProd, c -> legacyPriceIds, d -> landingPriceIds, p -> launchOfferPriceIds, m -> quarterlyPricesTest, y -> quarterlyPricesProd, f -> quarterlyPriceIds, h -> studioSeatsPricesTest, K -> studioSeatsPricesProd, v -> studioSeatsPriceIds, g -> tierCouponsTest, _ -> tierCouponsProd, R -> mapPricesToTierCoupon, b -> kitPricesTest, P -> kitPricesProd, L -> isLaunchPromoActive, k -> landingPriceIds, x -> studioSeatsPriceIds

const forceProduction = process.env.NEXT_PUBLIC_FORCE_PRODUCTION === 'true';
const isNodeProduction = true;
const isProduction = isNodeProduction || forceProduction;

const legacyPricesTest = {
  pro: 'price_1SmdgaRvKRKuKXmGKUEtcEIW',
  team: 'price_1Sme0wRvKRKuKXmGxvFcJSSH',
  lifetimePro: 'price_1So4YrRvKRKuKXmGGv53ZBWU',
};

const legacyPricesProd = {
  pro: 'price_1SgkfFRvKRKuKXmGBrzPYauv',
  team: 'price_1SgkfDRvKRKuKXmGDhPp0Iex',
  lifetimePro: 'price_1So4WaRvKRKuKXmGYkYZt35Z',
};

const landingPricesTest = {
  soloYearly: 'price_1UOGTcRvKRKuKXmGggrvYhSG',
  soloYearly249: 'price_1TdFEoRvKRKuKXmGEiYeo97J',
  soloMonthly: 'price_1TdFEoRvKRKuKXmGV7jD9iQh',
  studioYearly: 'price_1TdFEpRvKRKuKXmGRymGG43K',
  studioMonthly: 'price_1TdFEqRvKRKuKXmGB65QEdGD',
  studioPlusYearly: 'price_1TdFErRvKRKuKXmGK0DYsOMB',
  studioPlusMonthly: 'price_1TdFErRvKRKuKXmGxGTqkdgI',
};

const landingPricesProd = {
  soloYearly: 'price_1UOGTpRvKRKuKXmGKNOYxyHk',
  soloYearly249: 'price_1TdFH5RvKRKuKXmGDXlyHBFY',
  soloMonthly: 'price_1TdFH5RvKRKuKXmGV7QKmzVy',
  studioYearly: 'price_1TdFH6RvKRKuKXmGo7qkBvqi',
  studioMonthly: 'price_1TdFH7RvKRKuKXmGyVfG3wrm',
  studioPlusYearly: 'price_1TdFH8RvKRKuKXmGJOKCdxYD',
  studioPlusMonthly: 'price_1TdFH8RvKRKuKXmGss4l59Cn',
};

const launchOfferTest = {
  soloYearly: null,
  soloMonthly: null,
  studioYearly: null,
  studioMonthly: null,
  studioPlusYearly: null,
  studioPlusMonthly: null,
};

const launchOfferProd = {
  soloYearly: 'price_1TfRAbRvKRKuKXmGrVbCZJxA',
  soloMonthly: 'price_1TfRKuRvKRKuKXmGFpW9zSaJ',
  studioYearly: 'price_1TfRAcRvKRKuKXmG0pFVPJWM',
  studioMonthly: 'price_1TfRKvRvKRKuKXmG8QnoNbJw',
  studioPlusYearly: 'price_1TfRAcRvKRKuKXmG7hO4XkFp',
  studioPlusMonthly: 'price_1TfRKxRvKRKuKXmGR4qWpnDv',
};

export const legacyPriceIds = isProduction ? legacyPricesProd : legacyPricesTest;
export const landingPriceIds = isProduction ? landingPricesProd : landingPricesTest;
const launchOfferPriceIds = isProduction ? launchOfferProd : launchOfferTest;

const quarterlyPricesTest = {
  soloQuarterly: 'price_1U1UGJRvKRKuKXmGM8VegBXN',
  studioQuarterly: 'price_1U1UGKRvKRKuKXmGRpBeCyzG',
  studioPlusQuarterly: 'price_1U1UGMRvKRKuKXmGBf0wcs7Y',
};

const quarterlyPricesProd = {
  soloQuarterly: 'price_1U1UHGRvKRKuKXmGFm3YYFT2',
  studioQuarterly: 'price_1U1UHHRvKRKuKXmGQjtP5l3d',
  studioPlusQuarterly: 'price_1U1UHJRvKRKuKXmG3vkO8i8k',
};

quarterlyPricesTest.soloQuarterly;
quarterlyPricesTest.studioQuarterly;
quarterlyPricesTest.studioPlusQuarterly;
landingPricesTest.soloYearly249;
landingPricesTest.studioYearly;
landingPricesTest.studioPlusYearly;
quarterlyPricesProd.soloQuarterly;
quarterlyPricesProd.studioQuarterly;
quarterlyPricesProd.studioPlusQuarterly;
landingPricesProd.soloYearly249;
landingPricesProd.studioYearly;
landingPricesProd.studioPlusYearly;

export const quarterlyPriceIds = isProduction
  ? quarterlyPricesProd
  : quarterlyPricesTest;

const studioSeatsPricesTest = {
  studioSeatsQuarterly: 'price_1UOGYARvKRKuKXmGElIa5dg4',
  studioSeatsYearly: 'price_1UOGYARvKRKuKXmG8nxsS6Eh',
};

const studioSeatsPricesProd = {
  studioSeatsQuarterly: 'price_1UQ4ynRvKRKuKXmGt2iM71AC',
  studioSeatsYearly: 'price_1UQ4ynRvKRKuKXmG4NBjw67v',
};

export const studioSeatsPriceIds = isProduction
  ? studioSeatsPricesProd
  : studioSeatsPricesTest;

const tierCouponsTest = {
  T2: '7hAlupjR',
  T3: 'aSe5S8ch',
};

const tierCouponsProd = {
  T2: '0L8QOlX4',
  T3: 'FFbRaEuc',
};

function mapPricesToTierCoupon(priceMap, couponMap, tierKey) {
  return Object.fromEntries(
    Object.values(priceMap)
      .filter(Boolean)
      .filter(() => couponMap[tierKey])
      .map((priceId) => [priceId, couponMap[tierKey]])
  );
}

const kitPricesTest = {
  reveal: 'price_1TlTU4RvKRKuKXmGzj8ym0l2',
  menu: 'price_1U8HC9RvKRKuKXmGSeaIMCbI',
  'landing-pack': 'price_1UBAN6RvKRKuKXmGsqHMpbEY',
};

const kitPricesProd = {
  reveal: 'price_1TlTXHRvKRKuKXmGl62rlPoa',
  menu: 'price_1U8HFfRvKRKuKXmGVBlPxC8O',
  'landing-pack': 'price_1UBANXRvKRKuKXmG8FC9WzzA',
};

mapPricesToTierCoupon(studioSeatsPricesTest, tierCouponsTest, 'T2');
quarterlyPricesTest.soloQuarterly;
quarterlyPricesTest.studioQuarterly;
quarterlyPricesTest.studioPlusQuarterly;
landingPricesTest.soloYearly;
landingPricesTest.studioYearly;
landingPricesTest.studioPlusYearly;
kitPricesTest.reveal;
kitPricesTest.menu;

mapPricesToTierCoupon(studioSeatsPricesTest, tierCouponsTest, 'T3');
quarterlyPricesTest.soloQuarterly;
quarterlyPricesTest.studioQuarterly;
quarterlyPricesTest.studioPlusQuarterly;
landingPricesTest.soloYearly;
landingPricesTest.studioYearly;
landingPricesTest.studioPlusYearly;
kitPricesTest.reveal;
kitPricesTest.menu;

mapPricesToTierCoupon(studioSeatsPricesProd, tierCouponsProd, 'T2');
quarterlyPricesProd.soloQuarterly;
quarterlyPricesProd.studioQuarterly;
quarterlyPricesProd.studioPlusQuarterly;
landingPricesProd.soloYearly;
landingPricesProd.studioYearly;
landingPricesProd.studioPlusYearly;
kitPricesProd.reveal;
kitPricesProd.menu;

mapPricesToTierCoupon(studioSeatsPricesProd, tierCouponsProd, 'T3');
quarterlyPricesProd.soloQuarterly;
quarterlyPricesProd.studioQuarterly;
quarterlyPricesProd.studioPlusQuarterly;
landingPricesProd.soloYearly;
landingPricesProd.studioYearly;
landingPricesProd.studioPlusYearly;
kitPricesProd.reveal;
kitPricesProd.menu;

new Set(
  [
    ...Object.values(landingPriceIds),
    ...Object.values(quarterlyPriceIds),
    ...Object.values(launchOfferPriceIds),
    ...Object.values(studioSeatsPriceIds),
    legacyPriceIds.pro,
    legacyPriceIds.team,
  ].filter(Boolean)
);

new Set(
  [
    landingPricesTest.soloMonthly,
    landingPricesTest.studioMonthly,
    landingPricesTest.studioPlusMonthly,
    landingPricesProd.soloMonthly,
    landingPricesProd.studioMonthly,
    landingPricesProd.studioPlusMonthly,
    launchOfferTest.soloMonthly,
    launchOfferTest.studioMonthly,
    launchOfferTest.studioPlusMonthly,
    launchOfferProd.soloMonthly,
    launchOfferProd.studioMonthly,
    launchOfferProd.studioPlusMonthly,
  ].filter(Boolean)
);

new Set(
  [
    landingPricesTest,
    landingPricesProd,
    quarterlyPricesTest,
    quarterlyPricesProd,
    launchOfferTest,
    launchOfferProd,
  ]
    .flatMap((priceGroup) => Object.entries(priceGroup))
    .filter(([key]) => key.startsWith('studio'))
    .map(([, priceId]) => priceId)
    .filter(Boolean)
);

new Set(
  [landingPricesTest.soloYearly249, landingPricesProd.soloYearly249].filter(
    Boolean
  )
);

(function collectAllPriceIds({
  prices = {},
  landingPricesTest: testLanding = {},
  landingPricesProd: prodLanding = {},
  launchOfferTest: testLaunch = {},
  launchOfferProd: prodLaunch = {},
  kitPricesTest: testKits = {},
  kitPricesProd: prodKits = {},
  extra = [],
} = {}) {
  const priceSet = new Set();
  const addPriceId = (id) => {
    if (typeof id === 'string' && id.startsWith('price_')) {
      priceSet.add(id);
    }
  };

  for (const group of [
    prices,
    testLanding,
    prodLanding,
    testLaunch,
    prodLaunch,
    testKits,
    prodKits,
  ]) {
    for (const priceId of Object.values(group || {})) {
      addPriceId(priceId);
    }
  }

  for (const priceId of extra) {
    addPriceId(priceId);
  }
})({
  prices: { ...legacyPricesTest, ...legacyPricesProd },
  landingPricesTest,
  landingPricesProd,
  launchOfferTest,
  launchOfferProd,
  kitPricesTest,
  kitPricesProd,
  extra: [
    ...Object.values(quarterlyPricesTest),
    ...Object.values(quarterlyPricesProd),
    ...Object.values(studioSeatsPricesTest),
    ...Object.values(studioSeatsPricesProd),
  ].filter(Boolean),
});

export const FREE_KIT_SLUGS = ['landing-pack'];

// NOTE: module id: 825740
export function isLaunchPromoActive(now = Date.now()) {
  return now < Date.parse('2026-09-18T22:00:00Z');
}

export {
  FREE_KIT_SLUGS as f,
  isLaunchPromoActive as L,
  landingPriceIds as k,
  legacyPriceIds as b,
  quarterlyPriceIds as P,
  studioSeatsPriceIds as x,
};
