// POST /api/stripe/create-checkout
// Creates an embedded Stripe Checkout session for a Kit (one-time payment) or a
// plan (subscription). The client sends the price it wants; everything that
// matters (is this price sold, one-time vs recurring, quantity, discounts,
// ownership) is decided here, never trusted from the request body.
//
// Request body (from CheckoutPage.buildCheckoutBody):
//   { priceId, mode, uiMode, quantity?, successUrl, attribution, experiments, wantedComponent? }
// Response: { clientSecret }
// Errors the page understands: 409 { code: 'already_owned' | 'already_subscribed' }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { createServerSupabase } from '@/libs/supabase/server';
import {
  activeKitPrices,
  subscriptionPrices,
  launchOfferPrices,
  quarterlyPrices,
  studioSeatsPrices,
} from '@/libs/config/stripeConfig';

export const dynamic = 'force-dynamic';

const LEAD_COOKIE = 'anm_checkout_lead';
const MAX_SEATS = 20;
const SUCCESS_PATH = '/checkout-success?session_id={CHECKOUT_SESSION_ID}';

// Same country tiers as /api/geo/ppp, so the tier the visitor saw is the tier we apply
const PPP_TIER_2 = ['IN', 'ID', 'PH', 'VN', 'TH', 'MY', 'BR', 'MX', 'ZA'];
const PPP_TIER_3 = ['MM', 'BD', 'PK', 'NG', 'KE', 'LK', 'NP'];

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  // No apiVersion override: embedded checkout needs a recent API version
  return new Stripe(key);
}

// ---------- price catalogue ----------

const KIT_PRICE_TO_SLUG = new Map(
  Object.entries(activeKitPrices).map(([slug, priceId]) => [priceId, slug]),
);
const SEAT_PRICE_IDS = new Set(Object.values(studioSeatsPrices).filter(Boolean));
const PLAN_PRICE_IDS = new Set(
  [
    ...Object.values(subscriptionPrices),
    ...Object.values(launchOfferPrices),
    ...Object.values(quarterlyPrices),
    ...SEAT_PRICE_IDS,
  ].filter(Boolean),
);

function classifyPrice(priceId) {
  if (typeof priceId !== 'string') return null;
  if (KIT_PRICE_TO_SLUG.has(priceId)) {
    return { kind: 'kit', mode: 'payment', kitSlug: KIT_PRICE_TO_SLUG.get(priceId) };
  }
  if (PLAN_PRICE_IDS.has(priceId)) {
    return { kind: 'plan', mode: 'subscription', kitSlug: null };
  }
  return null;
}

// ---------- helpers ----------

function resolveSiteOrigin(request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    request.headers.get('origin') ||
    new URL(request.url).origin
  );
}

// Only return to our own origin; fall back to the default success page otherwise
function resolveReturnUrl(request, requested) {
  const siteOrigin = resolveSiteOrigin(request);
  const fallback = `${siteOrigin}${SUCCESS_PATH}`;
  if (typeof requested !== 'string') return fallback;
  try {
    const allowed = new Set([siteOrigin, new URL(request.url).origin]);
    const requestedOrigin = new URL(requested.replace(/[{}]/g, '')).origin;
    return allowed.has(requestedOrigin) ? requested : fallback;
  } catch {
    return fallback;
  }
}

function resolvePppTier(request) {
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  if (PPP_TIER_2.includes(country)) return 'T2';
  if (PPP_TIER_3.includes(country)) return 'T3';
  return 'T1';
}

// Coupon IDs live in env so a wrong percentage can never ship by accident:
//   STRIPE_PPP_COUPON_KIT_T2, STRIPE_PPP_COUPON_KIT_T3,
//   STRIPE_PPP_COUPON_PLAN_T2, STRIPE_PPP_COUPON_PLAN_T3
function resolvePppCoupon(kind, tier) {
  if (tier !== 'T2' && tier !== 'T3') return null;
  return process.env[`STRIPE_PPP_COUPON_${kind.toUpperCase()}_${tier}`] || null;
}

