'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
// UNRESOLVED: cn is a usage-based name for the class-name helper.
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391

import V3Ground from '@/sections/v3/V3Ground.jsx'; // NOTE: module id: 578275

/* Variable Mapping:
 * u -> bodyAnimation, e -> headline, r -> body, h -> actions, m -> visual,
 * g -> ground, f -> pad, p -> sectionRef, x -> visualRef, callback e -> visualElement
 */
gsap.registerPlugin(ScrollTrigger);

const bodyAnimation = {
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

// NOTE: module id: 216458
export default function V3Hero({
  headline,
  body,
  actions = null,
  visual = null,
  ground = <V3Ground />,
  pad = true,
}) {
  const sectionRef = useRef(null);
  const visualRef = useRef(null);

  useGSAP(() => {
    const visualElement = visualRef.current;
    if (!visualElement || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    gsap.fromTo(
      visualElement,
      { '--ground-scale': 1 },
      {
        '--ground-scale': 0.88,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${Math.round(0.6 * window.innerHeight)}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="overflow-hidden bg-background text-foreground"
    >
      <div className="v2-container flex flex-col gap-32 pt-112 pb-32 lg:gap-64 lg:pt-200 lg:pb-96">
        <div className="grid gap-24 lg:grid-cols-12 lg:items-end lg:gap-x-24">
          <RevealHeading
            as="h1"
            sizeClass="text-h1"
            className="font-medium text-balance lg:col-span-7"
            trigger="pageEnter"
          >
            {headline}
          </RevealHeading>
          <div className="flex flex-col items-start gap-24 lg:col-span-4 lg:col-start-9">
            {body ? (
              <AnimatedText
                tag="p"
                className="text-body-lg text-foreground-muted"
                {...bodyAnimation}
                delay={0.2}
              >
                {body}
              </AnimatedText>
            ) : null}
            {actions ? <FadeIn delay={0.35}>{actions}</FadeIn> : null}
          </div>
        </div>
        <div
          ref={visualRef}
          className={cn(
            'relative',
            pad
              ? 'min-h-[520px] lg:min-h-0 lg:h-[clamp(520px,44vw,680px)]'
              : 'h-[clamp(520px,44vw,680px)]',
          )}
        >
          <div className="absolute inset-0 origin-center [transform:scale(var(--ground-scale,1))]">
            {ground}
          </div>
          <div
            className={cn(
              'relative z-[1] flex items-center justify-center [clip-path:inset(calc((1_-_var(--ground-scale,1))_*_50%))]',
              pad ? 'min-h-[inherit] px-24 py-48 lg:h-full lg:px-48' : 'h-full',
            )}
          >
            {visual}
          </div>
        </div>
      </div>
    </section>
  );
}
