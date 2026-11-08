'use client';

/* Variable Mapping:
 * ec -> ANNOUNCEMENT_COMPONENTS, ed -> ANNOUNCEMENT_CHECKED_KEY,
 * eu -> postAnnouncementEvent, ef -> AnnouncementHost, e -> announcement,
 * r -> setAnnouncement, n -> open, l -> setOpen, i -> actionClickedRef,
 * s -> AnnouncementComponent
 */

import { useEffect, useRef, useState } from 'react';
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import AffiliateModal from '@/features/affiliate/AffiliateModal'; // NOTE: module id: 634401

const ANNOUNCEMENT_COMPONENTS = {
  'affiliate-launch': AffiliateModal,
};

const ANNOUNCEMENT_CHECKED_KEY = 'anm_announcement_checked';

const postAnnouncementEvent = (id, event) =>
  fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, event }),
    keepalive: true,
  }).catch(() => {});

// NOTE: module id: 583246
export function AnnouncementHost() {
  const [announcement, setAnnouncement] = useState(null);
  const [open, setOpen] = useState(false);
  const actionClickedRef = useRef(false);

  useEffect(() => {
    let timerId;
    const previewParam = new URLSearchParams(window.location.search).get('announcement');

    try {
      if (!previewParam && sessionStorage.getItem(ANNOUNCEMENT_CHECKED_KEY)) {
        return;
      }
    } catch {}

    let cancelled = false;

    fetch(`/api/announcements${previewParam ? `?preview=${encodeURIComponent(previewParam)}` : ''}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        try {
          if (!previewParam) {
            sessionStorage.setItem(ANNOUNCEMENT_CHECKED_KEY, '1');
          }
        } catch {}

        const item = data?.announcement;
        if (!item || !ANNOUNCEMENT_COMPONENTS[item.id]) return;

        const tryShowAnnouncement = (attempt = 0) => {
          const hasVisibleDialog = [
            ...document.querySelectorAll('[role="dialog"], [role="alertdialog"]'),
          ].some(
            (el) =>
              !el.closest('[aria-hidden="true"]') &&
              el.getClientRects().length > 0 &&
              getComputedStyle(el).visibility !== 'hidden'
          );

          if (hasVisibleDialog) {
            if (attempt < 5) {
              timerId = setTimeout(() => tryShowAnnouncement(attempt + 1), 2000);
            }
            return;
          }

          actionClickedRef.current = false;
          setAnnouncement(item);
          setOpen(true);
          if (!item.preview) {
            postAnnouncementEvent(item.id, 'shown');
          }
          analytics.track('announcement_shown', { id: item.id, preview: item.preview });
        };

        timerId = setTimeout(tryShowAnnouncement, item.delayMs || 0);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, []);

  if (!announcement) return null;

  const AnnouncementComponent = ANNOUNCEMENT_COMPONENTS[announcement.id];

  return (
    <AnnouncementComponent
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen && !actionClickedRef.current) {
          if (!announcement.preview) {
            postAnnouncementEvent(announcement.id, 'dismissed');
          }
          analytics.track('announcement_dismissed', {
            id: announcement.id,
            preview: announcement.preview,
          });
        }
      }}
      onAction={(action) => {
        actionClickedRef.current = true;
        if (!announcement.preview) {
          postAnnouncementEvent(announcement.id, 'clicked');
        }
        analytics.track('announcement_clicked', {
          id: announcement.id,
          action,
          preview: announcement.preview,
        });
        setOpen(false);
      }}
    />
  );
}