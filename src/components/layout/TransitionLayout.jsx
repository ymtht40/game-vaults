'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import gsap from 'gsap'; // NOTE: module id: 989970
import { useRouterTransition } from '@/contexts/RouterTransitionProvider'; // NOTE: module id: 406262
import { TransitionRouterProvider } from '@/contexts/TransitionRouterProvider'; // NOTE: module id: 676040
import { useAnimation } from '@/contexts/AnimationProvider'; // NOTE: module id: 488463
import { getRouteGroup } from '@/libs/config/routeConfig'; // NOTE: module id: 107255
import { setPendingRoute, getPendingRoute } from '@/libs/utils/pendingRoute'; // NOTE: module id: 842365
import { RouterTransitionProvider } from '@/contexts/RouterTransitionProvider';

const TRANSITION_CONFIGS = {
  app: {
    mechanism: 'fade',
    leave: { duration: 0.3, ease: 'power4.out' },
    enter: { duration: 0.4, ease: 'power4.out' },
  },
  sectionFade: {
    mechanism: 'fade',
    leave: { duration: 0.35, ease: 'power2.out' },
    enter: { duration: 0.5, ease: 'power2.out' },
  },
  marketing: {
    mechanism: 'ground',
    in: { duration: 0.3, ease: 'expo.out' },
    out: { duration: 0.4, ease: 'expo.out' },
  },
  auth: null,
  admin: {
    mechanism: 'fade',
    leave: { duration: 0.3, ease: 'power4.out' },
    enter: { duration: 0.5, ease: 'power4.out' },
  },
  standalone: {
    mechanism: 'ground',
    in: { duration: 0.3, ease: 'expo.out' },
    out: { duration: 0.4, ease: 'expo.out' },
  },
};

const DEFAULT_CONFIG = TRANSITION_CONFIGS.marketing;
const LIGHT_PAGES = ['/pricing', '/kits', '/roadmap'];

