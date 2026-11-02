'use client'; 

import { useRef } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import AnimatedText from '@/animations/AnimatedText'; // NOTE: module id: 218091
import { EndCtaRing, L as DEFAULT_MIN_HEIGHT_VH } from '@/features/common/EndCtaRing'; // NOTE: module id: 809214
import RevealHeading from '@/animations/RevealHeading'; // NOTE: module id: 963160
import { useRevealTimeline } from '@/hooks/useRevealTimeline'; // NOTE: module id: 228414

const DEFAULT_HEADLINE = t('common.endCta.headline');
const DEFAULT_SUBTEXT = t('common.endCta.subtext');
const DEFAULT_PRIMARY_CTA = {
  label: t('common.endCta.primaryLabel'),
  href: '/pricing',
};
const DEFAULT_SECONDARY_CTA = {
  label: t('common.endCta.secondaryLabel'),
  href: '/animations',
};

// NOTE: module id: 482232
export default function EndCta({
  headline = DEFAULT_HEADLINE,
  subtext = DEFAULT_SUBTEXT,
  primaryCta = DEFAULT_PRIMARY_CTA,
  secondaryCta = DEFAULT_SECONDARY_CTA,
  images = [],
  bleed = false,
  bleedTop = 0,
  ringOvershoot,
  ringPush,
  eyebrow,
  minimal = false,
  children = null,
}) {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRevealRef = useRef(null);

  useRevealTimeline(sectionRef, {
    mode: 'scroll',
    build: () => {
      const timeline = gsap.timeline({ paused: true });
      timeline.call(() => headingRef.current?.reveal?.(), [], 0);
      timeline.call(() => subtextRevealRef.current?.(), [], 0.2);
      return timeline;
    },
  });

  const halfIndex = Math.ceil(images.length / 2);
  const leftImages = images.slice(0, halfIndex);
  const rightImages = images.slice(halfIndex);
  const hasBleed = bleed && !minimal;
  const minHeightVh = minimal ? 50 : DEFAULT_MIN_HEIGHT_VH;
  const buttonSize = minimal ? 'sm' : 'default';

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className={`end-cta relative flex items-center bg-background text-foreground ${hasBleed ? '' : 'overflow-hidden'}`}
      style={{
        minHeight: `${minHeightVh}vh`,
        ...(hasBleed ? { clipPath: `inset(-${bleedTop}vh 0 -100vh 0)` } : null),
      }}
    >
      <EndCtaRing
        side="left"
        images={leftImages.length ? leftImages : images}
        overshoot={ringOvershoot}
        push={ringPush}
      />
      <EndCtaRing
        side="right"
        images={rightImages.length ? rightImages : images}
        overshoot={ringOvershoot}
        push={ringPush}
      />
      <EndCtaRing side="center" images={images} />

      <div className={`v2-container relative ${minimal ? 'py-96 lg:py-128' : 'py-128 lg:py-200'}`}>
        <div className="grid grid-cols-12 gap-x-24">
          <div
            className={`col-span-12 flex flex-col gap-32 lg:col-span-6 lg:col-start-4 ${children ? 'mx-auto w-full max-w-[560px] items-stretch text-left' : 'items-center text-center'}`}
          >
            {eyebrow && <p className="text-mono-sm text-foreground-muted">{eyebrow}</p>}

            <RevealHeading
              ref={headingRef}
              as="h2"
              trigger="manual"
              className="max-w-[18ch]"
            >
              {headline}
            </RevealHeading>

            {subtext ? (
              <AnimatedText
                tag="p"
                className="text-body max-w-[44ch] text-foreground-muted"
                type="lines"
                mask="lines"
                duration={0.6}
                stagger={0.03}
                ease="power2.out"
                animationProps={{ yPercent: 100 }}
                triggerMode="manual"
                onReady={(triggerReveal) => {
                  subtextRevealRef.current = triggerReveal;
                }}
              >
                {subtext}
              </AnimatedText>
            ) : null}

            {children ? (
              <div className="mt-8 w-full text-left">{children}</div>
            ) : (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-12">
                {primaryCta && (
                  <Button href={primaryCta.href} theme="brand" size={buttonSize}>
                    {primaryCta.label}
                  </Button>
                )}
                {secondaryCta && (
                  <Button href={secondaryCta.href} theme="surface" size={buttonSize}>
                    {secondaryCta.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

