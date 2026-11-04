
'use client';

import { Fragment, useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import Link from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { formatImageUrll } from '@/libs/utils/formatImageUrl'; // NOTE: module id: 632021
import { BrandLogo } from '@/assets/logos/BrandLogo'; // NOTE: module id: 635566
import NavLink from '@/components/navigation/NavSurface'; // NOTE: module id: 520237
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { useCategories } from '@/contexts/CategoryProvider'; // NOTE: module id: 87207
import { NavDropdownTrigger } from '@/components/header/NavDropdownTrigger'; // NOTE: module id: 76624
import { MobileNavAccordion } from '@/components/header/MobileNavAccordion'; // NOTE: module id: 76624
import { HeaderMarquee } from '@/components/header/HeaderMarquee'; // NOTE: module id: 76624
import { NAV_ITEMS } from '@/components/header/header.config'; // NOTE: module id: 76624
import { isRouteActive } from '@/libs/config/isRouteActive'; // NOTE: module id: 76624
import { useAuth } from '@/hooks/useAuth'; // NOTE: module id: 76624
import { useHeaderState } from '@/hooks/useHeaderState'; // NOTE: module id: 76624

// NOTE: module id: 76624
export default function Header({ latestAnimation }) {
  const pathname = usePathname();
  const isStarterPack = pathname === '/starter-pack' || pathname === '/v3/starter-pack';
  const isV3 = pathname === '/v3';

  const { hasAccess, isAuthenticated, loading: authLoading } = useAuth();

  const headerRef = useRef(null);
  const barRef = useRef(null);
  const barInnerRef = useRef(null);
  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownInnerRef = useRef(null);
  const scrimRef = useRef(null);
  const megaGroupRefs = useRef({});
  const hoverTimerRef = useRef(null);
  const leaveTimerRef = useRef(null);
  const lastScrollYRef = useRef(0);

  const [activeMegaKey, setActiveMegaKey] = useState(null);
  const activeMegaKeyRef = useRef(null);
  activeMegaKeyRef.current = activeMegaKey;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedKey, setMobileExpandedKey] = useState(null);
  const [isMegaAnimating, setIsMegaAnimating] = useState(false);
  const [marqueeShiftY, setMarqueeShiftY] = useState(0);

  const { headerTheme, scrollState } = useHeaderState(barRef);

  const padState = isMegaAnimating || isMobileMenuOpen ? 'open' : scrollState === 'scrolled' ? 'scrolled' : 'top';
  const isBarSolid = scrollState === 'scrolled' || isMobileMenuOpen || isMegaAnimating;

  const categories = useCategories();

  const navItems = useMemo(() => {
    const categoryLinks = categories.map((cat) => ({
      label: cat.name,
      href: `/animations?category=${cat.slug}`,
    }));

    return NAV_ITEMS.map((item) => {
      if (!item.mega?.columns) return item;
      return {
        ...item,
        mega: {
          ...item.mega,
          columns: item.mega.columns.map((col) => {
            const resolvedCol = col.dynamic === 'categories' ? { ...col, links: categoryLinks } : col;
            return isAuthenticated
              ? resolvedCol
              : {
                  ...resolvedCol,
                  links: resolvedCol.links.filter((link) => link.href !== '/animations/saved'),
                };
          }),
        },
      };
    });
  }, [categories, isAuthenticated]);

  const megaNavItems = useMemo(() => navItems.filter((item) => item.mega), [navItems]);

  const prevActiveKeyRef = useRef(null);

  useLayoutEffect(() => {
    const prevKey = prevActiveKeyRef.current;
    if (prevKey === activeMegaKey) return;
    prevActiveKeyRef.current = activeMegaKey;

    const dropdownInner = dropdownInnerRef.current;
    const dropdown = dropdownRef.current;
    const scrim = scrimRef.current;
    if (!dropdownInner || !dropdown) return;

    const allRevealElements = [];
    megaNavItems.forEach((item) => {
      const groupEl = megaGroupRefs.current[item.key];
      if (groupEl) {
        gsap.killTweensOf(groupEl);
        allRevealElements.push(...groupEl.querySelectorAll('[data-mm-reveal]'));
      }
    });

    gsap.killTweensOf([dropdownInner, scrim, ...allRevealElements]);

    if (activeMegaKey === null) {
      let isDoneAnimating = false;
      const prevGroup = prevKey ? megaGroupRefs.current[prevKey] : null;

      if (prevGroup) {
        gsap.to(prevGroup, {
          autoAlpha: 0,
          duration: 0.15,
          ease: 'power2.out',
        });
      }

      gsap.to(dropdownInner, {
        height: 0,
        duration: 0.3,
        ease: 'expo.out',
        onUpdate: function () {
          if (!isDoneAnimating && this.ratio >= 0.9) {
            isDoneAnimating = true;
            setIsMegaAnimating(false);
          }
        },
        onComplete: () => {
          gsap.set(dropdown, {
            visibility: 'hidden',
            pointerEvents: 'none',
          });
          megaNavItems.forEach((item) => {
            const groupEl = megaGroupRefs.current[item.key];
            if (groupEl) {
              gsap.set(groupEl, {
                visibility: 'hidden',
                opacity: 0,
                x: 0,
                pointerEvents: 'none',
              });
            }
          });
          if (!isDoneAnimating) {
            setIsMegaAnimating(false);
          }
        },
      });

      gsap.to(scrim, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'expo.out',
      });
      return;
    }

    const currentGroup = megaGroupRefs.current[activeMegaKey];
    if (!currentGroup) return;

    const isInitialOpen = prevKey === null;
    const prevGroup = isInitialOpen ? null : megaGroupRefs.current[prevKey];
    const direction =
      megaNavItems.findIndex((item) => item.key === activeMegaKey) >=
      megaNavItems.findIndex((item) => item.key === prevKey)
        ? 1
        : -1;

    setIsMegaAnimating(true);

    megaNavItems.forEach((item) => {
      const groupEl = megaGroupRefs.current[item.key];
      if (!groupEl || groupEl === prevGroup) return;
      const isActive = item.key === activeMegaKey;
      gsap.set(groupEl, {
        visibility: isActive ? 'visible' : 'hidden',
        opacity: isActive ? 1 : 0,
        x: 0,
        pointerEvents: isActive ? 'auto' : 'none',
      });
    });

    gsap.set(dropdown, {
      visibility: 'visible',
      pointerEvents: 'auto',
    });

    gsap.to(dropdownInner, {
      height: currentGroup.offsetHeight,
      duration: isInitialOpen ? 0.45 : 0.4,
      ease: 'expo.out',
    });

    gsap.to(scrim, {
      autoAlpha: 1,
      duration: 0.4,
      ease: 'expo.out',
    });

    const revealElements = currentGroup.querySelectorAll('[data-mm-reveal]');

    if (isInitialOpen) {
      gsap.fromTo(
        revealElements,
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
      if (prevGroup) {
        gsap.set(prevGroup, {
          pointerEvents: 'none',
        });
        gsap.to(prevGroup, {
          autoAlpha: 0,
          x: -(16 * direction),
          duration: 0.2,
          ease: 'power2.out',
        });
      }

      gsap.fromTo(
        revealElements,
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
      const groupEl = megaGroupRefs.current[activeMegaKey];
      setMarqueeShiftY(groupEl ? groupEl.offsetHeight : 0);
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeMegaKey]);

  const clearTimers = () => {
    clearTimeout(hoverTimerRef.current);
    clearTimeout(leaveTimerRef.current);
  };

  const handleNavMouseLeave = () => {
    clearTimers();
    leaveTimerRef.current = setTimeout(() => {
      setActiveMegaKey(null);
    }, 100);
  };

  const pointerTrackerRef = useRef({
    x: 0,
    y: 0,
    t: 0,
    v: 0,
  });

  useEffect(() => {
    const handlePointerMove = (e) => {
      const tracker = pointerTrackerRef.current;
      const now = performance.now();
      const dt = now - tracker.t;
      const currentSpeed = dt > 0 && dt < 100 ? Math.hypot(e.clientX - tracker.x, e.clientY - tracker.y) / dt : 0;
      tracker.v = 0.5 * tracker.v + 0.5 * currentSpeed;
      tracker.x = e.clientX;
      tracker.y = e.clientY;
      tracker.t = now;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const scheduleMegaOpen = (fn, startTime = performance.now()) => {
    const tracker = pointerTrackerRef.current;
    const now = performance.now();
    if (now - tracker.t >= 45 || tracker.v < 0.35 || now - startTime >= 150) {
      fn();
    } else {
      hoverTimerRef.current = setTimeout(() => scheduleMegaOpen(fn, startTime), 45);
    }
  };

  const handleItemMouseEnter = (item) => {
    clearTimers();
    if (item.mega) {
      if (activeMegaKey !== item.key) {
        scheduleMegaOpen(() => setActiveMegaKey(item.key));
      }
    } else if (activeMegaKey) {
      scheduleMegaOpen(() => setActiveMegaKey(null));
    }
  };

  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (activeMegaKey) {
      setHasInteracted(true);
    }
  }, [activeMegaKey]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
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
      clearTimeout(leaveTimerRef.current);
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
      const header = headerRef.current;
      if (!header) return;
      const scrollY = window.scrollY;

      if (activeMegaKey) {
        setActiveMegaKey(null);
      }

      let shouldHide = false;
      if (!isMobileMenuOpen && scrollY > 120) {
        shouldHide = scrollY > lastScrollYRef.current;
        header.classList.toggle('is-hidden', shouldHide);
      } else {
        header.classList.remove('is-hidden');
      }

      document.documentElement.classList.toggle('v2-header-hidden', shouldHide);
      lastScrollYRef.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeMegaKey, isMobileMenuOpen]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('v2-header-hidden');
    };
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const alignColumns = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    const navButtons = Array.from(navEl.children).filter((el) => el.tagName !== 'SPAN');

    Object.values(megaGroupRefs.current).forEach((groupEl) => {
      const cols = groupEl ? Array.from(groupEl.querySelectorAll('[data-mm-col]')) : [];
      if (!cols.length) return;
      const targetIndices = cols.length === 2 ? [0, 3] : [0, 2, 4];
      cols.forEach((col) => {
        col.style.marginLeft = '0px';
      });

      let parentLeft = cols[0].parentElement.getBoundingClientRect().left;

      cols.forEach((col, idx) => {
        const targetNavButton = navButtons[targetIndices[idx]];
        let targetLeft;
        if (targetNavButton) {
          const walker = document.createTreeWalker(targetNavButton, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => (node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
          });
          const textNode = walker.nextNode();
          if (!textNode) {
            targetLeft = targetNavButton.getBoundingClientRect().left;
          } else {
            const range = document.createRange();
            range.selectNodeContents(textNode);
            targetLeft = range.getBoundingClientRect().left;
          }
        } else {
          targetLeft = parentLeft + 48;
        }

        const margin = Math.max(24 * (idx ? 1 : 0), targetLeft - parentLeft);
        col.style.marginLeft = `${margin}px`;
        parentLeft += margin + col.getBoundingClientRect().width;
      });
    });
  }, []);

  useEffect(() => {
    alignColumns();
    document.fonts?.ready.then(alignColumns);
    window.addEventListener('resize', alignColumns);

    const observer = new ResizeObserver(() => {
      if (activeMegaKeyRef.current) {
        alignColumns();
      }
    });

    document.querySelectorAll('[data-mm-col]').forEach((col) => {
      observer.observe(col.parentElement);
    });

    return () => {
      window.removeEventListener('resize', alignColumns);
      observer.disconnect();
    };
  }, [alignColumns]);

  useEffect(() => {
    if (!activeMegaKey) return;
    alignColumns();
    let rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(alignColumns);
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeMegaKey, alignColumns]);

  useEffect(() => {
    document.documentElement.classList.toggle('v2-scroll-locked', isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        ref={headerRef}
        data-v2
        data-theme={headerTheme}
        data-pad-state={isStarterPack ? 'top' : padState}
        style={{ top: 'var(--anm-ppp-offset, 0px)' }}
        className={cn(
          'v2-header inset-x-0 top-0 z-[300] pt-[var(--v2-header-gap)]',
          isStarterPack ? 'absolute' : 'fixed'
        )}
      >
        <div ref={barRef} className="v2-mm-bar">
          <div
            ref={barInnerRef}
            className={cn(
              'v2-bar-padx v2-container flex h-full items-center justify-between transition-colors duration-300 ease-power3-out lg:grid lg:grid-cols-12 lg:gap-16',
              isBarSolid
                ? !isV3 || isMobileMenuOpen || isMegaAnimating
                  ? 'bg-surface'
                  : 'bg-background-muted'
                : 'bg-transparent'
            )}
          >
            <BrandLogo className="lg:col-span-3" />

            {isStarterPack ? null : (
              <nav
                ref={navRef}
                onMouseEnter={() => {
                  clearTimers();
                  setHasInteracted(true);
                }}
                onMouseLeave={handleNavMouseLeave}
                className="relative hidden h-full items-center justify-center lg:col-span-4 lg:col-start-5 lg:flex"
              >
                {navItems.map((item) =>
                  item.mega ? (
                    <NavDropdownTrigger
                      key={item.key}
                      item={item}
                      href={item.triggerHref}
                      badge={item.badge}
                      active={activeMegaKey === item.key || (item.triggerHref && isRouteActive(pathname, item.triggerHref))}
                      expanded={activeMegaKey === item.key}
                      onMouseEnter={() => handleItemMouseEnter(item)}
                      onClick={() => {
                        clearTimers();
                        setActiveMegaKey(null);
                      }}
                    />
                  ) : (
                    <NavLink
                      key={item.key}
                      href={item.href}
                      variant="nav"
                      onMouseEnter={() => handleItemMouseEnter(item)}
                      className={cn(
                        'text-mono h-full',
                        isRouteActive(pathname, item.href)
                          ? 'text-foreground'
                          : 'text-foreground-muted hover:text-foreground'
                      )}
                    >
                      {item.label}
                    </NavLink>
                  )
                )}
              </nav>
            )}

            {isStarterPack ? null : (
              <div className="hidden items-center justify-end gap-20 lg:col-span-3 lg:col-start-10 lg:flex">
                {!authLoading && (
                  <NavLink
                    href={hasAccess ? '/animations' : '/login'}
                    variant="nav"
                    className="text-mono text-foreground-muted hover:text-foreground"
                  >
                    {hasAccess ? t('common.header.actions.account') : t('common.header.actions.login')}
                  </NavLink>
                )}
                <Button href="/checkout?plan=solo&cycle=quarterly" size="sm" theme="brand">
                  {t('common.header.actions.getAccess')}
                </Button>
              </div>
            )}

            {isStarterPack ? null : (
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
                    isMobileMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[calc(50%-4px)]'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-1/2 h-[1.5px] w-20 -translate-x-1/2 bg-foreground transition-transform duration-300',
                    isMobileMenuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-[calc(50%+4px)]'
                  )}
                />
              </button>
            )}
          </div>
        </div>

        <div
          ref={dropdownRef}
          className="v2-mm-dropdown"
          onMouseEnter={clearTimers}
          onMouseLeave={handleNavMouseLeave}
        >
          <div ref={dropdownInnerRef} className="v2-mm-dropdown-inner">
            {megaNavItems.map((megaItem) => (
              <div
                key={megaItem.key}
                ref={(el) => {
                  megaGroupRefs.current[megaItem.key] = el;
                }}
                className="v2-mm-group"
              >
                <div className="grid grid-cols-12 gap-16 py-32">
                  <div data-mm-reveal className="col-span-3 col-start-1 flex flex-col gap-16">
                    <p className="text-h4 text-foreground">{megaItem.mega.intro.heading}</p>
                    <p className="text-body-sm text-foreground-muted">{megaItem.mega.intro.text}</p>
                    <NavLink
                      href={megaItem.mega.intro.cta.href}
                      onClick={() => setActiveMegaKey(null)}
                      variant="nav"
                      className="text-mono-sm -mx-12 text-foreground"
                    >
                      {megaItem.mega.intro.cta.label}
                    </NavLink>
                  </div>

                  <div className="col-span-5 col-start-4 flex">
                    {megaItem.mega.columns.map((col) => (
                      <div
                        key={col.label}
                        data-mm-reveal
                        data-mm-col
                        className="flex shrink-0 flex-col"
                      >
                        <span className="text-mono-sm mb-8 text-foreground-muted">{col.label}</span>
                        {col.links.map((link) => (
                          <NavLink
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
                          </NavLink>
                        ))}
                      </div>
                    ))}
                  </div>

                  {megaItem.mega.featured ? (
                    <div data-mm-reveal className="col-span-3 col-start-10">
                      <Link
                        href={megaItem.mega.featured.href}
                        onClick={() => setActiveMegaKey(null)}
                        className="group flex flex-col gap-12"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden bg-background-muted">
                          {hasInteracted ? (
                            <picture>
                              {megaItem.mega.featured.image.avif ? (
                                <source
                                  srcSet={megaItem.mega.featured.image.avif}
                                  type="image/avif"
                                />
                              ) : null}
                              <img
                                src={megaItem.mega.featured.image.jpg}
                                alt={megaItem.mega.featured.image.alt}
                                className="block object-cover transition-transform duration-300 ease-(--ease-expo-out) group-hover:scale-[1.04] motion-reduce:transition-none"
                                style={{ width: '100%', height: '100%' }}
                              />
                            </picture>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-4">
                          <p className="text-body-sm text-foreground underline decoration-transparent underline-offset-4 transition-colors duration-200 ease-(--ease-expo-out) group-hover:decoration-foreground/40">
                            {megaItem.mega.featured.title}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ) : latestAnimation ? (
                    <div data-mm-reveal className="col-span-3 col-start-10">
                      <Link
                        href={`/animations/${latestAnimation.slug}`}
                        onClick={() => setActiveMegaKey(null)}
                        className="group flex flex-col gap-12"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden bg-background-muted">
                          {hasInteracted ? (
                            latestAnimation.preview_video_url ? (
                              <video
                                src={latestAnimation.preview_video_url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover transition-transform duration-300 ease-(--ease-expo-out) group-hover:scale-[1.04] motion-reduce:transition-none"
                              />
                            ) : latestAnimation.preview_image_url ? (
                              <img
                                src={formatImageUrll(latestAnimation.preview_image_url, { width: 480 })}
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
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isStarterPack || isV3 ? null : (
          <HeaderMarquee scrolled={scrollState === 'scrolled'} shiftY={marqueeShiftY} />
        )}

        <div
          className="v2-mm-collapse group/panel v2-container absolute inset-x-0 top-full lg:hidden"
          data-open={isMobileMenuOpen}
          inert={!isMobileMenuOpen ? '' : undefined}
        >
          <div>
            <div
              data-lenis-prevent
              className="h-[calc(100svh-var(--v2-header-h)-2*var(--v2-header-gap))] overflow-y-auto bg-surface"
            >
              <div className="flex min-h-full flex-col px-16 pb-24 pt-8">
                {navItems.map((item, index) => (
                  <div
                    key={item.key}
                    style={{ '--i': index }}
                    className="translate-y-8 opacity-0 transition-[opacity,translate] duration-300 ease-(--ease-expo-out) group-data-[open=true]/panel:translate-y-0 group-data-[open=true]/panel:opacity-100 group-data-[open=true]/panel:delay-[calc(120ms+var(--i)*30ms)] motion-reduce:translate-y-0 motion-reduce:transition-none"
                  >
                    {item.mega ? (
                      <MobileNavAccordion
                        item={item}
                        expanded={mobileExpandedKey === item.key}
                        onToggle={() =>
                          setMobileExpandedKey((prev) => (prev === item.key ? null : item.key))
                        }
                      />
                    ) : (
                      <Link
                        href={item.href}
                        className="text-h4 block border-b border-border-muted py-16 text-foreground"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}

                <div className="mt-auto flex items-center justify-between gap-20 pt-32">
                  {!authLoading && (
                    <Link
                      href={hasAccess ? '/animations' : '/login'}
                      className="text-body py-12 text-foreground-muted"
                    >
                      {hasAccess ? t('common.header.actions.account') : t('common.header.actions.login')}
                    </Link>
                  )}
                  <Button href="/checkout?plan=solo&cycle=quarterly" size="sm" theme="brand">
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
