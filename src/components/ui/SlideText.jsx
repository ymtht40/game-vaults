// Variable Mapping: n -> slideClassName, f -> SlideText, e -> children, o -> className

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

const slideClassName = 'block transition-transform duration-(--duration-snap) ease-(--ease-expo-out) group-hover:-translate-y-full group-data-[active=true]:-translate-y-full';

// NOTE: module id: 991642
export function SlideText({ children, className }) {
  return (
    <span className={cn('relative block overflow-hidden', className)}>
      <span className={slideClassName}>{children}</span>
      <span
        aria-hidden="true"
        className={cn('absolute left-0 top-full w-full', slideClassName)}
      >
        {children}
      </span>
    </span>
  );
}

