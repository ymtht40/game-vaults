'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import {
  BookmarkSimpleIcon,
  BookOpenIcon,
  CaretDownIcon,
  DiscordLogoIcon,
  FunnelIcon,
  GearSixIcon,
  GraduationCapIcon,
  LightbulbIcon,
  ListIcon,
  PackageIcon,
  PlugsConnectedIcon,
  QuestionIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
// UNRESOLVED: ListIcon is inferred from the list view. The 499839.O definition is absent.
import { gsap } from 'gsap';

import HtmlIcon from '@/assets/icons/HtmlIcon'; // NOTE: module id: 732633
import ReactIcon from '@/assets/icons/ReactIcon'; // NOTE: module id: 408125
import VueIcon from '@/assets/icons/VueIcon'; // NOTE: module id: 900128
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
// UNRESOLVED: The class-name helper path is inferred.
import { getDiscordInviteUrl } from '@/libs/config/discord'; // NOTE: module id: 768947
// UNRESOLVED: getDiscordInviteUrl is a usage-based export name.
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import AnimationCard from '@/features/animation-page/components/AnimationCard'; // NOTE: module id: 591611
import AnimatedNumber from '@/components/motion/AnimatedNumber'; // NOTE: module id: 162387
import { useRevealTimeline } from '@/hooks/useRevealTimeline'; // NOTE: module id: 228414
// UNRESOLVED: useRevealTimeline is a usage-based export name.
import { useUser } from '@/providers/UserProvider'; // NOTE: module id: 201220

import { MockupBrand } from '@/features/platform/MockupBrand.jsx'; // NOTE: module id: 572332
import { MockupNavHeading } from '@/features/platform/MockupNavHeading.jsx'; // NOTE: module id: 572332
import { MockupNavItem } from '@/features/platform/MockupNavItem.jsx'; // NOTE: module id: 572332

/* Variable Mapping:
 * e/Z/v/E/R/O -> animations/revealOnPageEnter/filterBarDemo/filterPool/totalCount/className,
 * P/_/S/B/z -> user/profile/isSignedIn/discordUrl/gridRef,
 * I -> filterRef, T/$ -> selectedCategory/setSelectedCategory, K/D -> filterOpen/setFilterOpen,
 * U/q -> filterableAnimations/previewAnimations, G/Q -> categoryLabels/categoryOptions,
 * W/J/Y/X -> visibleAnimations/demoAnimations/matchingCount/currentCategoryLabel,
 * ee -> previousCategoryRef
 */
