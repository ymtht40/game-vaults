'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isLaunchPromoActive } from '@/libs/data/stripe-prices'; // NOTE: module id: 825740 // UNRESOLVED: export name guessed from usage
import { isRouteActive } from '@/libs/config/isRouteActive'; // NOTE: module id: 76624
import { createClient } from '@/libs/supabase/client'; // NOTE: module id: 416983
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { formatImageUrll as formatImageUrl } from '@/libs/utils/formatImageUrl'; // NOTE: module id: 632021
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { gsap } from '@/libs/utils/vendor'; // NOTE: module id: 989970
import { BrandLogo } from '@/assets/logos/BrandLogo'; // NOTE: module id: 635566 // UNRESOLVED: export name guessed from usage
import NavSurface, { NAV_SURFACE } from '@/components/navigation/NavSurface'; // NOTE: module id: 520237
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { SlideText } from '@/components/ui/SlideText'; // NOTE: module id: 991642 // UNRESOLVED: export name guessed from usage
import { useCategories } from '@/contexts/CategoryProvider'; // NOTE: module id: 87207

import { useScramble } from '@/hooks/useScramble';
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // NOTE: module id: 995289 // UNRESOLVED: export name guessed from usage

function HeaderNavTrigger({
  item,
  href,
  badge,
  active,
  expanded,
  setRef,
  onMouseEnter,
  onClick,
}) {
  const handleClick = useTransitionLinkClick(href || '', {
    onClick,
  });

  return (
    <Link
      href={href || '#'}
      ref={setRef}
      aria-expanded={expanded || false}
      aria-haspopup="true"
      onMouseEnter={onMouseEnter}
      onClick={handleClick}
      data-active={expanded ? 'true' : undefined}
      className={cn(
        'group text-mono relative flex h-full cursor-pointer items-center justify-center text-center',
        'transition-[transform,color] duration-(--duration-quick) ease-(--ease-back-out)',
        'hover:scale-[0.95] data-[active=true]:scale-[0.95]',
        active || expanded
          ? 'text-foreground'
          : 'text-foreground-muted hover:text-foreground'
      )}
    >
      <span className={NAV_SURFACE}>
        <SlideText>{item.label}</SlideText>
        {badge ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-6 left-[calc(100%-12px)] -translate-y-full text-accent-2xs text-brand whitespace-nowrap"
          >
            {badge}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function MobileMegaAccordion({ item, expanded, onToggle }) {
  const iconRef = useRef(null);
  const verticalLineRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const { ref: labelRef, scramble } = useScramble({
    duration: 0.5,
    firstColorClass: 'scramble-brand',
    secondColorClass: 'scramble-inherit',
  });

  useEffect(() => {
    gsap.to(iconRef.current, {
      rotation: expanded ? -180 : 0,
      duration: 0.6,
      ease: 'power3.inOut',
    });
    gsap.to(verticalLineRef.current, {
      opacity: +!expanded,
      duration: 0.35,
      ease: 'power3.inOut',
    });
    if (!isFirstRenderRef.current && expanded) {
      scramble();
    }
    isFirstRenderRef.current = false;
  }, [expanded, scramble]);

  return (
    <div className="border-b border-border-muted">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className={cn(
          'text-h4 flex w-full items-center justify-between py-16 text-foreground transition-colors duration-200'
        )}
      >
        <span ref={labelRef}>{item.label}</span>
        <svg
          ref={iconRef}
          className="size-14 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            ref={verticalLineRef}
            d="M8 1V15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          <path
            d="M1 8H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>
      <div className="v2-mm-collapse" data-open={expanded} inert={!expanded}>
        <div>
          <div className="flex flex-col pb-16">
            {item.mega.columns.flatMap((column) =>
              column.links.map((link) => (
                <TransitionLink
                  key={link.label}
                  href={link.href}
                  className="text-body py-8 text-foreground-muted hover:text-foreground"
                >
                  {link.label}
                  {link.badge ? (
                    <span className="text-accent-2xs ml-8 inline-block bg-brand px-6 py-2 align-middle text-black">
                      {link.badge}
                    </span>
                  ) : null}
                </TransitionLink>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const MARQUEE_ITEMS = [
  {
    label: t('common.header.marquee.label'),
    href: '/pricing',
    offer: true,
  },
  {
    label: t('common.header.marquee.labelMenuKit'),
    href: '/kits/menu',
    square: true,
  },
];

function HeaderMarquee({ scrolled = false, shiftY = 0 }) {
  const trackRef = useRef(null);
  const animStateRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl || typeof ResizeObserver === 'undefined') return;
    const rootEl = document.documentElement;
    const updateHeightVar = () =>
      rootEl.style.setProperty(
        '--anm-marquee-h',
        `${containerEl.offsetHeight}px`
      );
    updateHeightVar();
    const observer = new ResizeObserver(updateHeightVar);
    observer.observe(containerEl);
    return () => {
      observer.disconnect();
      rootEl.style.removeProperty('--anm-marquee-h');
    };
  }, []);

  useEffect(() => {
    const trackEl = trackRef.current;
    if (
      !trackEl ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const getKeyframes = () => [
      { transform: 'translateX(0px)' },
      { transform: `translateX(${-trackEl.scrollWidth / 2}px)` },
    ];
    const anim = trackEl.animate(getKeyframes(), {
      duration: 150000,
      iterations: Infinity,
      easing: 'linear',
    });
    const observer = new ResizeObserver(() =>
      anim.effect.setKeyframes(getKeyframes())
    );
    observer.observe(trackEl);
    animStateRef.current = {
      anim,
      rate: 1,
    };
    return () => {
      observer.disconnect();
      gsap.killTweensOf(animStateRef.current);
      anim.cancel();
      animStateRef.current = null;
    };
  }, []);

  const scrolledRef = useRef(scrolled);
  const isIntersectingRef = useRef(true);
  const syncPlayState = () => {
    const anim = animStateRef.current?.anim;
    if (anim) {
      if (scrolledRef.current && isIntersectingRef.current) {
        anim.play();
      } else {
        anim.pause();
      }
    }
  };

  useEffect(() => {
    scrolledRef.current = scrolled;
    syncPlayState();
  }, [scrolled]);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const observer = new IntersectionObserver(([entry]) => {
      isIntersectingRef.current = entry.isIntersecting;
      syncPlayState();
    });
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, []);

  const tweenPlaybackRate = (targetRate) => {
    const state = animStateRef.current;
    if (state) {
      gsap.to(state, {
        rate: targetRate,
        duration: targetRate === 0 ? 0.6 : 0.9,
        ease: 'power3.out',
        overwrite: true,
        onUpdate: () => {
          state.anim.playbackRate = state.rate;
        },
      });
    }
  };

  return (
    <div
      data-visible={scrolled}
      aria-hidden={!scrolled}
      className="invisible absolute inset-x-0 top-full z-[290] hidden opacity-0 transition-[opacity,visibility] duration-(--duration-quick) ease-(--ease-power3-out) data-[visible=true]:visible data-[visible=true]:opacity-100 lg:block"
    >
      <div
        style={{ transform: `translateY(${shiftY}px)` }}
        className="transition-transform duration-(--duration-snap) ease-(--ease-expo-out)"
      >
        <div className="mx-auto w-[calc(100%-2*var(--v2-header-pad,0px))] max-w-[calc(var(--v2-max,1920px)-2*var(--v2-header-pad,0px))] transition-[width,max-width] duration-(--duration-quick) ease-(--ease-power3-out)">
          <div
            ref={containerRef}
            onMouseEnter={() => tweenPlaybackRate(0)}
            onMouseLeave={() => tweenPlaybackRate(1)}
            className="overflow-hidden border-y border-foreground/10 bg-background-muted text-foreground"
          >
            <div ref={trackRef} className="flex w-max items-center">
              {Array.from({ length: 20 }).map((_, repeatIdx) => {
                const isFirstRepeat = repeatIdx === 0;
                return (
                  <Fragment key={repeatIdx}>
                    {MARQUEE_ITEMS.filter(
                      (item) => !item.offer || isLaunchPromoActive()
                    ).map((item, itemIdx) => (
                      <Fragment key={itemIdx}>
                        <TransitionLink
                          href={item.href}
                          aria-hidden={!isFirstRepeat || undefined}
                          tabIndex={isFirstRepeat ? undefined : -1}
                          className="text-mono-sm inline-flex items-center gap-10 whitespace-nowrap px-32 py-8 transition-colors duration-(--duration-quick) hover:text-brand"
                        >
                          {item.square ? (
                            <span
                              aria-hidden="true"
                              className="size-8 shrink-0 bg-brand"
                            />
                          ) : null}
                          {item.label}
                        </TransitionLink>
                        <span
                          aria-hidden="true"
                          className="size-3 shrink-0 rounded-full bg-foreground/30"
                        />
                      </Fragment>
                    ))}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HEADER_NAV_ITEMS = [
  {
    key: 'library',
    label: t('common.header.nav.library.label'),
    triggerHref: '/animations',
    mega: {
      intro: {
        heading: t('common.header.nav.library.intro.heading'),
        text: t('common.header.nav.library.intro.text'),
        cta: {
          label: t('common.header.nav.library.intro.ctaLabel'),
          href: '/animations',
        },
      },
      columns: [
        {
          label: t('common.header.nav.library.columns.byCategory'),
          dynamic: 'categories',
          links: [],
        },
        {
          label: t('common.header.nav.library.columns.collections'),
          links: [
            {
              label: t('common.header.nav.library.links.allComponents'),
              href: '/animations',
            },
            {
              label: t('common.header.nav.library.links.mostPopular'),
              href: '/animations?sort=hot',
            },
            {
              label: t('common.header.nav.library.links.saved'),
              href: '/animations/saved',
            },
            {
              label: t('common.header.nav.library.links.showcase'),
              href: '/showcase',
            },
          ],
        },
      ],
    },
  },
  {
    key: 'kits',
    label: t('common.header.nav.kits.label'),
    triggerHref: '/kits',
    badge: t('common.header.nav.kits.badge'),
    mega: {
      intro: {
        heading: t('common.header.nav.kits.intro.heading'),
        text: t('common.header.nav.kits.intro.text'),
        cta: {
          label: t('common.header.nav.kits.intro.ctaLabel'),
          href: '/kits/menu',
        },
      },
      columns: [
        {
          label: t('common.header.nav.kits.columns.theKits'),
          links: [
            {
              label: t('common.header.nav.kits.links.revealKit'),
              href: '/kits/reveal',
            },
            {
              label: t('common.header.nav.kits.links.menuKit'),
              href: '/kits/menu',
              badge: 'New',
            },
          ],
        },
        {
          label: t('common.header.nav.kits.columns.learn'),
          links: [
            {
              label: t('common.header.nav.kits.links.whatAKitIs'),
              href: '/kits',
            },
          ],
        },
        {
          label: t('common.header.nav.kits.columns.stayClose'),
          links: [
            {
              label: t('common.header.nav.kits.links.roadmap'),
              href: '/roadmap',
            },
            {
              label: t('common.header.nav.kits.links.pricing'),
              href: '/pricing',
            },
          ],
        },
      ],
      featured: {
        title: t('common.header.nav.kits.featured.title'),
        href: '/kits/menu',
        image: {
          jpg: 'https://annnimate.b-cdn.net/video-thumbnails/kits/menu/preview-index/preview-index.gif',
          alt: t('common.header.nav.kits.featured.imageAlt'),
        },
      },
    },
  },
  {
    key: 'learn',
    label: t('common.header.nav.learn.label'),
    triggerHref: '/learn',
    mega: {
      intro: {
        heading: t('common.header.nav.learn.intro.heading'),
        text: t('common.header.nav.learn.intro.text'),
        cta: {
          label: t('common.header.nav.learn.intro.ctaLabel'),
          href: '/learn',
        },
      },
      columns: [
        {
          label: t('common.header.nav.learn.columns.concepts'),
          links: [
            {
              label: t('common.header.nav.learn.links.easing'),
              href: '/learn/easing',
            },
            {
              label: t('common.header.nav.learn.links.scroll'),
              href: '/learn/scroll',
            },
            {
              label: t('common.header.nav.learn.links.timeline'),
              href: '/learn/timeline',
            },
            {
              label: t('common.header.nav.learn.links.text'),
              href: '/learn/text',
            },
            {
              label: t('common.header.nav.learn.links.react'),
              href: '/learn/react',
            },
            {
              label: t('common.header.nav.learn.links.performance'),
              href: '/learn/performance',
            },
            {
              label: t('common.header.nav.learn.links.plugins'),
              href: '/learn/plugins',
            },
          ],
        },
        {
          label: t('common.header.nav.learn.columns.explore'),
          links: [
            {
              label: t('common.header.nav.learn.links.patterns'),
              href: '/patterns',
            },
            {
              label: t('common.header.nav.learn.links.freeTools'),
              href: '/tools',
            },
            {
              label: t('common.header.nav.learn.links.comparisons'),
              href: '/compare',
            },
          ],
        },
      ],
    },
  },
  {
    key: 'docs',
    label: t('common.header.nav.docs.label'),
    href: '/docs',
  },
  {
    key: 'pricing',
    label: t('common.header.nav.pricing.label'),
    href: '/pricing',
  },
];

const VALID_THEMES = ['light', 'dark', 'brand'];

function useHeaderAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();
        if (error || !authUser) {
          setUser(null);
          return;
        }
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setUser({
          id: authUser.id,
          email: authUser.email,
          name:
            profile?.name ||
            profile?.display_name ||
            authUser.email?.split('@')[0] ||
            'User',
          avatarUrl: profile?.avatar_url,
          avatarIndex: profile?.avatar_index || 0,
          subscriptionStatus: profile?.subscription_status || 'free',
          hasAccess: profile?.has_access || false,
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    hasAccess: !loading && (user?.hasAccess || false),
    isAuthenticated: !loading && !!user,
  };
}

function useHeaderScrollAndTheme(barRef) {
  const pathname = usePathname();
  const [scrollState, setScrollState] = useState('top');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState('dark');
  const didLockScrollRef = useRef(false);

  const detectThemeAtOffset = useCallback((offsetY) => {
    const sections = document.querySelectorAll('main [data-theme]');
    if (sections.length === 0) return;
    const activeSection = Array.from(sections).find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= offsetY && rect.bottom > offsetY;
    });
    const theme = (activeSection ?? sections[0])?.dataset.theme;
    if (theme && VALID_THEMES.includes(theme)) {
      setHeaderTheme(theme);
    }
  }, []);

  const isTransitioningRef = useRef(false);

  useEffect(() => {
    let timeoutId = 0;
    const handleTransition = (event) => {
      isTransitioningRef.current = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        isTransitioningRef.current = false;
      }, 4000);
      setScrollState('top');
      const nextTheme = event.detail?.theme;
      if (nextTheme && VALID_THEMES.includes(nextTheme)) {
        setHeaderTheme(nextTheme);
      }
    };
    window.addEventListener('anm:transition', handleTransition);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('anm:transition', handleTransition);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!isTransitioningRef.current) {
        setScrollState(window.scrollY > 50 ? 'scrolled' : 'top');
        if (barRef.current) {
          detectThemeAtOffset(barRef.current.offsetTop);
        }
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [detectThemeAtOffset, barRef]);

  useEffect(() => {
    let isCancelled = false;
    isTransitioningRef.current = false;

    const syncHeader = () => {
      if (!isCancelled && barRef.current) {
        setScrollState(window.scrollY > 50 ? 'scrolled' : 'top');
        detectThemeAtOffset(barRef.current.offsetTop);
      }
    };

    const headerEl = barRef.current?.closest('.v2-header');
    headerEl?.classList.add('no-transition');
    syncHeader();

    const rafId = requestAnimationFrame(() => {
      syncHeader();
      requestAnimationFrame(() => headerEl?.classList.remove('no-transition'));
    });

    const observer = new MutationObserver(syncHeader);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const disconnectTimer = setTimeout(() => observer.disconnect(), 800);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      clearTimeout(disconnectTimer);
      headerEl?.classList.remove('no-transition');
    };
  }, [pathname, detectThemeAtOffset, barRef]);

  const headerState = useMemo(
    () => (isMenuOpen ? 'menuOpen' : scrollState),
    [isMenuOpen, scrollState]
  );
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.classList.add('v2-scroll-locked');
      window.lenis?.stop?.();
      didLockScrollRef.current = true;
    } else if (didLockScrollRef.current) {
      document.documentElement.classList.remove('v2-scroll-locked');
      window.lenis?.start?.();
      didLockScrollRef.current = false;
    }
  }, [isMenuOpen]);

  return {
    scrollState,
    isMenuOpen,
    headerState,
    headerTheme,
    toggleMenu,
    closeMenu,
  };
}

// NOTE: module id: 76624
export default function Header({ latestAnimation }) {
  const pathname = usePathname();
  const isStarterPackPage =
    pathname === '/starter-pack' || pathname === '/v3/starter-pack';
  const isV3Page = pathname === '/v3';

  const { hasAccess, isAuthenticated, loading } = useHeaderAuth();

  const headerRef = useRef(null);
  const barRef = useRef(null);
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownInnerRef = useRef(null);
  const scrimRef = useRef(null);
  const groupRefs = useRef({});
  const hoverTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const lastScrollYRef = useRef(0);

  const [activeMegaKey, setActiveMegaKey] = useState(null);
  const activeMegaKeyRef = useRef(null);
  activeMegaKeyRef.current = activeMegaKey;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedKey, setMobileExpandedKey] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [marqueeShiftY, setMarqueeShiftY] = useState(0);

  const { headerTheme, scrollState } = useHeaderScrollAndTheme(barRef);

  const padState =
    isDropdownOpen || isMobileMenuOpen
      ? 'open'
      : scrollState === 'scrolled'
        ? 'scrolled'
        : 'top';

  const hasSurfaceBg =
    scrollState === 'scrolled' || isMobileMenuOpen || isDropdownOpen;

  const categories = useCategories();

  const navItems = useMemo(() => {
    const categoryLinks = categories.map((category) => ({
      label: category.name,
      href: `/animations?category=${category.slug}`,
    }));

    return HEADER_NAV_ITEMS.map((item) =>
      item.mega?.columns
        ? {
            ...item,
            mega: {
              ...item.mega,
              columns: item.mega.columns.map((column) => {
                const resolvedColumn =
                  column.dynamic === 'categories'
                    ? { ...column, links: categoryLinks }
                    : column;
                return isAuthenticated
                  ? resolvedColumn
                  : {
                      ...resolvedColumn,
                      links: resolvedColumn.links.filter(
                        (link) => link.href !== '/animations/saved'
                      ),
                    };
              }),
            },
          }
        : item
    );
  }, [categories, isAuthenticated]);

  const megaNavItems = useMemo(
    () => navItems.filter((item) => item.mega),
    [navItems]
  );

  const prevMegaKeyRef = useRef(null);

  useLayoutEffect(() => {
    const prevKey = prevMegaKeyRef.current;
    if (prevKey === activeMegaKey) return;
    prevMegaKeyRef.current = activeMegaKey;

    const innerEl = dropdownInnerRef.current;
    const dropdownEl = dropdownRef.current;
    const scrimEl = scrimRef.current;
    if (!innerEl || !dropdownEl) return;

    const allRevealEls = [];
    megaNavItems.forEach((item) => {
      const groupEl = groupRefs.current[item.key];
      if (groupEl) {
        gsap.killTweensOf(groupEl);
        allRevealEls.push(...groupEl.querySelectorAll('[data-mm-reveal]'));
      }
    });
    gsap.killTweensOf([innerEl, scrimEl, ...allRevealEls]);

    if (activeMegaKey === null) {
      let didCloseEarly = false;
      const prevGroupEl = prevKey ? groupRefs.current[prevKey] : null;
      if (prevGroupEl) {
        gsap.to(prevGroupEl, {
          autoAlpha: 0,
          duration: 0.15,
          ease: 'power2.out',
        });
      }
      gsap.to(innerEl, {
        height: 0,
        duration: 0.3,
        ease: 'expo.out',
        onUpdate: function () {
          if (!didCloseEarly && this.ratio >= 0.9) {
            didCloseEarly = true;
            setIsDropdownOpen(false);
          }
        },
        onComplete: () => {
          gsap.set(dropdownEl, {
            visibility: 'hidden',
            pointerEvents: 'none',
          });
          megaNavItems.forEach((item) => {
            const groupEl = groupRefs.current[item.key];
            if (groupEl) {
              gsap.set(groupEl, {
                visibility: 'hidden',
                opacity: 0,
                x: 0,
                pointerEvents: 'none',
              });
            }
          });
          if (!didCloseEarly) {
            setIsDropdownOpen(false);
          }
        },
      });
      gsap.to(scrimEl, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'expo.out',
      });
      return;
    }

    const activeGroupEl = groupRefs.current[activeMegaKey];
    if (!activeGroupEl) return;

    const isOpeningFromClosed = prevKey === null;
    const prevGroupEl = isOpeningFromClosed ? null : groupRefs.current[prevKey];
    const direction =
      megaNavItems.findIndex((item) => item.key === activeMegaKey) >=
      megaNavItems.findIndex((item) => item.key === prevKey)
        ? 1
        : -1;

    setIsDropdownOpen(true);

    megaNavItems.forEach((item) => {
      const groupEl = groupRefs.current[item.key];
      if (!groupEl || groupEl === prevGroupEl) return;
      const isCurrent = item.key === activeMegaKey;
      gsap.set(groupEl, {
        visibility: isCurrent ? 'visible' : 'hidden',
        opacity: +!!isCurrent,
        x: 0,
        pointerEvents: isCurrent ? 'auto' : 'none',
      });
    });

    gsap.set(dropdownEl, {
      visibility: 'visible',
      pointerEvents: 'auto',
    });

    gsap.to(innerEl, {
      height: activeGroupEl.offsetHeight,
      duration: isOpeningFromClosed ? 0.45 : 0.4,
      ease: 'expo.out',
    });

    gsap.to(scrimEl, {
      autoAlpha: 1,
      duration: 0.4,
      ease: 'expo.out',
    });

    const revealTargets = activeGroupEl.querySelectorAll('[data-mm-reveal]');
    if (isOpeningFromClosed) {
      gsap.fromTo(
        revealTargets,
        {
          y: 16,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.45,
          ease: 'expo.out',
          stagger: 0.04,
          delay: 0.04,
        }
      );
    } else {
      if (prevGroupEl) {
        gsap.set(prevGroupEl, {
          pointerEvents: 'none',
        });
        gsap.to(prevGroupEl, {
          autoAlpha: 0,
          x: -(16 * direction),
          duration: 0.2,
          ease: 'power2.out',
        });
      }
      gsap.fromTo(
        revealTargets,
        {
          x: 24 * direction,
          autoAlpha: 0,
        },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: 'expo.out',
          stagger: 0.03,
          delay: 0.06,
        }
      );
    }
  }, [activeMegaKey, megaNavItems]);

  useEffect(() => {
    if (!activeMegaKey) {
      setMarqueeShiftY(0);
      return;
    }
    const rafId = requestAnimationFrame(() => {
      const activeGroupEl = groupRefs.current[activeMegaKey];
      setMarqueeShiftY(activeGroupEl ? activeGroupEl.offsetHeight : 0);
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeMegaKey]);

  const clearTimers = () => {
    clearTimeout(hoverTimerRef.current);
    clearTimeout(closeTimerRef.current);
  };

  const scheduleClose = () => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setActiveMegaKey(null), 100);
  };

  const pointerStateRef = useRef({
    x: 0,
    y: 0,
    t: 0,
    v: 0,
  });

  useEffect(() => {
    const handlePointerMove = (event) => {
      const state = pointerStateRef.current;
      const now = performance.now();
      const dt = now - state.t;
      const velocity =
        dt > 0 && dt < 100
          ? Math.hypot(event.clientX - state.x, event.clientY - state.y) / dt
          : 0;
      state.v = 0.5 * state.v + 0.5 * velocity;
      state.x = event.clientX;
      state.y = event.clientY;
      state.t = now;
    };
    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const runWhenPointerSettles = (callback, startTime = performance.now()) => {
    const state = pointerStateRef.current;
    const now = performance.now();
    if (now - state.t >= 45 || state.v < 0.35 || now - startTime >= 150) {
      callback();
    } else {
      hoverTimerRef.current = setTimeout(
        () => runWhenPointerSettles(callback, startTime),
        45
      );
    }
  };

  const handleNavEnter = (item) => {
    clearTimers();
    if (item.mega) {
      if (activeMegaKey !== item.key) {
        runWhenPointerSettles(() => setActiveMegaKey(item.key));
      }
    } else if (activeMegaKey) {
      runWhenPointerSettles(() => setActiveMegaKey(null));
    }
  };

  const [hasOpenedMega, setHasOpenedMega] = useState(false);

  useEffect(() => {
    if (activeMegaKey) {
      setHasOpenedMega(true);
    }
  }, [activeMegaKey]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveMegaKey(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setActiveMegaKey(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleTransition = () => {
      clearTimeout(hoverTimerRef.current);
      clearTimeout(closeTimerRef.current);
      setActiveMegaKey(null);
      setIsMobileMenuOpen(false);
      headerRef.current?.classList.remove('is-hidden');
      document.documentElement.classList.remove('v2-header-hidden');
      lastScrollYRef.current = 0;
    };
    window.addEventListener('anm:transition', handleTransition);
    return () => window.removeEventListener('anm:transition', handleTransition);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const headerEl = headerRef.current;
      if (!headerEl) return;
      const currentScrollY = window.scrollY;
      if (activeMegaKey) {
        setActiveMegaKey(null);
      }
      let shouldHide = false;
      if (!isMobileMenuOpen && currentScrollY > 120) {
        shouldHide = currentScrollY > lastScrollYRef.current;
        headerEl.classList.toggle('is-hidden', shouldHide);
      } else {
        headerEl.classList.remove('is-hidden');
      }
      document.documentElement.classList.toggle('v2-header-hidden', shouldHide);
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeMegaKey, isMobileMenuOpen]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove('v2-header-hidden');
    },
    []
  );

  useEffect(() => () => clearTimers(), []);

  const alignMegaColumns = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    const navTriggers = Array.from(navEl.children).filter(
      (child) => child.tagName !== 'SPAN'
    );

    Object.values(groupRefs.current).forEach((groupEl) => {
      const colEls = groupEl
        ? Array.from(groupEl.querySelectorAll('[data-mm-col]'))
        : [];
      if (!colEls.length) return;
      const targetTriggerIndices = colEls.length === 2 ? [0, 3] : [0, 2, 4];
      colEls.forEach((colEl) => {
        colEl.style.marginLeft = '0px';
      });
      let currentLeft = colEls[0].parentElement.getBoundingClientRect().left;

      colEls.forEach((colEl, colIdx) => {
        const triggerEl = navTriggers[targetTriggerIndices[colIdx]];
        const targetLeft = triggerEl
          ? ((el) => {
              const textNode = document
                .createTreeWalker(el, NodeFilter.SHOW_TEXT, {
                  acceptNode: (node) =>
                    node.textContent.trim()
                      ? NodeFilter.FILTER_ACCEPT
                      : NodeFilter.FILTER_SKIP,
                })
                .nextNode();
              if (!textNode) return el.getBoundingClientRect().left;
              const range = document.createRange();
              range.selectNodeContents(textNode);
              return range.getBoundingClientRect().left;
            })(triggerEl)
          : currentLeft + 48;

        const marginLeft = Math.max(24 * !!colIdx, targetLeft - currentLeft);
        colEl.style.marginLeft = `${marginLeft}px`;
        currentLeft += marginLeft + colEl.getBoundingClientRect().width;
      });
    });
  }, []);

  useEffect(() => {
    alignMegaColumns();
    document.fonts?.ready.then(alignMegaColumns);
    window.addEventListener('resize', alignMegaColumns);
    const observer = new ResizeObserver(() => {
      if (activeMegaKeyRef.current) {
        alignMegaColumns();
      }
    });
    document.querySelectorAll('[data-mm-col]').forEach((colEl) => {
      observer.observe(colEl.parentElement);
    });
    return () => {
      window.removeEventListener('resize', alignMegaColumns);
      observer.disconnect();
    };
  }, [alignMegaColumns]);

  useEffect(() => {
    if (!activeMegaKey) return;
    alignMegaColumns();
    let rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(alignMegaColumns);
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeMegaKey, alignMegaColumns]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'v2-scroll-locked',
      isMobileMenuOpen
    );
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        ref={headerRef}
        data-v2={true}
        data-theme={headerTheme}
        data-pad-state={isStarterPackPage ? 'top' : padState}
        style={{ top: 'var(--anm-ppp-offset, 0px)' }}
        className={cn(
          'v2-header inset-x-0 top-0 z-[300] pt-[var(--v2-header-gap)]',
          isStarterPackPage ? 'absolute' : 'fixed'
        )}
      >
        <div ref={barRef} className="v2-mm-bar">
          <div
            ref={containerRef}
            className={cn(
              'v2-bar-padx v2-container flex h-full items-center justify-between transition-colors duration-300 ease-power3-out lg:grid lg:grid-cols-12 lg:gap-16',
              hasSurfaceBg
                ? !isV3Page || isMobileMenuOpen || isDropdownOpen
                  ? 'bg-surface'
                  : 'bg-background-muted'
                : 'bg-transparent'
            )}
          >
            <BrandLogo className="lg:col-span-3" />

            {isStarterPackPage ? null : (
              <nav
                ref={navRef}
                onMouseEnter={() => {
                  clearTimers();
                  setHasOpenedMega(true);
                }}
                onMouseLeave={scheduleClose}
                className="relative hidden h-full items-center justify-center lg:col-span-4 lg:col-start-5 lg:flex"
              >
                {navItems.map((item) =>
                  item.mega ? (
                    <HeaderNavTrigger
                      key={item.key}
                      item={item}
                      href={item.triggerHref}
                      badge={item.badge}
                      active={
                        activeMegaKey === item.key ||
                        (item.triggerHref &&
                          isRouteActive(pathname, item.triggerHref))
                      }
                      expanded={activeMegaKey === item.key}
                      onMouseEnter={() => handleNavEnter(item)}
                      onClick={() => {
                        clearTimers();
                        setActiveMegaKey(null);
                      }}
                    />
                  ) : (
                    <NavSurface
                      key={item.key}
                      href={item.href}
                      variant="nav"
                      onMouseEnter={() => handleNavEnter(item)}
                      className={cn(
                        'text-mono h-full',
                        isRouteActive(pathname, item.href)
                          ? 'text-foreground'
                          : 'text-foreground-muted hover:text-foreground'
                      )}
                    >
                      {item.label}
                    </NavSurface>
                  )
                )}
              </nav>
            )}

            {isStarterPackPage ? null : (
              <div className="hidden items-center justify-end gap-20 lg:col-span-3 lg:col-start-10 lg:flex">
                {!loading && (
                  <NavSurface
                    href={hasAccess ? '/animations' : '/login'}
                    variant="nav"
                    className="text-mono text-foreground-muted hover:text-foreground"
                  >
                    {hasAccess
                      ? t('common.header.actions.account')
                      : t('common.header.actions.login')}
                  </NavSurface>
                )}
                <Button
                  href="/checkout?plan=solo&cycle=quarterly"
                  size="sm"
                  theme="brand"
                >
                  {t('common.header.actions.getAccess')}
                </Button>
              </div>
            )}

            {isStarterPackPage ? null : (
              <button
                type="button"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="relative -mr-6 size-44 lg:hidden"
              >
                <span
                  className={cn(
                    'absolute left-1/2 h-[1.5px] w-20 -translate-x-1/2 bg-foreground transition-transform duration-300',
                    isMobileMenuOpen
                      ? 'top-1/2 -translate-y-1/2 rotate-45'
                      : 'top-[calc(50%-4px)]'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-1/2 h-[1.5px] w-20 -translate-x-1/2 bg-foreground transition-transform duration-300',
                    isMobileMenuOpen
                      ? 'top-1/2 -translate-y-1/2 -rotate-45'
                      : 'top-[calc(50%+4px)]'
                  )}
                />
              </button>
            )}
          </div>
        </div>

        <div
          ref={dropdownRef}
          className="v2-mm-dropdown"
          onMouseEnter={() => clearTimers()}
          onMouseLeave={scheduleClose}
        >
          <div ref={dropdownInnerRef} className="v2-mm-dropdown-inner">
            {megaNavItems.map((item) => (
              <div
                key={item.key}
                ref={(el) => {
                  groupRefs.current[item.key] = el;
                }}
                className="v2-mm-group"
              >
                <div className="grid grid-cols-12 gap-16 py-32">
                  <div
                    data-mm-reveal={true}
                    className="col-span-3 col-start-1 flex flex-col gap-16"
                  >
                    <p className="text-h4 text-foreground">
                      {item.mega.intro.heading}
                    </p>
                    <p className="text-body-sm text-foreground-muted">
                      {item.mega.intro.text}
                    </p>
                    <NavSurface
                      href={item.mega.intro.cta.href}
                      onClick={() => setActiveMegaKey(null)}
                      variant="nav"
                      className="text-mono-sm -mx-12 text-foreground"
                    >
                      {item.mega.intro.cta.label}
                    </NavSurface>
                  </div>

                  <div className="col-span-5 col-start-4 flex">
                    {item.mega.columns.map((column) => (
                      <div
                        key={column.label}
                        data-mm-reveal={true}
                        data-mm-col={true}
                        className="flex shrink-0 flex-col"
                      >
                        <span className="text-mono-sm mb-8 text-foreground-muted">
                          {column.label}
                        </span>
                        {column.links.map((link) => (
                          <NavSurface
                            key={link.label}
                            href={link.href}
                            variant="nav"
                            className="text-body-sm -mx-12 text-foreground"
                          >
                            {link.label}
                            {link.badge ? (
                              <span className="text-accent-2xs ml-8 inline-block bg-brand px-6 py-2 align-middle text-black">
                                {link.badge}
                              </span>
                            ) : null}
                          </NavSurface>
                        ))}
                      </div>
                    ))}
                  </div>

                  {item.mega.featured ? (
                    <div
                      data-mm-reveal={true}
                      className="col-span-3 col-start-10"
                    >
                      <TransitionLink
                        href={item.mega.featured.href}
                        onClick={() => setActiveMegaKey(null)}
                        className="group flex flex-col gap-12"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden bg-background-muted">
                          {hasOpenedMega ? (
                            <picture>
                              {item.mega.featured.image.avif ? (
                                <source
                                  srcSet={item.mega.featured.image.avif}
                                  type="image/avif"
                                />
                              ) : null}
                              <img
                                src={item.mega.featured.image.jpg}
                                alt={item.mega.featured.image.alt}
                                className="block object-cover transition-transform duration-300 ease-(--ease-expo-out) group-hover:scale-[1.04] motion-reduce:transition-none"
                                style={{ width: '100%', height: '100%' }}
                              />
                            </picture>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-4">
                          <p className="text-body-sm text-foreground underline decoration-transparent underline-offset-4 transition-colors duration-200 ease-(--ease-expo-out) group-hover:decoration-foreground/40">
                            {item.mega.featured.title}
                          </p>
                        </div>
                      </TransitionLink>
                    </div>
                  ) : latestAnimation ? (
                    <div
                      data-mm-reveal={true}
                      className="col-span-3 col-start-10"
                    >
                      <TransitionLink
                        href={`/animations/${latestAnimation.slug}`}
                        onClick={() => setActiveMegaKey(null)}
                        className="group flex flex-col gap-12"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden bg-background-muted">
                          {hasOpenedMega ? (
                            latestAnimation.preview_video_url ? (
                              <video
                                src={latestAnimation.preview_video_url}
                                autoPlay={true}
                                loop={true}
                                muted={true}
                                playsInline={true}
                                className="h-full w-full object-cover transition-transform duration-300 ease-(--ease-expo-out) group-hover:scale-[1.04] motion-reduce:transition-none"
                              />
                            ) : latestAnimation.preview_image_url ? (
                              <img
                                src={formatImageUrl(
                                  latestAnimation.preview_image_url,
                                  { width: 480 }
                                )}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-300 ease-(--ease-expo-out) group-hover:scale-[1.04] motion-reduce:transition-none"
                              />
                            ) : null
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-4">
                          <p className="text-mono-sm text-foreground-muted">
                            {t('common.header.latestComponentLabel')}
                          </p>
                          <p className="text-body-sm text-foreground underline decoration-transparent underline-offset-4 transition-colors duration-200 ease-(--ease-expo-out) group-hover:decoration-foreground/40">
                            {latestAnimation.title}
                          </p>
                        </div>
                      </TransitionLink>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isStarterPackPage || isV3Page ? null : (
          <HeaderMarquee
            scrolled={scrollState === 'scrolled'}
            shiftY={marqueeShiftY}
          />
        )}

        <div
          className="v2-mm-collapse group/panel v2-container absolute inset-x-0 top-full lg:hidden"
          data-open={isMobileMenuOpen}
          inert={!isMobileMenuOpen}
        >
          <div>
            <div
              data-lenis-prevent={true}
              className="h-[calc(100svh-var(--v2-header-h)-2*var(--v2-header-gap))] overflow-y-auto bg-surface"
            >
              <div className="flex min-h-full flex-col px-16 pb-24 pt-8">
                {navItems.map((item, idx) => (
                  <div
                    key={item.key}
                    style={{ '--i': idx }}
                    className="translate-y-8 opacity-0 transition-[opacity,translate] duration-300 ease-(--ease-expo-out) group-data-[open=true]/panel:translate-y-0 group-data-[open=true]/panel:opacity-100 group-data-[open=true]/panel:delay-[calc(120ms+var(--i)*30ms)] motion-reduce:translate-y-0 motion-reduce:transition-none"
                  >
                    {item.mega ? (
                      <MobileMegaAccordion
                        item={item}
                        expanded={mobileExpandedKey === item.key}
                        onToggle={() =>
                          setMobileExpandedKey((prev) =>
                            prev === item.key ? null : item.key
                          )
                        }
                      />
                    ) : (
                      <TransitionLink
                        href={item.href}
                        className="text-h4 block border-b border-border-muted py-16 text-foreground"
                      >
                        {item.label}
                      </TransitionLink>
                    )}
                  </div>
                ))}

                <div className="mt-auto flex items-center justify-between gap-20 pt-32">
                  {!loading && (
                    <TransitionLink
                      href={hasAccess ? '/animations' : '/login'}
                      className="text-body py-12 text-foreground-muted"
                    >
                      {hasAccess
                        ? t('common.header.actions.account')
                        : t('common.header.actions.login')}
                    </TransitionLink>
                  )}
                  <Button
                    href="/checkout?plan=solo&cycle=quarterly"
                    size="sm"
                    theme="brand"
                  >
                    {t('common.header.actions.getAccess')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        ref={scrimRef}
        className="v2-mm-scrim"
        onClick={() => setActiveMegaKey(null)}
        aria-hidden="true"
      />

      <div
        data-open={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[290] bg-black/60 opacity-0 transition-opacity duration-300 ease-(--ease-expo-out) data-[open=true]:pointer-events-auto data-[open=true]:opacity-100 lg:hidden"
      />
    </>
  );
}

