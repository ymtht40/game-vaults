'use client';

// Variable Mapping: w -> RevealPairingSection?, e -> kit, a -> components, n -> covers, s -> heroes, o -> hasPairs, c -> resolveDefaultSlug, d -> selectedCover, u -> setSelectedCover, m -> selectedHero, p -> setSelectedHero, x -> replayKey, f -> setReplayKey, h -> sectionRef, v -> isInView, b -> setIsInView, C -> speed, k -> setSpeed, S -> debouncedSpeed, M -> setDebouncedSpeed, L -> previewUrl

import { useEffect, useMemo, useRef, useState } from 'react';
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import { ReplayIcon } from '@/assets/icons'; // NOTE: module id: 182006 // UNRESOLVED: name guessed from usage
import RangeSlider from '@/components/ui/RangeSlider'; // NOTE: module id: 125303 // UNRESOLVED: name guessed from usage
import { getVariantKindMeta } from '@/features/kits/utils/menuKits'; // NOTE: module id: 12426 // UNRESOLVED: name guessed from usage
import { PairingVariantList } from '@/features/kits/reveal/PairingVariantList'; // NOTE: module id: 301900

// NOTE: module id: 301900
export function RevealPairingSection({ kit }) {
  const components = kit?.components || [];
  const { covers, heroes } = useMemo(() => {
    const coverList = [];
    const heroList = [];
    for (const item of components) {
      const kindId = getVariantKindMeta(item.variant_kind)?.id;
      if (kindId === 'cover') {
        coverList.push(item);
      } else if (kindId === 'hero') {
        heroList.push(item);
      }
    }
    return {
      covers: coverList,
      heroes: heroList,
    };
  }, [components]);

  const hasPairs = covers.length > 0 && heroes.length > 0;
  const resolveDefaultSlug = (items, preferredSlug) =>
    items.find((item) => item.slug === preferredSlug)?.slug ||
    items[0]?.slug ||
    '';

  const [selectedCover, setSelectedCover] = useState(
    resolveDefaultSlug(covers, 'logo-fill-cover')
  );
  const [selectedHero, setSelectedHero] = useState(
    resolveDefaultSlug(heroes, 'tile-orb')
  );
  const [replayKey, setReplayKey] = useState(0);
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || isInView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '0px 0px -25% 0px',
      }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isInView]);

  const [speed, setSpeed] = useState(1);
  const [debouncedSpeed, setDebouncedSpeed] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSpeed(speed), 350);
    return () => clearTimeout(timer);
  }, [speed]);

  const previewUrl =
    hasPairs && isInView
      ? `/api/sandbox/kit/${kit.slug}/pair?cover=${encodeURIComponent(selectedCover)}&hero=${encodeURIComponent(selectedHero)}&speed=${debouncedSpeed}&k=${replayKey}`
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
              Preloaders and hero sections are one system. The preloader's release frame triggers the hero's first frame. Pick a pair and watch the real handoff.
            </AnimatedText>
            {hasPairs ? (
              <div className="mt-40 flex flex-col border border-foreground/15 bg-foreground/[0.04] lg:grid lg:grid-cols-[240px_1fr]">
                <div
                  data-theme="dark"
                  className="flex flex-col border-t border-foreground/15 bg-background p-16 text-foreground lg:min-h-0 lg:border-t-0 lg:border-r"
                >
                  <div className="flex flex-col gap-20 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                    <PairingVariantList
                      label="Preloaders"
                      items={covers}
                      value={selectedCover}
                      onSelect={setSelectedCover}
                    />
                    <PairingVariantList
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
                      value={speed}
                      onChange={(val) => setSpeed(parseFloat(val))}
                    />
                    <button
                      type="button"
                      onClick={() => setReplayKey((prev) => prev + 1)}
                      aria-label="Replay the handoff"
                      className="flex items-center justify-center gap-6 bg-foreground px-10 py-8 text-background transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90 max-lg:h-40 max-lg:text-body-sm lg:text-accent-xs"
                    >
                      <ReplayIcon size={12} />
                      Replay
                    </button>
                  </div>
                </div>
                <div className="relative order-first aspect-[4/5] w-full overflow-hidden bg-foreground/[0.06] lg:order-none lg:aspect-[16/10]">
                  {previewUrl ? (
                    <iframe
                      key={`${selectedCover}-${selectedHero}-${debouncedSpeed}-${replayKey}`}
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
