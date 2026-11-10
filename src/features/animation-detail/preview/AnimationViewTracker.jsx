'use client';

// Variable Mapping: l -> AnimationViewTracker, e -> animation, t -> hasTrackedRef, s -> storageKey, n.H -> analytics

import { useEffect, useRef } from 'react'; // NOTE: module id: 271645
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348

// NOTE: module id: 521041
export default function AnimationViewTracker({ animation }) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!animation?.id || hasTrackedRef.current) return;

    hasTrackedRef.current = true;
    analytics.animation.viewed(
      animation.id,
      animation.title || animation.name,
      animation.category?.name || animation.category || 'unknown',
      animation.animation_tags?.map((item) => item.tag?.name).filter(Boolean) || []
    );

    const storageKey = `anm_viewed_${animation.id}`;
    try {
      const lastViewedAt = Number(localStorage.getItem(storageKey) || 0);
      if (Date.now() - lastViewedAt < 86400000) return;
      localStorage.setItem(storageKey, String(Date.now()));
    } catch {}

    fetch('/api/animations/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        animationId: animation.id,
      }),
    }).catch((error) => {
      console.warn('Failed to track view:', error);
    });
  }, [animation]);

  return null;
}
