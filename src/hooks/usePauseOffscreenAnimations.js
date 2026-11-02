'use client';

// Variable Mapping: u -> containerRef / entry, D -> element / anim, e -> observer

import { useEffect } from 'react'; // NOTE: module id: 271645

// NOTE: module id: 771267
export function usePauseOffscreenAnimations(containerRef) {
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      element
        .getAnimations({ subtree: true })
        .forEach((anim) => (entry.isIntersecting ? anim.play() : anim.pause()));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);
}

export { usePauseOffscreenAnimations as f };

