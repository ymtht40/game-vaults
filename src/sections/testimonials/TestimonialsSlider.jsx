'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { testimonials } from '@/libs/data/testimonials';
import { t } from '@/libs/utils/i18n';
import RevealHeading from '@/components/motion/RevealHeading';
import { CaretLeftIcon } from '@phosphor-icons/react';
import { CaretRightIcon } from '@phosphor-icons/react';

gsap.registerPlugin(CustomEase, SplitText);
CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1');

const defaultTestimonials = [...testimonials].sort(
  (a, b) => /Lunardi/.test(b.name) - /Lunardi/.test(a.name),
);

export default function TestimonialsSection({ items = defaultTestimonials }) {
  const sectionRef = useRef(null);
  const quoteRefs = useRef([]);
  const nameRefs = useRef([]);
  const roleRefs = useRef([]);
  const avatarRefs = useRef([]);
  const splitLinesRef = useRef([]);
  const navigateRef = useRef(() => {});
  const [, setActiveIndex] = useState(0);
  const totalItems = items.length;

  useGSAP(
    () => {
      let currentIndex = 0;
      let activeTimeline = null;
      let isReady = false;

      splitLinesRef.current = [];

      quoteRefs.current.forEach((el, index) => {
        gsap.set(el, { autoAlpha: index === 0 ? 1 : 0 });
      });

      [nameRefs, roleRefs].forEach((refGroup) => {
        refGroup.current.forEach((el, index) => {
          gsap.set(el, { yPercent: index !== 0 ? 110 : 0 });
        });
      });

      avatarRefs.current.forEach((el, index) => {
        gsap.set(el, { autoAlpha: index === 0 ? 1 : 0 });
      });

      const splitInstances = quoteRefs.current.map((el, index) =>
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          aria: 'none',
          autoSplit: true,
          onSplit: (self) => {
            splitLinesRef.current[index] = self.lines;
            gsap.set(self.lines, {
              yPercent: index !== currentIndex ? 110 : 0,
            });
            gsap.set(el, { autoAlpha: 1 });
            if (
              splitLinesRef.current.filter(Boolean).length ===
              quoteRefs.current.length
            ) {
              isReady = true;
            }
          },
        }),
      );

      navigateRef.current = (direction) => {
        if (!isReady) return;
        if (activeTimeline) activeTimeline.progress(1);

        const prevIndex = currentIndex;
        const nextIndex = (currentIndex + direction + totalItems) % totalItems;
        currentIndex = nextIndex;
        setActiveIndex(nextIndex);

        const exitYPercent = direction > 0 ? -110 : 110;
        const motionScale = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
          ? 0
          : 1;

        activeTimeline = gsap.timeline({
          defaults: { ease: 'annnimateInOut' },
        });
        activeTimeline
          .to(
            splitLinesRef.current[prevIndex],
            {
              yPercent: exitYPercent,
              duration: 0.6 * motionScale,
              stagger: 0.04 * motionScale,
            },
            0,
          )
          .fromTo(
            splitLinesRef.current[nextIndex],
            { yPercent: -exitYPercent },
            {
              yPercent: 0,
              duration: 0.8 * motionScale,
              stagger: 0.05 * motionScale,
            },
            0.12 * motionScale,
          )
          .to(
            [nameRefs.current[prevIndex], roleRefs.current[prevIndex]],
            {
              yPercent: exitYPercent,
              duration: 0.6 * motionScale,
              stagger: 0.04 * motionScale,
            },
            0,
          )
          .fromTo(
            [nameRefs.current[nextIndex], roleRefs.current[nextIndex]],
            { yPercent: -exitYPercent },
            {
              yPercent: 0,
              duration: 0.8 * motionScale,
              stagger: 0.05 * motionScale,
            },
            0.12 * motionScale,
          )
          .to(
            avatarRefs.current[prevIndex],
            { autoAlpha: 0, duration: 0.8 * motionScale },
            0,
          )
          .to(
            avatarRefs.current[nextIndex],
            { autoAlpha: 1, duration: 0.8 * motionScale },
            0,
          );
      };

      return () => {
        activeTimeline?.kill();
        splitInstances.forEach((instance) => instance.revert());
      };
    },
    { scope: sectionRef, dependencies: [totalItems] },
  );

  return (
    <section
      ref={sectionRef}
      data-theme="light"
      className="bg-background py-64 text-foreground lg:py-160"
    >
      <div className="v2-container grid grid-cols-12 gap-x-24 gap-y-48">
        <div className="col-span-12 flex flex-col justify-between gap-48 lg:col-span-3">
          <RevealHeading
            as="h2"
            sizeClass="text-h2"
            className="font-medium text-balance"
            trigger="scroll"
          >
            {t('common.testimonials.heading')}
          </RevealHeading>
          <div className="flex gap-8">
            {[
              { dir: -1, label: 'Previous testimonial', Icon: CaretLeftIcon },
              { dir: 1, label: 'Next testimonial', Icon: CaretRightIcon },
            ].map(({ dir, label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() => navigateRef.current(dir)}
                className="inline-flex size-40 cursor-pointer items-center justify-center bg-surface text-foreground transition-[background-color,scale] duration-200 ease-(--ease-expo-out) hover:bg-surface/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/60 active:scale-90"
              >
                <Icon className="size-16" />
              </button>
            ))}
          </div>
        </div>

        <figure
          className="col-span-12 flex flex-col gap-32 lg:col-span-8 lg:col-start-5"
          aria-live="polite"
        >
          <blockquote className="grid">
            {items.map((item, index) => (
              <p
                key={item.name}
                ref={(el) => {
                  quoteRefs.current[index] = el;
                }}
                className="text-h3 w-full !font-normal text-wrap [grid-area:1/1]"
              >
                <span
                  aria-hidden="true"
                  className="hidden w-[4em] lg:inline-block"
                />
                {item.body}
              </p>
            ))}
          </blockquote>

          <div className="flex items-center gap-16">
            <div className="relative size-56 shrink-0 overflow-hidden">
              {items.map((item, index) => (
                <img
                  key={item.name}
                  ref={(el) => {
                    avatarRefs.current[index] = el;
                  }}
                  src={item.avatarSrc}
                  alt=""
                  className="absolute inset-0 object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              ))}
            </div>

            <div className="flex flex-col">
              <div className="grid overflow-hidden">
                {items.map((item, index) => (
                  <p
                    key={item.name}
                    ref={(el) => {
                      nameRefs.current[index] = el;
                    }}
                    className="text-body font-medium [grid-area:1/1]"
                  >
                    {item.name}
                  </p>
                ))}
              </div>
              <div className="grid overflow-hidden">
                {items.map((item, index) => (
                  <p
                    key={item.name}
                    ref={(el) => {
                      roleRefs.current[index] = el;
                    }}
                    className="text-body-sm text-foreground-muted [grid-area:1/1]"
                  >
                    {item.role}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
