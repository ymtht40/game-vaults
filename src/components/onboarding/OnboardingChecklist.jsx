'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  ChartLineUpIcon,
  DiscordLogoIcon,
  XIcon,
} from '@phosphor-icons/react';
import { analytics } from '@/libs/analytics/posthogAnalytics';
import { getDiscordInviteUrl } from '@/libs/config/discord';
import TransitionLink from '@/components/navigation/TransitionLink';
import Button from '@/components/ui/Button';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';
import { useOnboarding } from '@/contexts/OnboardingProvider';
import { useSidebar } from '@/contexts/SidebarProvider';
import { useUser } from '@/contexts/UserProvider';

const DISCORD_DISMISSED_STORAGE_KEY = 'anm_onboarding_discord_dismissed';
const PANEL_CLASS = 'fixed bottom-24 z-[60] hidden w-[320px] border border-foreground/10 bg-background p-16 shadow-[0_8px_40px_rgba(0,0,0,0.45)] transition-[opacity,transform,left] duration-(--duration-snap) ease-(--ease-expo-out) md:block';
const PANEL_VISIBLE_CLASS = 'translate-y-0 opacity-100';
const PANEL_HIDDEN_CLASS = 'translate-y-8 opacity-0';
const DISMISS_BUTTON_CLASS = 'flex size-24 items-center justify-center text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground';
const STEP_BOX_CLASS = 'mt-1 flex size-18 shrink-0 items-center justify-center transition-colors duration-(--duration-quick)';
const STEP_BOX_DONE_CLASS = 'border border-brand text-brand';
const STEP_BOX_TODO_CLASS = 'border border-foreground/20 text-foreground-muted';
const STEP_LINK_CLASS = 'flex items-start gap-10 transition-opacity duration-(--duration-quick) hover:opacity-80';
const DISCORD_DISMISS_BUTTON_CLASS = 'flex size-20 shrink-0 items-center justify-center text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground';

function getSidebarOffset(isMobile, isCollapsed) {
  if (isMobile) return 0;
  if (isCollapsed) return 64;
  return 256;
}

function storeDiscordDismissed() {
  try {
    localStorage.setItem(DISCORD_DISMISSED_STORAGE_KEY, '1');
  } catch {}
}

