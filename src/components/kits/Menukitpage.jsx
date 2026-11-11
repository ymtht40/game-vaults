'use client';

// Variable Mapping: m -> MENU_SHOWREEL_VIDEO_URL, h -> MENU_SHOWREEL_POSTER_URL, u -> HERO_TAGLINE_ANIMATION_PROPS, g -> MenuKitHero, j -> MENU_ICON_SVG_PROPS, M -> TwoLineMenuIcon, Z -> MENU_SLUG_ICONS, A -> MenuSlugIcon, V -> MenuKitStageSection, C -> StageViewportButton, N -> COVERAGE_DIAGRAM_VIEWBOX, k -> COVERAGE_STROKE_PROPS, L -> DiagramRect, F -> COVERAGE_DIAGRAMS, S -> MenuKitCoverageSection, I -> MENU_CRAFT_FEATURES, T -> MenuKitCraftSection, z -> REACT_CODE_SNIPPET, R -> VUE_CODE_SNIPPET, _ -> HTML_CODE_SNIPPET, K -> CSS_CODE_SNIPPET, O -> JS_CODE_SNIPPET, q -> MENU_CODE_STATE, $ -> MENU_ANIMATION_META, W -> MenuKitCodeSection, J -> MENU_KIT_FAQS, Q -> MENU_INCLUDED_ITEMS

import { useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import { MonitorIcon } from '@phosphor-icons/react'; // NOTE: module id: 769464
// import '@/styles/revealKit'; // NOTE: module id: 988051
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import { CodeViewer } from '@/features/animation-detail/components/CodeViewer'; // NOTE: module id: 343931
import HtmlIcon from '@/assets/icons/HtmlIcon'; // NOTE: module id: 514162
import { PhoneIcon } from '@/assets/icons'; // NOTE: module id: 954243
import ReactIcon from '@/assets/icons/ReactIcon'; // NOTE: module id: 989080
import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import VueIcon from '@/assets/icons/VueIcon'; // NOTE: module id: 667024
import Select from '@/components/ui/Select'; // NOTE: module id: 977805
import { usePageEnterAnimation } from '@/providers/AnimationProvider'; // NOTE: module id: 488463
import { BrandLogoSection } from '@/components/ui/BrandLogoSection'; // NOTE: module id: 950377
import { KitClosingCta } from '@/components/kits/Kitclosingcta'; // NOTE: module id: 525425
import { KitFaqSection } from '@/components/kits/Kitfaqsection'; // NOTE: module id: 498872
import { KitFloatingBuyBar } from '@/components/kits/Kitfloatingbuybar'; // NOTE: module id: 752959
import KitPricingSection from '@/components/kits/Kitpricingsection'; // NOTE: module id: 509259
import { KitPurchaseCta } from '@/components/kits/Kitpurchasecta'; // NOTE: module id: 787160
import { StarterPackModal } from '@/components/kits/Starterpackmodal'; // NOTE: module id: 573564
import { groupMenuItemsByCategory } from '@/components/kits/utils/menuKits'; // NOTE: module id: 12426

const MENU_SHOWREEL_VIDEO_URL =
  'https://annnimate.b-cdn.net/video-thumbnails/kits/menu/menu-showreel.mp4';
const MENU_SHOWREEL_POSTER_URL =
  'https://annnimate.b-cdn.net/video-thumbnails/kits/menu/menu-showreel_poster.avif';

const HERO_TAGLINE_ANIMATION_PROPS = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
  triggerMode: 'pageEnter',
};

