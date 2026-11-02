'use client';

// Variable Mapping: a -> lockCount, o -> isLocked, l -> setIsLocked, u -> lockScroll, i -> unlockScroll
// NOTE: module id: 441409

import { createContext, useState, useRef, useCallback, useContext } from 'react';

const ScrollLockContext = createContext({
  lockScroll: () => {},
  unlockScroll: () => {},
  isLocked: false
});

export function ScrollLockProvider({ children }) {
  const lockCount = useRef(0);
  const [isLocked, setIsLocked] = useState(false);

  const lockScroll = useCallback(() => {
    lockCount.current++;
    if (lockCount.current === 1) {
      window.lenis?.stop();
      window.lenisApp?.stop();
      setIsLocked(true);
    }
  }, []);

  const unlockScroll = useCallback(() => {
    lockCount.current = Math.max(0, lockCount.current - 1);
    if (lockCount.current === 0) {
      window.lenis?.start();
      window.lenisApp?.start();
      setIsLocked(false);
    }
  }, []);

  return (
    <ScrollLockContext.Provider value={{ lockScroll, unlockScroll, isLocked }}>
      {children}
    </ScrollLockContext.Provider>
  );
}

export function useScrollLockContext() {
  return useContext(ScrollLockContext);
}

