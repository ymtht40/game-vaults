'use client';

// Variable Mapping: a -> className, n -> containerRef

import { useRef } from 'react'; // NOTE: module id: 271645
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { usePauseOffscreenAnimations } from '@/hooks/usePauseOffscreenAnimations'; // NOTE: module id: 771267

// NOTE: module id: 400545
export function PingIndicator({ className = 'size-8' }) {
  const containerRef = useRef(null);

  usePauseOffscreenAnimations(containerRef);

  return (
    <span
      ref={containerRef}
      aria-hidden="true"
      className={cn('relative inline-flex', className)}
    >
      <span className="absolute inset-0 animate-ping bg-brand opacity-60" />
      <span className="relative block size-full bg-brand" />
    </span>
  );
}

export { PingIndicator as f };

