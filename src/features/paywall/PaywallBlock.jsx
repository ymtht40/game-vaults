'use client';

// Variable Mapping: x -> featuredTestimonial, p -> DEFAULT_MARQUEE_ITEMS, g -> StarterPackMarquee, u -> StarterPackMarquee, b -> PaywallQuote, B -> PaywallQuote, v -> FreeBadge, T -> FreeBadge, y -> PaywallBlock, U -> PaywallBlock, j -> LockedBadge, S -> isSubscriber, M -> setIsSubscriber, Z -> hasTrackedRef, L -> handleCheckoutClick, E -> checkoutHref, _ -> unlockLabel, A -> showStarterPackCapture

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { Lock } from '@phosphor-icons/react'; // NOTE: module id: 499141
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { appConfig, getActivePrice } from '@/libs/config/appConfig'; // NOTE: module id: 516799
import { testimonials } from '@/libs/data/testimonials'; // NOTE: module id: 967791
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import NavLink from '@/components/navigation/NavSurface'; // NOTE: module id: 520237
import NewsletterForm from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 42242
import PaywallSubscribedBlock from '@/features/paywall/PaywallSubscribedBlock'; // NOTE: module id: 928862
import { useBreakpoint } from '@/hooks/useBreakpoint'; // NOTE: module id: 400701
import { hasDismissedStarterPrompt } from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 927627

const featuredTestimonial = testimonials[2] || null;

const DEFAULT_MARQUEE_ITEMS = [
  {
    title: 'Text Reveal',
    img: 'https://annnimate.b-cdn.net/video-thumbnails/scroll/text-reveal/text-reveal_cover.avif'
  },
  {
    title: 'Dual Scramble',
    img: 'https://annnimate.b-cdn.net/video-thumbnails/ui-component/dual-scramble/dual_scramble_cover.avif'
  },
  {
    title: 'Accordion',
    img: 'https://annnimate.b-cdn.net/video-thumbnails/ui-component/accordion/accordion_cover.avif'
  },
  {
    title: 'Drawer Menu',
    img: 'https://annnimate.b-cdn.net/video-thumbnails/menu/multi-level-drawer-menu/multi-level-drawer-menu_cover.avif'
  }
];