function getPageTheme(url) {
  const cleanPath = (url || '').split(/[?#]/)[0].replace(/(.)\/$/, '$1');
  return LIGHT_PAGES.includes(cleanPath) ? 'light' : 'dark';
}

function resolveTransition(layoutType) {
  return layoutType in TRANSITION_CONFIGS ? TRANSITION_CONFIGS[layoutType] : DEFAULT_CONFIG;
}

const scrollReset = () => {
  if (window.lenis) {
    window.lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
};

const getEffectiveLayoutType = (pathname) => {
  const layout = getRouteGroup(pathname); // NOTE: module id: 107255
  if (layout !== 'app') return layout;
  if (typeof document !== 'undefined' && document.querySelector('[data-anon-app-shell]')) {
    return 'marketing';
  }
  return layout;
};

const getFirstSegment = (path) =>
  (path && typeof path === 'string' && path.split('?')[0].split('#')[0].split('/').filter(Boolean)[0]) || '';

const isSameSection = (pathA, pathB) => {
  const segA = getFirstSegment(pathA);
  const segB = getFirstSegment(pathB);
  return segA !== '' && segA === segB;
};

// NOTE: module id: 791141
export default function TransitionLayout({ children }) {
  const pathname = usePathname(); // NOTE: module id: 618566
  const { triggerPageEnter, revealPage, onGatesClear } = useAnimation(); // NOTE: module id: 488463

  const overlayRef = useRef(null);
  const isBackForwardNav = useRef(false);
  const currentLayoutType = useRef(null);
  const previousPathname = useRef(pathname);
  const isIntercepted = useRef(false);
  const activeConfig = useRef(null);
  const animatingElements = useRef([]);
  const pathRef = useRef(pathname);

  pathRef.current = pathname;

  useEffect(() => {
    currentLayoutType.current = getEffectiveLayoutType(pathname);
  }, [pathname]);

  const leaveCallbackRef = useRef(null);
  const enterCallbackRef = useRef(null);

  useEffect(() => {
    if (!('navigation' in window)) {
      const handlePopState = () => {
        const nextPath = window.location.pathname;
        if (nextPath !== previousPathname.current) {
          previousPathname.current = nextPath;
          if (enterCallbackRef.current) enterCallbackRef.current();
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }

    const handleNavigate = (event) => {
      if (event.navigationType !== 'traverse') return;
      if (event.hashChange) return;

      const dest = new URL(event.destination.url);
      if (dest.pathname === window.location.pathname) return;

      if (event.canIntercept && leaveCallbackRef.current) {
        isIntercepted.current = true;
        isBackForwardNav.current = true;
        setPendingRoute(dest.pathname); // NOTE: module id: 842365

        event.intercept({
          handler: async () => {
            await leaveCallbackRef.current();
          },
        });
      }
    };

    const handleNavigateSuccess = () => {
      if (isIntercepted.current && enterCallbackRef.current) {
        isIntercepted.current = false;
        enterCallbackRef.current();
      }
    };

    window.navigation.addEventListener('navigate', handleNavigate);
    window.navigation.addEventListener('navigatesuccess', handleNavigateSuccess);

    return () => {
      window.navigation.removeEventListener('navigate', handleNavigate);
      window.navigation.removeEventListener('navigatesuccess', handleNavigateSuccess);
    };
  }, []);

  const leave = useCallback(async () => {
    const fromLayout = currentLayoutType.current;
    const targetPath = getPendingRoute(); // NOTE: module id: 842365
    const toLayout = targetPath ? getEffectiveLayoutType(targetPath) : fromLayout;
    const currentPath = window.location.pathname;

    let config =
      fromLayout === toLayout
        ? resolveTransition(fromLayout)
        : fromLayout === 'marketing' || toLayout === 'marketing'
        ? resolveTransition('marketing')
        : resolveTransition(fromLayout);

    if (
      config &&
      document.querySelector('[data-anon-sidebar-chrome]') &&
      isSameSection(currentPath, targetPath)
    ) {
      config = resolveTransition('sectionFade');
    }

    activeConfig.current = config;
    if (!config) return Promise.resolve();

    const transitionTheme = config.mechanism === 'ground' ? getPageTheme(targetPath) : null;
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent('anm:transition', { detail: { theme: transitionTheme } }));
    });

    if (config.mechanism === 'ground') {
      const overlay = overlayRef.current;
      const skipAnimation = isBackForwardNav.current;
      isBackForwardNav.current = false;

      if (!overlay || skipAnimation || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return Promise.resolve();
      }

      gsap.set(overlay, {
        backgroundColor: getPageTheme(targetPath) === 'light' ? '#eeeeee' : '#141314',
        pointerEvents: 'auto',
      });

      return new Promise((resolve) => {
        gsap.to(overlay, {
          autoAlpha: 1,
          ...config.in,
          overwrite: true,
          onComplete: () => {
            scrollReset();
            resolve();
          },
        });
      });
    }

    const contentElements = document.querySelectorAll('[data-transition-content]');
    const footerElement = document.querySelector('footer');

    if (contentElements.length === 0) {
      scrollReset();
      return;
    }

    const { duration, ease } = config.leave;
    const elementsToAnimate = Array.from(contentElements);
    if (footerElement) elementsToAnimate.push(footerElement);
    animatingElements.current = elementsToAnimate;

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          scrollReset();
          resolve();
        },
      });
      tl.to(contentElements, { opacity: 0, duration, ease }, 0);
      if (footerElement) tl.to(footerElement, { opacity: 0, duration, ease }, 0);
    });
  }, []);

  const enter = useCallback(async () => {
    const config = activeConfig.current || resolveTransition(getEffectiveLayoutType(pathname));
    if (!config) return Promise.resolve();

    const runTrigger = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          triggerPageEnter();
        });
      });
    };

    if (config.mechanism === 'ground') {
      for (let i = 0; i < 60 && pathRef.current !== window.location.pathname; i++) {
        await new Promise((resolve) => setTimeout(resolve, 16));
      }

      scrollReset();

      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 1500);
        onGatesClear(() => {
          clearTimeout(timer);
          resolve();
        });
      });

      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 1000);
        let lastTimestamp = performance.now();
        let frameCount = 0;

        const checkFrame = (time) => {
          frameCount = time - lastTimestamp < 40 ? frameCount + 1 : 0;
          lastTimestamp = time;
          if (frameCount >= 2) {
            clearTimeout(timeout);
            resolve();
          } else {
            requestAnimationFrame(checkFrame);
          }
        };

        requestAnimationFrame(checkFrame);
      });

      revealPage();

      const overlay = overlayRef.current;
      if (!overlay) return;

      await new Promise((resolve) => {
        gsap.to(overlay, {
          autoAlpha: 0,
          ...config.out,
          overwrite: true,
          onComplete: () => {
            gsap.set(overlay, { pointerEvents: 'none' });
            resolve();
          },
        });
      });
      return;
    }

    const enterAnim = config.enter;
    const contentElements = document.querySelectorAll('[data-transition-content]');
    const footerElement = document.querySelector('footer');

    const nextContentSet = new Set(contentElements);
    const elementsToReset = animatingElements.current.filter((el) => el && !nextContentSet.has(el));
    if (elementsToReset.length) {
      gsap.set(elementsToReset, { opacity: 1 });
    }
    animatingElements.current = [];

    if (contentElements.length === 0) {
      runTrigger();
      return;
    }

    const { duration, ease } = enterAnim;
    const tl = gsap.timeline();

    return new Promise((resolve) => {
      tl.fromTo(contentElements, { opacity: 0 }, { opacity: 1, duration, ease }, 0);
      if (footerElement) {
        tl.fromTo(footerElement, { opacity: 0 }, { opacity: 1, duration, ease }, 0);
      }
      tl.call(runTrigger, [], 0);
      tl.call(() => resolve(), [], '>');
    });
  }, [pathname, triggerPageEnter, revealPage, onGatesClear]);

  useEffect(() => {
    leaveCallbackRef.current = leave;
    enterCallbackRef.current = enter;
  }, [leave, enter]);

  return (
    <RouterTransitionProvider leave={leave} enter={enter}>
      <TransitionRouterProvider>
        {children}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="pointer-events-none invisible fixed inset-0 z-[299] opacity-0"
        />
      </TransitionRouterProvider>
    </RouterTransitionProvider>
  );
}

