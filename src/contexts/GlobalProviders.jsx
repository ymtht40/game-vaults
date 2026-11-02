'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTransitionRouter } from '@/contexts/TransitionRouterProvider'; // NOTE: module id: 618566
import { Toaster, toast } from 'sonner'; // NOTE: module id: 846696
import { Tooltip } from 'react-tooltip'; // NOTE: module id: 830380
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { useAnimation, usePageEnterAnimation } from '@/contexts/AnimationProvider'; // NOTE: module id: 488463
import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220
import { trackAttribution, getAttributionData } from '@/libs/analytics/analytics'; // NOTE: module id: 746374
import { IconContext } from '@phosphor-icons/react'; // NOTE: module id: 207867

const ToasterContainer = ({ ...props }) => (
  <div data-theme="dark">
    <Toaster
      theme="dark"
      position="bottom-center"
      gap={8}
      toastOptions={{
        duration: 3000,
        unstyled: true,
        classNames: {
          toast: cn(
            'flex w-fit min-h-48 max-w-[90vw] items-center gap-12',
            'border border-foreground/10 bg-surface px-16 py-12',
            'text-foreground shadow-[0_8px_40px_rgba(0,0,0,0.45)]'
          ),
          title: 'text-body-sm font-medium text-foreground',
          description: 'text-body-sm mt-4 text-foreground-muted',
          actionButton: cn(
            'text-body-sm font-medium shrink-0 bg-foreground px-10 py-6 text-background',
            'transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90'
          ),
          cancelButton: cn(
            'text-body-sm font-medium shrink-0 border border-foreground/15 px-10 py-6 text-foreground-muted',
            'transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-foreground/5 hover:text-foreground'
          ),
          closeButton: cn(
            '!border-0 !bg-transparent !shadow-none text-foreground-muted',
            'transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
            'hover:!bg-transparent hover:text-foreground'
          ),
          icon: 'mr-2 shrink-0',
          success: '[&_[data-icon]]:text-brand',
          error: '[&_[data-icon]]:text-red-400',
          warning: '[&_[data-icon]]:text-amber-400',
          info: '[&_[data-icon]]:text-foreground',
          loading: '[&_[data-icon]]:text-foreground-muted',
        },
      }}
      expand={false}
      closeButton={true}
      {...props}
    />
  </div>
);

function DevGridOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'g') {
        event.preventDefault();
        setIsVisible((prev) => {
          setDirection(prev ? 'out' : 'in');
          return !prev;
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (direction !== 'out') return;
    const timer = setTimeout(() => setDirection(null), 1830);
    return () => clearTimeout(timer);
  }, [direction]);

  const isHidden = !isVisible && direction !== 'out';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ visibility: isHidden ? 'hidden' : 'visible' }}
      aria-hidden="true"
    >
      <div className="v2-container h-full">
        <div className="grid grid-cols-12 gap-16 h-full">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="h-full origin-top"
              style={{
                background: 'color-mix(in srgb, var(--brand) 10%, transparent)',
                transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                transitionProperty: 'transform',
                transitionDuration: '1500ms',
                transitionTimingFunction: 'var(--ease-power3-in-out)',
                transitionDelay: `${30 * index}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AttributionTracker() {
  const { user, profile } = useUser(); // NOTE: module id: 201220
  const hasBackfilled = useRef(false);

  useEffect(() => {
    trackAttribution(); // NOTE: module id: 746374
  }, []);

  useEffect(() => {
    if (!user || !profile || hasBackfilled.current || profile.ft_at || profile.ft_channel) return;

    const createdAtTime = profile.created_at ? new Date(profile.created_at).getTime() : 0;
    if (!createdAtTime || Date.now() - createdAtTime > 6048e5) return;

    hasBackfilled.current = true;
    fetch('/api/attribution/backfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getAttributionData()), // NOTE: module id: 746374
    }).catch(() => {});
  }, [user, profile]);

  return null;
}

const SUBSCRIPTION_MESSAGES = {
  newsletter: {
    title: "You're in. Welcome to the Annnimate newsletter.",
    description: "Expect one short email when there's something worth saying.",
  },
  kits: {
    title: "You're on the list.",
    description: "We'll let you know the moment the next Kit ships.",
  },
};

function SubscriptionHandler() {
  const searchParams = useSearchParams(); // NOTE: module id: 618566
  const pathname = usePathname(); // NOTE: module id: 618566
  const router = useTransitionRouter(); // NOTE: module id: 618566
  const subscribed = searchParams?.get('subscribed') || null;
  const isHandled = useRef(false);

  usePageEnterAnimation(
    () => {
      if (!subscribed || isHandled.current) return;
      const config = SUBSCRIPTION_MESSAGES[subscribed];
      if (!config) return;

      isHandled.current = true;
      toast.success(config.title, {
        description: config.description,
        duration: 8000,
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete('subscribed');
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [subscribed, pathname],
    'subscription-confirmed-toast',
    Boolean(subscribed)
  );

  return null;
}

function SubscriptionNotifier() {
  return (
    <Suspense fallback={null}>
      <SubscriptionHandler />
    </Suspense>
  );
}

const iconContextValue = { weight: 'fill' };

// NOTE: module id: 830380
export default function GlobalProviders({ children }) {
  return (
    <IconContext.Provider value={iconContextValue}>
      {children}
      <AttributionTracker />
      <DevGridOverlay />
      <ToasterContainer />
      <Suspense fallback={null}>
        <SubscriptionNotifier />
      </Suspense>
      <Tooltip id="tooltip" className="z-[60] !opacity-100 max-w-sm shadow-lg" />
    </IconContext.Provider>
  );
}
