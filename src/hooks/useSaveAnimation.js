'use client';

// Variable Mapping: f -> useSaveAnimation, e -> animationId, t -> initialIsSaved, n -> initialAnimation, r -> isSaved, i -> setIsSaved, s -> isLoading, l -> setIsLoading, h -> user, x -> setUser, p -> animationData, g -> setAnimationData, b -> router, v -> trackView, y -> toggleSave

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner'; // NOTE: module id: 846696
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { createClient } from '@/libs/supabase/client'; // NOTE: module id: 416983
import { serverEvents } from '@/libs/utils/events'; // NOTE: module id: 185161
import { useTransitionRouter as useTransitionRouterProviderTransition } from '@/contexts/TransitionRouterProvider'; // NOTE: module id: 676040

// NOTE: module id: 488843
export function useSaveAnimation(
  animationId,
  initialIsSaved = false,
  initialAnimation = null
) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [animationData, setAnimationData] = useState(initialAnimation);
  const router = useTransitionRouterProviderTransition();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();
      setUser(currentUser);
      if (animationId && !initialAnimation) {
        const { data } = await supabase
          .from('animations')
          .select('id, title, slug, category')
          .eq('id', animationId)
          .single();
        if (data) setAnimationData(data);
      }
    })();
  }, [animationId, initialAnimation]);

  const trackView = useCallback(async () => {
    if (animationId) {
      try {
        (
          await fetch('/api/animations/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ animationId })
          })
        ).ok;
      } catch (error) {}
    }
  }, [animationId]);

  const toggleSave = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (!user) {
        toast.error('Please sign in to save animations');
        router.push('/login');
        return;
      }
      if (!isLoading) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/animations/save', {
            method: isSaved ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ animationId })
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw Error(errorData.error || 'Failed to save animation');
          }
          setIsSaved(!isSaved);
          if (isSaved) {
            analytics.animation.unsaved(
              animationId,
              animationData?.title || 'Unknown',
              animationData?.category || 'Unknown'
            );
            toast.success('Animation removed from saved');
          } else {
            analytics.animation.saved(
              animationId,
              animationData?.title || 'Unknown',
              animationData?.category || 'Unknown'
            );
            serverEvents.animationSaved(
              animationId,
              animationData?.title || 'Unknown',
              animationData?.category || 'Unknown'
            );
            toast.success('Animation saved!');
          }
          router.refresh();
        } catch (error) {
          console.error('Error toggling save:', error);
          toast.error(error.message || 'Something went wrong');
        } finally {
          setIsLoading(false);
        }
      }
    },
    [animationId, isSaved, isLoading, user, router]
  );

  return {
    isSaved,
    isLoading,
    user,
    trackView,
    toggleSave
  };
}

