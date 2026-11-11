'use client';

// Variable Mapping: x -> RevealHandoffPreview, f -> HERO_TAGLINE_ANIMATION_PROPS, h -> RevealKitHero, w -> RevealKitPairingSection, N -> PairingCategoryList, k -> RevealKitManifestSection, S -> ManifestCategoryColumn, R -> RevealKitCaptureSection, A -> REACT_CODE_SNIPPET, E -> VUE_CODE_SNIPPET, _ -> HTML_CODE_SNIPPET, $ -> CSS_CODE_SNIPPET, U -> JS_CODE_SNIPPET, z -> REVEAL_CODE_STATE, F -> REVEAL_ANIMATION_META, H -> RevealKitCodeSection, I -> ScrollHighlightList, q -> REVEAL_INCLUDED_ITEMS, K -> RevealKitPricingSection, V -> REVEAL_KIT_FAQS

import { useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import _JSXStyle from 'styled-jsx/style'; // NOTE: module id: 437902
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
// import '@/styles/revealKit'; // NOTE: module id: 988051
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import { CodeViewer } from '@/features/animation-detail/components/CodeViewer'; // NOTE: module id: 343931
import NewsletterForm from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 42242
import HtmlIcon from '@/assets/icons/HtmlIcon'; // NOTE: module id: 514162
import ReactIcon from '@/assets/icons/ReactIcon'; // NOTE: module id: 989080
import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import VueIcon from '@/assets/icons/VueIcon'; // NOTE: module id: 667024
import { MediaHoverReveal } from '@/components/motion/MediaHoverReveal'; // NOTE: module id: 934783
import KitPrice from '@/features/pricing/components/KitPrice'; // NOTE: module id: 597274
import RangeSlider from '@/components/ui/RangeSlider'; // NOTE: module id: 125303
import { usePageEnterAnimation } from '@/providers/AnimationProvider'; // NOTE: module id: 488463
import { BrandLogoSection } from '@/components/ui/BrandLogoSection'; // NOTE: module id: 950377
import { KitClosingCta } from '@/components/kits/Kitclosingcta'; // NOTE: module id: 525425
import { KitFaqSection } from '@/components/kits/Kitfaqsection'; // NOTE: module id: 498872
import { KitFloatingBuyBar } from '@/components/kits/Kitfloatingbuybar'; // NOTE: module id: 752959
import { KitPurchaseCta } from '@/components/kits/Kitpurchasecta'; // NOTE: module id: 787160
import { StarterPackModal } from '@/components/kits/Starterpackmodal'; // NOTE: module id: 573564
import {
  KIT_EXCLUSION_NOTE,
  KIT_MEMBER_DISCOUNT_NOTE,
  getKitItemBadge,
  isKitAvailable,
} from '@/components/kits/utils/menuKits'; // NOTE: module id: 12426

function RevealHandoffPreview() {
  const [hasEntered, setHasEntered] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  usePageEnterAnimation(() => setHasEntered(true), [], 'reveal-preview');

  const iframeSrc = hasEntered
    ? `/api/sandbox/kit/reveal/pair?cover=logo-draw-split&hero=flow-field&invert=1&k=${replayCount}`
    : null;

  return (
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
        <button
          type="button"
          onClick={() => setReplayCount((count) => count + 1)}
          aria-label="Replay the handoff"
          className="flex shrink-0 items-center gap-6 bg-foreground px-10 py-10 lg:py-6 text-accent-xs text-background transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90"
        >
          <ArrowClockwiseIcon size={12} />
          Replay
        </button>
      </div>
      <div className="relative min-h-[560px] overflow-hidden bg-background lg:min-h-[820px]">
        {iframeSrc ? (
          <iframe
            key={replayCount}
            src={iframeSrc}
            title="Preloader and hero handoff preview"
            className="absolute inset-0 block size-full border-0"
          />
        ) : null}
      </div>
    </div>
  );
}

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

function RevealKitHero({
  kit,
  owns = false,
  priceId = null,
  images = [],
}) {
  const sectionRef = useRef(null);
  const previewContainerRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isMotionOk: '(prefers-reduced-motion: no-preference)',
          isDesktop: '(min-width: 1024px)',
        },
        (context) => {
          if (!context.conditions.isMotionOk) return;
          const targetY = context.conditions.isDesktop ? 220 : 120;
          gsap.fromTo(
            previewContainerRef.current,
            {
              y: 0,
              opacity: 1,
            },
            {
              y: targetY,
              opacity: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }
      );
      return () => mm.revert();
    },
    {
      scope: sectionRef,
    }
  );

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="relative flex min-h-svh flex-col overflow-hidden bg-background pb-0 pt-96 text-foreground lg:pt-128"
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
              {kit.title}
            </RevealHeading>
            <AnimatedText
              tag="p"
              className="text-body-lg mx-auto mt-16 max-w-[42ch] text-foreground-muted"
              {...HERO_TAGLINE_ANIMATION_PROPS}
              delay={0.2}
            >
              {kit.tagline
                ? `${kit.tagline} You pair any cover with any hero, in WebGL or GSAP, so the moment a site loads and opens runs as a single move.`
                : 'A deep, stand-alone Kit. One purchase, every project, forever.'}
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
      <div
        ref={previewContainerRef}
        className="relative pt-40 mb-[-80px] will-change-transform lg:pt-56 lg:mb-[-120px]"
      >
        <div className="v2-container">
          <div className="grid grid-cols-12 gap-x-24 lg:gap-x-32">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2">
              <FadeIn y={24} delay={0.5}>
                <RevealHandoffPreview />
              </FadeIn>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[320px] lg:h-[440px]"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, var(--background) 85%)',
          }}
        />
      </div>
    </section>
  );
}

