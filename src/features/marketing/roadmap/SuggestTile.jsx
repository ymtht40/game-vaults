'use client';

// Variable Mapping: j -> SuggestTile, e -> label, r -> onClick, a -> active, n -> className, s -> restProps

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

// NOTE: module id: 626171
export function SuggestTile({ label, onClick, active = false, className, ...restProps }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active ? 'true' : undefined}
      className={cn(
        'group/add relative flex w-full items-center justify-center border border-dashed border-foreground/15 p-20 text-center',
        'transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
        'hover:border-brand data-[active=true]:border-brand',
        className
      )}
      {...restProps}
    >
      <span
        className={cn(
          'pointer-events-none text-accent-xs text-foreground/70',
          'transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
          'group-hover/add:text-foreground group-data-[active=true]/add:text-foreground'
        )}
      >
        {label}
      </span>
    </button>
  );
}