// NOTE: module id: 572332
export default function PlatformMockup({
  animations = [],
  revealOnPageEnter = false,
  filterBarDemo = false,
  filterPool = [],
  totalCount = null,
  className = '',
}) {
  const { user, profile } = useUser();
  const isSignedIn = !!user;
  const discordUrl = getDiscordInviteUrl(profile);
  const gridRef = useRef(null);

  useRevealTimeline(gridRef, {
    mode: 'hero',
    build: (grid) => {
      const timeline = gsap.timeline({ paused: true });
      if (revealOnPageEnter && grid?.children?.length) {
        timeline.from(grid.children, {
          autoAlpha: 0,
          y: 32,
          duration: 0.8,
          stagger: 0.04,
          ease: 'expo.out',
          delay: 0.35,
        });
      }
      return timeline;
    },
    deps: [revealOnPageEnter],
  });

  const filterRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterableAnimations = useMemo(
    () => (filterPool || []).filter((animation) => animation?.preview_image_url),
    [filterPool],
  );
  const previewAnimations = useMemo(
    () => (animations || []).filter((animation) => animation?.preview_image_url),
    [animations],
  );
  const categoryLabels = {
    button: 'Buttons',
    scroll: 'Scroll',
    'ui-component': 'UI Components',
    experimental: 'Experimental',
    shader: 'Shaders',
    menu: 'Menus',
    section: 'Sections',
  };
  const categoryOptions = useMemo(() => {
    const counts = {};
    filterableAnimations.forEach((animation) => {
      counts[animation.category] = (counts[animation.category] || 0) + 1;
    });
    return Object.keys(categoryLabels)
      .filter((slug) => counts[slug])
      .map((slug) => ({ slug, label: categoryLabels[slug], count: counts[slug] }));
  }, [filterableAnimations]);
  const visibleAnimations = useMemo(
    () =>
      selectedCategory
        ? filterableAnimations.filter((animation) => animation.category === selectedCategory)
        : previewAnimations,
    [selectedCategory, previewAnimations, filterableAnimations],
  );
  const demoAnimations = visibleAnimations.slice(0, 9);
  const matchingCount = selectedCategory
    ? visibleAnimations.length
    : totalCount ?? previewAnimations.length;
  const currentCategoryLabel =
    (selectedCategory && categoryLabels[selectedCategory]) || 'All categories';

  useEffect(() => {
    if (!filterOpen) return;

    const handlePointerDown = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setFilterOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filterOpen]);

  const previousCategoryRef = useRef(null);

  useGSAP(() => {
    if (!filterBarDemo) return;
    const category = String(selectedCategory);
    if (previousCategoryRef.current === null) {
      previousCategoryRef.current = category;
      return;
    }
    if (category === previousCategoryRef.current) return;
    previousCategoryRef.current = category;

    const grid = gridRef.current;
    if (
      !grid ||
      !grid.children.length ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const cards = Array.from(grid.children).slice(0, demoAnimations.length);
    if (cards.length) {
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.035,
          ease: 'expo.out',
          overwrite: true,
        },
      );
    }
  }, {
    dependencies: [selectedCategory],
    scope: gridRef,
  });

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-foreground/15 bg-background shadow-[0_24px_64px_-24px_rgba(0,0,0,0.5)]',
        className,
      )}
    >
      <div className="flex h-full min-h-[520px] lg:min-h-[720px]">
        <aside className="m-8 hidden w-[220px] flex-shrink-0 flex-col rounded-md border border-foreground/15 bg-surface p-12 md:flex">
          <MockupBrand />
          <nav className="flex flex-1 flex-col">
            <MockupNavHeading>{t('platform.mockup.sectionPlatform')}</MockupNavHeading>
            <MockupNavItem
              icon={SquaresFourIcon}
              label={t('platform.mockup.navAnimations')}
              href="/animations"
              active
            />
            <MockupNavItem
              icon={BookmarkSimpleIcon}
              label={t('platform.mockup.navSaved')}
              href={isSignedIn ? '/animations/saved' : '/animations'}
            />
            <MockupNavItem icon={PackageIcon} label={t('platform.mockup.navKits')} href="/kits" />
            <MockupNavItem
              icon={LightbulbIcon}
              label={t('platform.mockup.navRoadmap')}
              href="/roadmap"
            />
            <div className="mt-16">
              <MockupNavHeading>{t('platform.mockup.sectionSupport')}</MockupNavHeading>
            </div>
            <MockupNavItem
              icon={BookOpenIcon}
              label={t('platform.mockup.navDocumentation')}
              href="/docs"
            />
            <MockupNavItem
              icon={PlugsConnectedIcon}
              label={t('platform.mockup.navMcp')}
              href="/docs/guides/mcp"
            />
            <MockupNavItem
              icon={GraduationCapIcon}
              label={t('platform.mockup.navLearn')}
              href="/learn"
            />
            <MockupNavItem
              icon={QuestionIcon}
              label={t('platform.mockup.navHelp')}
              href={isSignedIn ? '/help' : '/contact'}
            />
            <MockupNavItem
              icon={GearSixIcon}
              label={t('platform.mockup.navSettings')}
              href={isSignedIn ? '/settings' : '/login'}
            />
            <MockupNavItem
              icon={DiscordLogoIcon}
              label={t('platform.mockup.navDiscord')}
              href={discordUrl}
              external
            />
            <div className="mt-auto border-t border-foreground/10 pt-12">
              <div className="flex items-center gap-8 px-4 py-4">
                <div className="flex size-28 items-center justify-center rounded-full bg-foreground/10 text-mono-sm text-foreground-muted">
                  {t('platform.mockup.userInitials')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">
                    {t('platform.mockup.userName')}
                  </div>
                  <div className="truncate text-mono-sm text-foreground-muted">
                    {t('platform.mockup.userPlan')}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </aside>
        <div className="relative flex min-w-0 flex-1 flex-col bg-background">
          <header className="flex items-center justify-between gap-16 border-b border-foreground/15 px-16 py-12 lg:px-20">
            <div className="flex items-center gap-12">
              <p className="text-h6 m-0 text-foreground">{t('platform.mockup.headerTitle')}</p>
              {filterBarDemo ? (
                <span className="text-mono-sm flex items-center gap-4 text-foreground-muted">
                  <AnimatedNumber
                    value={matchingCount}
                    minDigits={1}
                    triggerMode="immediate"
                    duration={0.6}
                    valueChangeDuration={0.9}
                    ease="power3.inOut"
                    className="text-mono-sm leading-none"
                  />
                  matching
                </span>
              ) : (
                <span className="text-mono-sm text-foreground-muted">
                  {totalCount
                    ? t('platform.mockup.headerShowingOfTotal', {
                        shown: Math.min(9, animations.length),
                        total: totalCount,
                      })
                    : t('platform.mockup.headerCount', { count: animations.length })}
                </span>
              )}
            </div>
            {filterBarDemo ? (
              <div className="hidden items-stretch lg:flex">
                <div ref={filterRef} className="relative flex items-stretch">
                  <button
                    type="button"
                    onClick={() => setFilterOpen((open) => !open)}
                    aria-haspopup="listbox"
                    aria-expanded={filterOpen}
                    className="text-accent-xs flex cursor-pointer items-center gap-8 border-0 bg-transparent px-12 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                  >
                    <FunnelIcon className="size-14 text-foreground-muted" />
                    <span className="min-w-[72px] truncate text-left">{currentCategoryLabel}</span>
                    <CaretDownIcon
                      className={`size-14 text-foreground-muted transition-transform duration-(--duration-fast) ease-(--ease-expo-out) ${filterOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {filterOpen ? (
                    <ul
                      role="listbox"
                      className="absolute left-0 top-full z-[30] mt-4 max-h-[300px] min-w-[190px] overflow-auto border border-foreground/12 bg-surface py-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]"
                    >
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(null);
                            setFilterOpen(false);
                          }}
                          className="flex w-full cursor-pointer items-center justify-between gap-12 border-0 bg-transparent px-12 py-8 text-left text-sm text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                        >
                          <span>All categories</span>
                          {selectedCategory ? null : (
                            <span className="size-6 bg-brand" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                      {categoryOptions.map(({ slug, label, count }) => (
                        <li key={slug}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(slug);
                              setFilterOpen(false);
                            }}
                            className="flex w-full cursor-pointer items-center justify-between gap-12 border-0 bg-transparent px-12 py-8 text-left text-sm text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                          >
                            <span>{label}</span>
                            <span className="flex items-center gap-8">
                              <span className="text-accent-2xs text-foreground-muted">{count}</span>
                              {selectedCategory === slug ? (
                                <span className="size-6 bg-brand" aria-hidden="true" />
                              ) : null}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <span className="mx-4 w-px self-stretch bg-foreground/10" />
                <div className="flex items-center gap-4 pl-8">
                  <span className="flex size-24 items-center justify-center rounded-sm bg-foreground/10 text-foreground">
                    <SquaresFourIcon className="size-14" />
                  </span>
                  <span className="flex size-24 items-center justify-center text-foreground-muted/40">
                    <ListIcon className="size-14" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-12 text-foreground-muted">
                <ReactIcon size={18} aria-hidden="true" />
                <VueIcon size={18} aria-hidden="true" />
                <HtmlIcon size={18} aria-hidden="true" />
              </div>
            )}
          </header>
          <div className="flex-1 overflow-hidden p-16 lg:p-24">
            <div
              ref={gridRef}
              className="grid grid-cols-1 gap-x-16 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-24 lg:gap-y-24"
            >
              {(filterBarDemo ? demoAnimations : animations).slice(0, 9).map((animation, index) => (
                <AnimationCard
                  key={animation.id}
                  animation={animation}
                  viewMode="grid"
                  isAuthenticated={false}
                  priority={index === 0}
                />
              ))}
              {filterBarDemo && demoAnimations.length < 9
                ? Array.from({ length: 9 - demoAnimations.length }).map((_, index) => (
                    <div key={`ph-${index}`} aria-hidden="true" className="invisible bg-surface p-12">
                      <div className="aspect-[16/10] w-full" />
                      <div className="mt-12 h-24" />
                      <div className="mt-36 h-20" />
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