function MenuKitHero({ kit, owns = false, priceId = null }) {
  const videoRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  usePageEnterAnimation(() => setHasEntered(true), [], 'menu-showreel');

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return;
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      if (prefersReducedMotion) {
        videoEl.pause();
      } else {
        videoEl.play?.().catch(() => {});
      }
    }
  }, [prefersReducedMotion]);

  return (
    <section
      data-theme="dark"
      className="relative flex flex-col overflow-hidden bg-background pb-0 pt-96 text-foreground lg:pt-128"
    >
      <div className="v2-container">
        <div className="grid grid-cols-12 gap-x-24 lg:gap-x-32">
          <div className="col-span-12 text-center lg:col-span-8 lg:col-start-3">
            <FadeIn
              className="flex items-center justify-center gap-8 text-mono-sm text-foreground-muted"
              delay={0.1}
            >
              <span
                aria-hidden="true"
                className="inline-block size-8 bg-brand"
              />
              Landmark Kit
            </FadeIn>
            <RevealHeading
              as="h1"
              sizeClass="text-display"
              className="mt-16 font-medium"
              trigger="pageEnter"
            >
              {`${kit.title} Kit`}
            </RevealHeading>
            <AnimatedText
              tag="p"
              className="text-body-lg mx-auto mt-16 max-w-[46ch] text-foreground-muted"
              {...HERO_TAGLINE_ANIMATION_PROPS}
              delay={0.2}
            >
              Every site has one, and it is the first thing anyone touches. Ten
              complete navigation surfaces, each one art-directed on its own,
              all built on the same contract.
            </AnimatedText>
            <FadeIn
              className="mt-32 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 text-mono-sm text-foreground-muted"
              delay={0.35}
            >
              <span
                aria-label="React, Vue, and HTML / CSS / JS"
                className="flex items-center gap-12 text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="flex size-20 items-center justify-center"
                >
                  <ReactIcon />
                </span>
                <span
                  aria-hidden="true"
                  className="flex size-20 items-center justify-center"
                >
                  <VueIcon />
                </span>
                <span
                  aria-hidden="true"
                  className="flex size-20 items-center justify-center"
                >
                  <HtmlIcon />
                </span>
              </span>
              <span
                aria-hidden="true"
                className="inline-block size-6 bg-brand"
              />
              <span>One-time</span>
            </FadeIn>
            <FadeIn className="mt-32 flex justify-center" delay={0.45}>
              <KitPurchaseCta kit={kit} owns={owns} priceId={priceId} />
            </FadeIn>
          </div>
        </div>
      </div>
      <div className="relative mt-56 lg:mt-80">
        <div className="v2-container">
          <div className="grid grid-cols-12 gap-x-24 lg:gap-x-32">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2">
              <FadeIn y={24} delay={0.5}>
                <div className="relative overflow-hidden border border-foreground/15 bg-surface shadow-[0_24px_64px_-24px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-12 border-b border-foreground/15 px-16 py-12">
                    <div className="flex items-center gap-8" aria-hidden="true">
                      <span className="size-8 bg-foreground/15" />
                      <span className="size-8 bg-foreground/15" />
                      <span className="size-8 bg-foreground/15" />
                    </div>
                    <div className="mx-auto flex w-full max-w-[280px] items-center justify-center bg-foreground/[0.06] px-12 py-4">
                      <span className="text-accent-xs text-foreground-muted/70">
                        yourstudio.com
                      </span>
                    </div>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden bg-background">
                    {MENU_SHOWREEL_VIDEO_URL ? (
                      <video
                        ref={videoRef}
                        className="absolute inset-0 object-cover"
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        src={hasEntered ? MENU_SHOWREEL_VIDEO_URL : undefined}
                        poster={MENU_SHOWREEL_POSTER_URL || undefined}
                        autoPlay={!prefersReducedMotion}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={`${kit.title} Kit showreel`}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-mono-sm text-foreground-muted">
                          Showreel
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] lg:h-[180px]"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, var(--background) 90%)',
          }}
        />
      </div>
    </section>
  );
}

const MENU_ICON_SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': 'true',
};

function TwoLineMenuIcon() {
  return (
    <svg {...MENU_ICON_SVG_PROPS}>
      <rect x="1" y="7.25" width="22" height="1.5" fill="currentColor" />
      <rect x="1" y="15.25" width="22" height="1.5" fill="currentColor" />
    </svg>
  );
}

