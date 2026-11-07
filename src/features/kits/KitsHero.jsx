'use client';

// Variable Mapping: g -> heroTextAnimation, o -> activeIndex, c -> setActiveIndex, h -> halfRefs, p -> heroRef

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
// UNRESOLVED: original source path or export names are absent from this chunk.
import RevealHeading from '@/animations/RevealHeading'; // NOTE: module id: 963160
// UNRESOLVED: original source path or export names are absent from this chunk.
import Reveal from '@/animations/FadeIn'; // NOTE: module id: 460391
// UNRESOLVED: original source path or export names are absent from this chunk.
import SplitTextReveal from '@/features/demos/SplitTextReveal'; // NOTE: module id: 218091
// UNRESOLVED: original source path or export names are absent from this chunk.
import { ANNNIMATE_EASE, prefersReducedMotion } from '@/features/common/IsometricFigure'; // NOTE: module id: 576720
// UNRESOLVED: original source path or export names are absent from this chunk.
import gsap from 'gsap'; // NOTE: module id: 989970
// UNRESOLVED: original source path or export names are absent from this chunk.
import { translate } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import KitHalf from '@/features/kits/KitHalf'; // NOTE: module id: 898767

const heroTextAnimation = {
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
// NOTE: module id: 898767
export default function KitsHero({ kits = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const halfRefs = useRef([]);
  const heroRef = useRef(null);
  useGSAP(
    () => {
      window.matchMedia('(min-width: 1024px)').matches &&
        halfRefs.current.forEach((half, index) => {
          half &&
            gsap.to(half, {
              flexGrow: activeIndex === index ? 1.5 : 1,
              duration: 0.45 * !prefersReducedMotion(),
              ease: ANNNIMATE_EASE,
              overwrite: true,
            });
        });
    },
    {
      dependencies: [activeIndex],
      scope: heroRef,
    },
  );
  return (
    <section
      data-theme="light"
      className="bg-background pt-96 pb-96 text-foreground lg:pt-112 lg:pb-160"
    >
      <Reveal className="v2-container">
        <div
          ref={heroRef}
          data-theme="dark"
          onPointerLeave={() =>
            !window.matchMedia('(hover: none)').matches && setActiveIndex(null)
          }
          className="v3-rail flex gap-12 text-foreground [--rail-item:85%] md:flex-col lg:flex-row"
        >
          {kits.map((kit, index) => (
            <KitHalf
              kit={kit}
              active={activeIndex === index}
              onEnter={() =>
                !window.matchMedia('(hover: none)').matches && setActiveIndex(index)
              }
              onTap={() =>
                window.matchMedia('(hover: none)').matches &&
                setActiveIndex((currentIndex) => (currentIndex === index ? null : index))
              }
              halfRef={(node) => (halfRefs.current[index] = node)}
              key={kit.slug}
            />
          ))}
        </div>
      </Reveal>
      <div className="v2-container grid gap-16 pt-32 lg:grid-cols-2 lg:gap-12 lg:pt-40">
        <RevealHeading
          as="h1"
          sizeClass="text-h2"
          className="max-w-[22ch] font-medium text-balance"
          trigger="scroll"
        >
          {translate('kits-v3.hero.headline')}
        </RevealHeading>
        <SplitTextReveal
          tag="p"
          className="text-body-lg max-w-[52ch] text-foreground-muted"
          {...heroTextAnimation}
          delay={0.3}
        >
          {translate('kits-v3.hero.sub')}
        </SplitTextReveal>
      </div>
    </section>
  );
}
