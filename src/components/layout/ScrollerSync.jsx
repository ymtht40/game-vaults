'use client';

/* Variable Mapping:
 * ev -> ScrollerSync, e -> scrollerRef, t -> onReady, a -> scrollerEl,
 * r -> handleScroll, n -> resizeObserver, i -> rafId, s -> contentEl
 */

import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// NOTE: module id: 583246
export function ScrollerSync({ scrollerRef, onReady }) {
  useEffect(() => {
    const scrollerEl = scrollerRef.current;
    if (!scrollerEl) return;

    ScrollTrigger.scrollerProxy(scrollerEl, {
      scrollTop(value) {
        if (arguments.length) {
          scrollerEl.scrollTop = value;
        }
        return scrollerEl.scrollTop;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      pinType: 'fixed',
    });

    ScrollTrigger.defaults({ scroller: scrollerEl });

    const handleScroll = () => ScrollTrigger.update();
    scrollerEl.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver = null;
    let rafId = null;
    const contentEl = scrollerEl.firstElementChild;

    if (contentEl && typeof ResizeObserver !== 'undefined') {
      let lastHeight = contentEl.getBoundingClientRect().height;
      resizeObserver = new ResizeObserver((entries) => {
        if (rafId != null) return;
        const nextHeight = entries[0]?.contentRect?.height ?? lastHeight;
        if (Math.abs(nextHeight - lastHeight) >= 1) {
          lastHeight = nextHeight;
          rafId = requestAnimationFrame(() => {
            rafId = null;
            ScrollTrigger.refresh();
          });
        }
      });
      resizeObserver.observe(contentEl);
    }

    ScrollTrigger.refresh();
    onReady?.();

    return () => {
      scrollerEl.removeEventListener('scroll', handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.scroller === scrollerEl) {
          trigger.kill();
        }
      });
      ScrollTrigger.defaults({ scroller: window });
    };
  }, []);

  return null;
}