const MENU_SLUG_ICONS = {
  'preview-index': TwoLineMenuIcon,
  'mask-type': TwoLineMenuIcon,
  curtain: function () {
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        <rect x="3.75" y="4" width="1.5" height="9" fill="currentColor" />
        <rect x="8.75" y="4" width="1.5" height="14" fill="currentColor" />
        <rect x="13.75" y="4" width="1.5" height="9" fill="currentColor" />
      </svg>
    );
  },
  'tile-grid': function () {
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        <rect x="5" y="5" width="5" height="5" fill="currentColor" />
        <rect x="14" y="5" width="5" height="5" fill="currentColor" />
        <rect x="5" y="14" width="5" height="5" fill="currentColor" />
        <rect x="14" y="14" width="5" height="5" fill="currentColor" />
      </svg>
    );
  },
  accordion: function () {
    const coords = [4, 11, 18];
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        {coords.map((y) =>
          coords.map((x) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="2.5"
              height="2.5"
              fill="currentColor"
            />
          ))
        )}
      </svg>
    );
  },
  'context-shift': function () {
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        <rect x="2" y="5" width="3" height="14" fill="currentColor" />
        <rect
          x="7.75"
          y="5.75"
          width="14.5"
          height="12.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  },
  'split-screen': function () {
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        <rect x="2" y="11.25" width="7" height="1.5" fill="currentColor" />
        <rect x="11.25" y="4" width="1.5" height="16" fill="currentColor" />
        <rect x="15" y="11.25" width="7" height="1.5" fill="currentColor" />
      </svg>
    );
  },
  'push-down': function () {
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        <rect x="2" y="6" width="20" height="2" fill="currentColor" />
        <rect x="6" y="13" width="12" height="6" fill="currentColor" />
      </svg>
    );
  },
  island: function () {
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        <rect
          x="2.75"
          y="8.75"
          width="18.5"
          height="9.5"
          rx="4.75"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  },
  pillar: function () {
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        <rect x="5" y="7.25" width="14" height="1.5" fill="currentColor" />
        <rect x="5" y="11.25" width="14" height="1.5" fill="currentColor" />
        <rect x="5" y="15.25" width="14" height="1.5" fill="currentColor" />
      </svg>
    );
  },
  'stacked-drawer': function () {
    return (
      <svg {...MENU_ICON_SVG_PROPS}>
        <rect x="6.25" y="4" width="1.5" height="16" fill="currentColor" />
        <rect x="11.25" y="4" width="1.5" height="16" fill="currentColor" />
        <rect x="16.25" y="4" width="1.5" height="16" fill="currentColor" />
      </svg>
    );
  },
};

function MenuSlugIcon({ slug, className = '' }) {
  const IconComponent = MENU_SLUG_ICONS[slug];
  return IconComponent ? (
    <span className={`block size-20 shrink-0 ${className}`}>
      <IconComponent />
    </span>
  ) : null;
}