function clampSeats(raw) {
  const seats = Number.parseInt(raw, 10);
  if (!Number.isFinite(seats)) return 1;
  return Math.min(MAX_SEATS, Math.max(1, seats));
}

// Stripe metadata: max 50 keys, values up to 500 chars, strings only
function trimMeta(value) {
  return String(value ?? '').slice(0, 500);
}

function flattenAttribution(attribution) {
  const meta = {};
  if (!attribution || typeof attribution !== 'object') return meta;
  let count = 0;
  for (const [key, value] of Object.entries(attribution)) {
    if (count >= 15) break;
    if (value == null || typeof value === 'object') continue;
    meta[`attr_${key}`.slice(0, 40)] = trimMeta(value);
    count += 1;
  }
  return meta;
}

async function readGuestEmail() {
  try {
    const store = await cookies();
    const raw = store.get(LEAD_COOKIE)?.value;
    return raw ? decodeURIComponent(raw) : null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { priceId, quantity, successUrl, attribution, experiments, wantedComponent } = body;

    const price = classifyPrice(priceId);
    if (!price) {
      return NextResponse.json({ error: 'Unknown price', code: 'invalid_price' }, { status: 400 });
    }

    // Logged-in is optional: guests check out with the email from the lead step
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let stripeCustomerId = null;

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('has_access, subscription_status, stripe_customer_id')
        .eq('id', user.id)
        .maybeSingle();

      stripeCustomerId = profile?.stripe_customer_id || null;

      if (price.kind === 'plan') {
        const isLive = ['active', 'trialing'].includes(profile?.subscription_status);
        if (profile?.has_access === true && isLive) {
          return NextResponse.json(
            { error: 'Already subscribed', code: 'already_subscribed' },
            { status: 409 },
          );
        }
      }

      if (price.kind === 'kit') {
        // kit_purchases is created in supabase/kit-schema.sql; a missing table is not fatal
        const { data: owned, error: ownedError } = await supabase
          .from('kit_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('kit_slug', price.kitSlug)
          .maybeSingle();

        if (ownedError) {
          console.warn('[create-checkout] ownership lookup failed:', ownedError.message);
        } else if (owned) {
          return NextResponse.json(
            { error: 'Already owned', code: 'already_owned' },
            { status: 409 },
          );
        }
      }
    }

    const isSeatPrice = SEAT_PRICE_IDS.has(priceId);
    const lineQuantity = isSeatPrice ? clampSeats(quantity) : 1;

    const pppTier = resolvePppTier(request);
    const coupon = resolvePppCoupon(price.kind, pppTier);

    const metadata = {
      kind: price.kind,
      price_id: priceId,
      ...(price.kitSlug ? { kit_slug: price.kitSlug } : {}),
      ...(user ? { user_id: user.id } : {}),
      ...(typeof wantedComponent === 'string' ? { wanted_component: trimMeta(wantedComponent) } : {}),
      ...(pppTier !== 'T1' ? { ppp_tier: pppTier } : {}),
      ...(experiments && typeof experiments === 'object'
        ? { experiments: trimMeta(JSON.stringify(experiments)) }
        : {}),
      ...flattenAttribution(attribution),
    };

    const guestEmail = user ? null : await readGuestEmail();

    const sessionParams = {
      ui_mode: 'embedded',
      mode: price.mode,
      line_items: [{ price: priceId, quantity: lineQuantity }],
      return_url: resolveReturnUrl(request, successUrl),
      metadata,
      ...(stripeCustomerId
        ? { customer: stripeCustomerId }
        : {
            customer_email: user?.email || guestEmail || undefined,
            ...(price.mode === 'payment' ? { customer_creation: 'always' } : {}),
          }),
      // A coupon and promo-code entry cannot be combined
      ...(coupon ? { discounts: [{ coupon }] } : { allow_promotion_codes: true }),
      // Copy metadata to the object the webhook will receive later
      ...(price.mode === 'subscription'
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }),
    };

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('[create-checkout]', error);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}

