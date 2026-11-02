'use client';

// Variable Mapping: U -> FirstComponentBanner, e -> slug, a -> platform, n -> active, r -> steps, i -> starterSlug, l -> isDismissed, o -> setIsDismissed, c -> platformLabel, H.a -> useOnboarding, R.A -> PLATFORM_OPTIONS, $.f -> XIcon

import { useState } from 'react'; // NOTE: module id: 271645
import { useOnboarding } from '@/contexts/OnboardingProvider'; // NOTE: module id: 92451
import { PLATFORM_OPTIONS } from '@/libs/config/onboarding'; // NOTE: module id: 734601
import { XIcon } from '@phosphor-icons/react'; // NOTE: module id: 137410

// NOTE: module id: 521041
export default function FirstComponentBanner({ slug, platform }) {
  const { active, steps, starterSlug } = useOnboarding();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!active || isDismissed || slug !== starterSlug || steps.copy) return null;

  const platformLabel = PLATFORM_OPTIONS.find((item) => item.value === platform)?.label || null;

  return (
    <div className="v2-container pt-24">
      <div className="flex items-center gap-12 border border-foreground/10 bg-foreground/[0.04] px-16 py-12">
        <span className="size-8 shrink-0 bg-brand" />
        <p className="text-body-sm flex-1 text-foreground">
          Your first component.{' '}
          <span className="text-foreground-muted">
            Copy it{platformLabel ? ` in ${platformLabel}` : ''}, then drop it into your
            project - the panel tells you exactly where it goes.
          </span>
        </p>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss"
          className="flex size-24 shrink-0 items-center justify-center text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  );
}
