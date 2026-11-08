'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircleIcon } from '@phosphor-icons/react'; // NOTE: module id: 817389
import Loader from '@/components/ui/Loader'; // NOTE: module id: 461376
import { useTransitionRouter } from '@/contexts/TransitionRouterProvider'; // NOTE: module id: 676040
import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220
import { LibraryShowcaseLayout } from '@/features/common/LibraryShowcaseLayout'; // NOTE: module id: 430550
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { 
  PLATFORM_OPTIONS,
  DEFAULT_PLATFORM,
  STARTER_ANIMATION_SLUG,
} from '@/libs/config/onboarding'; // NOTE: module id: 734601

// NOTE: module id: 302155
export function WelcomeView({ onStart, onSkip, images = [] }) {
  return (
    <LibraryShowcaseLayout
      images={images}
      icon={<CheckCircleIcon className="size-40 text-brand" />}
      heading="You're in. Start with this one."
      body="We picked a sharp one to begin. Copy it, drop it into your project - the whole library works exactly the same."
      primary={{
        onClick: () => onStart(DEFAULT_PLATFORM),
        label: 'Copy your first component',
      }}
      footer="Every format is one click away on any component, whatever you pick here."
    >
      <div className="mb-24">
        <p className="text-mono-sm mb-12 text-foreground-muted">Prefer a different stack?</p>
        <div className="flex flex-wrap gap-8">
          {PLATFORM_OPTIONS.map((platform) => (
            <button
              key={platform.value}
              type="button"
              onClick={() => onStart(platform.value)}
              className="text-mono-sm flex items-center gap-8 border border-foreground/15 px-12 py-8 text-foreground transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:border-foreground/40 hover:bg-foreground/5"
            >
              <span className="size-6 shrink-0 bg-foreground/20" />
              {platform.label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="text-mono-sm mb-24 block w-full text-center text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
      >
        I'll look around
      </button>
    </LibraryShowcaseLayout>
  );
}

// NOTE: module id: 302155
export default function WelcomePage({ images = [] }) {
  const router = useTransitionRouter();
  const { user, profile, loading, updateProfile } = useUser();
  const isNavigatingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isNavigatingRef.current) {
      if (!user) {
        router.replace('/login');
        return;
      }
      if (profile && (profile.onboarding_completed === true || profile.preferred_platform)) {
        router.replace('/animations');
      }
    }
  }, [loading, user, profile, router]);

  const hasTrackedStartRef = useRef(false);

  useEffect(() => {
    if (user && !hasTrackedStartRef.current) {
      hasTrackedStartRef.current = true;
      analytics.track('onboarding_started', { source: 'welcome_page' });
    }
  }, [user]);

  const handleStart = async (platform) => {
    isNavigatingRef.current = true;
    setIsSubmitting(true);
    analytics.track('onboarding_platform_selected', { platform });
    await updateProfile({ preferred_platform: platform });
    router.push(`/animations/${STARTER_ANIMATION_SLUG}`);
  };

  const handleSkip = async () => {
    isNavigatingRef.current = true;
    setIsSubmitting(true);
    analytics.track('onboarding_skipped', { source: 'welcome_page' });
    await updateProfile({ onboarding_completed: true });
    router.push('/animations');
  };

  return loading ||
    !user ||
    isSubmitting ||
    (profile && (profile.onboarding_completed === true || profile.preferred_platform)) ? (
    <div className="flex min-h-screen items-center justify-center bg-background p-24">
      <Loader size="32" />
    </div>
  ) : (
    <WelcomeView onStart={handleStart} onSkip={handleSkip} images={images} />
  );
}

