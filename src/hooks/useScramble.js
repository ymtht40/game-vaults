'use client';

// Variable Mapping: A -> DEFAULT_SCRAMBLE_CHARS, u -> duration, t -> speed, a -> chars, n -> firstColorClass, r -> secondColorClass, l -> elementRef, F -> timelineRef, E -> originalTextRef, i -> isAnimatingRef, C -> resetElementStyles, c -> kill, h -> scramble, o -> randomPassText, d -> nonSpaceCount

import { useRef, useEffect, useCallback } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'; // NOTE: module id: 437302

gsap.registerPlugin(ScrambleTextPlugin);

export const DEFAULT_SCRAMBLE_CHARS =
  " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

function generateRandomText(sourceText, charPool) {
  let result = '';
  for (let index = 0; index < sourceText.length; index++) {
    result +=
      sourceText[index] === ' '
        ? ' '
        : charPool[Math.floor(Math.random() * charPool.length)];
  }
  return result;
}

// NOTE: module id: 254359
export function useScramble({
  duration = 0.5,
  speed = 1,
  chars = DEFAULT_SCRAMBLE_CHARS,
  firstColorClass = 'scramble-brand',
  secondColorClass = 'scramble-inherit',
} = {}) {
  const elementRef = useRef(null);
  const timelineRef = useRef(null);
  const originalTextRef = useRef('');
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (elementRef.current) {
      originalTextRef.current = elementRef.current.innerText ?? '';
    }
  }, []);

  const resetElementStyles = useCallback(() => {
    const el = elementRef.current;
    if (el) {
      gsap.set(el, {
        clearProps: 'width,height,display,overflow,whiteSpace',
      });
    }
  }, []);

  const kill = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
    isAnimatingRef.current = false;
    resetElementStyles();
  }, [resetElementStyles]);

  const scramble = useCallback(
    (newTextArg) => {
      const el = elementRef.current;
      if (!el || isAnimatingRef.current) return;

      const explicitText = typeof newTextArg === 'string' ? newTextArg : null;
      const targetText =
        explicitText ?? (originalTextRef.current || el.innerText || '');

      if (targetText.trim().length === 0) return;

      originalTextRef.current = targetText;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (explicitText != null) {
          el.innerText = explicitText;
        }
        return;
      }

      kill();
      isAnimatingRef.current = true;

      gsap.set(el, {
        width: 'auto',
        height: 'auto',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      });
      gsap.set(el, {
        width: el.offsetWidth,
        height: el.offsetHeight,
        display: 'inline-block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      });

      const randomPassText = generateRandomText(targetText, chars);
      const nonSpaceCount = targetText.replace(/\s/g, '').length;
      const secondPassOffset = nonSpaceCount > 0 ? duration / nonSpaceCount : 0;

      timelineRef.current = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          timelineRef.current = null;
          resetElementStyles();
        },
      });

      timelineRef.current
        .to(el, {
          duration,
          scrambleText: {
            text: randomPassText,
            chars,
            speed,
            revealDelay: 0.1,
            oldClass: firstColorClass,
            newClass: firstColorClass,
          },
          ease: 'none',
        })
        .to(
          el,
          {
            duration,
            scrambleText: {
              text: targetText,
              chars,
              speed,
              revealDelay: 0.1,
              oldClass: firstColorClass,
              newClass: secondColorClass,
            },
            ease: 'none',
          },
          secondPassOffset
        );
    },
    [duration, speed, chars, firstColorClass, secondColorClass, kill, resetElementStyles]
  );

  useEffect(() => kill, [kill]);

  return {
    ref: elementRef,
    scramble,
    kill,
  };
}

export { DEFAULT_SCRAMBLE_CHARS as X, useScramble as j };

