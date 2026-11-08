'use client';

/* Variable Mapping:
 * eh -> hasMountedAppShell, e -> children, n -> user, l -> profile,
 * i -> loading, s -> isMounted, o -> setIsMounted, c -> authTimedOut,
 * d -> setAuthTimedOut, u -> scrollerRef, f -> scrollerReady,
 * m -> setScrollerReady, h -> handleScrollerReady, p -> pathname,
 * g -> routeConfig, x -> isEdgeToEdge, b -> hasSidebar,
 * v -> movesTransitionContent, y -> isE2eTestingMode, A -> setIsE2eTestingMode,
 * E -> addReadyGate, M -> gateRegisteredRef, _ -> releaseReadyGateRef,
 * S -> releaseReadyGate, C -> isAuthResolved, N -> isShellReady
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@/libs/auth/authHashErrorHandler'; // NOTE: module id: 627731 // UNRESOLVED: side-effect import guessed from tree
import { getRouteConfig } from '@/libs/config/routeConfig'; // NOTE: module id: 107255 // UNRESOLVED: name guessed from usage
import { AnnouncementHost } from '@/components/announcements/AnnouncementHost'; // NOTE: module id: 583246
import Footer from '@/components/footer/Footer'; // NOTE: module id: 297428
import Header from '@/components/header/Header'; // NOTE: module id: 76624
import { LoadingScreen } from '@/components/layout/LoadingScreen'; // NOTE: module id: 583246
import { ScrollerSync } from '@/components/layout/ScrollerSync'; // NOTE: module id: 583246
import { SidebarNav } from '@/components/navigation/SidebarNav'; // NOTE: module id: 583246
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'; // NOTE: module id: 583246
import { useAnimation } from '@/contexts/AnimationProvider'; // NOTE: module id: 488463
import LenisProvider from '@/contexts/LenisProvider'; // NOTE: module id: 776017
import { OnboardingProvider } from '@/contexts/OnboardingProvider'; // NOTE: module id: 92451
import SidebarProvider from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220
import Sidebar from '@/features/sidebar/Sidebar'; // NOTE: module id: 187797
import SidebarMobileTrigger from '@/features/sidebar/SidebarMobileTrigger'; // NOTE: module id: 977303
import UserProfileDropdown from '@/features/sidebar/UserProfileDropdown'; // NOTE: module id: 490620

gsap.registerPlugin(ScrollTrigger);

let hasMountedAppShell = false;

setTimeout(() => {
  if (!hasMountedAppShell) {
    try {
      if (!sessionStorage.getItem('anm-auth-watchdog')) {
        sessionStorage.setItem('anm-auth-watchdog', '1');
        window.location.reload();
      }
    } catch {}
  }
}, 10000);

// NOTE: module id: 583246
export default function AppShell({ children }) {
  const { user, profile, loading } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      try {
        sessionStorage.removeItem('anm-auth-watchdog');
      } catch {}
      return;
    }

    const timerId = setTimeout(() => {
      try {
        if (!sessionStorage.getItem('anm-auth-watchdog')) {
          sessionStorage.setItem('anm-auth-watchdog', '1');
          window.location.reload();
          return;
        }
      } catch {}
      setAuthTimedOut(true);
    }, 8000);

    return () => clearTimeout(timerId);
  }, [loading]);

  const scrollerRef = useRef(null);
  const [scrollerReady, setScrollerReady] = useState(false);
  const handleScrollerReady = useCallback(() => setScrollerReady(true), []);

  const pathname = usePathname();
  const routeConfig = getRouteConfig(pathname);
  const isEdgeToEdge = routeConfig.edgeToEdge;
  const hasSidebar = routeConfig.sidebar;
  const movesTransitionContent = hasSidebar || routeConfig.movesTransitionContent;

  const [isE2eTestingMode, setIsE2eTestingMode] = useState(false);

  useEffect(() => {
    setIsE2eTestingMode(localStorage.getItem('e2e-testing-mode') === 'true');
  }, []);

  useEffect(() => {
    setIsMounted(true);
    hasMountedAppShell = true;
  }, []);

  const { addReadyGate } = useAnimation();
  const gateRegisteredRef = useRef(false);
  const releaseReadyGateRef = useRef(null);

  if (!gateRegisteredRef.current) {
    gateRegisteredRef.current = true;
    releaseReadyGateRef.current = addReadyGate('app-shell');
  }

  const releaseReadyGate = useCallback(() => {
    releaseReadyGateRef.current?.();
    releaseReadyGateRef.current = null;
  }, []);

  useEffect(() => () => releaseReadyGate(), [releaseReadyGate]);

  const isAuthResolved = !loading || authTimedOut;
  const isShellReady =
    (isMounted && isAuthResolved && !user && !isE2eTestingMode) ||
    (isMounted && isAuthResolved && (user || isE2eTestingMode) && scrollerReady);

  useEffect(() => {
    if (isShellReady) {
      releaseReadyGate();
    }
  }, [isShellReady, releaseReadyGate]);

  if (!isAuthResolved) {
    return <LoadingScreen type="app" />;
  }

  if (user || isE2eTestingMode) {
    return (
      <SidebarProvider>
        <OnboardingProvider>
          <div className="flex h-screen bg-background relative">
            <Sidebar
              footer={
                profile ? (
                  <UserProfileDropdown
                    user={{
                      name: profile.name || profile.email,
                      email: profile.email,
                      avatar: profile.avatar_url,
                    }}
                  />
                ) : null
              }
            >
              <SidebarNav />
            </Sidebar>
            <SidebarMobileTrigger />
            <div
              ref={scrollerRef}
              className={
                isEdgeToEdge
                  ? 'flex-1 overflow-auto relative z-10 bg-secondary'
                  : 'flex-1 overflow-auto relative z-10 p-16'
              }
              data-transition-content={movesTransitionContent ? undefined : ''}
            >
              <ScrollerSync scrollerRef={scrollerRef} onReady={handleScrollerReady} />
              <div className="min-h-full has-[.ai-page-wrapper]:h-full has-[.ai-page-wrapper]:min-h-0">
                {children}
              </div>
            </div>
          </div>
          <OnboardingChecklist />
          <AnnouncementHost />
        </OnboardingProvider>
      </SidebarProvider>
    );
  }

  if (routeConfig.public) {
    return (
      <LenisProvider>
        <div className="v2-marketing">
          <Header />
          <main
            className={
              hasSidebar
                ? 'flex-1 relative z-[2] bg-background pt-[calc(var(--v2-header-h)+var(--v2-header-gap))]'
                : 'flex-1 pt-0 relative z-[2] bg-background'
            }
            data-theme={hasSidebar ? 'dark' : undefined}
            data-anon-app-shell=""
            data-anon-sidebar-chrome=""
            data-transition-content={movesTransitionContent ? undefined : ''}
          >
            {children}
          </main>
          <Footer />
        </div>
      </LenisProvider>
    );
  }

  window.location.href = '/';
  return <LoadingScreen type="app" />;
}