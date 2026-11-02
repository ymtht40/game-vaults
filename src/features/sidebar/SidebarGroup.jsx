'use client';

// Variable Mapping: e -> label, t -> children, r -> className, n -> isCollapsed, o -> isMobile, l -> isCollapsedDesktop

// NOTE: module id: 713637
import { useSidebar } from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

export default function SidebarGroup({ label, children, className }) {
  const { isCollapsed, isMobile } = useSidebar();
  const isCollapsedDesktop = isCollapsed && !isMobile;

  return (
    <div className={cn("flex flex-col", className)}>
      {label ? (
        isCollapsedDesktop ? (
          <div className="mx-12 mb-8 mt-12 h-px bg-foreground/10" aria-hidden="true" />
        ) : (
          <div className="text-mono-sm px-12 pt-12 pb-8 text-foreground-muted">
            {label}
          </div>
        )
      ) : null}
      <div className={cn("flex flex-col", isCollapsedDesktop ? "gap-4 px-12" : "gap-2 px-8")}>
        {children}
      </div>
    </div>
  );
}