// NOTE: module id: 993603
export function StarterPackMarquee({ className = '', items = null }) {
  const resolvedItems = items && items.length ? items : DEFAULT_MARQUEE_ITEMS;
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const container = containerRef.current;
      if (track && container) {
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          const tween = gsap.to(track, {
            xPercent: -50,
            duration: 7 * resolvedItems.length,
            ease: 'none',
            repeat: -1,
            force3D: true
          });
          const pauseMarquee = () =>
            gsap.to(tween, { timeScale: 0, duration: 0.4, overwrite: true });
          const resumeMarquee = () =>
            gsap.to(tween, { timeScale: 1, duration: 0.4, overwrite: true });

          container.addEventListener('mouseenter', pauseMarquee);
          container.addEventListener('mouseleave', resumeMarquee);
          return () => {
            container.removeEventListener('mouseenter', pauseMarquee);
            container.removeEventListener('mouseleave', resumeMarquee);
          };
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_28%,black_72%,transparent)] ${className}`}
    >
      <div ref={trackRef} className="flex w-max">
        {[...resolvedItems, ...resolvedItems].map((item, index) => (
          <figure
            key={`${item.title}-${index}`}
            aria-hidden={index >= resolvedItems.length ? 'true' : undefined}
            className="flex w-140 shrink-0 flex-col gap-6 pr-12"
          >
            <div className="aspect-[16/10] w-full overflow-hidden border border-foreground/10 bg-foreground/[0.04]">
              <img
                src={item.img}
                alt={index >= resolvedItems.length ? '' : item.title}
                className="block object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <figcaption className="text-accent-2xs truncate text-center text-foreground-muted">
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function PaywallQuote({ className = 'mt-8' }) {
  return featuredTestimonial ? (
    <blockquote className={`${className} flex max-w-[34ch] flex-col gap-6 text-center`}>
      <p className="text-body-sm text-foreground-muted">
        “Similar services are 2-3 times the cost and don&apos;t offer the level of polish that GameVault does.”
      </p>
      <footer className="text-accent-xs text-foreground-muted">
        {featuredTestimonial.name} · {featuredTestimonial.role}
      </footer>
    </blockquote>
  ) : null;
}

export function FreeBadge() {
  return (
    <span className="text-accent-xs inline-flex h-24 items-center bg-brand px-8 font-medium text-[#141314]">
      Free
    </span>
  );
}

export function PaywallBlock({
  animation,
  isAuthenticated = false,
  starterPack = null,
  trackShown = true,
  showCheckout = true
}) {
  const isDesktop = useBreakpoint('lg');
  const title = animation?.title || animation?.name || 'this component';
  const slug = animation?.slug;
  const isInStarterPack = !!animation?.is_free_preview;
  const displayCount = appConfig.animationStats?.displayCount || '100+';
  const soloPlan = appConfig.stripe?.landingPlans?.find((plan) => plan.key === 'solo');
  const monthlyPrice = getActivePrice(soloPlan?.quarterly);
  const checkoutHref = `/checkout?plan=solo&cycle=quarterly${slug ? `&component=${slug}` : ''}`;
  const unlockLabel = monthlyPrice
    ? `Unlock everything - €${monthlyPrice}/mo`
    : 'Unlock everything';
  const showStarterPackCapture = isDesktop && !isAuthenticated;

  const [isSubscriber, setIsSubscriber] = useState(false);

  useEffect(() => {
    setIsSubscriber(hasDismissedStarterPrompt());
  }, []);

  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (trackShown && showStarterPackCapture && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      analytics.track('paywall_capture_shown', {
        animation_slug: slug,
        animation_name: title,
        in_starter_pack: isInStarterPack,
        subscriber: hasDismissedStarterPrompt()
      });
    }
  }, [trackShown, showStarterPackCapture, slug, title, isInStarterPack]);

  const handleCheckoutClick = () =>
    analytics.track('paywall_checkout_clicked', {
      animation_slug: slug,
      animation_name: title,
      subscriber: isSubscriber
    });

  const checkoutBlock = (
    <div className="flex flex-col items-center gap-12">
      <Button href={checkoutHref} onClick={handleCheckoutClick} theme="brand" size="sm">
        {unlockLabel}
      </Button>
      <p className="text-accent-xs text-foreground-muted">
        Cancel anytime · 14-day money-back guarantee
      </p>
      <NavLink
        href="/pricing"
        className="text-accent-xs text-foreground-muted hover:text-foreground"
      >
        See all plans
      </NavLink>
    </div>
  );

  if (showStarterPackCapture) {
    if (isSubscriber) {
      return (
        <PaywallSubscribedBlock
          title={title}
          isInStarterPack={isInStarterPack}
          count={displayCount}
          checkoutBlock={showCheckout ? checkoutBlock : null}
        />
      );
    }

    return (
      <div className="flex w-full max-w-[26rem] flex-col gap-20">
        <div className="flex flex-col items-center gap-10 text-center">
          {isInStarterPack ? (
            <>
              <FreeBadge />
              <p className="text-body font-medium text-foreground">
                {title} is in the free Starter Pack.
              </p>
              <p className="text-body-sm text-foreground-muted">
                Drop your email and this exact component lands in your inbox, in React, Vue and HTML. No card, no trial.
              </p>
            </>
          ) : (
            <>
              <LockedBadge />
              <p className="text-body font-medium text-foreground">
                The full code for {title} is locked.
              </p>
              <p className="text-body-sm text-foreground-muted">
                Start with the free pack, in React, Vue and HTML. A new free component every week. The whole {displayCount} library unlocks anytime.
              </p>
            </>
          )}
        </div>
        {!isInStarterPack && <StarterPackMarquee items={starterPack} />}
        <div className="flex flex-col gap-8">
          <NewsletterForm
            source="paywall-block"
            idPrefix="paywall"
            buttonLabel={
              isInStarterPack ? 'Send me this component' : 'Send me the free pack'
            }
            buttonSize="sm"
            className="w-full"
            compact={true}
            wantedComponent={slug}
            askName={false}
          />
        </div>
        {showCheckout && (
          <div className="mt-16 flex flex-col items-center gap-10 border-t border-foreground/10 pt-32">
            <Button
              href={checkoutHref}
              onClick={handleCheckoutClick}
              theme="surface"
              size="xs"
            >
              {monthlyPrice
                ? `Unlock everything - €${monthlyPrice}/mo`
                : 'Unlock everything'}
            </Button>
            <p className="text-accent-xs text-foreground-muted">
              Cancel anytime · 14-day money-back
            </p>
            <PaywallQuote />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-24">
      <div className="flex flex-col items-center gap-16 text-center">
        <LockedBadge />
        <span className="text-accent-xs text-foreground-muted">Locked</span>
        <p className="text-body max-w-[26ch] font-medium text-foreground">
          Get the full code for {title}.
        </p>
        <p className="text-body-sm max-w-[30ch] text-foreground-muted">
          Plus {displayCount} production components in React, Vue and HTML, each built to the standard we ship for real brands.
        </p>
      </div>
      {checkoutBlock}
    </div>
  );
}

function LockedBadge() {
  return (
    <span className="flex size-32 items-center justify-center border border-foreground/15 bg-background">
      <Lock size={14} className="text-foreground-muted" />
    </span>
  );
}

