'use client';

// NOTE: module id: 421413
import { useSidebar } from '@/providers/SidebarProvider'; // NOTE: module id: 855382
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

export default function SidebarMobileTrigger({ className }) {
  const { isMobile, isMobileOpen, openMobile } = useSidebar();

  if (!isMobile || isMobileOpen) return null;

  return (
    <button
      type="button"
      onClick={openMobile}
      aria-label="Open menu"
      className={cn(
        "fixed left-12 top-12 z-30 inline-flex size-40 items-center justify-center",
        "border border-foreground/10 bg-background text-foreground-muted",
        "transition-colors duration-(--duration-fast) ease-(--ease-power3-out)",
        "hover:border-foreground/30 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
        className
      )}
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-16">
        <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
      </svg>
    </button>
  );
}

