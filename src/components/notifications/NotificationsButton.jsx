'use client';

/* Variable Mapping:
 * F -> LAST_SEEN_STORAGE_KEY, $ -> NotificationsButton, e -> className,
 * r -> items, n -> latestDate, l -> isCollapsed, i -> isMobile,
 * s -> isDesktopCollapsed, o -> open, c -> setOpen, d -> lastSeenAt,
 * u -> setLastSeenAt, f -> hasLoadedStorage, m -> setHasLoadedStorage,
 * h -> hasUnread
 */

import { useEffect, useState } from 'react';
import { BellIcon } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import NotificationsDrawer from '@/components/notifications/NotificationsDrawer'; // NOTE: module id: 583246
import { useNotificationFeed } from '@/contexts/NotificationProvider'; // NOTE: module id: 594886
import { useSidebar } from '@/contexts/SidebarProvider'; // NOTE: module id: 855382 // UNRESOLVED: name guessed from usage

gsap.registerPlugin(useGSAP);

const LAST_SEEN_STORAGE_KEY = 'annnimate_notifications_last_seen_at';

// NOTE: module id: 583246
export function NotificationsButton({ className }) {
  const { items, latestDate } = useNotificationFeed();
  const { isCollapsed, isMobile } = useSidebar();
  const isDesktopCollapsed = isCollapsed && !isMobile;

  const [open, setOpen] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    try {
      setLastSeenAt(localStorage.getItem(LAST_SEEN_STORAGE_KEY));
    } catch {}
    setHasLoadedStorage(true);
  }, []);

  const hasUnread =
    hasLoadedStorage &&
    latestDate &&
    (!lastSeenAt || new Date(latestDate).getTime() > new Date(lastSeenAt).getTime());

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (latestDate) {
            const nowIso = new Date().toISOString();
            try {
              localStorage.setItem(LAST_SEEN_STORAGE_KEY, nowIso);
            } catch {}
            setLastSeenAt(nowIso);
          }
        }}
        aria-label={hasUnread ? "What's new (unread)" : "What's new"}
        title={isDesktopCollapsed ? "What's new" : undefined}
        className={cn(
          'group relative flex h-40 w-full items-center rounded-[2px] text-foreground-muted',
          'transition-colors duration-(--duration-fast) ease-(--ease-power3-out)',
          'hover:text-foreground',
          isDesktopCollapsed ? 'justify-center px-0' : 'gap-12 px-12',
          className
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none relative inline-flex shrink-0 items-center justify-center"
        >
          <BellIcon className="size-18" aria-hidden="true" />
          {isDesktopCollapsed && hasUnread ? (
            <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-brand" />
          ) : null}
        </span>
        {!isDesktopCollapsed && (
          <span className="pointer-events-none min-w-0 flex-1 truncate text-left text-body-sm">
            What's new
          </span>
        )}
        {!isDesktopCollapsed && hasUnread ? (
          <span
            aria-hidden="true"
            className="pointer-events-none h-6 w-6 rounded-full bg-brand"
          />
        ) : null}
      </button>
      <NotificationsDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        lastSeenAt={lastSeenAt}
      />
    </>
  );
}