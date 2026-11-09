'use client';

import { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { analytics } from '@/libs/analytics/posthogAnalytics';
import { getAttributionData } from '@/libs/analytics/analytics';
import { getStoredExperiments } from '@/libs/config/abTesting';
import { appConfig, getActivePrice } from '@/libs/config/appConfig';
import { CYCLE_MONTHS, calculateTierSeatsPrice } from '@/libs/config/appConfig';
import { cn } from '@/libs/utils/className';
import { apiClient } from '@/libs/auth/api';
import FadeIn from '@/animations/FadeIn';
import { BrandLogo as BrandMark } from '@/assets/logos/BrandLogo';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useUser } from '@/contexts/UserProvider';
import { DraggableGrid } from '@/features/common/DraggableGrid';
import { getAddonTierPrice, getBillingDetails } from '@/libs/utils/pricingUtils';
import { PricingCycleToggle } from '@/features/pricing/PricingCycleToggle';
import { SeatStepper } from '@/features/pricing/SeatStepper';
import { BulletList } from '@/features/pricing/components/BulletList';
import KitPrice from '@/features/pricing/components/KitPrice';
import { PppTooltipBadge, PppCallout } from '@/features/marketing/Pppbanner';
import { usePppTier } from '@/hooks/usePppGeo';
import { CheckoutNotice } from '@/features/checkout/CheckoutNotice';
import { EuFlagIcon } from '@/assets/icons/EuFlagIcon';
import { EMAIL_REGEX, formatPriceAmount } from '@/libs/utils/checkoutHelpers';

const DESKTOP_FOOTER_CLASS = 'text-accent-2xs hidden px-24 text-left text-foreground-muted md:px-40 lg:block';
const MOBILE_FOOTER_CLASS = 'text-accent-2xs w-full max-w-[30rem] text-left text-foreground-muted lg:hidden';
const CHECKOUT_FADE_CLASS = 'relative z-10 flex min-h-full flex-col items-center justify-center gap-16 p-16 lg:h-screen lg:p-24';
const CHECKOUT_CARD_CLASS = 'max-h-[calc(100vh-4rem)] w-full max-w-[30rem] overflow-y-auto border border-foreground/15 bg-background p-20 text-foreground shadow-2xl lg:p-24';
const EMAIL_INPUT_CLASS = 'w-full border-b bg-transparent px-0 py-12 text-body text-foreground transition-colors duration-(--duration-quick) ease-(--ease-expo-out) placeholder:text-foreground/30 focus:outline-none';
const CHECKBOX_CLASS = 'mt-2 size-16 shrink-0 cursor-pointer appearance-none border border-foreground/30 bg-transparent transition-colors checked:border-brand checked:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50';
const SKIP_BUTTON_CLASS = 'text-body-sm text-foreground-reading underline decoration-foreground/30 underline-offset-4 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground hover:decoration-foreground disabled:opacity-50';

function getEffectivePrice({ kind, isPerSeat, perSeatPrice, planPppPricing, currentCyclePlan }) {
  if (kind === 'kit') return null;
  if (isPerSeat) return perSeatPrice;
  if (planPppPricing) return planPppPricing.price;
  return getActivePrice(currentCyclePlan);
}

function getHeadingTitle(kind, kit, plan) {
  if (kind !== 'kit') return `${plan.name} Plan`;
  if (kit.isPack) return kit.title;
  return `${kit.title} Kit`;
}

function getPerSeatSummary(cycle, seatsPrefix, effectivePrice) {
  if (cycle === 'yearly') {
    return `${seatsPrefix}€${formatPriceAmount(effectivePrice)}/year · cancel anytime`;
  }

  return `${seatsPrefix}€${formatPriceAmount(Math.round((effectivePrice / 3) * 100) / 100)}/month · billed €${formatPriceAmount(effectivePrice)} quarterly · cancel anytime`;
}

