'use client';

// Variable Mapping: F -> LAST_SEEN_STORAGE_KEY, $ -> NotificationsButton, e -> className, r -> items, n -> latestDate, l -> isCollapsed, i -> isMobile, s -> isIconOnly, o -> isOpen, c -> setIsOpen, d -> lastSeenAt, u -> setLastSeenAt, f -> hasMounted, m -> setHasMounted, h -> hasUnread

import { useEffect, useState } from 'react'; // NOTE: module id: 271645
import { BellIcon } from '@phosphor-icons/react'; // NOTE: module id: 769464

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { useSidebar } from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import { useNotificationFeed } from '@/contexts/NotificationProvider'; // NOTE: module id: 594886
import NotificationsDrawer from '@/components/notifications/NotificationsDrawer';

const LAST_SEEN_STORAGE_KEY = 'gamevault_notifications_last_seen_at';

// NOTE: module id: 583246
export default function NotificationsButton({ className }) {
  const { items, latestDate } = useNotificationFeed();
  const { isCollapsed, isMobile } = useSidebar();
  const isIconOnly = isCollapsed && !isMobile;
  const [isOpen, setIsOpen] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    try {
      setLastSeenAt(localStorage.getItem(LAST_SEEN_STORAGE_KEY));
    } catch (error) {}
    setHasMounted(true);
  }, []);

  const hasUnread =
    hasMounted &&
    latestDate &&
    (!lastSeenAt || new Date(latestDate).getTime() > new Date(lastSeenAt).getTime());

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          if (latestDate) {
            const seenAt = new Date().toISOString();
            try {
              localStorage.setItem(LAST_SEEN_STORAGE_KEY, seenAt);
            } catch (error) {}
            setLastSeenAt(seenAt);
          }
        }}
        aria-label={hasUnread ? "What's new (unread)" : "What's new"}
        title={isIconOnly ? "What's new" : undefined}
        className={cn(
          'group relative flex h-40 w-full items-center rounded-[2px] text-foreground-muted',
          'transition-colors duration-(--duration-fast) ease-(--ease-power3-out)',
          'hover:text-foreground',
          isIconOnly ? 'justify-center px-0' : 'gap-12 px-12',
          className
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none relative inline-flex shrink-0 items-center justify-center"
        >
          <BellIcon className="size-18" aria-hidden="true" />
          {isIconOnly && hasUnread ? (
            <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-brand" />
          ) : null}
        </span>
        {!isIconOnly && (
          <span className="pointer-events-none min-w-0 flex-1 truncate text-left text-body-sm">
            What's new
          </span>
        )}
        {!isIconOnly && hasUnread ? (
          <span
            aria-hidden="true"
            className="pointer-events-none h-6 w-6 rounded-full bg-brand"
          />
        ) : null}
      </button>
      <NotificationsDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        lastSeenAt={lastSeenAt}
      />
    </>
  );
}
