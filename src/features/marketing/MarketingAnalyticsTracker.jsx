'use client';

// Variable Mapping: a -> SCROLL_THRESHOLDS, u -> pathname, D -> pageName, e -> startTime, n -> trackedDepths, r -> maxScrollDepth, l -> hasSentTimeOnPage, i -> rafId, s -> docElement, o -> scrollableHeight, F -> resizeObserver, c -> currentScrollY, C -> evaluateScrollDepth, E -> handleScroll, h -> sendTimeOnPage, m -> handleVisibilityChange

import { useEffect } from 'react'; // NOTE: module id: 271645
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

// NOTE: module id: 263227
export default function MarketingAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const pageName = (pathname && pathname !== '/' && pathname.split('/')[1]) || 'home';
    const startTime = Date.now();
    const trackedDepths = new Set();
    let maxScrollDepth = 0;
    let hasSentTimeOnPage = false;
    let rafId = 0;
    const docElement = document.documentElement;
    let scrollableHeight = docElement.scrollHeight - window.innerHeight;

    const resizeObserver = new ResizeObserver(() => {
      scrollableHeight = docElement.scrollHeight - window.innerHeight;
    });
    resizeObserver.observe(docElement);

    let currentScrollY = window.scrollY;

    const evaluateScrollDepth = () => {
      rafId = 0;
      const depthPercent =
        scrollableHeight > 0
          ? Math.min(100, Math.round((currentScrollY / scrollableHeight) * 100))
          : 100;

      if (depthPercent > maxScrollDepth) {
        maxScrollDepth = depthPercent;
      }

      for (const threshold of SCROLL_THRESHOLDS) {
        if (depthPercent >= threshold && !trackedDepths.has(threshold)) {
          trackedDepths.add(threshold);
          analytics.track('marketing_scroll_depth', {
            page: pageName,
            depth: threshold,
          });
        }
      }
    };

    const handleScroll = () => {
      currentScrollY = window.scrollY;
      if (!rafId) {
        rafId = requestAnimationFrame(evaluateScrollDepth);
      }
    };

    const sendTimeOnPage = () => {
      if (hasSentTimeOnPage) return;
      const seconds = Math.round((Date.now() - startTime) / 1000);
      if (seconds < 1) return;
      hasSentTimeOnPage = true;
      analytics.track(
        'marketing_time_on_page',
        {
          page: pageName,
          seconds,
          max_scroll_depth: maxScrollDepth,
        },
        { transport: 'sendBeacon' }
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendTimeOnPage();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', sendTimeOnPage);
    evaluateScrollDepth();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', sendTimeOnPage);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
      sendTimeOnPage();
    };
  }, [pathname]);

  return null;
}