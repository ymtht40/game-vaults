'use client';

// Variable Mapping: e -> items, o -> pathname, m -> match, f -> slug, h -> isDetailView, p -> itemCount, g -> currentIndex, x -> getAdjacentItem, E -> prevItem, M -> nextItem, b -> displayItems, j -> setDisplayItems, w -> prevScramble, v -> nextScramble, Z -> widthsRef, N -> trackEvent, F -> buttonClassName

// NOTE: module id: 245711

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import Link from 'next/link'; // NOTE: module id: 101836
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { CaretLeft, CaretRight } from '@phosphor-icons/react'; // NOTE: module ids: 590961, 268817
import { useScramble } from '@/hooks/useScramble'; // NOTE: module id: 254359
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348

gsap.registerPlugin(useGSAP);

export default function AnimationDetailNav({ items = [] }) {
  const pathname = usePathname();
  const match = pathname?.match(/^\/animations\/([^/]+)$/);
  const slug = match ? decodeURIComponent(match[1]) : null;
  const isDetailView = !!slug && slug !== 'saved' && items.length > 0;
  const itemCount = items.length;
  const currentIndex = isDetailView ? items.findIndex((item) => item.slug === slug) : -1;

  const getAdjacentItem = (offset) =>
    currentIndex === -1 || itemCount < 2
      ? null
      : items[(currentIndex + offset + itemCount) % itemCount];

  const prevItem = getAdjacentItem(-1);
  const nextItem = getAdjacentItem(1);

  const [displayItems, setDisplayItems] = useState({ prev: prevItem, next: nextItem });
  const prevScramble = useScramble({ duration: 0.35 });
  const nextScramble = useScramble({ duration: 0.35 });
  const widthsRef = useRef(null);

  useGSAP(
    () => {
      if (
        displayItems.prev?.slug !== prevItem?.slug ||
        displayItems.next?.slug !== nextItem?.slug
      ) {
        if (isDetailView) {
          widthsRef.current = {
            prev: prevScramble.ref.current?.offsetWidth ?? null,
            next: nextScramble.ref.current?.offsetWidth ?? null,
          };
        }
        setDisplayItems({ prev: prevItem, next: nextItem });
      }
    },
    { dependencies: [prevItem?.slug, nextItem?.slug, isDetailView] }
  );

  useGSAP(
    () => {
      const widths = widthsRef.current;
      if (!widths) return;
      widthsRef.current = null;

      const animate = (scramble, title, previousWidth) => {
        const el = scramble.ref.current;
        if (!el || !title || getComputedStyle(el).display === 'none') return;

        scramble.kill();
        scramble.scramble(title);

        const newWidth = el.offsetWidth;
        if (previousWidth != null && Math.abs(newWidth - previousWidth) > 1) {
          gsap.fromTo(
            el,
            { width: previousWidth },
            { width: newWidth, duration: 0.4, ease: 'expo.out' }
          );
        }
      };

      animate(prevScramble, displayItems.prev?.title, widths.prev);
      animate(nextScramble, displayItems.next?.title, widths.next);
    },
    { dependencies: [displayItems] }
  );

  if (!isDetailView) return null;

  const trackEvent = (action, toSlug) =>
    analytics.track(
      'detail_browse_used',
      { action, from_slug: slug, to_slug: toSlug || null },
      { transport: 'sendBeacon' }
    );

  const buttonClassName =
    'text-accent-xs flex items-center gap-8 px-16 py-14 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10';

  return (
    <div className="pointer-events-none sticky bottom-24 z-[100] flex justify-center px-16">
      <div
        data-theme="dark"
        className="pointer-events-auto flex max-w-full items-stretch bg-surface text-foreground"
      >
        {prevItem && (
          <>
            <Link
              href={`/animations/${prevItem.slug}`}
              className={buttonClassName}
              aria-label={`Previous component: ${prevItem.title}`}
              onClick={() => trackEvent('prev', prevItem.slug)}
            >
              <CaretLeft className="size-14 shrink-0 text-foreground-muted" />
              <span
                ref={prevScramble.ref}
                className="hidden max-w-[18ch] truncate md:block"
              >
                {displayItems.prev?.title || prevItem.title}
              </span>
            </Link>
            <span aria-hidden="true" className="w-px self-stretch bg-foreground/10" />
          </>
        )}

        <Link
          href="/animations"
          className={buttonClassName}
          onClick={() => trackEvent('browse_all')}
        >
          <span className="whitespace-nowrap">Browse all {itemCount}</span>
        </Link>

        {nextItem && (
          <>
            <span aria-hidden="true" className="w-px self-stretch bg-foreground/10" />
            <Link
              href={`/animations/${nextItem.slug}`}
              className={buttonClassName}
              aria-label={`Next component: ${nextItem.title}`}
              onClick={() => trackEvent('next', nextItem.slug)}
            >
              <span
                ref={nextScramble.ref}
                className="hidden max-w-[18ch] truncate md:block"
              >
                {displayItems.next?.title || nextItem.title}
              </span>
              <CaretRight className="size-14 shrink-0 text-foreground-muted" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
