'use client';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { HEADER_THEMES } from '@/components/header/header.config'; // NOTE: module id: 76624

// NOTE: module id: 76624
export function useHeaderState(barRef) {
  const pathname = usePathname();
  const [scrollState, setScrollState] = useState('top');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState('dark');
  const isScrollLockedRef = useRef(false);
  const isTransitioningRef = useRef(false);

  const updateThemeForScrollPosition = useCallback((top) => {
    const themeElements = document.querySelectorAll('main [data-theme]');
    if (themeElements.length === 0) return;
    const matchingElement = Array.from(themeElements).find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top <= top && rect.bottom > top;
    });
    const theme = (matchingElement ?? themeElements[0])?.dataset.theme;
    if (theme && HEADER_THEMES.includes(theme)) {
      setHeaderTheme(theme);
    }
  }, []);

  useEffect(() => {
    let timeoutId = 0;
    const handleTransition = (e) => {
      isTransitioningRef.current = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        isTransitioningRef.current = false;
      }, 4000);
      setScrollState('top');
      const theme = e.detail?.theme;
      if (theme && HEADER_THEMES.includes(theme)) {
        setHeaderTheme(theme);
      }
    };

    window.addEventListener('anm:transition', handleTransition);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('anm:transition', handleTransition);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!isTransitioningRef.current) {
        setScrollState(window.scrollY > 50 ? 'scrolled' : 'top');
        if (barRef.current) {
          updateThemeForScrollPosition(barRef.current.offsetTop);
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateThemeForScrollPosition, barRef]);

  useEffect(() => {
    let isCancelled = false;
    isTransitioningRef.current = false;

    const checkState = () => {
      if (!isCancelled && barRef.current) {
        setScrollState(window.scrollY > 50 ? 'scrolled' : 'top');
        updateThemeForScrollPosition(barRef.current.offsetTop);
      }
    };

    const header = barRef.current?.closest('.v2-header');
    header?.classList.add('no-transition');
    checkState();

    const rafId = requestAnimationFrame(() => {
      checkState();
      requestAnimationFrame(() => header?.classList.remove('no-transition'));
    });

    const observer = new MutationObserver(checkState);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const timeoutId = setTimeout(() => observer.disconnect(), 800);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      clearTimeout(timeoutId);
      header?.classList.remove('no-transition');
    };
  }, [pathname, updateThemeForScrollPosition, barRef]);

  const headerState = useMemo(() => (isMenuOpen ? 'menuOpen' : scrollState), [isMenuOpen, scrollState]);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.classList.add('v2-scroll-locked');
      window.lenis?.stop?.();
      isScrollLockedRef.current = true;
    } else if (isScrollLockedRef.current) {
      document.documentElement.classList.remove('v2-scroll-locked');
      window.lenis?.start?.();
      isScrollLockedRef.current = false;
    }
  }, [isMenuOpen]);

  return {
    scrollState,
    isMenuOpen,
    headerState,
    headerTheme,
    toggleMenu,
    closeMenu,
  };
}
