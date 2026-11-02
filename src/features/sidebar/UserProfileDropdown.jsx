'use client';

// Variable Mapping: t -> user, r -> extraItems, n -> isCollapsed, l -> isMobile, i -> isCollapsedDesktop, s -> profile, c -> router, m -> isBillingLoading, h -> setIsBillingLoading, w -> displayName, y -> planName

// NOTE: module id: 253454
import { useState } from 'react';
import { useTransitionRouter } from '@/contexts/TransitionRouterProvider'; // NOTE: module id: 676040
import Link from 'next/link'; // NOTE: module id: 101836
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'; // Radix primitives replaced manual inline
import { CreditCard, SignOut, ShieldCheck, CaretUpDown, Gear } from '@phosphor-icons/react';
import { useSidebar } from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220
import { createClient } from '@/libs/supabase/client'; // NOTE: module id: 628469
import { Avatar } from '@/components/ui/Avatar'; // NOTE: module id: 813920
import { InlineLoader } from '@/components/ui/Loader'; // NOTE: module id: 461376
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

const itemClasses = "flex text-body-sm gap-10 px-10 py-8 cursor-pointer items-center !rounded-none !text-foreground hover:!bg-foreground/10 focus:!bg-foreground/10 data-[highlighted]:!bg-foreground/10 data-[highlighted]:!text-foreground outline-none transition-colors";

export default function UserProfileDropdown({ user, extraItems = [] }) {
  const { isCollapsed, isMobile } = useSidebar();
  const isCollapsedDesktop = isCollapsed && !isMobile;
  const { profile } = useUser();
  const router = useTransitionRouter();
  
  const handleNavigation = (href) => (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    e.preventDefault();
    router.push(href);
  };

  const [isBillingLoading, setIsBillingLoading] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleBilling = async () => {
    if (isBillingLoading) return;
    setIsBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No portal URL returned:", data.error);
        setIsBillingLoading(false);
      }
    } catch (e) {
      console.error("Billing portal error:", e);
      setIsBillingLoading(false);
    }
  };

  const displayName = user.name || user.email;
  const planName = profile?.plan_name ? `${profile.plan_name} Plan` : "Free Plan";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "group flex w-full items-center gap-12 text-left",
            "transition-colors duration-(--duration-fast) ease-(--ease-power3-out)",
            "hover:bg-foreground/[0.04] data-[state=open]:bg-surface",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
            isCollapsedDesktop ? "h-48 justify-center px-0" : "h-56 px-12"
          )}
        >
          <Avatar name={displayName} src={user.avatar} avatarIndex={profile?.avatar_index} alt={displayName} size={32} className="size-32 shrink-0" />
          
          {!isCollapsedDesktop && (
            <>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-sm truncate text-foreground">{displayName}</span>
                <span className="text-accent-xs truncate text-foreground-muted">{planName}</span>
              </span>
              <CaretUpDown className="size-14 shrink-0 text-foreground-muted transition-colors group-hover:text-foreground group-data-[state=open]:text-foreground" aria-hidden="true" />
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={isCollapsedDesktop ? "right" : "top"}
          align={isCollapsedDesktop ? "end" : "start"}
          sideOffset={16}
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out",
            "!rounded-none !border-foreground/10 !bg-surface !text-foreground !shadow-lg !p-0",
            isCollapsedDesktop && "min-w-[220px]"
          )}
          style={isCollapsedDesktop ? undefined : { width: "var(--radix-dropdown-menu-trigger-width)" }}
        >
          <DropdownMenu.Label className="!p-0 font-normal">
            <div className="flex items-start gap-10 border-b border-foreground/10 px-12 py-12">
              <Avatar name={displayName} src={user.avatar} avatarIndex={profile?.avatar_index} alt={displayName} size={32} className="size-32 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-sm truncate font-medium leading-tight text-foreground">{displayName}</span>
                <span className="text-body-sm truncate font-normal leading-tight text-foreground-muted">{user.email}</span>
                <span className="text-accent-xs mt-6 truncate text-foreground-muted">
                  {planName}
                  {profile?.is_legacy_user ? (
                    <span className="ml-8 inline-flex items-center gap-4 text-brand">
                      <span aria-hidden="true" className="inline-block size-6 bg-brand" />
                      Founding member
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </DropdownMenu.Label>

          <DropdownMenu.Group className="!p-4">
            <DropdownMenu.Item asChild className={itemClasses}>
              <Link href="/settings" onClick={handleNavigation("/settings")}>
                <Gear className="size-16 shrink-0 text-foreground-muted" aria-hidden="true" />
                <span>Settings</span>
              </Link>
            </DropdownMenu.Item>
            
            <DropdownMenu.Item 
              onSelect={(e) => { e.preventDefault(); handleBilling(); }} 
              disabled={isBillingLoading} 
              className={itemClasses}
            >
              {isBillingLoading ? (
                <InlineLoader size="16" color="currentColor" className="shrink-0" />
              ) : (
                <CreditCard className="size-16 shrink-0 text-foreground-muted" aria-hidden="true" />
              )}
              <span>Billing</span>
            </DropdownMenu.Item>

            {extraItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenu.Item asChild className={itemClasses} key={item.href || item.label}>
                  <Link href={item.href} onClick={handleNavigation(item.href)}>
                    {Icon && <Icon className="size-16 shrink-0 text-foreground-muted" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenu.Item>
              );
            })}

            {profile?.is_super_admin && (
              <>
                <DropdownMenu.Separator className="!my-4 !-mx-0 !bg-foreground/10 h-px" />
                <DropdownMenu.Item asChild className={cn(itemClasses, "!text-brand hover:!text-brand focus:!text-brand data-[highlighted]:!text-brand")}>
                  <Link href="/admin" onClick={handleNavigation("/admin")}>
                    <ShieldCheck className="size-16 shrink-0 text-brand" aria-hidden="true" />
                    <span>Admin dashboard</span>
                  </Link>
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Group>

          <DropdownMenu.Separator className="!my-0 !-mx-0 !bg-foreground/10 h-px" />
          
          <div className="!p-4">
            <DropdownMenu.Item onClick={handleLogout} className={itemClasses}>
              <SignOut className="size-16 shrink-0 text-foreground-muted" aria-hidden="true" />
              <span>Log out</span>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