function RevealKitPairingSection({ kit }) {
  const components = kit?.components || [];
  const { covers, heroes } = useMemo(() => {
    const coverList = [];
    const heroList = [];
    for (const component of components) {
      const categoryId = getKitItemBadge(component.variant_kind)?.id;
      if (categoryId === 'cover') {
        coverList.push(component);
      } else if (categoryId === 'hero') {
        heroList.push(component);
      }
    }
    return {
      covers: coverList,
      heroes: heroList,
    };
  }, [components]);

  const hasPairs = covers.length > 0 && heroes.length > 0;
  const getInitialSlug = (list, preferredSlug) =>
    list.find((item) => item.slug === preferredSlug)?.slug ||
    list[0]?.slug ||
    '';

  const [selectedCover, setSelectedCover] = useState(
    getInitialSlug(covers, 'logo-fill-cover')
  );
  const [selectedHero, setSelectedHero] = useState(
    getInitialSlug(heroes, 'tile-orb')
  );
  const [replayCount, setReplayCount] = useState(0);
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
        rootMargin: '0px 0px -25% 0px',
      }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [hasIntersected]);

  const [speedInput, setSpeedInput] = useState(1);
  const [debouncedSpeed, setDebouncedSpeed] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSpeed(speedInput), 350);
    return () => clearTimeout(timer);
  }, [speedInput]);

  const previewUrl =
    hasPairs && hasIntersected
      ? `/api/sandbox/kit/${kit.slug}/pair?cover=${encodeURIComponent(selectedCover)}&hero=${encodeURIComponent(selectedHero)}&speed=${debouncedSpeed}&k=${replayCount}`
      : null;

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
              The system
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[24ch] font-medium"
            >
              Pair any preloader with any hero.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[60ch] leading-relaxed text-foreground-muted"
            >
              Preloaders and hero sections are one system. The preloader&apos;s
              release frame triggers the hero&apos;s first frame. Pick a pair
              and watch the real handoff.
            </AnimatedText>
            {hasPairs ? (
              <div className="mt-40 flex flex-col border border-foreground/15 bg-foreground/[0.04] lg:grid lg:grid-cols-[240px_1fr]">
                <div
                  data-theme="dark"
                  className="flex flex-col border-t border-foreground/15 bg-background p-16 text-foreground lg:min-h-0 lg:border-t-0 lg:border-r"
                >
                  <div className="flex flex-col gap-20 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                    <PairingCategoryList
                      label="Preloaders"
                      items={covers}
                      value={selectedCover}
                      onSelect={setSelectedCover}
                    />
                    <PairingCategoryList
                      label="Heroes"
                      items={heroes}
                      value={selectedHero}
                      onSelect={setSelectedHero}
                    />
                  </div>
                  <div className="mt-16 flex shrink-0 flex-col gap-12">
                    <RangeSlider
                      label="Speed"
                      unit="x"
                      min={0.1}
                      max={4}
                      step={0.1}
                      value={speedInput}
                      onChange={(val) => setSpeedInput(parseFloat(val))}
                    />
                    <button
                      type="button"
                      onClick={() => setReplayCount((count) => count + 1)}
                      aria-label="Replay the handoff"
                      className="flex items-center justify-center gap-6 bg-foreground px-10 py-8 text-background transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90 max-lg:h-40 max-lg:text-body-sm lg:text-accent-xs"
                    >
                      <ArrowClockwiseIcon size={12} />
                      Replay
                    </button>
                  </div>
                </div>
                <div className="relative order-first aspect-[4/5] w-full overflow-hidden bg-foreground/[0.06] lg:order-none lg:aspect-[16/10]">
                  {previewUrl ? (
                    <iframe
                      key={`${selectedCover}-${selectedHero}-${debouncedSpeed}-${replayCount}`}
                      src={previewUrl}
                      title="Preloader and hero pairing preview"
                      className="absolute inset-0 block size-full border-0"
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-40 border border-foreground/15 bg-foreground/[0.04] px-20 py-24 text-body-sm leading-relaxed text-foreground-muted">
                The live pairing preview lands with the Kit.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PairingCategoryList({ label, items, value, onSelect }) {
  return (
    <div className="flex flex-col">
      <span className="text-mono-sm text-foreground border-b border-foreground/15 pb-8">
        {label}
      </span>
      <ul className="mt-8 flex flex-col max-lg:-mx-16 max-lg:snap-x max-lg:flex-row max-lg:gap-8 max-lg:overflow-x-auto max-lg:scroll-px-16 max-lg:px-16 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isSelected = item.slug === value;
          return (
            <li key={item.slug} className="max-lg:shrink-0 max-lg:snap-start">
              <button
                type="button"
                onClick={() => onSelect(item.slug)}
                aria-pressed={isSelected}
                className={cn(
                  'flex w-full items-center gap-8 py-6 text-left text-mono-sm transition-colors duration-(--duration-fast) ease-(--ease-expo-out) max-lg:border max-lg:border-foreground/15 max-lg:px-12 max-lg:py-10',
                  isSelected
                    ? 'text-foreground'
                    : 'text-foreground/55 hover:text-foreground'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-6 shrink-0',
                    isSelected ? 'bg-brand' : 'bg-transparent max-lg:hidden'
                  )}
                />
                <span className="truncate">{item.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RevealKitManifestSection({ kit, videos = [] }) {
  let normalizedItems;
  const metadata = kit?.metadata || {};
  const formats = metadata.formats || [];
  const components = kit?.components || [];

  const previewMediaItems = (normalizedItems =
    components.length > 0
      ? components.map((component, index) => ({
          index,
          key: component.slug,
          label: component.title,
          category: getKitItemBadge(component.variant_kind)?.id || 'hero',
          previewType: component.preview_video_url ? 'video' : 'image',
          previewSrc:
            component.preview_video_url ||
            component.preview_image_url ||
            '/imgs/kits_coming_soon.jpg',
        }))
      : (metadata.variant_kinds || []).map((variant, index) => ({
          index,
          key: variant.key,
          label: variant.label,
          category: variant.key?.includes('cover') ? 'cover' : 'hero',
          previewType: 'video',
          previewSrc: videos[index],
        }))).map((item) => ({
    type: item.previewType,
    src: item.previewSrc,
  }));

  const coverItems = normalizedItems.filter((item) => item.category === 'cover');
  const heroItems = normalizedItems.filter((item) => item.category === 'hero');
  const listContainerRef = useRef(null);

  const descriptionText =
    components.length > 0
      ? `All ${components.length} components: preloaders and hero sections, every one built to drop in and tune. Hover any to preview it.`
      : 'A complete entrance system: preloaders and hero sections, every one built to drop in and tune. Hover any to preview it.';

  const specs = [
    {
      label: 'Formats',
      value: `${formats.join(' · ') || 'React · Vue · HTML'}. ${KIT_EXCLUSION_NOTE}`,
    },
    {
      label: 'One attribute API',
      value:
        'Set timing, easing, and intensity once. The whole system stays in sync.',
    },
    {
      label: 'Production-ready',
      value:
        'Typed, SSR-safe, reduced-motion aware, with a performance budget per component.',
    },
    {
      label: 'Yours forever',
      value:
        'One purchase. Every future update to this Kit, at no extra cost.',
    },
  ];

  return (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">
              What&apos;s inside
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[24ch] font-medium"
            >
              Everything you get.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[58ch] leading-relaxed text-foreground-muted"
            >
              {descriptionText}
            </AnimatedText>
            <div
              ref={listContainerRef}
              className="mt-40 grid grid-cols-12 gap-x-24 gap-y-32"
            >
              <ManifestCategoryColumn
                eyebrow={`Preloaders${coverItems.length ? ` (${coverItems.length})` : ''}`}
                items={coverItems}
                className="col-span-12 lg:col-span-6"
              />
              <ManifestCategoryColumn
                eyebrow={`Hero sections${heroItems.length ? ` (${heroItems.length})` : ''}`}
                items={heroItems}
                className="col-span-12 lg:col-span-6"
              />
            </div>
            <div className="mt-40 grid grid-cols-1 gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-col gap-8 bg-background px-20 py-24"
                >
                  <span className="flex items-center gap-8 text-mono-sm text-foreground">
                    <span
                      aria-hidden="true"
                      className="size-6 shrink-0 bg-brand"
                    />
                    {spec.label}
                  </span>
                  <span className="text-body-sm leading-relaxed text-foreground-muted">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MediaHoverReveal
        containerRef={listContainerRef}
        items={previewMediaItems}
        width={240}
        frameClassName="border border-foreground/15"
      />
    </section>
  );
}

function ManifestCategoryColumn({ eyebrow, items, className = '' }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-accent-2xs text-foreground-muted">{eyebrow}</span>
      <ul className="mt-16 flex flex-col divide-y divide-foreground/10 border-y border-foreground/10">
        {items.map((item) => (
          <li
            key={item.key}
            data-hfp-index={item.index}
            className="-mx-12 flex items-center gap-12 px-12 py-16 transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/[0.04]"
          >
            <span aria-hidden="true" className="size-8 shrink-0 bg-brand" />
            <span className="text-h5 text-foreground">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RevealKitCaptureSection() {
  return (
    <section
      data-theme="light"
      data-starter-pack-band={true}
      className="bg-background text-foreground"
    >
      <div className="v2-container py-96 lg:py-160">
        <div className="grid grid-cols-12 gap-x-24 gap-y-32 lg:items-center">
          <div className="col-span-12 lg:col-span-5 lg:col-start-2">
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="font-medium"
            >
              {t('kits.capture.headline')}
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body mt-16 leading-relaxed text-foreground-muted"
            >
              {t('kits.capture.body')}
            </AnimatedText>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-8">
            <NewsletterForm
              source="kit-reveal-page"
              idPrefix="kit-reveal"
              buttonLabel={t('kits.capture.buttonLabel')}
              inputSize="lg"
              emailPlaceholder={t('kits.capture.emailPlaceholder')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const REACT_CODE_SNIPPET = `import RevealCounterColumns from "./reveal/counter-columns";

export default function Layout({ children }) {
  return (
    <>
      <RevealCounterColumns minDuration={4000} exit="up" />
      {children}
    </>
  );
}`;

const VUE_CODE_SNIPPET = `<script setup>
import RevealCounterColumns from "./reveal/counter-columns.vue";
</script>

<template>
  <RevealCounterColumns :min-duration="4000" exit="up" />
  <slot />
</template>`;

const HTML_CODE_SNIPPET = `<div
  data-anm-kit-reveal-counter-columns
  data-anm-min-duration="4000"
  data-anm-exit="up"
  role="status"
  aria-busy="true"
>
  <!-- columns + counter markup from the kit files -->
</div>`;

const CSS_CODE_SNIPPET = `/* Each component ships themeable tokens on its root. */
[data-anm-kit-reveal-counter-columns] {
  --reveal-counter-columns-bg: #0a0a0a;
  --reveal-counter-columns-stroke: #f4efe9;
}`;

const JS_CODE_SNIPPET = `// The vanilla build self-initializes and exposes a
// namespaced public handle - collision-safe next to
// any Library animation on the same page.
window.Anm.kit.reveal.counterColumns.forceComplete();

// Sync your page entrance to the release frame:
document.addEventListener("reveal:opening", startEntrances);`;

const REVEAL_CODE_STATE = {
  react: REACT_CODE_SNIPPET,
  vue: VUE_CODE_SNIPPET,
  html: HTML_CODE_SNIPPET,
  css: CSS_CODE_SNIPPET,
  js: JS_CODE_SNIPPET,
};

const REVEAL_ANIMATION_META = {
  id: 'reveal-kit-usage',
  slug: 'reveal',
  title: 'Reveal',
  category: 'kit',
  react_code: REACT_CODE_SNIPPET,
  vue_code: VUE_CODE_SNIPPET,
  html_code: HTML_CODE_SNIPPET,
  css_code: CSS_CODE_SNIPPET,
  js_code: JS_CODE_SNIPPET,
};

function RevealKitCodeSection() {
  return (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="jsx-d0166576148eee8d v2-container pt-64 pb-64 lg:pt-96 lg:pb-96">
        <div className="jsx-d0166576148eee8d grid grid-cols-12 gap-x-24 gap-y-40 lg:items-center">
          <div className="jsx-d0166576148eee8d col-span-12 lg:col-span-4 lg:col-start-2">
            <span className="jsx-d0166576148eee8d text-mono-sm text-foreground-muted">
              The code
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 font-medium"
            >
              Code you would have written anyway.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body mt-16 leading-relaxed text-foreground-muted"
            >
              Real React, Vue, and HTML. Typed, SSR-safe, reduced-motion aware.
              GSAP for the motion, Three.js for the WebGL variants. Paste it and
              ship.
            </AnimatedText>
          </div>
          <div className="jsx-d0166576148eee8d col-span-12 lg:col-span-5 lg:col-start-7">
            <div className="jsx-d0166576148eee8d reveal-code-panel h-[340px] lg:h-[400px]">
              <CodeViewer
                codeState={REVEAL_CODE_STATE}
                animation={REVEAL_ANIMATION_META}
                defaultPlatform="react"
              />
            </div>
          </div>
        </div>
        <_JSXStyle id="d0166576148eee8d">
          {
            '.reveal-code-panel.jsx-d0166576148eee8d [data-lenis-prevent]{pointer-events:none;overflow:hidden!important}'
          }
        </_JSXStyle>
      </div>
    </section>
  );
}

gsap.registerPlugin(ScrollTrigger);

function ScrollHighlightList({
  items,
  eyebrow,
  triggerRef,
  className = '',
  itemClassName = 'text-body',
}) {
  const listWrapRef = useRef(null);
  const markerRef = useRef(null);
  const itemRefs = useRef([]);

  useGSAP(
    () => {
      const triggerEl = triggerRef?.current || listWrapRef.current;
      const listEl = listWrapRef.current;
      const markerEl = markerRef.current;
      if (!triggerEl || !listEl || !markerEl) return;

      const validItems = itemRefs.current.filter(Boolean);
      if (!validItems.length) return;

      const mm = gsap.matchMedia();

      mm.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        () => {
          const setMarkerY = gsap.quickTo(markerEl, 'y', {
            duration: 0.3,
            ease: 'power2.out',
          });
          const setMarkerRotation = gsap.quickTo(markerEl, 'rotation', {
            duration: 0.1,
            ease: 'none',
          });
          const itemQuickX = validItems.map((el) =>
            gsap.quickTo(el, 'x', {
              duration: 0.5,
              ease: 'back.out(1.4)',
            })
          );
          const count = validItems.length;
          const getOffsetForDistance = (distance) =>
            distance >= 5 ? 0 : 48 * (1 - distance / 5) ** 3;
          const getCenterOffset = () => {
            const rect = listEl.getBoundingClientRect();
            return window.innerHeight / 2 - rect.top;
          };

          const triggerInstance = ScrollTrigger.create({
            trigger: triggerEl,
            start: 'top 55%',
            end: 'bottom 45%',
            onUpdate: (self) => {
              setMarkerRotation(360 * self.progress);
              setMarkerY(getCenterOffset());
              const activeFloatIndex = self.progress * (count - 1 + 2) - 1;
              for (let idx = 0; idx < count; idx++) {
                itemQuickX[idx]?.(
                  getOffsetForDistance(Math.abs(idx - activeFloatIndex))
                );
              }
            },
            onEnter: () =>
              gsap.to(markerEl, {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: 'back.out(1.7)',
              }),
            onLeave: () => {
              gsap.to(markerEl, {
                opacity: 0,
                scale: 0,
                duration: 0.3,
                ease: 'power2.in',
              });
              for (const setItemX of itemQuickX) {
                setItemX(0);
              }
            },
            onEnterBack: () =>
              gsap.to(markerEl, {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: 'back.out(1.7)',
              }),
            onLeaveBack: () => {
              gsap.to(markerEl, {
                opacity: 0,
                scale: 0,
                duration: 0.3,
                ease: 'power2.in',
              });
              for (const setItemX of itemQuickX) {
                setItemX(0);
              }
            },
          });

          const handleResize = () => setMarkerY(getCenterOffset());
          window.addEventListener('resize', handleResize);

          return () => {
            window.removeEventListener('resize', handleResize);
            triggerInstance.kill();
          };
        }
      );

      mm.add('(max-width: 1023px)', () => {
        gsap.set(validItems, {
          opacity: 0,
        });
        gsap.to(validItems, {
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: listEl,
            start: 'top 80%',
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    {
      scope: listWrapRef,
    }
  );

  return (
    <div className={className}>
      {eyebrow && (
        <AnimatedText
          tag="p"
          className="text-mono-sm mb-40 text-foreground-muted"
          type="lines"
          mask="lines"
          duration={0.55}
          stagger={0.04}
          ease="power2.out"
          animationProps={{
            yPercent: 100,
          }}
          triggerMode="scroll"
        >
          {eyebrow}
        </AnimatedText>
      )}
      <div ref={listWrapRef} className="relative flex w-full flex-col">
        <div
          ref={markerRef}
          className="pointer-events-none absolute left-0 top-0 z-10 hidden size-8 bg-brand lg:block"
          style={{
            opacity: 0,
            scale: 0,
            transform: 'translateY(-50%)',
          }}
          aria-hidden="true"
        />
        {items.map((itemText, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          return (
            <ul
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={`list-none py-20 ${itemClassName} ${isFirst ? 'pt-0' : 'border-t border-foreground/10'} ${isLast ? 'pb-0' : ''}`}
            >
              <li>
                <AnimatedText
                  type="lines"
                  mask="lines"
                  duration={0.6}
                  stagger={0.04}
                  ease="power2.out"
                  animationProps={{
                    yPercent: 100,
                  }}
                  triggerMode="scroll"
                >
                  {itemText}
                </AnimatedText>
              </li>
            </ul>
          );
        })}
      </div>
    </div>
  );
}

const REVEAL_INCLUDED_ITEMS = [
  'Every Reveal component, in React, Vue and HTML / CSS / JS. Not for Webflow.',
  'A perpetual license. Yours forever, on unlimited commercial projects.',
  'Lifetime updates, every future addition to this Kit at no extra cost.',
  'Production-ready. Typed, SSR-safe, reduced-motion aware. GSAP and Three.js.',
];

function RevealKitPricingSection({ kit, owns = false, priceId = null }) {
  const sectionRef = useRef(null);
  const fallbackPriceDisplay =
    kit?.metadata?.price_display ||
    (isKitAvailable(kit) ? null : 'Announced at launch');

  return (
    <section
      ref={sectionRef}
      data-theme="light"
      className="bg-background text-foreground"
    >
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <div className="grid grid-cols-12 gap-x-24 gap-y-40 lg:items-start">
              <div className="col-span-12 lg:col-span-5">
                <span className="text-mono-sm text-foreground-muted">
                  Pricing
                </span>
                <RevealHeading
                  as="h2"
                  sizeClass="text-h2"
                  trigger="scroll"
                  className="mt-16 max-w-[16ch] font-medium"
                >
                  One purchase. Yours forever.
                </RevealHeading>
                <div className="mt-32">
                  <p className="text-h3 font-medium text-foreground">
                    <KitPrice
                      kitSlug={kit?.slug}
                      fallback={fallbackPriceDisplay || 'See checkout'}
                      struckClassName="text-body font-normal text-foreground-muted"
                    />
                  </p>
                  <p className="text-body-sm mt-8 text-foreground-muted">
                    One-time. No subscription, no seats.
                  </p>
                </div>
                <KitPurchaseCta
                  kit={kit}
                  owns={owns}
                  priceId={priceId}
                  className="mt-24"
                />
                <div className="mt-20 flex flex-col gap-8">
                  <span className="flex items-center gap-8 text-mono-sm text-foreground-muted">
                    <span
                      aria-hidden="true"
                      className="size-6 shrink-0 bg-brand"
                    />
                    Final sale, so no refunds
                  </span>
                  <span className="text-body-sm text-foreground-muted">
                    {KIT_MEMBER_DISCOUNT_NOTE}
                  </span>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                <ScrollHighlightList
                  items={REVEAL_INCLUDED_ITEMS}
                  eyebrow="What you get"
                  triggerRef={sectionRef}
                  itemClassName="text-h4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const REVEAL_KIT_FAQS = [
  {
    q: 'Is the Reveal Kit part of the Library subscription?',
    a: 'No. The Reveal Kit is a stand-alone product, bought once and owned forever. The Library is a separate yearly subscription, billed and accessed independently from any Kit.',
  },
  {
    q: 'Which frameworks does it ship in?',
    a: 'The Reveal Kit ships in React, Vue, and plain HTML / CSS / JS. It is not built for Webflow.',
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
    q: 'Do I have to use both WebGL and GSAP? Can I mix them?',
    a: 'No. Reveal is a mix-and-match system: pair any preloader cover with any hero section, in WebGL or GSAP, and use only the variants your project needs.',
  },
  {
    q: 'What does the Reveal Kit depend on?',
    a: 'The GSAP variants need GSAP. The WebGL variants also need Three.js. Both are standard, widely used libraries, and GSAP is free including every plugin.',
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
    a: "The Reveal Kit is final sale. You get the full code the moment you pay, so the purchase can't be returned or refunded. Every component is on this page to watch before you buy, and the refund policy has the details.",
  },
];

// NOTE: module id: 301900
export default function RevealKitPage({
  kit,
  owns = false,
  priceId = null,
  images = [],
  videos = [],
  isAuthenticated = false,
  manifest = null,
  capture = null,
  pricing = null,
}) {
  return (
    <>
      <StarterPackModal
        isAuthenticated={isAuthenticated}
        source="kit-reveal-ad"
        idPrefix="kit-reveal-modal"
        delayMs={30000}
        storageKey="anm_kit_reveal_prompt_dismissed_v1"
        eyebrow="Free starter pack"
        title="Not ready for the full Kit? Take the free components."
        description="Production GSAP for React, Vue, and HTML/CSS/JS - the same craft that is in Reveal. In your inbox the moment you subscribe."
        buttonLabel="Send it to me"
      />
      <div className="relative">
        <RevealKitHero
          kit={kit}
          owns={owns}
          priceId={priceId}
          images={images}
        />
        <BrandLogoSection />
        <RevealKitPairingSection kit={kit} />
        {manifest ?? <RevealKitManifestSection kit={kit} videos={videos} />}
        {owns ? null : (capture ?? <RevealKitCaptureSection />)}
        <RevealKitCodeSection />
        {pricing ?? (
          <RevealKitPricingSection kit={kit} owns={owns} priceId={priceId} />
        )}
        <KitFaqSection kit={kit} faqs={REVEAL_KIT_FAQS} />
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