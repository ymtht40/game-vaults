'use client';

import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { toast } from 'sonner';
import { analytics } from '@/libs/analytics/posthogAnalytics';
import { serverEvents } from '@/libs/utils/events';
import { useTransitionRouter as useTransitionRouterProviderTransition } from '@/contexts/TransitionRouterProvider';
import { useUser } from '@/contexts/UserProvider';
import { AnimationSaveContext } from '@/contexts/AnimationSaveContext';

export function useSaveAnimation(
  animationId,
  initialIsSaved = false,
  initialAnimation = null
) {
  const [isSaved, setIsSaved] = useState(Boolean(initialIsSaved));
  const [isLoading, setIsLoading] = useState(false);
  const savedRef = useRef(Boolean(initialIsSaved));
  const pendingRef = useRef(false);
  const library = useContext(AnimationSaveContext);
  const { user } = useUser();
  const router = useTransitionRouterProviderTransition();

  useEffect(() => {
    if (!pendingRef.current) {
      savedRef.current = Boolean(initialIsSaved);
      setIsSaved(Boolean(initialIsSaved));
    }
  }, [animationId, initialIsSaved]);

  const signIn = useCallback(() => {
    toast.error('Please sign in to save animations');
    const returnTo = window.location.pathname + window.location.search;
    router.push('/login?redirectTo=' + encodeURIComponent(returnTo));
  }, [router]);

  const trackView = useCallback(async () => {
    if (animationId) {
      try {
        await fetch('/api/animations/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ animationId })
        });
      } catch {}
    }
  }, [animationId]);

  const toggleSave = useCallback(async (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (pendingRef.current || library?.pendingIds.has(animationId)) return false;
    if (!animationId) {
      signIn();
      return false;
    }
    if (library && !library.beginSave(animationId)) return false;

    const previous = savedRef.current;
    const next = !previous;
    pendingRef.current = true;
    savedRef.current = next;
    setIsSaved(next);
    setIsLoading(true);
    library?.onSaveChange(animationId, next, true);

    let succeeded = false;
    try {
      // The endpoint verifies the session and derives user_id on the server.
      const response = await fetch('/api/animations/save', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animationId })
      });
      if (response.status === 401) {
        signIn();
      } else if (!response.ok) {
        throw Error('Save request failed');
      } else {
        const result = await response.json();
        if (result?.success !== true) throw Error('Invalid save response');
        succeeded = true;
      }
    } catch {
      toast.error('Unable to update saved animations. Please try again.');
    } finally {
      if (!succeeded) {
        savedRef.current = previous;
        setIsSaved(previous);
      }
      library?.onSaveChange(animationId, succeeded ? next : previous, false);
      library?.finishSave(animationId);
      pendingRef.current = false;
      setIsLoading(false);
    }

    if (succeeded) {
      toast.success(next ? 'Animation saved!' : 'Animation removed from saved');
      try {
        const track = next ? analytics.animation.saved : analytics.animation.unsaved;
        track(animationId, initialAnimation?.title || 'Unknown', initialAnimation?.category || 'Unknown');
        if (next) {
          void serverEvents.animationSaved(
            animationId,
            initialAnimation?.title || 'Unknown',
            initialAnimation?.category || 'Unknown'
          );
        }
      } catch {
        console.warn('Unable to track the saved animation change.');
      }
      router.refresh();
    }
    return succeeded;
  }, [animationId, initialAnimation, library, router, signIn]);

  return {
    isSaved,
    isLoading: isLoading || Boolean(library?.pendingIds.has(animationId)),
    user,
    trackView,
    toggleSave
  };
}
