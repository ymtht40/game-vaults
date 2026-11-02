'use client';

// Variable Mapping: X -> BATCH_SIZE, t -> useInfiniteScroll, e -> totalCount, n -> displayedCount, s -> setDisplayedCount, r -> sentinelRef, l -> lastLoadTimeRef, o -> displayedCountRef, i -> checkAndLoadMore

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'; // NOTE: module id: 271645

function getScrollParent(element) {
  if (!element) return null;

  let parent = element.parentElement;
  while (
    parent &&
    parent !== document.body &&
    parent !== document.documentElement
  ) {
    const computedStyle = window.getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(computedStyle.overflowY)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return window;
}

// NOTE: module id: 451945
export const BATCH_SIZE = 12;

export function useInfiniteScroll(totalCount, resetDeps = []) {
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef(null);
  const lastLoadTimeRef = useRef(0);
  const displayedCountRef = useRef(displayedCount);

  useEffect(() => {
    displayedCountRef.current = displayedCount;
  }, [displayedCount]);

  useEffect(() => {
    setDisplayedCount(BATCH_SIZE);
    displayedCountRef.current = BATCH_SIZE;
    lastLoadTimeRef.current = 0;
  }, resetDeps);

  const checkAndLoadMore = useCallback(() => {
    if (displayedCountRef.current >= totalCount) return;

    const sentinelEl = sentinelRef.current;
    if (!sentinelEl) return;

    const now = performance.now();
    if (
      now - lastLoadTimeRef.current < 150 ||
      sentinelEl.getBoundingClientRect().top - window.innerHeight >= 1500
    ) {
      return;
    }

    lastLoadTimeRef.current = now;
    const nextCount = Math.min(
      displayedCountRef.current + BATCH_SIZE,
      totalCount
    );
    displayedCountRef.current = nextCount;

    startTransition(() => {
      setDisplayedCount(nextCount);
    });
  }, [totalCount]);

  useEffect(() => {
    let scrollTarget = null;
    let isDisposed = false;
    const handleScroll = () => checkAndLoadMore();

    const rafId = requestAnimationFrame(() => {
      if (
        !isDisposed &&
        (scrollTarget = getScrollParent(sentinelRef.current))
      ) {
        (scrollTarget === window ? window : scrollTarget).addEventListener(
          'scroll',
          handleScroll,
          { passive: true }
        );
        isDisposed = true;
        checkAndLoadMore();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (isDisposed && scrollTarget) {
        (scrollTarget === window ? window : scrollTarget).removeEventListener(
          'scroll',
          handleScroll
        );
      }
    };
  }, [checkAndLoadMore]);

  return {
    displayedCount,
    sentinelRef,
    hasMore: displayedCount < totalCount,
  };
}

