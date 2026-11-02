'use client';

// Variable Mapping: r -> BREAKPOINTS, f -> useBreakpoint, e -> breakpoint, n -> mediaQueryString, i -> minWidthPx

import { useSyncExternalStore } from 'react';

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// NOTE: module id: 400701
export function useBreakpoint(breakpoint) {
  const minWidthPx =
    typeof breakpoint === 'number' ? breakpoint : BREAKPOINTS[breakpoint];

  if (minWidthPx == null) {
    throw Error(
      `useBreakpoint: unknown breakpoint "${breakpoint}". Use one of: ${Object.keys(
        BREAKPOINTS
      ).join(', ')} or a raw px number.`
    );
  }

  const mediaQueryString = `(min-width: ${minWidthPx}px)`;

  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(mediaQueryString);
      mediaQueryList.addEventListener('change', onStoreChange);
      return () => mediaQueryList.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(mediaQueryString).matches,
    () => false
  );
}

