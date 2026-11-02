'use client';

// Variable Mapping: o -> RouterTransitionContext, a -> useRouterTransition, _ -> useRouterTransition, j -> RouterTransitionProvider, u -> pathname, s -> isLeavingComplete, l -> setIsLeavingComplete, c -> stage, f -> setStage, d -> pendingPath, p -> setPendingPath, g -> startTransition, m -> hasEnteredRef, h -> contextValue

import { createContext, useContext, useState, useTransition, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566

const RouterTransitionContext = createContext(null);

// NOTE: module id: 406262
export function useRouterTransition() {
  const context = useContext(RouterTransitionContext);
  if (!context) {
    throw Error('useRouterTransition must be used within TransitionProvider');
  }
  return context;
}

export function RouterTransitionProvider({ children, leave, enter }) {
  const pathname = usePathname();
  const [isLeavingComplete, setIsLeavingComplete] = useState(false);
  const [stage, setStage] = useState(undefined);
  const [pendingPath, setPendingPath] = useState(null);
  const [, startTransition] = useTransition();
  const hasEnteredRef = useRef(false);

  ((...args) => 0)('RouterTransition mounted');

  useEffect(() => {
    if (!isLeavingComplete || hasEnteredRef.current) return;

    const runEnter = () => {
      if (!hasEnteredRef.current) {
        hasEnteredRef.current = true;
        ((...args) => 0)('Running enter animation');
        setStage('entering');
        startTransition(async () => {
          await enter().then((cleanup) => cleanup?.());
          setStage(undefined);
          setIsLeavingComplete(false);
          setPendingPath(null);
        });
      }
    };

    if (!pendingPath || pathname === pendingPath) {
      runEnter();
      return;
    }

    const timerId = setTimeout(runEnter, 2000);
    return () => clearTimeout(timerId);
  }, [enter, isLeavingComplete, pathname, pendingPath]);

  const contextValue = [
    {
      isPending: !!stage,
      stage,
      pendingPath
    },
    (navigateCallback, targetPath) => {
      ((...args) => 0)('startRouteTransition called:', {
        targetPath,
        currentStage: stage
      });
      if (stage) {
        ((...args) => 0)('Transition blocked - already in progress:', stage);
      } else {
        ((...args) => 0)('Starting leave animation...');
        hasEnteredRef.current = false;
        setStage('leaving');
        setPendingPath(targetPath);
        startTransition(async () => {
          setIsLeavingComplete(true);
          ((...args) => 0)('Leave animation starting...');
          await leave().then((cleanup) => cleanup?.());
          ((...args) => 0)('Leave animation complete, executing callback...');
          await navigateCallback();
          ((...args) => 0)('Navigation callback executed');
        });
      }
    }
  ];

  return (
    <RouterTransitionContext.Provider value={contextValue}>
      {children}
    </RouterTransitionContext.Provider>
  );
}
