'use client';

import { useRef } from 'react';
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { IsoBoxes, useIsoBoxes, boxEase } from '@/components/canvas/IsoBoxes'; // NOTE: module id: 576720
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682

const textRevealProps = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
};

const studentBoxFig = {
  hold: true,
  model: () => [
    {
      x: -40,
      y: -40,
      z: 0,
      w: 80,
      d: 80,
      h: 64,
    },
    {
      x: -72,
      y: -72,
      z: 64,
      w: 144,
      d: 144,
      h: 4,
      accent: true,
    },
    {
      x: -5,
      y: -5,
      z: 68,
      w: 10,
      d: 10,
      h: 3,
    },
    {
      x: 5,
      y: -1,
      z: 68,
      w: 67,
      d: 2,
      h: 1,
    },
    {
      x: 72,
      y: -1.5,
      z: 38,
      w: 3,
      d: 3,
      h: 30,
    },
  ],
  cycle: (timeline, boxes) => {
    timeline.to(boxes.slice(1), {
      z: (_, box) => box.z + 40,
      duration: 0.6,
      ease: boxEase,
    });
  },
};

// Variable Mapping: e -> containerRef, u -> boxes, m -> handleMouseEnter, x -> handleMouseLeave
// NOTE: module id: 952244
export default function StudentsSection() {
  const containerRef = useRef(null);
  const { rest: boxes, onEnter: handleMouseEnter, onLeave: handleMouseLeave } = useIsoBoxes(containerRef, studentBoxFig);

  return (
    <section
      data-theme="light"
      className="bg-background py-64 text-foreground lg:py-160"
    >
      <div
        ref={containerRef}
        className="v2-container flex flex-col items-center gap-32 text-center lg:gap-48"
      >
        <FadeIn
          trigger="scroll"
          className="h-[140px] w-full max-w-[360px] lg:h-[260px]"
        >
          <div
            aria-hidden="true"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="h-full w-full"
          >
            <IsoBoxes boxes={boxes} />
          </div>
        </FadeIn>
        <div className="flex flex-col items-center gap-32">
          <div className="flex flex-col items-center gap-16">
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              className="max-w-[22ch] font-medium text-balance"
              trigger="scroll"
            >
              {t('pricing-v3.students.headline')}
            </RevealHeading>
            <AnimatedText
              tag="p"
              className="text-body-lg max-w-[46ch] text-foreground-muted"
              {...textRevealProps}
              triggerMode="scroll"
              delay={0.25}
            >
              {t('pricing-v3.students.line')}
            </AnimatedText>
          </div>
          <FadeIn
            trigger="scroll"
            delay={0.35}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Button href="/students" theme="surface">
              {t('pricing-v3.students.cta')}
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
