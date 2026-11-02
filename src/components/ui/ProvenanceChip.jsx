// Variable Mapping: l -> CHIP_SIZES, e -> animation, n -> size, r -> className, i -> label, o -> sizeStyles, c -> resolvedLabel

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { getProvenanceLabel } from '@/libs/utils/provenance'; // NOTE: module id: 809630

const CHIP_SIZES = {
  sm: {
    dot: 'size-6',
    text: 'text-accent-2xs',
    gap: 'gap-6'
  },
  default: {
    dot: 'size-8',
    text: 'text-accent-xs',
    gap: 'gap-8'
  },
  lg: {
    dot: 'size-12',
    text: 'text-mono-sm',
    gap: 'gap-12'
  }
};

// NOTE: module id: 909247
export function ProvenanceChip({
  animation,
  size = 'default',
  className = '',
  label
}) {
  const sizeStyles = CHIP_SIZES[size] ?? CHIP_SIZES.default;
  const resolvedLabel = label ?? getProvenanceLabel(animation);

  return (
    <span
      className={cn(
        'inline-flex items-center text-foreground',
        sizeStyles.text,
        sizeStyles.gap,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn('block shrink-0 bg-brand', sizeStyles.dot)}
      />
      <span>{resolvedLabel}</span>
    </span>
  );
}

