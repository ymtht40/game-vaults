// Variable Mapping: l -> SOLO_LIST_CENTS, n -> getInitialStudioPrice, i -> pricingConfig, T -> SOLO_LIST_CENTS, U -> pricingConfig, K -> formatMonthlyPrice, j -> formatCycleTotalPrice, t.b -> legacyPriceIds, t.k -> soloYearlyPriceIds, t.P -> soloQuarterlyPriceIds, t.x -> studioPriceIds, t.L -> isLaunchPromoActive

import {
  b as legacyPriceIds,
  k as soloYearlyPriceIds,
  P as soloQuarterlyPriceIds,
  x as studioPriceIds,
  L as isLaunchPromoActive,
} from '@/libs/data/stripe-prices'; // NOTE: module id: 825740
import {
  CYCLE_MONTHS,
  calculateStudioTotalCents,
} from '@/libs/data/seat-prices'; // NOTE: module id: 59011

export const SOLO_LIST_CENTS = {
  quarterly: 8700,
  yearly: 24000,
};

const getInitialStudioPrice = (cycle) =>
  calculateStudioTotalCents(2, SOLO_LIST_CENTS[cycle], CYCLE_MONTHS[cycle]) / 100;

// NOTE: module id: 516799
export const pricingConfig = {
  appName: 'Annnimate',
  appDescription:
    'Production GSAP motion components for React and Vue. Every component shipped on a real brand site before it reached the library. By Good Fella.',
  domainName: 'annnimate.com',
  crisp: {
    id: '',
    onlyShowOnRoutes: ['/'],
  },
  stripe: {
    plans: [
      {
        isFeatured: true,
        priceId: legacyPriceIds.pro,
        name: 'Pro',
        description: 'Perfect for individual designers and developers.',
        price: 199,
        priceAnchor: null,
        userAmount: 1,
        isBillingCycle: 'yearly',
        features: [
          { name: 'Full access to animation library' },
          { name: 'All code formats (HTML, React, Webflow)' },
          { name: 'GSAP integration' },
          { name: 'Save & organize favorites' },
          { name: 'New animations monthly' },
          { name: 'Documentation & support' },
          { name: 'All future updates' },
        ],
      },
      {
        priceId: legacyPriceIds.team,
        name: 'Team',
        description: 'For agencies and teams collaborating on projects.',
        price: 300,
        priceAnchor: null,
        isBillingCycle: 'yearly',
        userAmount: 3,
        additionalInfo: 'Includes 3 seats, +€159/year per additional seat',
        features: [
          { name: 'Everything in Pro' },
          { name: 'Minimum 3 team members included' },
          { name: 'Shared team workspace' },
          { name: 'Team collaboration tools' },
          { name: 'Priority support' },
          { name: 'Additional seats: €159/year each' },
        ],
      },
    ],
    landingPlans: [
      {
        key: 'solo',
        name: 'Solo',
        cta: 'Get Solo',
        surface: 'dark',
        isPopular: true,
        seatTag: '1 seat',
        pitch: 'For one developer working solo or on freelance work.',
        yearly: {
          price: 199,
          listPrice: 240,
          priceId: soloYearlyPriceIds.soloYearly,
          cycleLabel: '/year',
        },
        quarterly: {
          price: 20,
          listPrice: 29,
          cycleTotal: 60,
          listCycleTotal: 87,
          priceId: soloQuarterlyPriceIds.soloQuarterly,
          cycleLabel: '/month',
        },
        features: [
          { componentCount: true },
          { shippedRecently: true },
          'React, Vue and HTML',
          'MCP server for Cursor and Claude Code',
          'New components as they ship',
          'Documentation and support',
        ],
      },
      {
        key: 'studio-seats',
        name: 'Studio',
        cta: 'Get Studio',
        surface: 'surface',
        perSeat: true,
        minSeats: 2,
        maxSeats: 20,
        soloCents: SOLO_LIST_CENTS,
        seatTag: '2 to 20 seats',
        pitch:
          'For a studio or team shipping client work. Every seat after the first costs less.',
        yearly: {
          price: getInitialStudioPrice('yearly'),
          listPrice: getInitialStudioPrice('yearly'),
          priceId: studioPriceIds.studioSeatsYearly,
          cycleLabel: '/year',
        },
        quarterly: {
          price: getInitialStudioPrice('quarterly') / 3,
          listPrice: getInitialStudioPrice('quarterly') / 3,
          cycleTotal: getInitialStudioPrice('quarterly'),
          listCycleTotal: getInitialStudioPrice('quarterly'),
          priceId: studioPriceIds.studioSeatsQuarterly,
          cycleLabel: '/month',
        },
        features: [
          'Everything in Solo, for every seat',
          '10% off every seat after the first, up to 40%',
          'Add or remove seats any time',
          'MCP server for the whole team',
          'Priority support',
        ],
      },
    ],
    addons: [],
  },
  aws: {
    bucket: 'bucket-name',
    bucketUrl: 'https://bucket-name.s3.amazonaws.com/',
    cdn: 'https://cdn-id.cloudfront.net/',
  },
  resend: {
    fromNoReply: 'Annnimate <noreply@annnimate.com>',
    fromAdmin: 'Team at Annnimate <team@annnimate.com>',
    supportEmail: 'support@annnimate.com',
    contactEmail: 'contact@annnimate.com',
  },
  colors: {
    main: '#b3fca0',
  },
  auth: {
    loginUrl: '/login',
    callbackUrl: '/animations',
  },
  animationStats: {
    totalCount: 128,
    displayCount: '120+',
  },
  featureFlags: {
    earlyAccessFeatures: [
      'ai_code_generation_v2',
      'animation_composer',
      'team_workspaces',
      'advanced_customization',
    ],
    adminOnlyFeatures: [],
    disabledFeatures: [],
  },
  adminMetrics: {
    monthlyInfraCostEur: 20,
  },
};

export function formatMonthlyPrice(planCycle, now = Date.now()) {
  if (!planCycle) return null;
  return isLaunchPromoActive(now)
    ? planCycle.price
    : (planCycle.listPrice ?? planCycle.price);
}

export function formatCycleTotalPrice(planCycle, now = Date.now()) {
  if (!planCycle?.cycleTotal) return null;
  return isLaunchPromoActive(now)
    ? planCycle.cycleTotal
    : (planCycle.listCycleTotal ?? planCycle.cycleTotal);
}

export {
  SOLO_LIST_CENTS as T,
  pricingConfig as U,
  formatMonthlyPrice as K,
  formatCycleTotalPrice as j,
};