function MenuKitStageSection({ kit }) {
  const components = kit?.components || [];
  const groupedCategories = useMemo(
    () => groupMenuItemsByCategory(components),
    [components]
  );
  const hasComponents = components.length > 0;

  const [selectedSlug, setSelectedSlug] = useState(
    () =>
      components.find((item) => item.slug === 'accordion')?.slug ||
      components[0]?.slug ||
      ''
  );
  const [isPhoneViewport, setIsPhoneViewport] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const sectionRef = useRef(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl || hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '0px 0px -20% 0px',
      }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [hasIntersected]);

  const handleSelectMenu = (nextSlug) => {
    if (nextSlug !== selectedSlug) {
      setSelectedSlug(nextSlug);
      setResetCount((count) => count + 1);
    }
  };

  const handleViewportChange = (nextIsPhone) => {
    if (nextIsPhone !== isPhoneViewport) {
      setIsPhoneViewport(nextIsPhone);
      setResetCount((count) => count + 1);
    }
  };

  const previewUrl =
    hasComponents && hasIntersected && selectedSlug
      ? `/api/sandbox/kit/${kit.slug}/${selectedSlug}`
      : null;
  const activeComponent = components.find((item) => item.slug === selectedSlug);

  return (
    <section
      ref={sectionRef}
      data-buybar-hide=""
      data-theme="light"
      className="bg-background text-foreground"
    >
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">
              The stage
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[24ch] font-medium"
            >
              Open every one of them.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[62ch] leading-relaxed text-foreground-muted"
            >
              Pick a menu and click its trigger. The page behind it never
              changes, so the only thing you are comparing is the menu.{' '}
              <span className="max-lg:hidden">
                Switch the stage to phone to check the mobile behaviour, which
                is where most menus quietly fall apart.
              </span>
            </AnimatedText>
            {hasComponents ? (
              <div className="mt-40 flex flex-col border border-foreground/15 bg-foreground/[0.04] lg:grid lg:grid-cols-[280px_1fr]">
                <div
                  data-theme="dark"
                  className="flex items-center gap-8 border-b border-foreground/15 bg-background p-20 text-foreground lg:flex-col lg:items-stretch lg:gap-0 lg:border-b-0 lg:border-r lg:p-0"
                >
                  <div className="min-w-0 flex-1 lg:hidden">
                    <Select
                      value={selectedSlug}
                      onChange={handleSelectMenu}
                      options={groupedCategories.flatMap((group) =>
                        group.items.map((item) => ({
                          value: item.slug,
                          label: item.title,
                        }))
                      )}
                      ariaLabel="Choose a menu"
                      size="lg"
                      className="w-full"
                    />
                  </div>
                  <div className="hidden flex-col gap-24 p-20 lg:flex lg:flex-1">
                    {groupedCategories.map((group) => (
                      <div key={group.id} className="flex flex-col">
                        <span className="border-b border-foreground/15 pb-8 text-mono-sm text-foreground">
                          {group.label}
                        </span>
                        <ul className="mt-8 flex flex-col">
                          {group.items.map((item) => {
                            const isSelected = item.slug === selectedSlug;
                            return (
                              <li key={item.slug}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMenu(item.slug)}
                                  aria-pressed={isSelected}
                                  className={cn(
                                    'flex w-full items-center gap-10 py-8 text-left text-mono-sm transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
                                    isSelected
                                      ? 'text-brand'
                                      : 'text-foreground/55 hover:text-foreground'
                                  )}
                                >
                                  <MenuSlugIcon slug={item.slug} />
                                  <span className="truncate">{item.title}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="flex shrink-0 items-center gap-8 lg:border-t lg:border-foreground/15 lg:p-20">
                    <div
                      role="group"
                      aria-label="Stage viewport"
                      className="hidden border border-foreground/20 lg:flex"
                    >
                      <StageViewportButton
                        active={!isPhoneViewport}
                        onClick={() => handleViewportChange(false)}
                        label="Desktop"
                        icon={<MonitorIcon size={12} />}
                      />
                      <StageViewportButton
                        active={isPhoneViewport}
                        onClick={() => handleViewportChange(true)}
                        label="Phone"
                        icon={<PhoneIcon size={12} />}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetCount((count) => count + 1)}
                      aria-label="Reset the stage"
                      className="ml-auto flex items-center gap-6 bg-foreground px-10 py-8 text-background transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90 max-lg:h-48 max-lg:px-16 max-lg:text-body-sm lg:text-accent-xs"
                    >
                      <ArrowClockwiseIcon size={12} />
                      Reset
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="relative flex h-[min(560px,64svh)] w-full flex-1 items-center max-lg:flex-none justify-center overflow-hidden bg-foreground/[0.06] lg:aspect-auto lg:h-full">
                    <div
                      className="h-full overflow-hidden bg-background transition-[width] duration-(--duration-snap) ease-(--ease-expo-out)"
                      style={
                        isPhoneViewport
                          ? {
                              width: '390px',
                              maxWidth: '100%',
                            }
                          : {
                              width: '100%',
                            }
                      }
                    >
                      {previewUrl ? (
                        <iframe
                          key={`${selectedSlug}-${isPhoneViewport ? 'phone' : 'desktop'}-${resetCount}`}
                          src={previewUrl}
                          title={
                            activeComponent
                              ? `${activeComponent.title} menu preview`
                              : 'Menu preview'
                          }
                          className="block size-full border-0"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-40 border border-foreground/15 bg-foreground/[0.04] px-20 py-24 text-body-sm leading-relaxed text-foreground-muted">
                The live stage lands with the Kit.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StageViewportButton({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-6 px-10 py-6 text-accent-xs transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
        active
          ? 'bg-foreground text-background'
          : 'text-foreground-muted hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

const COVERAGE_DIAGRAM_VIEWBOX = '0 0 96 60';
const COVERAGE_STROKE_PROPS = {
  stroke: 'currentColor',
  strokeWidth: '1',
  fill: 'none',
};

function DiagramRect({
  x = 8,
  y = 8,
  w = 80,
  h = 44,
  opacity = 1,
  transform,
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      opacity={opacity}
      transform={transform}
      {...COVERAGE_STROKE_PROPS}
    />
  );
}

const COVERAGE_DIAGRAMS = {
  cover: function () {
    return (
      <svg
        viewBox={COVERAGE_DIAGRAM_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <DiagramRect opacity="0.35" />
        <rect
          x="8"
          y="8"
          width="80"
          height="44"
          fill="currentColor"
          opacity="0.12"
        />
        <DiagramRect />
      </svg>
    );
  },
  move: function () {
    return (
      <svg
        viewBox={COVERAGE_DIAGRAM_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <rect
          x="8"
          y="8"
          width="18"
          height="44"
          fill="currentColor"
          opacity="0.12"
        />
        <DiagramRect x={34} y={8} w={54} h={44} />
      </svg>
    );
  },
  float: function () {
    return (
      <svg
        viewBox={COVERAGE_DIAGRAM_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <DiagramRect />
        <rect
          x="14"
          y="16"
          width="26"
          height="28"
          rx="3"
          fill="currentColor"
          opacity="0.12"
        />
        <rect
          x="14"
          y="16"
          width="26"
          height="28"
          rx="3"
          {...COVERAGE_STROKE_PROPS}
        />
      </svg>
    );
  },
  drill: function () {
    return (
      <svg
        viewBox={COVERAGE_DIAGRAM_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <DiagramRect opacity="0.35" />
        <rect
          x="52"
          y="8"
          width="36"
          height="44"
          fill="currentColor"
          opacity="0.12"
        />
        <rect x="52" y="8" width="36" height="44" {...COVERAGE_STROKE_PROPS} />
        <rect
          x="56"
          y="13"
          width="1.5"
          height="34"
          fill="currentColor"
          opacity="0.5"
        />
        <rect
          x="61"
          y="13"
          width="1.5"
          height="34"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>
    );
  },
};

function MenuKitCoverageSection({ kit }) {
  const groupedCategories = groupMenuItemsByCategory(kit?.components || []);

  return groupedCategories.length ? (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">Coverage</span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[26ch] font-medium"
            >
              Four things a menu can do to a page.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[62ch] leading-relaxed text-foreground-muted"
            >
              The useful question is not which effect you like, it is what your
              layout can survive. A site with a pinned hero cannot take a menu
              that shoves the page down. One with a live canvas behind it should
              not be covered. The Kit has all four, so the answer is already in
              it.
            </AnimatedText>
            <FadeIn
              trigger="scroll"
              stagger={0.08}
              y={20}
              className="mt-40 grid grid-cols-1 gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-4"
            >
              {groupedCategories.map((group) => {
                const DiagramComponent = COVERAGE_DIAGRAMS[group.id];
                return (
                  <div
                    key={group.id}
                    className="flex flex-col bg-background p-20 lg:row-span-2 lg:grid lg:grid-rows-subgrid"
                  >
                    <div className="flex flex-col gap-16 lg:pb-24">
                      <div className="max-w-[128px] text-foreground/45">
                        {DiagramComponent ? <DiagramComponent /> : null}
                      </div>
                      <div className="flex flex-col gap-8">
                        <span className="flex items-center gap-8 text-mono-sm text-foreground">
                          <span
                            aria-hidden="true"
                            className="size-6 shrink-0 bg-brand"
                          />
                          {group.label}
                        </span>
                        <span className="text-body-sm leading-relaxed text-foreground-muted">
                          {group.blurb}
                        </span>
                      </div>
                    </div>
                    <ul className="mt-24 flex flex-col gap-6 border-t border-foreground/10 pt-24 lg:mt-0 lg:self-start">
                      {group.items.map((item) => (
                        <li
                          key={item.slug}
                          className="flex items-center gap-8 text-mono-sm text-foreground-muted"
                        >
                          <MenuSlugIcon
                            slug={item.slug}
                            className="size-16 text-foreground/50"
                          />
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  ) : null;
}

const MENU_CRAFT_FEATURES = [
  {
    title: 'Your nav never leaves the DOM',
    body: 'A closed menu is visibility: hidden plus inert - never display: none. Crawlers and screen readers get the full navigation whether the menu has ever been opened or not.',
  },
  {
    title: 'Real dialog semantics',
    body: 'Modal surfaces carry role="dialog" and aria-modal, the trigger tracks aria-expanded, focus moves in on open and returns to the trigger on close. Escape closes, always, immediately.',
  },
  {
    title: 'Scroll lock that finds your scroller',
    body: "The lock targets the layout's actual scroll source - Lenis when present, the real scroller otherwise - instead of blindly freezing the body and hoping.",
  },
  {
    title: 'Reduced motion, same menu',
    body: 'With prefers-reduced-motion the open completes in under 150ms and content lands settled. Functionality is identical - nobody gets a lesser menu.',
  },
  {
    title: 'GPU properties only',
    body: 'Transforms, opacity, clip-path. No width or height tweens, no layout thrash, no per-frame DOM reads. Surfaces that grow are clipped or scaled, not resized.',
  },
  {
    title: 'One motion language',
    body: 'Every menu opens on the same easing family and closes on the house state curve, with content exiting first and the surface retracting through its tail. Ten designs, one hand.',
  },
];

function MenuKitCraftSection() {
  return (
    <section data-theme="light" className="bg-background text-foreground">
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">
              The hard part
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[26ch] font-medium"
            >
              A menu is where sites quietly break.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[62ch] leading-relaxed text-foreground-muted"
            >
              Focus, scroll, SEO, keyboards, interrupts - navigation is the one
              component where the animation is the easy half. The Kit&apos;s
              contract handles the other half the same way in all ten, so you
              don&apos;t re-audit it per menu.
            </AnimatedText>
            <FadeIn
              trigger="scroll"
              stagger={0.06}
              y={20}
              className="mt-40 grid grid-cols-1 gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-3"
            >
              {MENU_CRAFT_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col gap-8 bg-background px-20 py-24"
                >
                  <span className="flex items-center gap-8 text-mono-sm text-foreground">
                    <span
                      aria-hidden="true"
                      className="size-6 shrink-0 bg-brand"
                    />
                    {feature.title}
                  </span>
                  <span className="text-body-sm leading-relaxed text-foreground-muted">
                    {feature.body}
                  </span>
                </div>
              ))}
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

const REACT_CODE_SNIPPET = `import MenuPreviewIndex from "./menu/preview-index";

export default function Layout({ children }) {
  return (
    <MenuPreviewIndex
      onOpening={() => pauseHeroVideo()}
      onClose={() => resumeHeroVideo()}
    >
      {children}
    </MenuPreviewIndex>
  );
}`;

const VUE_CODE_SNIPPET = `<script setup>
import MenuPreviewIndex from "./menu/preview-index.vue";
</script>

<template>
  <MenuPreviewIndex @opening="pauseHeroVideo" @close="resumeHeroVideo">
    <slot />
  </MenuPreviewIndex>
</template>`;

const HTML_CODE_SNIPPET = `<div
  data-anm-kit-menu-preview-index
  data-anm-duration="0"
  data-anm-ease="expo.out"
  data-anm-stagger="0.07"
>
  <!-- trigger + surface markup from the kit files -->
  <!-- your page goes in the stage slot -->
</div>`;

const CSS_CODE_SNIPPET = `/* Every menu stamps its live phase on the container:
   closed -> opening -> open -> closing. Style YOUR page
   against it - no JS required. */
[data-anm-kit-menu-preview-index][data-anm-menu-phase="open"] ~ .site-header {
  opacity: 0;
}`;

const JS_CODE_SNIPPET = `// The vanilla build self-initializes and exposes a
// namespaced handle - collision-safe next to any
// Library animation on the same page.
window.Anm.kit.menu.previewIndex.toggle();

// Page-level hooks: every menu dispatches
// menu:opening / open / closing / closed on its container.
container.addEventListener("menu:opening", dimThePage);`;

const MENU_CODE_STATE = {
  react: REACT_CODE_SNIPPET,
  vue: VUE_CODE_SNIPPET,
  html: HTML_CODE_SNIPPET,
  css: CSS_CODE_SNIPPET,
  js: JS_CODE_SNIPPET,
};

const MENU_ANIMATION_META = {
  id: 'menu-kit-usage',
  slug: 'menu',
  title: 'Menu',
  category: 'kit',
  react_code: REACT_CODE_SNIPPET,
  vue_code: VUE_CODE_SNIPPET,
  html_code: HTML_CODE_SNIPPET,
  css_code: CSS_CODE_SNIPPET,
  js_code: JS_CODE_SNIPPET,
};

function MenuKitCodeSection() {
  return (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="v2-container pt-64 pb-64 lg:pt-96 lg:pb-96">
        <div className="grid grid-cols-12 gap-x-24 gap-y-40 lg:items-center">
          <div className="col-span-12 lg:col-span-4 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">The code</span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 font-medium"
            >
              Each menu is one drop-in component.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body mt-16 leading-relaxed text-foreground-muted"
            >
              Everything lives inside it: the trigger, the surface, the
              choreography, the accessibility floor. Pass your page in as
              children, wire the callbacks you need, ship it. React, Vue, and
              plain HTML - GSAP only, nothing else to install.
            </AnimatedText>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-7">
            <div className="h-[480px] lg:h-[400px]">
              <CodeViewer
                codeState={MENU_CODE_STATE}
                animation={MENU_ANIMATION_META}
                defaultPlatform="react"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const MENU_KIT_FAQS = [
  {
    q: 'Is the Menu Kit part of the Library subscription?',
    a: 'No. The Menu Kit is a stand-alone product, bought once and owned forever. The Library is a separate yearly subscription, billed and accessed independently from any Kit.',
  },
  {
    q: 'Which frameworks does it ship in?',
    a: 'The Menu Kit ships in React, Vue, and plain HTML / CSS / JS. It is not built for Webflow.',
  },
  {
    q: 'How is this different from the menu components in the Library?',
    a: 'The Library goes broad; this Kit goes deep. Every menu here is authored as part of one navigation system - same props, same events, same accessibility floor - so swapping one menu for another is a component swap, not a re-integration. Nothing in the Kit is unlocked by a Library subscription.',
  },
  {
    q: 'Will it work with my existing site?',
    a: 'Yes - that is what the Kit is organized around. Four menus cover the page, three move it, two float beside it, and one drills into deep navigation, so there is a menu for whatever your layout can take. Your page passes in as children; the menu never dictates your markup.',
  },
  {
    q: 'What about accessibility and SEO?',
    a: 'Every menu keeps your nav links in the DOM while closed (visibility plus inert, never display: none), traps and returns focus, closes on Escape, locks scroll against the real scroller, and completes near-instantly under prefers-reduced-motion. That floor is part of the shared contract, not per-menu effort.',
  },
  {
    q: 'What does it depend on?',
    a: 'GSAP, and nothing else. No Three.js, no component framework beyond the one you already use. GSAP is free, including every plugin.',
  },
  {
    q: 'Do I own it forever, and are updates included?',
    a: 'Yes. One purchase gives you a perpetual license plus every future update to the Kit at no extra cost. Nothing renews and nothing expires.',
  },
  {
    q: 'Can I use it on client and commercial projects?',
    a: 'Yes. The license covers unlimited commercial and client projects. The only thing you cannot do is repackage or resell the components as a competing product.',
  },
  {
    q: 'How do I get the code after I buy?',
    a: 'After purchase the Kit lives in your account, separate from the Library. You can browse and copy every component in the app, or download the whole Kit as a ZIP.',
  },
  {
    q: 'I subscribe to the Library. Do I get a discount?',
    a: 'Yes. Library members get 20% off every Kit for as long as the subscription is active. Buy a Kit first and you get 20% off your first year of any Library plan.',
  },
  {
    q: 'What is the refund policy?',
    a: "The Menu Kit is final sale. You get the full code the moment you pay, so the purchase can't be returned or refunded. Every menu is on this page to watch before you buy, and the refund policy has the details.",
  },
];

const MENU_INCLUDED_ITEMS = [
  'All ten menus, in React, Vue and HTML / CSS / JS',
  'Perpetual license, unlimited commercial projects',
  'Lifetime updates to this Kit, at no extra cost',
  'One contract across all ten - same props, same events, same accessibility floor',
];

// NOTE: module id: 37418
export default function MenuKitPage({
  kit,
  owns = false,
  priceId = null,
  images = [],
  isAuthenticated = false,
  coverage = null,
  craft = null,
}) {
  return (
    <>
      <StarterPackModal
        isAuthenticated={isAuthenticated}
        source="kit-menu-ad"
        idPrefix="kit-menu-modal"
        delayMs={30000}
        storageKey="anm_kit_menu_prompt_dismissed_v1"
        eyebrow="Free starter pack"
        title="Not ready for the full Kit? Take the free components."
        description="Production GSAP for React, Vue, and HTML/CSS/JS - the same craft that is in the Menu Kit. In your inbox the moment you subscribe."
        buttonLabel="Send it to me"
      />
      <div className="relative">
        <MenuKitHero kit={kit} owns={owns} priceId={priceId} />
        <BrandLogoSection />
        <MenuKitStageSection kit={kit} />
        {coverage ?? <MenuKitCoverageSection kit={kit} />}
        {craft ?? <MenuKitCraftSection />}
        <MenuKitCodeSection />
        <KitPricingSection
          kit={kit}
          owns={owns}
          priceId={priceId}
          included={MENU_INCLUDED_ITEMS}
          media={{
            type: 'video',
            src: MENU_SHOWREEL_VIDEO_URL,
            poster: MENU_SHOWREEL_POSTER_URL,
          }}
        />
        <KitFaqSection kit={kit} faqs={MENU_KIT_FAQS} />
        <KitFloatingBuyBar kit={kit} owns={owns} priceId={priceId} />
      </div>
      <KitClosingCta
        kit={kit}
        owns={owns}
        priceId={priceId}
        images={images}
      />
    </>
  );
}