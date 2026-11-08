'use client';

/* Variable Mapping:
 * e -> stripePk, t -> kind, a -> plan, s -> kit, l -> component,
 * i -> initialCycle, o -> initialSeats, c -> images, d -> user,
 * u -> cycle, m -> setCycle, p -> isPerSeat, f -> seats, x -> setSeats,
 * g -> step, h -> setStep, y -> alreadyReason, V -> setAlreadyReason,
 * Y -> email, B -> setEmail, D -> emailError, W -> setEmailError,
 * Q -> newsletterOptIn, G -> setNewsletterOptIn, J -> isSubmittingEmail,
 * X -> setIsSubmittingEmail, ee -> checkoutError, et -> setCheckoutError,
 * er -> isMountingCheckout, en -> setIsMountingCheckout,
 * ea -> checkoutContainerRef, es -> emailInputRef,
 * el -> hasTrackedCheckoutStartRef, ei -> hasTrackedPageViewRef,
 * eo -> currentCyclePlan, ec -> pppTier, ed -> activePriceId,
 * eu -> planPppPricing, em -> perSeatPrice, ep -> effectivePrice,
 * ef -> hasPppDiscount, ex -> handleEmailSubmit, eg -> headingTitle,
 * eh -> seatsPrefix, ey -> priceSummaryNode, eb -> legalFooterNode
 */

import { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import { getAttributionData } from '@/libs/analytics/analytics'; // NOTE: module id: 746374 // UNRESOLVED: name guessed from usage
import { getStoredExperiments } from '@/libs/config/abTesting'; // NOTE: module id: 499046 // UNRESOLVED: name guessed from usage
import { appConfig, getActivePrice } from '@/libs/config/appConfig'; // NOTE: module id: 516799
import { CYCLE_MONTHS, calculateTierSeatsPrice } from '@/libs/config/appConfig'; // NOTE: module id: 59011
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { apiClient } from '@/libs/auth/api'; // NOTE: module id: 853155 // UNRESOLVED: name guessed from usage
import FadeIn from '@/animations/FadeIn'; // NOTE: module id: 460391
import { BrandMark } from '@/components/ui/BrandMark'; // NOTE: module id: 635566 // UNRESOLVED: name guessed from usage
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import Loader from '@/components/ui/Loader'; // NOTE: module id: 461376
import { SecondaryButton } from '@/components/ui/SecondaryButton'; // NOTE: module id: 520237
import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220
import { DraggableGrid } from '@/features/common/DraggableGrid'; // NOTE: module id: 111235
import { getAddonTierPrice, getBillingDetails } from '@/libs/utils/pricingUtils'; // NOTE: module id: 397242 // UNRESOLVED: name guessed from usage
import { PricingCycleToggle } from '@/features/pricing/PricingCycleToggle'; // NOTE: module id: 821980
import { SeatStepper } from '@/features/pricing/SeatStepper'; // NOTE: module id: 69291
import { BulletList } from '@/features/pricing/components/BulletList'; // NOTE: module id: 702954
import KitPrice from '@/features/pricing/components/KitPrice'; // NOTE: module id: 597274
import { PppTooltipBadge, PppCallout } from '@/features/marketing/Pppbanner'; // NOTE: module id: 245647 // UNRESOLVED: name guessed from usage

import { usePppTier } from '@/hooks/usePppGeo'; // NOTE: module id: 12895
import { CheckoutNotice } from '@/features/checkout/CheckoutNotice'; // NOTE: module id: 769149
import { EuFlagIcon } from '@/assets/icons/EuFlagIcon'; // NOTE: module id: 769149
import { EMAIL_REGEX, formatPriceAmount } from '@/libs/utils/checkoutHelpers'; // NOTE: module id: 769149

// NOTE: module id: 769149
export default function CheckoutPage({
  stripePk,
  kind,
  plan,
  kit,
  component,
  initialCycle,
  initialSeats = null,
  images = [],
}) {
  const { user } = useUser();
  const [cycle, setCycle] = useState(initialCycle);
  const isPerSeat = !!plan?.perSeat;
  const [seats, setSeats] = useState(initialSeats ?? plan?.minSeats ?? 1);
  const [step, setStep] = useState(stripePk ? 'lead-check' : 'no-pk');
  const [alreadyReason, setAlreadyReason] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isMountingCheckout, setIsMountingCheckout] = useState(false);

  const checkoutContainerRef = useRef(null);
  const emailInputRef = useRef(null);
  const hasTrackedCheckoutStartRef = useRef(false);
  const hasTrackedPageViewRef = useRef(false);

  const currentCyclePlan = plan ? plan[cycle] : null;
  const pppTier = usePppTier();
  const activePriceId = kind === 'kit' ? kit?.priceId : currentCyclePlan?.priceId;
  const planPppPricing =
    kind !== 'kit' && plan && pppTier ? getBillingDetails(plan.key, cycle, pppTier) : null;
  const perSeatPrice = isPerSeat
    ? calculateTierSeatsPrice(seats, plan.soloCents[cycle], pppTier, CYCLE_MONTHS[cycle]) / 100
    : null;
  const effectivePrice =
    kind === 'kit'
      ? null
      : isPerSeat
        ? perSeatPrice
        : planPppPricing
          ? planPppPricing.price
          : getActivePrice(currentCyclePlan);
  const hasPppDiscount = !!(
    planPppPricing ||
    (kind === 'kit' && pppTier && getAddonTierPrice(kit?.slug, pppTier) != null)
  );

  useEffect(() => {
    if (step !== 'lead-check') return;
    let cancelled = false;

    (async () => {
      if (!hasTrackedPageViewRef.current) {
        hasTrackedPageViewRef.current = true;
        analytics.track('checkout_page_viewed', {
          kind,
          plan: plan?.key || kit?.slug,
          cycle,
          component: component?.slug || null,
        });
      }

      if (user) {
        if (!cancelled) setStep('payment');
        return;
      }

      try {
        await apiClient.get('/checkout/lead');
        if (!cancelled) setStep('payment');
      } catch {
        if (!cancelled) setStep('payment');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, user]);

  useEffect(() => {
    if (step === 'email') {
      emailInputRef.current?.focus();
      analytics.track('checkout_email_step_shown', {
        kind,
        plan: plan?.key || kit?.slug,
      });
    }
  }, [step]);

  useEffect(() => {
    if (step !== 'payment' || !stripePk || !activePriceId) return;
    let cancelled = false;
    let embeddedCheckout = null;

    setCheckoutError(null);
    setIsMountingCheckout(true);

    const timerId = setTimeout(() => {
      (async () => {
        try {
          const [stripeInstance, sessionRes] = await Promise.all([
            loadStripe(stripePk),
            apiClient.post('/stripe/create-checkout', {
              priceId: activePriceId,
              mode: kind === 'kit' ? 'payment' : 'subscription',
              uiMode: 'embedded',
              ...(isPerSeat ? { quantity: seats } : {}),
              successUrl: `${window.location.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
              attribution: getAttributionData(),
              experiments: getStoredExperiments(),
              ...(component?.slug ? { wantedComponent: component.slug } : {}),
            }),
          ]);

          if (cancelled || !sessionRes?.clientSecret) return;

          embeddedCheckout = await stripeInstance.createEmbeddedCheckoutPage({
            clientSecret: sessionRes.clientSecret,
          });

          if (cancelled) {
            embeddedCheckout.destroy();
            return;
          }

          embeddedCheckout.mount(checkoutContainerRef.current);
          setIsMountingCheckout(false);

          if (!hasTrackedCheckoutStartRef.current) {
            hasTrackedCheckoutStartRef.current = true;
            if (kind === 'kit') {
              analytics.track?.('kit_checkout_started', {
                kit: kit?.title,
                ...(pppTier ? { ppp_tier: pppTier } : {}),
              });
            } else {
              analytics.revenue.checkoutStarted(
                plan?.name,
                effectivePrice ?? null,
                cycle,
                isPerSeat ? { seats } : undefined
              );
            }
          }
        } catch (err) {
          if (cancelled) return;
          setIsMountingCheckout(false);
          const errorCode = err?.response?.data?.code;
          if (errorCode === 'already_subscribed' || errorCode === 'already_owned') {
            setAlreadyReason(errorCode);
            setStep('already');
            return;
          }
          console.error('[Checkout] embedded mount failed:', err);
          setCheckoutError('The payment form could not load. Reload the page to try again.');
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
      embeddedCheckout?.destroy();
    };
  }, [step, activePriceId, stripePk, seats]);

  const handleEmailSubmit = async (event) => {
    event?.preventDefault?.();
    if (isSubmittingEmail) return;

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('That email looks off.');
      return;
    }

    setIsSubmittingEmail(true);
    if (newsletterOptIn) {
      apiClient.post('/newsletter', { email: trimmedEmail, source: 'checkout' }).catch(() => {});
    }

    try {
      await apiClient.post('/checkout/lead', { email: trimmedEmail });
      analytics.track('checkout_email_step_submitted', {
        kind,
        plan: plan?.key || kit?.slug,
        newsletter_opt_in: newsletterOptIn,
      });
      setStep('payment');
    } catch {
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const headingTitle =
    kind === 'kit' ? (kit.isPack ? kit.title : `${kit.title} Kit`) : `${plan.name} Plan`;
  const seatsPrefix = isPerSeat ? `${seats} seats · ` : '';

  const priceSummaryNode = isPerSeat ? (
    cycle === 'yearly' ? (
      `${seatsPrefix}€${formatPriceAmount(effectivePrice)}/year · cancel anytime`
    ) : (
      `${seatsPrefix}€${formatPriceAmount(Math.round((effectivePrice / 3) * 100) / 100)}/month · billed €${formatPriceAmount(effectivePrice)} quarterly · cancel anytime`
    )
  ) : kind === 'kit' ? (
    <>
      <KitPrice
        kitSlug={kit?.slug}
        fallback={kit.priceDisplay || ''}
        struckClassName="text-foreground-muted"
      />
      {kit.priceDisplay ? ' ' : ''}
      one-time · yours forever
    </>
  ) : cycle === 'yearly' ? (
    planPppPricing ? (
      <span
        aria-label={`€${effectivePrice} per year, regularly €${getActivePrice(currentCyclePlan)}, cancel anytime`}
      >
        €{effectivePrice}/year{' '}
        <s aria-hidden="true" className="text-foreground-muted">
          €{getActivePrice(currentCyclePlan)}
        </s>{' '}
        · cancel anytime
      </span>
    ) : (
      `€${effectivePrice}/year · cancel anytime`
    )
  ) : planPppPricing ? (
    <span
      aria-label={`€${effectivePrice} per month, regularly €${getActivePrice(currentCyclePlan)}, billed €${planPppPricing.cycleTotal} quarterly, cancel anytime`}
    >
      €{effectivePrice}/month{' '}
      <s aria-hidden="true" className="text-foreground-muted">
        €{getActivePrice(currentCyclePlan)}
      </s>{' '}
      · billed €{planPppPricing.cycleTotal} quarterly · cancel anytime
    </span>
  ) : (
    `€${effectivePrice}/month · billed quarterly · cancel anytime`
  );

  const legalFooterNode = (
    <>
      {kind === 'kit' ? (
        <SecondaryButton href="/kits" inline={true} className="text-foreground">
          Back to Kits
        </SecondaryButton>
      ) : (
        <SecondaryButton href="/pricing" inline={true} className="text-foreground">
          Compare all plans
        </SecondaryButton>
      )}{' '}
      · By purchasing, you agree to our{' '}
      <SecondaryButton href="/terms" inline={true} className="text-foreground">
        Terms
      </SecondaryButton>{' '}
      and{' '}
      <SecondaryButton href="/refund" inline={true} className="text-foreground">
        Refund Policy
      </SecondaryButton>
      .
    </>
  );

  return (
    <div className="grid bg-background lg:h-screen lg:grid-cols-[1fr_3fr]">
      <div className="relative flex flex-col bg-background">
        <div className="absolute bottom-0 right-0 top-0 hidden w-px bg-foreground/10 lg:block" />
        <FadeIn className="flex flex-1 flex-col gap-16 py-24 md:py-40" stagger={0.08}>
          <div className="flex items-center px-24 md:px-40">
            <BrandMark />
          </div>
          <div className="flex px-24 md:px-40 lg:flex-1 lg:items-center">
            <div className="flex w-full max-w-[26rem] flex-col gap-16 lg:gap-32">
              <div className="flex flex-col gap-8">
                {hasPppDiscount ? (
                  <span className="flex justify-start">
                    <PppTooltipBadge />
                  </span>
                ) : null}
                <h1 className="h4 hidden font-medium lg:block">{headingTitle}</h1>
                <p className="text-body hidden text-foreground lg:block">{priceSummaryNode}</p>
                <p className="text-body-sm font-medium text-foreground lg:hidden">
                  {headingTitle} · {priceSummaryNode}
                </p>
                {kind === 'plan' ? (
                  <div className="mt-8 flex justify-start">
                    <PricingCycleToggle cycle={cycle} onChange={setCycle} variant="compact" />
                  </div>
                ) : null}
                {isPerSeat ? (
                  <SeatStepper
                    className="mt-8"
                    seats={seats}
                    onChange={setSeats}
                    min={plan.minSeats}
                    max={plan.maxSeats}
                    tone="light"
                  />
                ) : null}
              </div>

              {hasPppDiscount ? <PppCallout align="start" /> : null}

              {component ? (
                <div className="flex items-center gap-16 border border-foreground/10 bg-surface p-12">
                  {component.image ? (
                    <picture className="block w-[7rem] shrink-0 overflow-hidden">
                      <source srcSet={component.image} type="image/avif" />
                      <img
                        src={component.image}
                        alt={component.title}
                        className="block aspect-[16/10] object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </picture>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    <span className="text-accent-2xs text-foreground-muted">You are unlocking</span>
                    <span className="text-body-sm font-medium text-foreground">
                      {component.title}
                    </span>
                    <span className="text-accent-2xs text-foreground-muted">
                      Included in every plan, plus the whole library.
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-24">
                <BulletList
                  items={
                    kind === 'kit'
                      ? [
                          'One-time payment, yours forever',
                          'React, Vue and HTML',
                          'Final sale: you get the code right away, so there are no refunds',
                        ]
                      : [
                          `All ${appConfig.animationStats?.totalCount || '100+'} components`,
                          'React, Vue and HTML',
                          'New components as they ship',
                          '14-day money-back guarantee on your first payment',
                        ]
                  }
                />
                <div className="flex flex-col items-start gap-12 border border-foreground/10 bg-surface p-16">
                  <EuFlagIcon className="w-36" />
                  <div className="flex flex-col gap-4">
                    <p className="text-body-sm font-medium text-foreground">
                      Registered as a business in the EU?
                    </p>
                    <p className="text-body-sm text-foreground-muted">
                      Add your VAT number at the Tax ID field in the payment form to reverse-charge VAT.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-accent-2xs hidden px-24 text-left text-foreground-muted md:px-40 lg:block">
            {legalFooterNode}
          </p>
        </FadeIn>
      </div>

      <div className="relative bg-background">
        <div className="absolute inset-0">
          <DraggableGrid images={images} className="h-full" driftVx={16} driftVy={0} />
        </div>
        <div className="pointer-events-none absolute inset-0 hidden bg-background/65 lg:block" />
        <FadeIn
          delay={0.12}
          className="relative z-10 flex min-h-full flex-col items-center justify-center gap-16 p-16 lg:h-screen lg:p-24"
        >
          <div className="max-h-[calc(100vh-4rem)] w-full max-w-[30rem] overflow-y-auto border border-foreground/15 bg-background p-20 text-foreground shadow-2xl lg:p-24">
            {step === 'no-pk' ? (
              <CheckoutNotice
                title="Checkout is temporarily unavailable."
                body="The payment configuration is missing. Please try again shortly, or write us at support@annnimate.com."
              />
            ) : step === 'already' ? (
              <CheckoutNotice
                title={
                  alreadyReason === 'already_owned'
                    ? kit?.isPack
                      ? 'You already own this Pack.'
                      : 'You already own this Kit.'
                    : 'You already have an active plan.'
                }
                body={
                  alreadyReason === 'already_owned'
                    ? 'It lives in your account, ready to use.'
                    : 'Change or manage your plan from your account settings.'
                }
                actionHref={
                  alreadyReason === 'already_owned'
                    ? `/account/kits/${kit?.slug || ''}`
                    : '/settings'
                }
                actionLabel={
                  alreadyReason === 'already_owned'
                    ? kit?.isPack
                      ? 'Open your Pack'
                      : 'Open your Kit'
                    : 'Open settings'
                }
              />
            ) : step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-24 p-8">
                <h2 className="text-body font-medium text-foreground">
                  Where should we send your access?
                </h2>
                <div className="flex flex-col gap-4">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    maxLength={200}
                    placeholder="you@studio.com"
                    aria-label="Email address"
                    aria-invalid={!!emailError}
                    className={cn(
                      'w-full border-b bg-transparent px-0 py-12 text-body text-foreground transition-colors duration-(--duration-quick) ease-(--ease-expo-out) placeholder:text-foreground/30 focus:outline-none',
                      emailError ? 'border-brand' : 'border-foreground/20 focus:border-foreground/55'
                    )}
                  />
                  {emailError ? (
                    <p className="text-accent-xs text-brand">{emailError}</p>
                  ) : null}
                </div>
                <label className="flex cursor-pointer items-start gap-10 text-body-sm text-foreground-muted">
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(event) => setNewsletterOptIn(event.target.checked)}
                    disabled={isSubmittingEmail}
                    className="mt-2 size-16 shrink-0 cursor-pointer appearance-none border border-foreground/30 bg-transparent transition-colors checked:border-brand checked:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
                  />
                  <span>Also send me new components as they ship. Unsubscribe anytime.</span>
                </label>
                <div className="flex flex-col items-start gap-12">
                  <Button
                    type="submit"
                    theme="brand"
                    size="sm"
                    loading={isSubmittingEmail}
                  >
                    Continue to payment
                  </Button>
                  <p className="text-accent-2xs text-foreground-muted">
                    Your sign-in link and receipt go here. No spam.
                  </p>
                  <button
                    type="button"
                    disabled={isSubmittingEmail}
                    onClick={() => {
                      analytics.track('checkout_email_step_skipped', {
                        kind,
                        plan: plan?.key || kit?.slug,
                      });
                      setStep('payment');
                    }}
                    className="text-body-sm text-foreground-reading underline decoration-foreground/30 underline-offset-4 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground hover:decoration-foreground disabled:opacity-50"
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-12">
                {checkoutError ? (
                  <CheckoutNotice title="Something went wrong." body={checkoutError} />
                ) : null}
                <div className="relative min-h-[32rem]">
                  {isMountingCheckout ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader size="32" />
                    </div>
                  ) : null}
                  <div key={`${activePriceId}-${cycle}`} ref={checkoutContainerRef} />
                </div>
              </div>
            )}
          </div>
          <p className="text-accent-2xs w-full max-w-[30rem] text-left text-foreground-muted lg:hidden">
            {legalFooterNode}
          </p>
        </FadeIn>
      </div>
    </div>
  );
}