'use client';

// Variable Mapping: f -> useTransitionLinkClick, e -> href, o -> replace, a -> onClick, i -> router, t -> event

import { useContext } from 'react';
import TransitionRouterContext from '@/contexts/TransitionRouterProvider'; // NOTE: module id: 676040
import { setPendingRoute } from '@/libs/utils/pendingRoute'; // NOTE: module id: 842365

// NOTE: module id: 995289
export function useTransitionLinkClick(href, { replace = false, onClick } = {}) {
  const router = useContext(TransitionRouterContext);

  return (event) => {
    onClick?.(event);
    if (
      !event.defaultPrevented &&
      router &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button !== 1 &&
      typeof href === 'string' &&
      href.startsWith('/')
    ) {
      event.preventDefault();
      // Start login with a fresh document rather than retaining the marketing
      // page's animated DOM during a client-side transition.
      if (/^\/login\/?(?:[?#]|$)/.test(href)) {
        if (replace) {
          window.location.replace(href);
        } else {
          window.location.assign(href);
        }
        return;
      }
      setPendingRoute(href);
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    }
  };
}

