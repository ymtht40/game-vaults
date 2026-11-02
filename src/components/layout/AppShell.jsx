'use client';

// Variable Mapping: eh -> isShellMounted, default -> AppShell?, e -> children, s -> isMounted, o -> setIsMounted, c -> authTimedOut, d -> setAuthTimedOut, u -> scrollerRef, f -> isScrollerReady, m -> setIsScrollerReady, h -> handleScrollerReady, p -> pathname, g -> routeConfig, x -> edgeToEdge, b -> hasSidebar, v -> movesTransitionContent, y -> isE2eTestingMode, A -> setIsE2eTestingMode, E -> addReadyGate, M -> hasAddedReadyGateRef, _ -> releaseReadyGateRef, S -> releaseReadyGate, C -> isAuthResolved, N -> isShellReady, (watchdog effect) e -> timeoutId

import { useCallback, useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495

// import '@/lib/sideEffects'; // NOTE: module id: 627731
import { getRouteConfig, getRouteGroup } from '@/libs/config/routeConfig'; // NOTE: module id: 107255
import SidebarMobileTrigger from '@/features/sidebar/SidebarMobileTrigger';
import Sidebar from '@/features/sidebar/Sidebar'; // NOTE: module id: 187797
import UserProfileDropdown from '@/features/sidebar/UserProfileDropdown'; // NOTE: module id: 490620
import LenisProvider from '@/contexts/LenisProvider'; // NOTE: module id: 776017
import SidebarProvider from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import Header from '@/components/layout/Header'; // NOTE: module id: 76624
import Footer from '@/components/layout/Footer'; // NOTE: module id: 297428

import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220
import { useAnimation } from '@/contexts/AnimationProvider'; // NOTE: module id: 488463

import { OnboardingProvider } from '@/contexts/OnboardingProvider'; // NOTE: module id: 92451
import AnnouncementHost from '@/components/announcements/AnnouncementHost';
import LoadingScreen from '@/components/layout/LoadingScreen';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';
import ScrollerSync from '@/components/layout/ScrollerSync';
import SidebarNav from '@/components/navigation/SidebarNav';

gsap.registerPlugin(ScrollTrigger);

let isShellMounted = false;

// Register the auth watchdog only in the browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (!isShellMounted) {
      try {
        if (!sessionStorage.getItem('anm-auth-watchdog')) {
          sessionStorage.setItem('anm-auth-watchdog', '1');
          window.location.reload();
        }
      } catch {}
    }
  }, 1e4);
}

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
    const timeoutId = setTimeout(() => {
      try {
        if (!sessionStorage.getItem('anm-auth-watchdog')) {
          sessionStorage.setItem('anm-auth-watchdog', '1');
          window.location.reload();
          return;
        }
      } catch {}
      setAuthTimedOut(true);
    }, 8e3);
    return () => clearTimeout(timeoutId);
  }, [loading]);

  const scrollerRef = useRef(null);
  const [isScrollerReady, setIsScrollerReady] = useState(false);
  const handleScrollerReady = useCallback(() => setIsScrollerReady(true), []);
  const pathname = usePathname();
  const routeConfig = getRouteConfig(pathname);
  // Marketing, auth and standalone pages are always public (this also covers /_not-found)
  const isPublicRoute =
    routeConfig.public ||
    ['marketing', 'auth', 'standalone'].includes(getRouteGroup(pathname));
  // /login renders its own BrandLogo, so the global Header would duplicate it
  const hidesGlobalHeader = pathname === '/login' || pathname?.startsWith('/login/');
  const edgeToEdge = routeConfig.edgeToEdge;
  const hasSidebar = routeConfig.sidebar;
  const movesTransitionContent = hasSidebar || routeConfig.movesTransitionContent;
  const [isE2eTestingMode, setIsE2eTestingMode] = useState(false);

  useEffect(() => {
    setIsE2eTestingMode(localStorage.getItem('e2e-testing-mode') === 'true');
  }, []);

  useEffect(() => {
    setIsMounted(true);
    isShellMounted = true;
  }, []);

  const { addReadyGate } = useAnimation();
  const hasAddedReadyGateRef = useRef(false);
  const releaseReadyGateRef = useRef(null);
  if (!hasAddedReadyGateRef.current) {
    hasAddedReadyGateRef.current = true;
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
    (isMounted && isAuthResolved && (user || isE2eTestingMode) && isScrollerReady);

  useEffect(() => {
    if (isShellReady) releaseReadyGate();
  }, [isShellReady, releaseReadyGate]);

  // Redirect unauthenticated visitors away from private routes (client-side only)
  const shouldRedirectHome =
    isAuthResolved && !user && !isE2eTestingMode && !isPublicRoute;

  useEffect(() => {
    if (shouldRedirectHome) {
      window.location.href = '/';
    }
  }, [shouldRedirectHome]);

  if (!isAuthResolved) return <LoadingScreen type="app" />;

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
                edgeToEdge
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

  if (isPublicRoute) {
    return (
      <LenisProvider>
        <div className="v2-marketing">
          {hidesGlobalHeader ? null : <Header />}
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
  // Show a loading screen while the effect above performs the redirect
  return <LoadingScreen type="app" />;
}
