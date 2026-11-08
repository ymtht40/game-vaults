'use client';

// Variable Mapping: S -> RoadmapCard, A -> CardExpandIcon, k -> BuildingNowBadge, H -> CardCategoryLabel, T -> CardTargetWindow, e -> item, a -> variant, n -> isAuthenticated, s -> onVoteChange, i -> onOpenSuggest, l -> suggestOpen, o -> expanded, d -> setExpanded, r -> daysElapsed

import { useState } from 'react';
import { CalendarDotIcon } from '@phosphor-icons/react';
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { SuggestTile } from '@/features/roadmap/SuggestTile'; // NOTE: module id: 626171
import { VoteButton } from '@/features/roadmap/VoteButton'; // NOTE: module id: 626171
import { CARD_VARIANT_CLASSES } from '@/features/roadmap/roadmap.config'; // NOTE: module id: 626171

// NOTE: module id: 626171
export function RoadmapCard({
  item,
  variant,
  isAuthenticated,
  onVoteChange,
  onOpenSuggest,
  suggestOpen = false,
}) {
  const [expanded, setExpanded] = useState(false);

  if (variant === 'suggest') {
    return (
      <SuggestTile
        label="Suggest a component"
        onClick={onOpenSuggest}
        active={suggestOpen}
      />
    );
  }

  return (
    <article
      data-theme={variant === 'in-progress' ? (isAuthenticated ? 'light' : 'dark') : undefined}
      className={cn('flex min-h-[160px] flex-col border', CARD_VARIANT_CLASSES[variant])}
    >
      <button
        type="button"
        data-state={expanded ? 'open' : 'closed'}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="group/trigger flex flex-1 flex-col gap-12 p-20 text-left"
      >
        <div className="flex items-center justify-between gap-12">
          {variant === 'in-progress' ? (
            <BuildingNowBadge item={item} />
          ) : (
            <CardCategoryLabel item={item} />
          )}
          <CardExpandIcon expanded={expanded} />
        </div>
        <h3 className="text-h5 font-medium leading-tight text-foreground">{item.title}</h3>
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-(--duration-base) ease-(--ease-expo-in-out)',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden">
            <p className="pt-4 text-body-sm text-foreground-muted">{item.description}</p>
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between gap-12 px-20 pb-16 pt-4">
        {variant === 'in-progress' ? (
          <CardTargetWindow item={item} />
        ) : (
          <span className="text-accent-xs text-foreground/45">
            {item.category} · {item.priority}
          </span>
        )}
        {variant !== 'in-progress' && (
          <VoteButton
            itemId={item.id}
            itemTitle={item.title}
            itemCategory={item.category}
            initialCount={item.vote_count}
            initialVoted={item.user_has_voted}
            onChange={onVoteChange}
          />
        )}
      </div>
    </article>
  );
}

function CardExpandIcon({ expanded }) {
  return (
    <svg
      className="h-14 w-14 shrink-0 text-foreground/45"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        transformOrigin: 'center',
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transitionProperty: 'transform',
        transitionDuration: 'var(--duration-base)',
        transitionTimingFunction: 'var(--ease-expo-in-out)',
      }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 12h14" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 5v14"
        style={{
          transformOrigin: 'center',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transitionProperty: 'transform',
          transitionDuration: 'var(--duration-base)',
          transitionTimingFunction: 'var(--ease-expo-in-out)',
        }}
      />
    </svg>
  );
}

function BuildingNowBadge({ item }) {
  const daysElapsed = (function (startedAt) {
    if (!startedAt) return null;
    const timestamp = new Date(startedAt).getTime();
    return Number.isNaN(timestamp)
      ? null
      : Math.max(0, Math.round((Date.now() - timestamp) / 86400000));
  })(item.started_at);

  return (
    <span className="inline-flex items-center gap-8 text-accent-xs text-brand">
      <span className="relative inline-flex">
        <span
          className="absolute inset-0 inline-block size-8 animate-ping bg-brand opacity-60"
          aria-hidden="true"
        />
        <span className="relative block size-8 bg-brand" aria-hidden="true" />
      </span>
      <span>Building now</span>
      {daysElapsed !== null && (
        <span className="text-foreground/45">
          · Day {daysElapsed.toString().padStart(2, '0')}
        </span>
      )}
    </span>
  );
}

function CardCategoryLabel({ item }) {
  return <span className="text-accent-xs text-foreground/45">{item.category}</span>;
}

function CardTargetWindow({ item }) {
  return item.target_window ? (
    <span className="inline-flex items-center gap-8 text-accent-xs text-foreground/70">
      <CalendarDotIcon className="size-12 text-foreground/55" aria-hidden="true" />
      <span>{item.target_window}</span>
    </span>
  ) : (
    <span className="text-accent-xs text-foreground/45">{item.category}</span>
  );
}
