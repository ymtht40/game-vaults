'use client';

// Variable Mapping: l -> AnimationContext, c -> defaultAnimationContext, f -> useAnimation, o -> pathname, a -> latestPathnameRef, i -> revealedPathRef, d -> subscribersRef, p -> readyGatesRef, g -> gatesClearCallbackRef, m -> pendingTriggerRef, h -> revealPage, y -> whenRevealed, v -> addReadyGate, b -> onGatesClear, _ -> triggerPageEnter, x -> getHasTriggered

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import { perfLog, perfMeasure } from '@/libs/utils/perf'; // NOTE: module id: 991763

const AnimationContext = createContext(null);

const defaultAnimationContext = {
  revealed: false,
  revealPage: () => {},
  whenRevealed: () => {},
  addReadyGate: () => () => {},
  onGatesClear: () => () => {},
  triggerPageEnter: () => {},
  getHasTriggered: () => false
};

// NOTE: module id: 488463
export function useAnimation() {
  const context = useContext(AnimationContext);
  return context || defaultAnimationContext;
}

export function AnimationProvider({ children }) {
  const pathname = usePathname();
  const latestPathnameRef = useRef(pathname);
  latestPathnameRef.current = pathname;

  const revealedPathRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const subscribersRef = useRef(new Set());
  const readyGatesRef = useRef(new Set());
  const gatesClearCallbackRef = useRef(null);
  const pendingTriggerRef = useRef(false);

  const revealPage = useCallback(() => {
    if (revealedPathRef.current === latestPathnameRef.current) {
      ((...args) => 0)('revealPage skipped - already revealed:', latestPathnameRef.current);
    } else {
      revealedPathRef.current = latestPathnameRef.current;
      setRevealed(true);
      ((...args) => 0)(
        `revealPage (${latestPathnameRef.current}), subscribers: ${subscribersRef.current.size}`
      );
      perfLog('revealPage() fired', {
        path: latestPathnameRef.current,
        subscribers: subscribersRef.current.size
      });
      if (typeof document !== 'undefined') {
        document
          .querySelectorAll('[data-page-enter-animation]')
          .forEach((el) => el.setAttribute('data-animation-started', 'true'));
      }
      perfMeasure('reveal wave (all whenRevealed callbacks)', () => {
        Array.from(subscribersRef.current).forEach((callback) => {
          try {
            callback();
          } catch (error) {
            console.error('Error in whenRevealed callback:', error);
          }
        });
      });
    }
  }, []);

  const whenRevealed = useCallback((callback) => {
    if (revealedPathRef.current === latestPathnameRef.current) {
      try {
        callback();
      } catch (error) {
        console.error('Error in whenRevealed callback:', error);
      }
      return () => {};
    }
    subscribersRef.current.add(callback);
    return () => subscribersRef.current.delete(callback);
  }, []);

  useEffect(() => {
    if (revealedPathRef.current !== pathname) {
      setRevealed(false);
    }
  }, [pathname]);

  const addReadyGate = useCallback(
    (gateName) => {
      readyGatesRef.current.add(gateName);
      ((...args) => 0)(`addReadyGate: ${gateName}, open: ${[...readyGatesRef.current].join(', ')}`);
      let isReleased = false;
      return () => {
        if (!isReleased) {
          isReleased = true;
          readyGatesRef.current.delete(gateName);
          ((...args) => 0)(
            `gate released: ${gateName}, remaining: ${[...readyGatesRef.current].join(', ') || '(none)'}`
          );
          if (readyGatesRef.current.size === 0) {
            gatesClearCallbackRef.current?.();
            if (pendingTriggerRef.current) {
              pendingTriggerRef.current = false;
              revealPage();
            }
          }
        }
      };
    },
    []
  );

  const onGatesClear = useCallback((callback) => {
    gatesClearCallbackRef.current = callback;
    if (readyGatesRef.current.size === 0) {
      callback();
    }
    return () => {
      if (gatesClearCallbackRef.current === callback) {
        gatesClearCallbackRef.current = null;
      }
    };
  }, []);

  const triggerPageEnter = useCallback(() => {
    if (readyGatesRef.current.size > 0) {
      pendingTriggerRef.current = true;
      return;
    }
    revealPage();
  }, [revealPage]);

  const getHasTriggered = useCallback(
    () => revealedPathRef.current === latestPathnameRef.current,
    []
  );

  return (
    <AnimationContext.Provider
      value={{
        revealed,
        revealPage,
        whenRevealed,
        addReadyGate,
        onGatesClear,
        triggerPageEnter,
        getHasTriggered
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function usePageEnterAnimation(callback, deps = [], label = '', enabled = true) {
  const { whenRevealed } = useAnimation();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (enabled) {
      return whenRevealed(() => callbackRef.current());
    }
  }, [whenRevealed, enabled, ...deps]);
}

