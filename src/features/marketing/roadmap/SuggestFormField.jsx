'use client';

// Variable Mapping: F -> SuggestFormField, e -> id, r -> label, a -> error, n -> required, s -> counter, i -> counterWarn, l -> children

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

// NOTE: module id: 626171
export function SuggestFormField({
  id,
  label,
  error,
  required,
  counter,
  counterWarn,
  children,
}) {
  return (
    <div className="relative">
      <div className="flex items-baseline justify-between gap-12">
        <label htmlFor={id} className="text-accent-xs text-foreground/55">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {counter && (
          <span
            className={cn(
              'text-accent-xs tabular-nums',
              counterWarn ? 'text-brand' : 'text-foreground/45'
            )}
            aria-hidden="true"
          >
            {counter}
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="absolute top-full mt-6 text-accent-xs text-brand"
        >
          {error}
        </p>
      )}
    </div>
  );
}
