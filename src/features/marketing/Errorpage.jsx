'use client';

// Variable Mapping: e -> error, t -> reset, n -> containerRef, i -> headingRevealRef, r -> playDescriptionRevealRef, s -> actionsWrapperRef

import { useEffect, useRef } from 'react'; // NOTE: module id: 271645
import Link from 'next/link'; // NOTE: module id: 522016
import { Crisp } from 'crisp-sdk-web';
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { pricingConfig as config } from '@/libs/data/pricing'; // NOTE: module id: 516799
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { SecondaryButton } from '@/components/ui/SecondaryButton'; // NOTE: module id: 511757
import RevealHeading from '@/animations/RevealHeading'; // NOTE: module id: 963160
import SplitTextReveal from '@/animations/AnimatedText'; // NOTE: module id: 218091
import { BrandLogo } from '@/assets/logos/BrandLogo'; // NOTE: module id: 843028

// NOTE: module id: 760542
export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    analytics.error.exception(error, {
      source: 'segment-error',
      digest: error?.digest,
      url: window.location.href,
    });
  }, [error]);

  const containerRef = useRef(null);
  const headingRevealRef = useRef(null);
  const playDescriptionRevealRef = useRef(null);
  const actionsWrapperRef = useRef(null);

  useGSAP(
    () => {
      const runEntranceAnimation = (withDelays) => {
        headingRevealRef.current?.reveal?.();
        gsap.delayedCall(0.15 * !!withDelays, () => playDescriptionRevealRef.current?.());
        if (actionsWrapperRef.current) {
          gsap.fromTo(
            actionsWrapperRef.current,
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: 'expo.out',
              delay: 0.5 * !!withDelays,
            }
          );
        }
      };

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const delayedCall = gsap.delayedCall(0.2, () => runEntranceAnimation(true));
        return () => delayedCall.kill();
      });
      mm.add('(prefers-reduced-motion: reduce)', () => runEntranceAnimation(false));

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <main
      ref={containerRef}
      data-theme="dark"
      className="error-page relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-24 text-foreground"
    >
      <Link
        href="/"
        aria-label="Annnimate home"
        className="absolute left-24 top-24 lg:left-32 lg:top-32"
      >
        <BrandLogo height={20} className="text-foreground" />
      </Link>

      <div className="flex w-full max-w-[640px] flex-col items-center text-center">
        <p className="text-accent-xs mb-32 flex items-center gap-10 text-foreground-muted lg:mb-40">
          <span aria-hidden="true" className="relative inline-flex size-8">
            <span className="absolute inset-0 animate-ping bg-brand opacity-60" />
            <span className="relative inline-block size-8 bg-brand" />
          </span>
          Runtime error
        </p>

        <RevealHeading
          ref={headingRevealRef}
          as="h1"
          sizeClass="text-h2"
          className="font-medium"
          trigger="manual"
        >
          Something came apart.
        </RevealHeading>

        <SplitTextReveal
          tag="p"
          className="text-body-lg mt-16 max-w-[44ch] text-foreground-muted lg:mt-20"
          type="lines"
          mask="lines"
          duration={0.6}
          stagger={0.03}
          ease="power2.out"
          animationProps={{ yPercent: 100 }}
          triggerMode="manual"
          onReady={(play) => {
            playDescriptionRevealRef.current = play;
          }}
        >
          An unexpected error happened. Try refreshing the page, or reach out if it
          keeps happening.
        </SplitTextReveal>

        <div
          ref={actionsWrapperRef}
          className="mt-32 flex flex-wrap items-center justify-center gap-12 lg:mt-40"
        >
          <Button onClick={reset} theme="brand" size="sm">
            Try again
          </Button>
          <SecondaryButton
            onClick={() => {
              if (config.crisp?.id) {
                Crisp.chat.show();
                Crisp.chat.open();
              } else if (config.resend?.supportEmail) {
                window.open(
                  `mailto:${config.resend.supportEmail}?subject=Error report for ${config.appName}`,
                  '_blank'
                );
              }
            }}
            size="sm"
          >
            Contact support
          </SecondaryButton>
          <SecondaryButton href="/" size="sm">
            Back to home
          </SecondaryButton>
        </div>
      </div>

      <span className="sr-only">Application error</span>
    </main>
  );
}