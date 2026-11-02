'use client';

// Variable Mapping: e -> href, t -> icon, r -> label, n -> active, l -> badge, i -> external, s -> className, u -> isCollapsed, f -> isMobile, m -> closeMobile, h -> isCollapsedDesktop, v -> routerOnClick, w -> classes, y -> Component

// NOTE: module id: 899801
import { createElement } from 'react';
import Link from 'next/link'; // NOTE: module id: 522016
import { usePathname } from 'next/navigation'; // NOTE: module id: 995289 (assuming usage context)
import { useSidebar } from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

export default function SidebarItem({ href, icon: Icon, label, active = false, badge, external = false, className, ...rest }) {
  const { isCollapsed, isMobile, closeMobile } = useSidebar();
  const isCollapsedDesktop = isCollapsed && !isMobile;
  
  // NOTE: In the bundle, this wrapped navigation. Adjust if you use a custom NextLink hook.
  const handleNavigation = (e) => {
    if (isMobile) closeMobile();
  };

  const classes = cn(
    "group relative flex h-40 items-center rounded-[2px] text-foreground-muted",
    "transition-colors duration-(--duration-fast) ease-(--ease-power3-out)",
    "hover:text-foreground data-[active=true]:text-foreground",
    isCollapsedDesktop ? "justify-center px-0" : "gap-12 px-12",
    className
  );

  const Component = external ? "a" : Link;

  return (
    <Component
      href={href}
      onClick={external ? () => { if (isMobile) closeMobile(); } : handleNavigation}
      data-active={active ? "true" : undefined}
      aria-current={active ? "page" : undefined}
      title={isCollapsedDesktop ? label : undefined}
      className={classes}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 inset-y-8 w-2 origin-left scale-x-0 bg-brand",
          "transition-transform duration-(--duration-snap) ease-(--ease-power3-out)",
          "group-data-[active=true]:scale-x-100"
        )}
      />
      {Icon ? (
        <span aria-hidden="true" className="pointer-events-none inline-flex shrink-0 items-center justify-center">
          <Icon className="size-18" aria-hidden="true" strokeWidth={1.5} />
        </span>
      ) : null}
      
      {!isCollapsedDesktop && (
        <span className="pointer-events-none text-body-sm min-w-0 flex-1 truncate">
          {label}
        </span>
      )}
      
      {!isCollapsedDesktop && badge ? (
        <span aria-hidden="true" className="pointer-events-none text-accent-2xs text-brand">
          {badge}
        </span>
      ) : null}
    </Component>
  );
}

