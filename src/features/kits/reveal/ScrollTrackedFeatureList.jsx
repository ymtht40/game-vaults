'use client';

// Variable Mapping: I -> ScrollTrackedFeatureList?, e -> items, i -> eyebrow, o -> triggerRef, c -> className, d -> itemClassName, u -> listRef, m -> markerRef, g -> itemRefs

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage

gsap.registerPlugin(ScrollTrigger);

// NOTE: module id: 301900
export function ScrollTrackedFeatureList({
  items,
  eyebrow,
  triggerRef,
  className = '',
  itemClassName = 'text-body',
}) {
  const listRef = useRef(null);
  const markerRef = useRef(null);
  const itemRefs = useRef([]);

  useGSAP(
    () => {
      const triggerEl = triggerRef?.current || listRef.current;
      const listEl = listRef.current;
      const markerEl = markerRef.current;
      if (!triggerEl || !listEl || !markerEl) return;
      const validItems = itemRefs.current.filter(Boolean);
      if (!validItems.length) return;
      const mm = gsap.matchMedia();

      mm.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        () => {
          const quickY = gsap.quickTo(markerEl, 'y', {
            duration: 0.3,
            ease: 'power2.out',
          });
          const quickRotation = gsap.quickTo(markerEl, 'rotation', {
            duration: 0.1,
            ease: 'none',
          });
          const quickXList = validItems.map((itemEl) =>
            gsap.quickTo(itemEl, 'x', {
              duration: 0.5,
              ease: 'back.out(1.4)',
            })
          );
          const count = validItems.length;
          const calcShift = (distance) =>
            distance >= 5 ? 0 : 48 * (1 - distance / 5) ** 3;
          const calcCenterY = () => {
            const rect = listEl.getBoundingClientRect();
            return window.innerHeight / 2 - rect.top;
          };
          const trigger = ScrollTrigger.create({
            trigger: triggerEl,
            start: 'top 55%',
            end: 'bottom 45%',
            onUpdate: (self) => {
              quickRotation(360 * self.progress);
              quickY(calcCenterY());
              const activeIndex = self.progress * (count - 1 + 2) - 1;
              for (let idx = 0; idx < count; idx++) {
                quickXList[idx]?.(calcShift(Math.abs(idx - activeIndex)));
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
              for (const setX of quickXList) {
                setX(0);
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
              for (const setX of quickXList) {
                setX(0);
              }
            },
          });
          const handleResize = () => quickY(calcCenterY());
          window.addEventListener('resize', handleResize);
          return () => {
            window.removeEventListener('resize', handleResize);
            trigger.kill();
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
      scope: listRef,
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
      <div ref={listRef} className="relative flex w-full flex-col">
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
        {items.map((item, index) => {
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
                  {item}
                </AnimatedText>
              </li>
            </ul>
          );
        })}
      </div>
    </div>
  );
}
