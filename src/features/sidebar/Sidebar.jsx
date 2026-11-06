'use client';

// Variable Mapping: e -> children, t -> footer, r -> isCollapsed, n -> isMobile, l -> isMobileOpen, i -> closeMobile, s -> isCollapsedDesktop, c -> widthClass

// NOTE: module id: 187797
import { useEffect, Fragment } from 'react';
import { useSidebar } from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

// NOTE: Components used internally by the sidebar layout block.
import { InlineLoader } from '@/components/ui/Loader'; // NOTE: module id: 101836 (Annimate home link)
import SidebarProvider from '@/contexts/SidebarProvider'; // Extracted from module 855382 helper 'm'
import { AnimatedStrokeIcon } from '@/assets/icons/AnimatedStrokeIcon'; // Guess based on ref animation play

// Helper Component extracted from Module 855382 bundle logic that renders the toggle arrow button
function SidebarProviderBtn({ className }) {
  const { isCollapsed, isMobile, toggleCollapse, closeMobile } = useSidebar();
  const isCollapsedDesktop = isCollapsed && !isMobile;
  const label = isMobile ? "Close menu" : isCollapsedDesktop ? "Expand sidebar" : "Collapse sidebar";
  
  return (
    <button
      type="button"
      onClick={() => isMobile ? closeMobile() : toggleCollapse()}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-28 shrink-0 items-center justify-center",
        "border border-foreground/10 text-foreground-muted",
        "transition-colors duration-(--duration-fast) ease-(--ease-power3-out)",
        "hover:border-foreground/30 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
        className
      )}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={cn(
          "size-14 transition-transform duration-(--duration-snap) ease-(--ease-power3-out)",
          isCollapsedDesktop ? "rotate-180" : "rotate-0"
        )}
      >
        <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </button>
  );
}

// Helper Component extracted from module logic representing the inner sidebar content
function SidebarInner({ collapsed, footer, children }) {
  return (
    <div className="flex h-full flex-col">
      <header className={cn("flex h-56 items-center border-b border-foreground/10", collapsed ? "justify-center px-0" : "px-16")}>
        <InlineLoader href="/" aria-label="GameVault home" className="inline-flex items-center gap-8 text-foreground">
          {/* InlineLoader internals simplified as standard usage */}
          <AnimatedStrokeIcon className="h-16" />
          {!collapsed && <span className="text-foreground">GameVault</span>}
        </InlineLoader>
      </header>
      
      <nav className="flex flex-1 flex-col overflow-y-auto py-12">
        {children}
      </nav>
      
      {footer ? (
        <div className={cn("border-t border-foreground/10", collapsed ? "px-0 py-8" : "px-8 py-8")}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar({ children, footer }) {
  const { isCollapsed, isMobile, isMobileOpen, closeMobile } = useSidebar();
  const isCollapsedDesktop = isCollapsed && !isMobile;

  useEffect(() => {
    if (!isMobile || !isMobileOpen) return;
    
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    const handleEscape = (e) => {
      if (e.key === "Escape") closeMobile();
    };
    
    window.addEventListener("keydown", handleEscape);
    
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobile, isMobileOpen, closeMobile]);

  const widthClass = isMobile ? "w-0" : isCollapsedDesktop ? "w-64" : "w-256";

  return (
    <Fragment>
      <aside
        aria-label="Main"
        className={cn(
          "relative h-screen shrink-0 border-r border-foreground/10 bg-background",
          "transition-[width] duration-(--duration-snap) ease-(--ease-power3-out)",
          widthClass,
          isMobile && "hidden"
        )}
      >
        <SidebarInner collapsed={isCollapsedDesktop} footer={footer}>
          {children}
        </SidebarInner>
        <div className="absolute left-full top-14 z-20 ml-16" aria-hidden="false">
          <SidebarProviderBtn />
        </div>
      </aside>

      {isMobile ? (
        <Fragment>
          <div
            onClick={closeMobile}
            aria-hidden="true"
            className={cn(
              "fixed inset-0 z-40 bg-background/60 backdrop-blur-sm",
              "transition-opacity duration-(--duration-fast) ease-(--ease-power3-out)",
              isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
          />
          <aside
            aria-label="Main"
            aria-hidden={isMobileOpen ? undefined : "true"}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-256 border-r border-foreground/10 bg-background",
              "transition-transform duration-(--duration-snap) ease-(--ease-power3-out)",
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <SidebarInner collapsed={false} footer={footer}>
              {children}
            </SidebarInner>
          </aside>
        </Fragment>
      ) : null}
    </Fragment>
  );
}

