'use client';

/* Variable Mapping:
   e -> seats
   l -> onChange
   n -> min
   i -> max
   s -> tone
   o -> className
   c -> buttonClassName
*/

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { MinusIcon, PlusIcon } from '@/assets/icons/BoldIcons'; // NOTE: module id: 499839 // UNRESOLVED: name guessed from usage

// NOTE: module id: 69291
// UNRESOLVED: name guessed from usage (exported as "f")
export function SeatStepper({
  seats,
  onChange,
  min = 2,
  max = 20,
  tone = 'dark',
  className = '',
}) {
  const buttonClassName = cn(
    "relative inline-flex size-32 cursor-pointer items-center justify-center after:absolute after:-inset-6 after:content-[''] transition-[background-color,scale] duration-200 ease-(--ease-expo-out) active:scale-90 disabled:cursor-not-allowed disabled:opacity-40",
    tone === 'light'
      ? 'bg-background/10 text-background hover:bg-background/20'
      : 'bg-foreground/5 text-foreground hover:bg-foreground/10'
  );

  return (
    <div className={cn('flex items-center gap-8', className)} role="group" aria-label="Seats">
      <button
        type="button"
        className={buttonClassName}
        aria-label="Remove a seat"
        disabled={seats <= min}
        onClick={() => onChange(Math.max(min, seats - 1))}
      >
        <MinusIcon className="size-14" />
      </button>
      <span className="text-body min-w-[5.5ch] text-center tabular-nums" aria-live="polite">
        {seats} seats
      </span>
      <button
        type="button"
        className={buttonClassName}
        aria-label="Add a seat"
        disabled={seats >= max}
        onClick={() => onChange(Math.min(max, seats + 1))}
      >
        <PlusIcon className="size-14" />
      </button>
    </div>
  );
}
