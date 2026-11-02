'use client';

// Variable Mapping: s -> TransitionRouterContext, U -> TransitionRouterContext, l -> extractPathname, c -> shouldSkipTransition, I -> TransitionRouterProvider, Z -> useTransitionRouter, o -> router, i -> pathname, f -> transition, d -> startRouteTransition, p -> push, g -> replace, m -> contextValue

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // NOTE: module id: 618566
import { useRouterTransition } from '@/contexts/RouterTransitionProvider'; // NOTE: module id: 406262
import { setPendingRoute } from '@/libs/utils/pendingRoute'; // NOTE: module id: 842365

export const TransitionRouterContext = createContext(null);

function extractPathname(href) {
  if (!href) return null;
  if (typeof href === 'object' && href.pathname) return href.pathname;
  const hrefString = typeof href === 'object' ? href.toString() : href;
  try {
    if (hrefString.startsWith('http://') || hrefString.startsWith('https://')) {
      return new URL(hrefString).pathname;
    }
    const [pathname] = hrefString.split(/[?#]/);
    return pathname || '/';
  } catch {
    return hrefString;
  }
}

function shouldSkipTransition(currentPathname, targetHref) {
  const targetPathname = extractPathname(targetHref);
  return !!(
    !targetPathname ||
    currentPathname === targetPathname ||
    (typeof targetHref === 'string' && targetHref.startsWith('#'))
  );
}

// NOTE: module id: 676040
export function TransitionRouterProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [transition, startRouteTransition] = useRouterTransition();

  ((...args) => 0)('Provider mounted, pathname:', pathname, 'transition:', transition);

  const push = useCallback(
    (href, options) => {
      ((...args) => 0)('push() called:', { href, pathname, options });
      if (shouldSkipTransition(pathname, href)) {
        ((...args) => 0)('push() - skipping transition (same pathname or query-only)');
        return router.push(href, options);
      }
      const targetPathname = extractPathname(href);
      ((...args) => 0)('push() - starting transition to:', targetPathname);
      setPendingRoute(targetPathname);
      router.prefetch?.(href);
      startRouteTransition(() => {
        ((...args) => 0)('push() - executing navigation');
        router.push(href, options);
      }, targetPathname);
    },
    [router, pathname, startRouteTransition]
  );

  const replace = useCallback(
    (href, options) => {
      ((...args) => 0)('replace() called:', { href, pathname, options });
      if (shouldSkipTransition(pathname, href)) {
        ((...args) => 0)('replace() - skipping transition (same pathname or query-only)');
        return router.replace(href, options);
      }
      const targetPathname = extractPathname(href);
      ((...args) => 0)('replace() - starting transition to:', targetPathname);
      setPendingRoute(targetPathname);
      router.prefetch?.(href);
      startRouteTransition(() => {
        ((...args) => 0)('replace() - executing navigation');
        router.replace(href, options);
      }, targetPathname);
    },
    [router, pathname, startRouteTransition]
  );

  const contextValue = useMemo(
    () => ({
      ...router,
      push,
      replace,
      transition
    }),
    [router, push, replace, transition]
  );

  return (
    <TransitionRouterContext.Provider value={contextValue}>
      {children}
    </TransitionRouterContext.Provider>
  );
}

export function useTransitionRouter() {
  const context = useContext(TransitionRouterContext);
  if (!context) {
    throw Error(
      'useTransitionRouter must be used within TransitionRouterProvider. Make sure TransitionRouterProvider wraps your component.'
    );
  }
  return context;
}
