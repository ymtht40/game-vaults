'use client';

// Variable Mapping: i -> STORAGE_KEY, t -> defaultCollapsed, r -> isDesktop, n -> isMobile, d -> isCollapsed, c -> setIsCollapsed, u -> isMobileOpen, f -> setIsMobileOpen, p -> isMounted, m -> setIsMounted

// NOTE: module id: 855382
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint'; // NOTE: module id: 400701

const STORAGE_KEY = "anm:sidebar-collapsed";
const SidebarContext = createContext(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw Error("useSidebar must be used inside <SidebarProvider>");
  }
  return context;
}

export default function SidebarProvider({ children, defaultCollapsed = false }) {
  const isDesktop = useBreakpoint("lg");
  const isMobile = !isDesktop;
  
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setIsCollapsed(true);
      else if (stored === "0") setIsCollapsed(false);
    } catch {}
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem(STORAGE_KEY, isCollapsed ? "1" : "0");
      } catch {}
    }
  }, [isCollapsed, isMounted]);

  const toggleCollapse = useCallback(() => setIsCollapsed(e => !e), []);
  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const toggleMobile = useCallback(() => setIsMobileOpen(e => !e), []);

  useEffect(() => {
    if (isDesktop && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isDesktop, isMobileOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!((e.key === "b" || e.key === "B") && (e.metaKey || e.ctrlKey))) return;
      
      const target = e.target;
      const tagName = target?.tagName;
      
      if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) return;
      
      e.preventDefault();
      if (isMobile) {
        setIsMobileOpen(e => !e);
      } else {
        setIsCollapsed(e => !e);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  const value = useMemo(() => ({
    isCollapsed,
    isMobile,
    isMobileOpen,
    toggleCollapse,
    openMobile,
    closeMobile,
    toggleMobile
  }), [isCollapsed, isMobile, isMobileOpen, toggleCollapse, openMobile, closeMobile, toggleMobile]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

