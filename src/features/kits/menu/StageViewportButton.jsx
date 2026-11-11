'use client';

// Variable Mapping: C -> StageViewportButton?, e -> active, a -> onClick, r -> label, n -> icon

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

// NOTE: module id: 37418
export function StageViewportButton({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-6 px-10 py-6 text-accent-xs transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
        active
          ? 'bg-foreground text-background'
          : 'text-foreground-muted hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
