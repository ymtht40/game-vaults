'use client';

// Variable Mapping: ec -> ANNOUNCEMENTS, ed -> ANNOUNCEMENT_CHECKED_KEY, eu -> trackAnnouncementEvent, ef -> AnnouncementHost, e -> announcement, r -> setAnnouncement, n -> isOpen, l -> setIsOpen, i -> wasActionClickedRef, s -> AnnouncementComponent, (effect) e -> timeoutId, t -> previewId, a -> isCancelled, n -> data, s -> nextAnnouncement, o -> showAnnouncement, (showAnnouncement) t -> retryCount, (handlers) t -> nextOpen / action

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645

import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import AffiliateModal from '@/features/affiliate/AffiliateModal'; // NOTE: module id: 634401

const ANNOUNCEMENTS = {
  'affiliate-launch': AffiliateModal,
};

const ANNOUNCEMENT_CHECKED_KEY = 'anm_announcement_checked';

const trackAnnouncementEvent = (id, event) =>
  fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, event }),
    keepalive: true,
  }).catch(() => {});

// NOTE: module id: 583246
export default function AnnouncementHost() {
  const [announcement, setAnnouncement] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const wasActionClickedRef = useRef(false);

  useEffect(() => {
    let timeoutId;
    const previewId = new URLSearchParams(window.location.search).get('announcement');
    try {
      if (!previewId && sessionStorage.getItem(ANNOUNCEMENT_CHECKED_KEY)) return;
    } catch {}
    let isCancelled = false;
    fetch(
      `/api/announcements${
        previewId ? `?preview=${encodeURIComponent(previewId)}` : ''
      }`
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isCancelled) return;
        try {
          if (!previewId) sessionStorage.setItem(ANNOUNCEMENT_CHECKED_KEY, '1');
        } catch {}
        const nextAnnouncement = data?.announcement;
        if (!nextAnnouncement || !ANNOUNCEMENTS[nextAnnouncement.id]) return;
        const showAnnouncement = (retryCount = 0) => {
          if (
            [
              ...document.querySelectorAll('[role="dialog"], [role="alertdialog"]'),
            ].some(
              (element) =>
                !element.closest('[aria-hidden="true"]') &&
                element.getClientRects().length > 0 &&
                getComputedStyle(element).visibility !== 'hidden'
            )
          ) {
            if (retryCount < 5) {
              timeoutId = setTimeout(() => showAnnouncement(retryCount + 1), 2e3);
            }
            return;
          }
          wasActionClickedRef.current = false;
          setAnnouncement(nextAnnouncement);
          setIsOpen(true);
          if (!nextAnnouncement.preview) {
            trackAnnouncementEvent(nextAnnouncement.id, 'shown');
          }
          analytics.track('announcement_shown', {
            id: nextAnnouncement.id,
            preview: nextAnnouncement.preview,
          });
        };
        timeoutId = setTimeout(showAnnouncement, nextAnnouncement.delayMs || 0);
      })
      .catch(() => {});
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  if (!announcement) return null;

  const AnnouncementComponent = ANNOUNCEMENTS[announcement.id];

  return (
    <AnnouncementComponent
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);
        if (!nextOpen && !wasActionClickedRef.current) {
          if (!announcement.preview) {
            trackAnnouncementEvent(announcement.id, 'dismissed');
          }
          analytics.track('announcement_dismissed', {
            id: announcement.id,
            preview: announcement.preview,
          });
        }
      }}
      onAction={(action) => {
        wasActionClickedRef.current = true;
        if (!announcement.preview) {
          trackAnnouncementEvent(announcement.id, 'clicked');
        }
        analytics.track('announcement_clicked', {
          id: announcement.id,
          action,
          preview: announcement.preview,
        });
        setIsOpen(false);
      }}
    />
  );
}
