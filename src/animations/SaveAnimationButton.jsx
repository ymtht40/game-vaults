'use client';

// Variable Mapping: h -> BookmarkIcon, x -> VARIANT_STYLES, p -> SaveAnimationButton, f -> SaveAnimationButton, e -> animation, a -> initialIsSaved, n -> variant, i -> isAuthenticated, s -> fadeOnHover, o -> unauthHint, c -> className, d -> variantStyles, u -> isSaved, m -> isLoading, g -> toggleSave

import { ArrowUpRight } from '@phosphor-icons/react'; // NOTE: module id: 683845
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { useSaveAnimation } from '@/hooks/useSaveAnimation'; // NOTE: module id: 488843

function BookmarkIcon({ filled = false, className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="miter"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 2 H13 V14 L8 10 L3 14 Z" />
    </svg>
  );
}

const VARIANT_STYLES = {
  overlay: {
    bg: 'bg-background/85 backdrop-blur-md hover:bg-background',
    transition:
      'transition-[opacity,translate,background-color] duration-(--duration-quick) ease-(--ease-back-out)'
  },
  inline: {
    bg: 'bg-foreground/[0.06] hover:bg-foreground/10',
    transition:
      'transition-colors duration-(--duration-quick) ease-(--ease-back-out)'
  }
};

// NOTE: module id: 878512
export function SaveAnimationButton({
  animation,
  initialIsSaved = false,
  variant = 'inline',
  isAuthenticated = true,
  fadeOnHover = false,
  unauthHint = 'none',
  className = ''
}) {
  const variantStyles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.inline;
  const { isSaved, isLoading, toggleSave } = useSaveAnimation(
    isAuthenticated ? animation?.id : null,
    initialIsSaved,
    isAuthenticated ? animation : null
  );

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleSave?.(event);
        }}
        disabled={isLoading}
        aria-label={isSaved ? 'Remove from saved' : 'Save animation'}
        aria-pressed={isSaved}
        className={cn(
          'flex size-32 items-center justify-center',
          variantStyles.bg,
          variantStyles.transition,
          fadeOnHover &&
            (isSaved
              ? 'translate-y-0 opacity-100'
              : 'translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100'),
          className
        )}
      >
        <BookmarkIcon
          filled={isSaved}
          className={cn('size-16', isSaved ? 'text-brand' : 'text-foreground')}
        />
      </button>
    );
  }

  if (unauthHint !== 'arrow') return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-32 items-center justify-center',
        variantStyles.bg,
        variantStyles.transition,
        fadeOnHover &&
          'translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
        className
      )}
    >
      <ArrowUpRight className="size-16 text-foreground" />
    </span>
  );
}

