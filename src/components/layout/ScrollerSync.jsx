'use client';

// Variable Mapping: ev -> ScrollerSync, e -> scrollerRef, t -> onReady, a -> scroller, r -> handleScroll, n -> resizeObserver, i -> pendingFrame, s -> content, (observer) e -> lastHeight, t -> entries, a -> height, (cleanup) e -> trigger, (scrollTop) e -> value

import { useEffect } from 'react'; // NOTE: module id: 271645
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495

// NOTE: module id: 583246
export default function ScrollerSync({ scrollerRef, onReady }) {
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (arguments.length) scroller.scrollTop = value;
        return scroller.scrollTop;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      pinType: 'fixed',
    });
    ScrollTrigger.defaults({ scroller });
    const handleScroll = () => ScrollTrigger.update();
    scroller.addEventListener('scroll', handleScroll, { passive: true });
    let resizeObserver = null;
    let pendingFrame = null;
    const content = scroller.firstElementChild;
    if (content && typeof ResizeObserver !== 'undefined') {
      let lastHeight = content.getBoundingClientRect().height;
      resizeObserver = new ResizeObserver((entries) => {
        if (pendingFrame != null) return;
        const height = entries[0]?.contentRect?.height ?? lastHeight;
        if (Math.abs(height - lastHeight) < 1) return;
        lastHeight = height;
        pendingFrame = requestAnimationFrame(() => {
          pendingFrame = null;
          ScrollTrigger.refresh();
        });
      });
      resizeObserver.observe(content);
    }
    ScrollTrigger.refresh();
    onReady?.();
    return () => {
      scroller.removeEventListener('scroll', handleScroll);
      if (resizeObserver) resizeObserver.disconnect();
      if (pendingFrame != null) cancelAnimationFrame(pendingFrame);
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.scroller === scroller) trigger.kill();
      });
      ScrollTrigger.defaults({ scroller: window });
    };
  }, []);

  return null;
}