function getAlreadyNotice(alreadyReason, kit) {
  if (alreadyReason === 'already_owned') {
    return {
      title: kit?.isPack ? 'You already own this Pack.' : 'You already own this Kit.',
      body: 'It lives in your account, ready to use.',
      actionHref: `/account/kits/${kit?.slug || ''}`,
      actionLabel: kit?.isPack ? 'Open your Pack' : 'Open your Kit',
    };
  }

  return {
    title: 'You already have an active plan.',
    body: 'Change or manage your plan from your account settings.',
    actionHref: '/settings',
    actionLabel: 'Open settings',
  };
}

function getPerkItems(kind) {
  if (kind === 'kit') {
    return [
      'One-time payment, yours forever',
      'React, Vue and HTML',
      'Final sale: you get the code right away, so there are no refunds',
    ];
  }

  return [
    `All ${appConfig.animationStats?.totalCount || '100+'} components`,
    'React, Vue and HTML',
    'New components as they ship',
    '14-day money-back guarantee on your first payment',
  ];
}

function buildCheckoutBody({ priceId, kind, isPerSeat, seats, component }) {
  return {
    priceId,
    mode: kind === 'kit' ? 'payment' : 'subscription',
    uiMode: 'embedded',
    ...(isPerSeat ? { quantity: seats } : {}),
    successUrl: `${window.location.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    attribution: getAttributionData(),
    experiments: getStoredExperiments(),
    ...(component?.slug ? { wantedComponent: component.slug } : {}),
  };
}

function KitPriceSummary({ kit }) {
  return (
    <>
      <KitPrice
        kitSlug={kit?.slug}
        fallback={kit.priceDisplay || ''}
        struckClassName="text-foreground-muted"
      />
      {kit.priceDisplay ? ' ' : ''}
      one-time · yours forever
    </>
  );
}

function YearlyPppSummary({ effectivePrice, currentCyclePlan }) {
  return (
    <span
      aria-label={`€${effectivePrice} per year, regularly €${getActivePrice(currentCyclePlan)}, cancel anytime`}
    >
      €{effectivePrice}/year{' '}
      <s aria-hidden="true" className="text-foreground-muted">
        €{getActivePrice(currentCyclePlan)}
      </s>{' '}
      · cancel anytime
    </span>
  );
}

function QuarterlyPppSummary({ effectivePrice, planPppPricing, currentCyclePlan }) {
  return (
    <span
      aria-label={`€${effectivePrice} per month, regularly €${getActivePrice(currentCyclePlan)}, billed €${planPppPricing.cycleTotal} quarterly, cancel anytime`}
    >
      €{effectivePrice}/month{' '}
      <s aria-hidden="true" className="text-foreground-muted">
        €{getActivePrice(currentCyclePlan)}
      </s>{' '}
      · billed €{planPppPricing.cycleTotal} quarterly · cancel anytime
    </span>
  );
}

function PriceSummary({
  kind,
  kit,
  cycle,
  isPerSeat,
  seatsPrefix,
  effectivePrice,
  planPppPricing,
  currentCyclePlan,
}) {
  if (isPerSeat) return getPerSeatSummary(cycle, seatsPrefix, effectivePrice);
  if (kind === 'kit') return <KitPriceSummary kit={kit} />;

  if (cycle === 'yearly') {
    if (!planPppPricing) return `€${effectivePrice}/year · cancel anytime`;

    return (
      <YearlyPppSummary effectivePrice={effectivePrice} currentCyclePlan={currentCyclePlan} />
    );
  }

  if (!planPppPricing) return `€${effectivePrice}/month · billed quarterly · cancel anytime`;

  return (
    <QuarterlyPppSummary
      effectivePrice={effectivePrice}
      planPppPricing={planPppPricing}
      currentCyclePlan={currentCyclePlan}
    />
  );
}

function LegalFooter({ kind }) {
  return (
    <>
      {kind === 'kit' ? (
        <SecondaryButton
          href="/kits"
          inline
          className="text-foreground"
        >
          Back to Kits
        </SecondaryButton>
      ) : (
        <SecondaryButton
          href="/pricing"
          inline
          className="text-foreground"
        >
          Compare all plans
        </SecondaryButton>
      )}{' '}
      · By purchasing, you agree to our{' '}
      <SecondaryButton
        href="/terms"
        inline
        className="text-foreground"
      >
        Terms
      </SecondaryButton>{' '}
      and{' '}
      <SecondaryButton
        href="/refund"
        inline
        className="text-foreground"
      >
        Refund Policy
      </SecondaryButton>
      .
    </>
  );
}

function PlanHeader({
  kind,
  plan,
  cycle,
  seats,
  isPerSeat,
  hasPppDiscount,
  headingTitle,
  priceSummary,
  onCycleChange,
  onSeatsChange,
}) {
  return (
    <div className="flex flex-col gap-8">
      {hasPppDiscount && (
        <span className="flex justify-start">
          <PppTooltipBadge />
        </span>
      )}
      <h1 className="h4 hidden font-medium lg:block">{headingTitle}</h1>
      <p className="text-body hidden text-foreground lg:block">{priceSummary}</p>
      <p className="text-body-sm font-medium text-foreground lg:hidden">
        {headingTitle} · {priceSummary}
      </p>
      {kind === 'plan' && (
        <div className="mt-8 flex justify-start">
          <PricingCycleToggle
            cycle={cycle}
            onChange={onCycleChange}
            variant="compact"
          />
        </div>
      )}
      {isPerSeat && (
        <SeatStepper
          className="mt-8"
          seats={seats}
          onChange={onSeatsChange}
          min={plan.minSeats}
          max={plan.maxSeats}
          tone="light"
        />
      )}
    </div>
  );
}

function UnlockingCard({ component }) {
  return (
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
        <span className="text-body-sm font-medium text-foreground">{component.title}</span>
        <span className="text-accent-2xs text-foreground-muted">
          Included in every plan, plus the whole library.
        </span>
      </div>
    </div>
  );
}

function CheckoutPerks({ kind }) {
  return (
    <div className="flex flex-col gap-24">
      <BulletList items={getPerkItems(kind)} />
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
  );
}

function SummaryColumn({ kind, children }) {
  return (
    <div className="relative flex flex-col bg-background">
      <div className="absolute bottom-0 right-0 top-0 hidden w-px bg-foreground/10 lg:block" />
      <FadeIn className="flex flex-1 flex-col gap-16 py-24 md:py-40" stagger={0.08}>
        <div className="flex items-center px-24 md:px-40">
          <BrandMark />
        </div>
        <div className="flex px-24 md:px-40 lg:flex-1 lg:items-center">
          <div className="flex w-full max-w-[26rem] flex-col gap-16 lg:gap-32">{children}</div>
        </div>
        <p className={DESKTOP_FOOTER_CLASS}>
          <LegalFooter kind={kind} />
        </p>
      </FadeIn>
    </div>
  );
}

function EmailStep({
  email,
  emailError,
  newsletterOptIn,
  isSubmittingEmail,
  emailInputRef,
  onEmailSubmit,
  onEmailChange,
  onNewsletterChange,
  onSkipEmail,
}) {
  return (
    <form onSubmit={onEmailSubmit} className="flex flex-col gap-24 p-8">
      <h2 className="text-body font-medium text-foreground">
        Where should we send your access?
      </h2>
      <div className="flex flex-col gap-4">
        <input
          ref={emailInputRef}
          type="email"
          value={email}
          onChange={onEmailChange}
          maxLength={200}
          placeholder="you@studio.com"
          aria-label="Email address"
          aria-invalid={!!emailError}
          className={cn(
            EMAIL_INPUT_CLASS,
            emailError ? 'border-brand' : 'border-foreground/20 focus:border-foreground/55',
          )}
        />
        {emailError ? <p className="text-accent-xs text-brand">{emailError}</p> : null}
      </div>
      <label className="flex cursor-pointer items-start gap-10 text-body-sm text-foreground-muted">
        <input
          type="checkbox"
          checked={newsletterOptIn}
          onChange={onNewsletterChange}
          disabled={isSubmittingEmail}
          className={CHECKBOX_CLASS}
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
          onClick={onSkipEmail}
          className={SKIP_BUTTON_CLASS}
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}

function PaymentStep({
  cycle,
  activePriceId,
  checkoutError,
  isMountingCheckout,
  checkoutContainerRef,
}) {
  return (
    <div className="flex flex-col gap-12">
      {checkoutError ? (
        <CheckoutNotice title="Something went wrong." body={checkoutError} />
      ) : null}
      <div className="relative min-h-[32rem]">
        {isMountingCheckout && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader size="32" />
          </div>
        )}
        <div key={`${activePriceId}-${cycle}`} ref={checkoutContainerRef} />
      </div>
    </div>
  );
}

function CheckoutStep({
  step,
  kit,
  cycle,
  alreadyReason,
  activePriceId,
  email,
  emailError,
  newsletterOptIn,
  isSubmittingEmail,
  checkoutError,
  isMountingCheckout,
  emailInputRef,
  checkoutContainerRef,
  onEmailSubmit,
  onEmailChange,
  onNewsletterChange,
  onSkipEmail,
}) {
  if (step === 'no-pk') {
    return (
      <CheckoutNotice
        title="Checkout is temporarily unavailable."
        body="The payment configuration is missing. Please try again shortly, or write us at support@annnimate.com."
      />
    );
  }

  if (step === 'already') {
    const notice = getAlreadyNotice(alreadyReason, kit);

    return (
      <CheckoutNotice
        title={notice.title}
        body={notice.body}
        actionHref={notice.actionHref}
        actionLabel={notice.actionLabel}
      />
    );
  }

  if (step === 'email') {
    return (
      <EmailStep
        email={email}
        emailError={emailError}
        newsletterOptIn={newsletterOptIn}
        isSubmittingEmail={isSubmittingEmail}
        emailInputRef={emailInputRef}
        onEmailSubmit={onEmailSubmit}
        onEmailChange={onEmailChange}
        onNewsletterChange={onNewsletterChange}
        onSkipEmail={onSkipEmail}
      />
    );
  }

  return (
    <PaymentStep
      cycle={cycle}
      activePriceId={activePriceId}
      checkoutError={checkoutError}
      isMountingCheckout={isMountingCheckout}
      checkoutContainerRef={checkoutContainerRef}
    />
  );
}

function CheckoutColumn({ images, kind, children }) {
  return (
    <div className="relative bg-background">
      <div className="absolute inset-0">
        <DraggableGrid
          images={images}
          className="h-full"
          driftVx={16}
          driftVy={0}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 hidden bg-background/65 lg:block" />
      <FadeIn delay={0.12} className={CHECKOUT_FADE_CLASS}>
        <div className={CHECKOUT_CARD_CLASS}>{children}</div>
        <p className={MOBILE_FOOTER_CLASS}>
          <LegalFooter kind={kind} />
        </p>
      </FadeIn>
    </div>
  );
}

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
  const pppTier = usePppTier();
  const checkoutContainerRef = useRef(null);
  const emailInputRef = useRef(null);
  const hasTrackedCheckoutStartRef = useRef(false);
  const hasTrackedPageViewRef = useRef(false);
  const [cycle, setCycle] = useState(initialCycle);
  const [seats, setSeats] = useState(initialSeats ?? plan?.minSeats ?? 1);
  const [step, setStep] = useState(stripePk ? 'lead-check' : 'no-pk');
  const [alreadyReason, setAlreadyReason] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isMountingCheckout, setIsMountingCheckout] = useState(false);

  const isPerSeat = !!plan?.perSeat;
  const currentCyclePlan = plan ? plan[cycle] : null;
  const activePriceId = kind === 'kit' ? kit?.priceId : currentCyclePlan?.priceId;
  const planPppPricing =
    kind !== 'kit' && plan && pppTier ? getBillingDetails(plan.key, cycle, pppTier) : null;
  const perSeatPrice = isPerSeat
    ? calculateTierSeatsPrice(seats, plan.soloCents[cycle], pppTier, CYCLE_MONTHS[cycle]) / 100
    : null;
  const effectivePrice = getEffectivePrice({
    kind,
    isPerSeat,
    perSeatPrice,
    planPppPricing,
    currentCyclePlan,
  });
  const hasPppDiscount = !!(
    planPppPricing ||
    (kind === 'kit' && pppTier && getAddonTierPrice(kit?.slug, pppTier) != null)
  );
  const headingTitle = getHeadingTitle(kind, kit, plan);
  const seatsPrefix = isPerSeat ? `${seats} seats · ` : '';
  const priceSummary = (
    <PriceSummary
      kind={kind}
      kit={kit}
      cycle={cycle}
      isPerSeat={isPerSeat}
      seatsPrefix={seatsPrefix}
      effectivePrice={effectivePrice}
      planPppPricing={planPppPricing}
      currentCyclePlan={currentCyclePlan}
    />
  );

  async function onEmailSubmit(event) {
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
    } catch {} finally {
      setIsSubmittingEmail(false);
    }
  }

  function onEmailChange(event) {
    setEmail(event.target.value);
    if (emailError) setEmailError(null);
  }

  function onNewsletterChange(event) {
    setNewsletterOptIn(event.target.checked);
  }

  function onSkipEmail() {
    analytics.track('checkout_email_step_skipped', {
      kind,
      plan: plan?.key || kit?.slug,
    });
    setStep('payment');
  }

  useEffect(() => {
    if (step !== 'lead-check') return;

    let cancelled = false;

    async function runLeadCheck() {
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
    }

    runLeadCheck();

    return () => {
      cancelled = true;
    };
  }, [step, user]);

  useEffect(() => {
    if (step !== 'email') return;

    emailInputRef.current?.focus();
    analytics.track('checkout_email_step_shown', {
      kind,
      plan: plan?.key || kit?.slug,
    });
  }, [step]);

  useEffect(() => {
    if (step !== 'payment' || !stripePk || !activePriceId) return;

    let cancelled = false;
    let embeddedCheckout = null;
    const checkoutOptions = { priceId: activePriceId, kind, isPerSeat, seats, component };

    function trackCheckoutStarted() {
      if (hasTrackedCheckoutStartRef.current) return;

      hasTrackedCheckoutStartRef.current = true;

      if (kind === 'kit') {
        analytics.track?.('kit_checkout_started', {
          kit: kit?.title,
          ...(pppTier ? { ppp_tier: pppTier } : {}),
        });
        return;
      }

      analytics.revenue.checkoutStarted(
        plan?.name,
        effectivePrice ?? null,
        cycle,
        isPerSeat ? { seats } : undefined,
      );
    }

    function onMountError(err) {
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

    async function mountCheckout() {
      try {
        const [stripeInstance, sessionRes] = await Promise.all([
          loadStripe(stripePk),
          apiClient.post('/stripe/create-checkout', buildCheckoutBody(checkoutOptions)),
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
        trackCheckoutStarted();
      } catch (err) {
        onMountError(err);
      }
    }

    setCheckoutError(null);
    setIsMountingCheckout(true);

    const timerId = setTimeout(() => {
      mountCheckout();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
      embeddedCheckout?.destroy();
    };
  }, [step, activePriceId, stripePk, seats]);

  return (
    <div className="grid bg-background lg:h-screen lg:grid-cols-[1fr_3fr]">
      <SummaryColumn kind={kind}>
        <PlanHeader
          kind={kind}
          plan={plan}
          cycle={cycle}
          seats={seats}
          isPerSeat={isPerSeat}
          hasPppDiscount={hasPppDiscount}
          headingTitle={headingTitle}
          priceSummary={priceSummary}
          onCycleChange={setCycle}
          onSeatsChange={setSeats}
        />

        {hasPppDiscount && <PppCallout align="start" />}

        {component ? <UnlockingCard component={component} /> : null}

        <CheckoutPerks kind={kind} />
      </SummaryColumn>

      <CheckoutColumn images={images} kind={kind}>
        <CheckoutStep
          step={step}
          kit={kit}
          cycle={cycle}
          alreadyReason={alreadyReason}
          activePriceId={activePriceId}
          email={email}
          emailError={emailError}
          newsletterOptIn={newsletterOptIn}
          isSubmittingEmail={isSubmittingEmail}
          checkoutError={checkoutError}
          isMountingCheckout={isMountingCheckout}
          emailInputRef={emailInputRef}
          checkoutContainerRef={checkoutContainerRef}
          onEmailSubmit={onEmailSubmit}
          onEmailChange={onEmailChange}
          onNewsletterChange={onNewsletterChange}
          onSkipEmail={onSkipEmail}
        />
      </CheckoutColumn>
    </div>
  );
}