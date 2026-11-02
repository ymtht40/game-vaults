'use client';

// Variable Mapping: n -> THEME_KEY, a -> DEFAULT_THEME, o -> ThemeContext, l -> theme, u -> setThemeState, i -> systemTheme, s -> setSystemTheme, d -> isMounted, c -> setIsMounted, f -> resolvedTheme, m -> setTheme, p -> providerValue
// NOTE: module id: 914899

import { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';

const THEME_KEY = 'theme';
const DEFAULT_THEME = 'dark';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [systemTheme, setSystemTheme] = useState(DEFAULT_THEME);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setThemeState(() => {
      try {
        return window.localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
      } catch (e) {
        return DEFAULT_THEME;
      }
    });
    setSystemTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setIsMounted(true);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');

    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (isMounted) {
      !(function () {
        if (typeof document === 'undefined') return;
        const style = document.createElement('style');
        style.appendChild(document.createTextNode('*,*::before,*::after{transition:none !important;animation-duration:0s !important;animation-delay:0s !important;}'));
        document.head.appendChild(style);
        window.getComputedStyle(document.body).opacity;
        requestAnimationFrame(() => {
          document.head.removeChild(style);
        });
      })();
      
      (function (currentTheme) {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        if (currentTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      })(resolvedTheme);
    }
  }, [isMounted, resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try {
      window.localStorage.setItem(THEME_KEY, newTheme);
    } catch (e) {}
  }, []);

  const providerValue = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme
  }), [theme, resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={providerValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw Error('useTheme must be used inside <ThemeProvider>');
  return context;
}

