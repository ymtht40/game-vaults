// Variable Mapping: t -> forceProd, r -> isProdDefault, a -> isProd, o -> testPrices, l -> prodPrices, n -> testLandingPrices, i -> prodLandingPrices, s -> testLaunchOffer, u -> prodLaunchOffer, c -> activePrices, d -> activeLandingPrices, p -> activeLaunchOffer, m -> testQuarterlyPrices, y -> prodQuarterlyPrices, f -> activeQuarterlyPrices, h -> testSeatPrices, K -> prodSeatPrices, v -> activeSeatPrices
// NOTE: module id: 825740

const forceProd = process.env.NEXT_PUBLIC_FORCE_PRODUCTION === "true";
const isProdDefault = true; 
const isProd = isProdDefault || forceProd;

const testPrices = { pro: "price_1SmdgaRvKRKuKXmGKUEtcEIW", team: "price_1Sme0wRvKRKuKXmGxvFcJSSH", lifetimePro: "price_1So4YrRvKRKuKXmGGv53ZBWU" };
const prodPrices = { pro: "price_1SgkfFRvKRKuKXmGBrzPYauv", team: "price_1SgkfDRvKRKuKXmGDhPp0Iex", lifetimePro: "price_1So4WaRvKRKuKXmGYkYZt35Z" };

const testLandingPrices = { soloYearly: "price_1UOGTcRvKRKuKXmGggrvYhSG", soloYearly249: "price_1TdFEoRvKRKuKXmGEiYeo97J", soloMonthly: "price_1TdFEoRvKRKuKXmGV7jD9iQh", studioYearly: "price_1TdFEpRvKRKuKXmGRymGG43K", studioMonthly: "price_1TdFEqRvKRKuKXmGB65QEdGD", studioPlusYearly: "price_1TdFErRvKRKuKXmGK0DYsOMB", studioPlusMonthly: "price_1TdFErRvKRKuKXmGxGTqkdgI" };
const prodLandingPrices = { soloYearly: "price_1UOGTpRvKRKuKXmGKNOYxyHk", soloYearly249: "price_1TdFH5RvKRKuKXmGDXlyHBFY", soloMonthly: "price_1TdFH5RvKRKuKXmGV7QKmzVy", studioYearly: "price_1TdFH6RvKRKuKXmGo7qkBvqi", studioMonthly: "price_1TdFH7RvKRKuKXmGyVfG3wrm", studioPlusYearly: "price_1TdFH8RvKRKuKXmGJOKCdxYD", studioPlusMonthly: "price_1TdFH8RvKRKuKXmGss4l59Cn" };

const testLaunchOffer = { soloYearly: null, soloMonthly: null, studioYearly: null, studioMonthly: null, studioPlusYearly: null, studioPlusMonthly: null };
const prodLaunchOffer = { soloYearly: "price_1TfRAbRvKRKuKXmGrVbCZJxA", soloMonthly: "price_1TfRKuRvKRKuKXmGFpW9zSaJ", studioYearly: "price_1TfRAcRvKRKuKXmG0pFVPJWM", studioMonthly: "price_1TfRKvRvKRKuKXmG8QnoNbJw", studioPlusYearly: "price_1TfRAcRvKRKuKXmG7hO4XkFp", studioPlusMonthly: "price_1TfRKxRvKRKuKXmGR4qWpnDv" };

const activePrices = isProd ? prodPrices : testPrices;
const activeLandingPrices = isProd ? prodLandingPrices : testLandingPrices;
const activeLaunchOffer = isProd ? prodLaunchOffer : testLaunchOffer;

const testQuarterlyPrices = { soloQuarterly: "price_1U1UGJRvKRKuKXmGM8VegBXN", studioQuarterly: "price_1U1UGKRvKRKuKXmGRpBeCyzG", studioPlusQuarterly: "price_1U1UGMRvKRKuKXmGBf0wcs7Y" };
const prodQuarterlyPrices = { soloQuarterly: "price_1U1UHGRvKRKuKXmGFm3YYFT2", studioQuarterly: "price_1U1UHHRvKRKuKXmGQjtP5l3d", studioPlusQuarterly: "price_1U1UHJRvKRKuKXmG3vkO8i8k" };
const activeQuarterlyPrices = isProd ? prodQuarterlyPrices : testQuarterlyPrices;

const testSeatPrices = { studioSeatsQuarterly: "price_1UOGYARvKRKuKXmGElIa5dg4", studioSeatsYearly: "price_1UOGYARvKRKuKXmG8nxsS6Eh" };
const prodSeatPrices = { studioSeatsQuarterly: "price_1UQ4ynRvKRKuKXmGt2iM71AC", studioSeatsYearly: "price_1UQ4ynRvKRKuKXmG4NBjw67v" };
const activeSeatPrices = isProd ? prodSeatPrices : testSeatPrices;

export const f = ["landing-pack"];

export const L = function(e = Date.now()) { 
  return e < Date.parse("2026-09-18T22:00:00Z"); 
};

export const k = activeLandingPrices;
export const b = activePrices;
export const P = activeQuarterlyPrices;
export const x = activeSeatPrices;