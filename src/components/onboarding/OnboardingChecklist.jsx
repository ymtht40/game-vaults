'use client';

// Variable Mapping: ei -> DISCORD_NUDGE_DISMISSED_KEY, es -> OnboardingChecklist, e -> active, r -> steps, n -> allDone, l -> starterSlug, i -> dismiss, s -> profile, o -> isCollapsed, c -> isMobile, d -> isVisible, u -> setIsVisible, f -> isCompleteView, m -> setIsCompleteView, h -> isDiscordDismissed, g -> setIsDiscordDismissed, x -> showDiscordNudge, b -> nudgeTrackedRef, v -> completedCount, y -> checklistItems, w -> highlightedKey, (effects) e -> frameId / timeoutId, (list map) e -> item, a -> isHighlighted, r -> itemContent

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645

import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { getDiscordInviteUrl } from '@/libs/config/discord'; // NOTE: module id: 768947
import { ArrowRightIcon, CheckIcon, DiscordLogoIcon, X } from '@phosphor-icons/react'; // NOTE: module id: 137410

import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836
import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220
import { useSidebar } from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import { useOnboarding } from '@/contexts/OnboardingProvider'; // NOTE: module id: 92451
import OnboardingComplete from '@/components/onboarding/OnboardingComplete';

const DISCORD_NUDGE_DISMISSED_KEY = 'anm_onboarding_discord_dismissed';

// NOTE: module id: 583246
export default function OnboardingChecklist() {
  const { active, steps, allDone, starterSlug, dismiss } = useOnboarding();
  const { profile } = useUser();
  const { isCollapsed, isMobile } = useSidebar();
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleteView, setIsCompleteView] = useState(false);
  const [isDiscordDismissed, setIsDiscordDismissed] = useState(true);

  useEffect(() => {
    try {
      setIsDiscordDismissed(localStorage.getItem(DISCORD_NUDGE_DISMISSED_KEY) === '1');
    } catch {}
  }, []);

  const showDiscordNudge =
    steps.copy && !isDiscordDismissed && !allDone && !isCompleteView;
  const nudgeTrackedRef = useRef(false);

  useEffect(() => {
    if (showDiscordNudge && !nudgeTrackedRef.current) {
      nudgeTrackedRef.current = true;
      analytics.track('onboarding_discord_nudge_shown');
    }
  }, [showDiscordNudge]);

  useEffect(() => {
    if (active) {
      const frameId = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frameId);
    }
    setIsVisible(false);
  }, [active]);

  useEffect(() => {
    if (allDone && !isCompleteView) {
      const timeoutId = setTimeout(() => setIsCompleteView(true), 850);
      return () => clearTimeout(timeoutId);
    }
  }, [allDone, isCompleteView]);

  if (!active) return null;

  const completedCount = [steps.stack, steps.copy, steps.tune].filter(Boolean).length;
  const checklistItems = [
    { key: 'stack', label: 'Pick your stack', done: steps.stack },
    {
      key: 'copy',
      label: 'Copy your first component',
      done: steps.copy,
      href: `/animations/${starterSlug}`,
    },
    {
      key: 'tune',
      label: 'Tune it - edit the code, watch it update',
      done: steps.tune,
    },
  ];
  const highlightedKey = checklistItems.find((item) => !item.done && item.href)?.key;

  return (
    <div
      data-theme="dark"
      style={{ left: `${(isMobile ? 0 : isCollapsed ? 64 : 256) + 24}px` }}
      className={`fixed bottom-24 z-[60] hidden w-[320px] border border-foreground/10 bg-background p-16 shadow-[0_8px_40px_rgba(0,0,0,0.45)] transition-[opacity,transform,left] duration-(--duration-snap) ease-(--ease-expo-out) md:block ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      {isCompleteView ? (
        <OnboardingComplete onClose={dismiss} />
      ) : (
        <>
          <div className="mb-16 flex items-center justify-between">
            <p className="text-accent-xs flex items-center gap-8 text-foreground">
              <span className="size-8 shrink-0 bg-brand" />
              {allDone ? "You're all set" : 'Getting started'}
            </p>
            <div className="flex items-center gap-10">
              {!allDone && (
                <span className="text-accent-xs text-foreground-muted">
                  {completedCount}/3
                </span>
              )}
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="flex size-24 items-center justify-center text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
              >
                <x size={14} />
              </button>
            </div>
          </div>
          <ul className="flex flex-col gap-10">
            {checklistItems.map((item) => {
              const isHighlighted = item.key === highlightedKey;
              const itemContent = (
                <>
                  <span
                    className={`mt-1 flex size-18 shrink-0 items-center justify-center transition-colors duration-(--duration-quick) ${
                      item.done
                        ? 'border border-brand text-brand'
                        : 'border border-foreground/20 text-foreground-muted'
                    }`}
                  >
                    {item.done ? <CheckIcon size={15} /> : null}
                  </span>
                  <span
                    className={`text-body-sm ${
                      item.done
                        ? 'text-foreground-muted line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isHighlighted && item.href ? (
                    <ArrowRightIcon
                      size={13}
                      className="ml-auto mt-1 shrink-0 text-foreground-muted"
                    />
                  ) : null}
                </>
              );
              return isHighlighted && item.href ? (
                <li key={item.key}>
                  <TransitionLink
                    href={item.href}
                    className="flex items-start gap-10 transition-opacity duration-(--duration-quick) hover:opacity-80"
                  >
                    {itemContent}
                  </TransitionLink>
                </li>
              ) : (
                <li key={item.key} className="flex items-start gap-10">
                  {itemContent}
                </li>
              );
            })}
          </ul>
          {showDiscordNudge ? (
            <div className="mt-16 border-t border-foreground/10 pt-16">
              <div className="mb-8 flex items-start justify-between gap-10">
                <div className="flex items-center gap-8">
                  <DiscordLogoIcon size={14} className="shrink-0 text-brand" />
                  <p className="text-accent-xs text-foreground">Devs hang out here</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(DISCORD_NUDGE_DISMISSED_KEY, '1');
                    } catch {}
                    setIsDiscordDismissed(true);
                    analytics.track('onboarding_discord_nudge_dismissed');
                  }}
                  aria-label="Dismiss Discord tip"
                  className="flex size-20 shrink-0 items-center justify-center text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
                >
                  <x size={12} />
                </button>
              </div>
              <p className="text-body-sm mb-12 text-foreground-muted">
                Drop in. Share what you build, see what others ship, get help when
                something breaks.
              </p>
              <Button
                href={getDiscordInviteUrl(profile)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try {
                    localStorage.setItem(DISCORD_NUDGE_DISMISSED_KEY, '1');
                  } catch {}
                  setIsDiscordDismissed(true);
                  analytics.track('onboarding_discord_nudge_clicked');
                }}
                theme="surface"
                size="xs"
                className="w-full"
              >
                Join the Discord
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
