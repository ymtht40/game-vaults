'use client';

// Variable Mapping: s -> CookieBanner, e -> onOpenPreferences, c -> isVisible, u -> setIsVisible, d -> bannerRef, p -> dismissBanner

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { acceptAllConsent, getConsentState } from '@/libs/config/consent'; // NOTE: module id: 160725
import Button from '@/components/ui/Button'; // NOTE: module id: 687989

// NOTE: module id: 632120
export function CookieBanner({ onOpenPreferences }) {
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    const consent = getConsentState();
    if (consent && consent.method !== null) return;

    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleConsentChanged = () => dismissBanner();
    window.addEventListener('gamevault:consent-changed', handleConsentChanged);
    return () =>
      window.removeEventListener(
        'gamevault:consent-changed',
        handleConsentChanged
      );
  }, []);

  useGSAP(
    () => {
      if (isVisible && bannerRef.current) {
        gsap.fromTo(
          bannerRef.current,
          { y: 32, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' }
        );
      }
    },
    { dependencies: [isVisible] }
  );

  const dismissBanner = (callback) => {
    if (!bannerRef.current) {
      setIsVisible(false);
      callback?.();
      return;
    }

    gsap.to(bannerRef.current, {
      y: 32,
      autoAlpha: 0,
      duration: 0.4,
      ease: 'expo.in',
      onComplete: () => {
        setIsVisible(false);
        callback?.();
      },
    });
  };

  return isVisible ? (
    <div
      ref={bannerRef}
      role="dialog"
      aria-label="Cookie preferences"
      aria-describedby="cookie-banner-body"
      className="fixed bottom-16 left-16 z-40 w-[calc(100vw-32px)] max-w-[320px] opacity-0"
      data-theme="dark"
    >
      <div className="flex flex-col gap-16 border border-foreground/15 bg-background p-16 text-foreground lg:p-20">
        <p id="cookie-banner-body" className="text-body-sm text-foreground-muted">
          Anonymous pageviews by default. Accept all for session recording and live chat.{' '}
          <Link
            href="/cookies"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:decoration-foreground"
          >
            Learn more
          </Link>
        </p>
        <div className="flex gap-8">
          <Button
            type="button"
            theme="light"
            size="xs"
            onClick={() => dismissBanner(acceptAllConsent)}
            className="flex-1"
          >
            Accept all
          </Button>
          <Button
            type="button"
            theme="surface"
            size="xs"
            onClick={() => dismissBanner(onOpenPreferences)}
            className="flex-1"
          >
            Preferences
          </Button>
        </div>
      </div>
    </div>
  ) : null;
}

// NOTE: module id: 632120
export default CookieBanner;
