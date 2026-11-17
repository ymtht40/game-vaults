import { 
  legacyPrices, 
  subscriptionPrices, 
  quarterlyPrices, 
  studioSeatsPrices, 
  isOfferActive 
 } from '@/libs/config/stripeConfig';

export const CYCLE_MONTHS = { quarterly: 3, yearly: 12 };
const TIER_DISCOUNTS = { T2: 30, T3: 50 };

export const MAX_SEATS = 20;
export const MIN_SEATS = 2;

export function calculateSeatsTotalCents(seats, priceCents, factor = 1) {
  return (function(s, p, f = 1) {
    return 100 * Math.floor((p / f) * (10 - Math.min(+Math.max(0, s - 1), 4)) / 10 / 100 + 1e-9) * f;
  })(seats, priceCents, factor) * seats;
}

export function calculateTierSeatsPrice(seats, priceCents, tier, factor = 1) {
  const tierDiscount = TIER_DISCOUNTS[tier];
  const seatsTotal = calculateSeatsTotalCents(seats, priceCents, factor);
  return tierDiscount ? Math.round(seatsTotal * (100 - tierDiscount) / 100) : seatsTotal;
}

export const SOLO_BASE_CENTS = { quarterly: 8700, yearly: 24000 };

const getStudioBasePrice = (cycle) => calculateSeatsTotalCents(2, SOLO_BASE_CENTS[cycle], CYCLE_MONTHS[cycle]) / 100;

export const appConfig = {
  appName: "DriveX Gaming",
  appDescription: "Your Trusted MLBB Marketplace. Safe, fast, and verified Mobile Legends & game account trades with lifetime warranty.",
  domainName: "drivexstore.shop",
  crisp: {
    id: "",
    onlyShowOnRoutes: ["/"]
  },
  stripe: {
    plans: [
      {
        isFeatured: true,
        priceId: legacyPrices.pro,
        name: "Pro",
        description: "Perfect for individual buyers and gamers.",
        price: 199,
        priceAnchor: null,
        userAmount: 1,
        isBillingCycle: "yearly",
        features: [
          { name: "Full access to verified accounts" },
          { name: "Fast transaction & instant delivery" },
          { name: "Lifetime warranty protection" },
          { name: "Save & organize favorite accounts" },
          { name: "New accounts listed daily" },
          { name: "24/7 customer support" },
          { name: "Priority trade assistance" }
        ]
      },
      {
        priceId: legacyPrices.team,
        name: "Team",
        description: "For resellers and trading teams.",
        price: 300,
        priceAnchor: null,
        isBillingCycle: "yearly",
        userAmount: 3,
        additionalInfo: "Includes 3 seats, +€159/year per additional seat",
        features: [
          { name: "Everything in Pro" },
          { name: "Minimum 3 team members included" },
          { name: "Shared team workspace" },
          { name: "Team management tools" },
          { name: "Priority support" },
          { name: "Additional seats: €159/year each" }
        ]
      }
    ],
    landingPlans: [
      {
        key: "solo",
        name: "Solo",
        cta: "Get Solo",
        surface: "dark",
        isPopular: true,
        seatTag: "1 seat",
        pitch: "For individual gamers looking for verified MLBB accounts.",
        yearly: { price: 199, listPrice: 240, priceId: subscriptionPrices.soloYearly, cycleLabel: "/year" },
        quarterly: { price: 20, listPrice: 29, cycleTotal: 60, listCycleTotal: 87, priceId: quarterlyPrices.soloQuarterly, cycleLabel: "/month" },
        features: [
          { componentCount: true },
          { shippedRecently: true },
          "Safe & verified MLBB accounts",
          "Fast transaction & instant handover",
          "Lifetime warranty included",
          "24/7 support"
        ]
      },
      {
        key: "studio-seats",
        name: "Studio",
        cta: "Get Studio",
        surface: "surface",
        perSeat: true,
        minSeats: 2,
        maxSeats: 20,
        soloCents: SOLO_BASE_CENTS,
        seatTag: "2 to 20 seats",
        pitch: "For resellers and gaming communities.",
        yearly: { 
          price: getStudioBasePrice("yearly"), 
          listPrice: getStudioBasePrice("yearly"), 
          priceId: studioSeatsPrices.studioSeatsYearly, 
          cycleLabel: "/year" 
        },
        quarterly: { 
          price: getStudioBasePrice("quarterly") / 3, 
          listPrice: getStudioBasePrice("quarterly") / 3, 
          cycleTotal: getStudioBasePrice("quarterly"), 
          listCycleTotal: getStudioBasePrice("quarterly"), 
          priceId: studioSeatsPrices.studioSeatsQuarterly, 
          cycleLabel: "/month" 
        },
        features: [
          "Everything in Solo, for every seat",
          "10% off every seat after the first, up to 40%",
          "Add or remove seats any time",
          "Dedicated trade support",
          "Priority support"
        ]
      }
    ],
    addons: []
  },
  aws: {
    bucket: "bucket-name",
    bucketUrl: "https://bucket-name.s3.amazonaws.com/",
    cdn: "https://cdn-id.cloudfront.net/"
  },
  resend: {
    fromNoReply: "DriveX Gaming <noreply@drivexstore.shop>",
    fromAdmin: "Team at DriveX Gaming <team@drivexstore.shop>",
    supportEmail: "support@drivexstore.shop",
    contactEmail: "contact@drivexstore.shop"
  },
  colors: { main: "#b3fca0" },
  auth: { loginUrl: "/login", callbackUrl: "/animations" },
  animationStats: { totalCount: 131, displayCount: "130+" },
  featureFlags: {
    earlyAccessFeatures: ["ai_code_generation_v2", "animation_composer", "team_workspaces", "advanced_customization"],
    adminOnlyFeatures: [],
    disabledFeatures: []
  },
  adminMetrics: { monthlyInfraCostEur: 20 }
};

export function getActivePrice(plan, date = Date.now()) {
  if (!plan) return null;
  return isOfferActive(date) ? plan.price : (plan.listPrice ?? plan.price);
}

export function getActiveCycleTotal(plan, date = Date.now()) {
  if (!plan?.cycleTotal) return null;
  return isOfferActive(date) ? plan.cycleTotal : (plan.listCycleTotal ?? plan.cycleTotal);
}
