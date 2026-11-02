'use client';

// Variable Mapping: T -> NotificationsDrawer, e -> open, r -> onClose, l -> items, i -> lastSeenAt, s -> overlayRef, o -> panelRef, c -> closeButtonRef, d -> timelineRef, u -> lockScroll, f -> unlockScroll, m -> isMounted, h -> setIsMounted, p -> thisWeek, g -> earlier, x -> lastSeenTime, b -> isUnread, v -> isEmpty, (grouping helper) e -> entries, t -> now, a -> recent, r -> older, n -> entry, (timeline effect) e -> prefersReducedMotion, t -> timeline

import { useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import { createPortal } from 'react-dom'; // NOTE: module id: 174080
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { X } from '@phosphor-icons/react'; // NOTE: module id: 137410
import { useScrollLockContext } from '@/contexts/ScrollLockProvider'; // NOTE: module id: 441409
import NotificationItem from '@/components/notifications/NotificationItem';

function groupItemsByRecency(entries) {
  const now = Date.now();
  const recent = [];
  const older = [];
  for (const entry of entries) {
    if (now - new Date(entry.date).getTime() <= 6048e5) recent.push(entry);
    else older.push(entry);
  }
  return { thisWeek: recent, earlier: older };
}

// NOTE: module id: 583246
export default function NotificationsDrawer({ open, onClose, items, lastSeenAt }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const timelineRef = useRef(null);
  const { lockScroll, unlockScroll } = useScrollLockContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const { thisWeek, earlier } = useMemo(
    () => groupItemsByRecency(items || []),
    [items]
  );

  const lastSeenTime = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
  const isUnread = (entry) => new Date(entry.date).getTime() > lastSeenTime;

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
  }, [open, lockScroll, unlockScroll]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useGSAP(
    () => {
      if (!overlayRef.current || !panelRef.current) return;
      if (!timelineRef.current) {
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        timelineRef.current = gsap
          .timeline({
            paused: true,
            onComplete: () => closeButtonRef.current?.focus(),
          })
          .fromTo(
            overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power3.inOut', easeReverse: true },
            0
          )
          .fromTo(
            panelRef.current,
            { x: '100%' },
            { x: '0%', duration: 0.7, ease: 'power3.inOut', easeReverse: true },
            0
          );
        if (prefersReducedMotion) timelineRef.current.timeScale(20);
      }
      const timeline = timelineRef.current;
      if (open) timeline.play();
      else timeline.reverse();
    },
    { dependencies: [open] }
  );

  useEffect(
    () => () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    },
    []
  );

  const isEmpty = (items || []).length === 0;

  return isMounted
    ? createPortal(
        <div
          className={cn('fixed inset-0 z-[70]', !open && 'pointer-events-none')}
          aria-hidden={!open}
        >
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-background/40 backdrop-blur-sm opacity-0"
            onClick={(event) => {
              if (event.target === overlayRef.current) onClose();
            }}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="What's new"
            className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] translate-x-full bg-background border-l border-border flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-border px-20 py-16">
              <h2 className="h4 font-medium tracking-tight">What's new</h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-32 w-32 items-center justify-center rounded-md microinteraction hover:bg-secondary"
              >
                <x className="h-16 w-16" />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-8 py-12"
              data-lenis-prevent
            >
              {isEmpty ? (
                <div className="flex h-full flex-col items-center justify-center px-24 text-center">
                  <p className="h5 font-medium">You're all caught up.</p>
                  <p className="mt-8 text-sm color-faded">
                    New animations and posts show up here.
                  </p>
                </div>
              ) : (
                <>
                  {thisWeek.length > 0 && (
                    <section className="mb-8">
                      <p className="px-12 pb-8 pt-12 text-xs color-faded">This week</p>
                      <div className="flex flex-col gap-4">
                        {thisWeek.map((item) => (
                          <NotificationItem
                            key={item.id}
                            item={item}
                            isUnread={isUnread(item)}
                            onNavigate={onClose}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                  {earlier.length > 0 && (
                    <section>
                      <p className="px-12 pb-8 pt-12 text-xs color-faded">Earlier</p>
                      <div className="flex flex-col gap-4">
                        {earlier.map((item) => (
                          <NotificationItem
                            key={item.id}
                            item={item}
                            isUnread={isUnread(item)}
                            onNavigate={onClose}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
}

gsap.registerPlugin(useGSAP);
