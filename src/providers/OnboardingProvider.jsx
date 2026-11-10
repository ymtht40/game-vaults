'use client';

// Variable Mapping: s -> COPIED_STORAGE_KEY, o -> TUNED_STORAGE_KEY, i -> defaultOnboardingContext, c -> OnboardingContext, R -> OnboardingProvider, a -> useOnboarding, d -> updateProfile, u -> hasCopied, m -> setHasCopied, f -> hasTuned, h -> setHasTuned, p -> hasStack, g -> createdAtMs, x -> isRecentSignup, v -> isActive, A -> isAllDone, b -> completeOnboarding

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { useUser } from '@/providers/UserProvider'; // NOTE: module id: 201220
import { EVENTS, STARTER_ANIMATION_SLUG } from '@/libs/config/onboarding'; // NOTE: module id: 734601

const COPIED_STORAGE_KEY = 'anm_onboarding_copied';
const TUNED_STORAGE_KEY = 'anm_onboarding_tuned';

const defaultOnboardingContext = {
  active: false,
  starterSlug: STARTER_ANIMATION_SLUG,
  steps: { stack: false, copy: false, tune: false },
  allDone: false,
  completeOnboarding: () => {},
  dismiss: () => {}
};

const OnboardingContext = createContext(defaultOnboardingContext);

// NOTE: module id: 92451
export function OnboardingProvider({ children }) {
  const { profile, updateProfile } = useUser();
  const [hasCopied, setHasCopied] = useState(false);
  const [hasTuned, setHasTuned] = useState(false);

  useEffect(() => {
    try {
      setHasCopied(localStorage.getItem(COPIED_STORAGE_KEY) === '1');
      setHasTuned(localStorage.getItem(TUNED_STORAGE_KEY) === '1');
    } catch {}
  }, []);

  useEffect(() => {
    const handleCopied = () => {
      const alreadyCopied = (() => {
        try {
          return localStorage.getItem(COPIED_STORAGE_KEY) === '1';
        } catch {
          return false;
        }
      })();
      try {
        localStorage.setItem(COPIED_STORAGE_KEY, '1');
      } catch {}
      setHasCopied(true);
      if (!alreadyCopied) {
        analytics.track('onboarding_step_completed', { step: 'copy' });
      }
    };

    const handleTuned = () => {
      const alreadyTuned = (() => {
        try {
          return localStorage.getItem(TUNED_STORAGE_KEY) === '1';
        } catch {
          return false;
        }
      })();
      try {
        localStorage.setItem(TUNED_STORAGE_KEY, '1');
      } catch {}
      setHasTuned(true);
      if (!alreadyTuned) {
        analytics.track('onboarding_step_completed', { step: 'tune' });
      }
    };

    window.addEventListener(EVENTS.copied, handleCopied);
    window.addEventListener(EVENTS.tuned, handleTuned);
    return () => {
      window.removeEventListener(EVENTS.copied, handleCopied);
      window.removeEventListener(EVENTS.tuned, handleTuned);
    };
  }, []);

  const hasStack = !!profile?.preferred_platform;
  const createdAtMs = profile?.created_at
    ? new Date(profile.created_at).getTime()
    : null;
  const isRecentSignup = createdAtMs != null && Date.now() - createdAtMs < 2592000000;
  const isActive = profile?.onboarding_completed === false && isRecentSignup;
  const isAllDone = hasStack && hasCopied && hasTuned;

  const completeOnboarding = useCallback(() => {
    if (profile && profile.onboarding_completed === false) {
      analytics.activation.onboardingCompleted(null, [
        ...(profile?.preferred_platform ? ['stack'] : []),
        ...(hasCopied ? ['copy'] : []),
        ...(hasTuned ? ['tune'] : [])
      ]);
      updateProfile({ onboarding_completed: true });
    }
  }, [profile, updateProfile, hasCopied, hasTuned]);

  return (
    <OnboardingContext.Provider
      value={{
        active: isActive,
        starterSlug: STARTER_ANIMATION_SLUG,
        steps: { stack: hasStack, copy: hasCopied, tune: hasTuned },
        allDone: isAllDone,
        completeOnboarding,
        dismiss: completeOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}