function ChecklistHeader({ allDone, completedCount, onDismiss }) {
  return (
    <div className="mb-16 flex items-center justify-between">
      <p className="text-accent-xs flex items-center gap-8 text-foreground">
        <span className="size-8 shrink-0 bg-brand" />
        {allDone ? "You're all set" : 'Getting started'}
      </p>
      <div className="flex items-center gap-10">
        {!allDone && (
          <span className="text-accent-xs text-foreground-muted">{completedCount}/3</span>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={DISMISS_BUTTON_CLASS}
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  );
}

function ChecklistRowContent({ item, showArrow }) {
  const boxStateClass = item.done ? STEP_BOX_DONE_CLASS : STEP_BOX_TODO_CLASS;
  const labelStateClass = item.done ? 'text-foreground-muted line-through' : 'text-foreground';

  return (
    <>
      <span className={`${STEP_BOX_CLASS} ${boxStateClass}`}>
        {item.done ? <ChartLineUpIcon size={15} /> : null}
      </span>
      <span className={`text-body-sm ${labelStateClass}`}>{item.label}</span>
      {showArrow ? (
        <ArrowRightIcon size={13} className="ml-auto mt-1 shrink-0 text-foreground-muted" />
      ) : null}
    </>
  );
}

function ChecklistItem({ item, isNextLinkStep }) {
  const isLinkStep = isNextLinkStep && item.href;
  const rowContent = <ChecklistRowContent item={item} showArrow={isLinkStep} />;

  if (isLinkStep) {
    return (
      <li>
        <TransitionLink href={item.href} className={STEP_LINK_CLASS}>
          {rowContent}
        </TransitionLink>
      </li>
    );
  }

  return <li className="flex items-start gap-10">{rowContent}</li>;
}

function DiscordNudge({ profile, onDismiss, onJoin }) {
  return (
    <div className="mt-16 border-t border-foreground/10 pt-16">
      <div className="mb-8 flex items-start justify-between gap-10">
        <div className="flex items-center gap-8">
          <DiscordLogoIcon size={14} className="shrink-0 text-brand" />
          <p className="text-accent-xs text-foreground">Devs hang out here</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss Discord tip"
          className={DISCORD_DISMISS_BUTTON_CLASS}
        >
          <XIcon size={12} />
        </button>
      </div>
      <p className="text-body-sm mb-12 text-foreground-muted">
        Drop in. Share what you build, see what others ship, get help when something breaks.
      </p>
      <Button
        href={getDiscordInviteUrl(profile)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onJoin}
        theme="surface"
        size="xs"
        className="w-full"
      >
        Join the Discord
      </Button>
    </div>
  );
}

function ChecklistView({
  allDone,
  completedCount,
  checklistItems,
  nextStepKey,
  shouldShowDiscordNudge,
  profile,
  onDismiss,
  onDiscordDismiss,
  onDiscordJoin,
}) {
  return (
    <>
      <ChecklistHeader
        allDone={allDone}
        completedCount={completedCount}
        onDismiss={onDismiss}
      />

      <ul className="flex flex-col gap-10">
        {checklistItems.map((item) => (
          <ChecklistItem
            key={item.key}
            item={item}
            isNextLinkStep={item.key === nextStepKey}
          />
        ))}
      </ul>

      {shouldShowDiscordNudge ? (
        <DiscordNudge
          profile={profile}
          onDismiss={onDiscordDismiss}
          onJoin={onDiscordJoin}
        />
      ) : null}
    </>
  );
}

export function OnboardingChecklist() {
  const { active, steps, allDone, starterSlug, dismiss } = useOnboarding();
  const { profile } = useUser();
  const { isCollapsed, isMobile } = useSidebar();
  const hasTrackedDiscordNudgeRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showCompleteView, setShowCompleteView] = useState(false);
  const [discordDismissed, setDiscordDismissed] = useState(true);

  const shouldShowDiscordNudge =
    steps.copy && !discordDismissed && !allDone && !showCompleteView;

  function onDiscordDismiss() {
    storeDiscordDismissed();
    setDiscordDismissed(true);
    analytics.track('onboarding_discord_nudge_dismissed');
  }

  function onDiscordJoin() {
    storeDiscordDismissed();
    setDiscordDismissed(true);
    analytics.track('onboarding_discord_nudge_clicked');
  }

  useEffect(() => {
    try {
      setDiscordDismissed(localStorage.getItem(DISCORD_DISMISSED_STORAGE_KEY) === '1');
    } catch {}
  }, []);

  useEffect(() => {
    if (!shouldShowDiscordNudge || hasTrackedDiscordNudgeRef.current) return;

    hasTrackedDiscordNudgeRef.current = true;
    analytics.track('onboarding_discord_nudge_shown');
  }, [shouldShowDiscordNudge]);

  useEffect(() => {
    if (!active) {
      setIsVisible(false);
      return;
    }

    const rafId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  useEffect(() => {
    if (!allDone || showCompleteView) return;

    const timerId = setTimeout(() => setShowCompleteView(true), 850);
    return () => clearTimeout(timerId);
  }, [allDone, showCompleteView]);

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
  const nextStepKey = checklistItems.find((item) => !item.done && item.href)?.key;
  const visibilityClass = isVisible ? PANEL_VISIBLE_CLASS : PANEL_HIDDEN_CLASS;

  return (
    <div
      data-theme="dark"
      style={{ left: `${getSidebarOffset(isMobile, isCollapsed) + 24}px` }}
      className={`${PANEL_CLASS} ${visibilityClass}`}
    >
      {showCompleteView ? (
        <OnboardingComplete onClose={dismiss} />
      ) : (
        <ChecklistView
          allDone={allDone}
          completedCount={completedCount}
          checklistItems={checklistItems}
          nextStepKey={nextStepKey}
          shouldShowDiscordNudge={shouldShowDiscordNudge}
          profile={profile}
          onDismiss={dismiss}
          onDiscordDismiss={onDiscordDismiss}
          onDiscordJoin={onDiscordJoin}
        />
      )}
    </div>
  );
}