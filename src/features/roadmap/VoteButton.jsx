'use client';

// Variable Mapping: E -> VoteButton, e -> itemId, a -> itemTitle, n -> itemCategory, s -> initialCount, i -> initialVoted, l -> onChange, o -> className, c -> voted, h -> setVoted, g -> count, m -> setCount, f -> isSubmitting, p -> setIsSubmitting, x -> showYouBadge, b -> setShowYouBadge, v -> handleToggleVote

import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@phosphor-icons/react';
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import AnimatedNumber from '@/animations/AnimatedNumber'; // NOTE: module id: 162387
import { toast } from 'sonner'; // NOTE: module id: 846696

// NOTE: module id: 626171
export function VoteButton({
  itemId,
  itemTitle = '',
  itemCategory = '',
  initialCount = 0,
  initialVoted = false,
  onChange,
  className = '',
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showYouBadge, setShowYouBadge] = useState(false);

  async function handleToggleVote(event) {
    event?.stopPropagation();
    if (isSubmitting) return;

    const nextVoted = !voted;
    const nextCount = nextVoted ? count + 1 : Math.max(0, count - 1);

    setVoted(nextVoted);
    setCount(nextCount);
    setIsSubmitting(true);

    if (nextVoted) {
      setShowYouBadge(true);
      setTimeout(() => setShowYouBadge(false), 1100);
    }

    try {
      const response = await fetch('/api/roadmap/vote', {
        method: nextVoted ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        throw Error(`HTTP ${response.status}`);
      }

      analytics.features.voted(
        itemId,
        itemTitle,
        nextVoted ? 'upvote' : 'remove_vote',
        itemCategory
      );
      onChange?.({ itemId, voted: nextVoted, count: nextCount });
    } catch (error) {
      console.error('[VoteButton] toggle failed:', error);
      setVoted(voted);
      setCount(count);
      toast('Could not record vote. Try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    setVoted(initialVoted);
    setCount(initialCount);
  }, [initialVoted, initialCount]);

  return (
    <button
      type="button"
      onClick={handleToggleVote}
      aria-pressed={voted}
      aria-label={voted ? `Unvote (${count} votes)` : `Vote (${count} votes)`}
      className={cn(
        'group/vote relative inline-flex items-center gap-8 border px-10 py-6 text-accent-xs transition-colors duration-(--duration-instant) ease-(--ease-expo-out)',
        voted
          ? 'border-brand bg-brand text-background'
          : 'border-foreground/15 bg-transparent text-foreground/70 hover:border-foreground/40 hover:text-foreground',
        className
      )}
    >
      <AnimatedNumber
        value={count}
        duration={0.3}
        ease="expo.out"
        triggerMode="immediate"
        minDigits={2}
        className="tabular-nums text-mono-sm leading-none"
      />
      <span className="block w-px -my-6 self-stretch bg-current opacity-30" aria-hidden="true" />
      <span className="inline-flex items-center gap-4">
        <ArrowUpIcon
          className="size-12"
          style={{
            transform: voted ? 'translateY(-1px)' : 'none',
            transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          aria-hidden="true"
        />
        <span>{voted ? 'Voted' : 'Vote'}</span>
      </span>
      {showYouBadge && (
        <span
          className="pointer-events-none absolute -top-12 right-0 inline-flex items-center gap-4 bg-brand px-6 py-2 text-accent-2xs text-background"
          aria-hidden="true"
        >
          <ArrowUpIcon className="size-8" />
          You
        </span>
      )}
    </button>
  );
}
