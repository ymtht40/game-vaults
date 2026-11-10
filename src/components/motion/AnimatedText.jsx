'use client';

// Variable Mapping: _ -> containerRef, F -> splitInstanceRef, H -> tweenRef, M -> hasPageEnteredRef, W -> fontsLoaded, L -> setFontsLoaded, q -> resolvedType, $ -> resolvedMask, I -> splitTypeString, P -> initialFromVars, U -> getHasTriggered, z -> markAnimationStarted

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495
import { SplitText } from 'gsap/SplitText'; // NOTE: module id: 875324
import { useAnimation, usePageEnterAnimation } from '@/providers/AnimationProvider'; // NOTE: module id: 488463

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// NOTE: module id: 218091
export default function AnimatedText({
  children,
  type,
  duration = 0.8,
  delay = 0,
  ease = 'power4.out',
  mask,
  stagger = 0.05,
  from,
  animationProps,
  triggerMode = 'scroll',
  start,
  toggleActions,
  scrollTrigger,
  autoSplit = true,
  deepSlice = true,
  linesClass,
  wordsClass,
  charsClass,
  aria = 'none',
  propIndex = false,
  onComplete,
  onSplitCallback,
  onReady,
  className = '',
  tag: Tag = 'div',
  revertOnComplete = false,
  ...props
}) {
  const containerRef = useRef(null);
  const splitInstanceRef = useRef(null);
  const tweenRef = useRef(null);
  const hasPageEnteredRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsLoaded(true));
  }, []);

  let resolvedType = type;
  let resolvedMask = mask;
  if (resolvedType === undefined && resolvedMask === undefined) {
    resolvedType = 'lines';
    resolvedMask = 'lines';
  }

  const splitTypeString =
    resolvedType || (resolvedMask ? `${resolvedMask},words` : 'lines,words,chars');
  const initialFromVars = animationProps || from || { opacity: 0, y: 30 };

  const { getHasTriggered } = useAnimation();

  const markAnimationStarted = () => {
    if (containerRef.current) {
      containerRef.current.setAttribute('data-animation-started', 'true');
    }
  };

  usePageEnterAnimation(
    () => {
      hasPageEnteredRef.current = true;
      markAnimationStarted();
      if (tweenRef.current) {
        tweenRef.current.restart(true);
      }
    },
    [],
    'AnimatedText',
    triggerMode === 'pageEnter'
  );

  useEffect(() => {
    if (
      triggerMode === 'pageEnter' &&
      fontsLoaded &&
      tweenRef.current &&
      getHasTriggered() &&
      hasPageEnteredRef.current
    ) {
      const timerId = setTimeout(() => {
        if (tweenRef.current) {
          markAnimationStarted();
          tweenRef.current.restart(true);
        }
      }, 50);
      return () => clearTimeout(timerId);
    }
  }, [triggerMode, fontsLoaded, getHasTriggered]);

  useGSAP(
    () => {
      if (!containerRef.current || !fontsLoaded) return;

      const splitConfig = {
        type: splitTypeString,
        aria,
        deepSlice,
        propIndex,
        autoSplit,
        ...(resolvedMask && { mask: resolvedMask }),
        ...(linesClass && { linesClass }),
        ...(wordsClass && { wordsClass }),
        ...(charsClass && { charsClass }),
        onSplit(self) {
          splitInstanceRef.current = self;
          if (onSplitCallback) onSplitCallback(self);

          const requestedTypes = splitTypeString.split(',').map((item) => item.trim());
          const targets =
            requestedTypes.includes('chars') && self.chars?.length > 0
              ? self.chars
              : requestedTypes.includes('words') && self.words?.length > 0
              ? self.words
              : requestedTypes.includes('lines') && self.lines?.length > 0
              ? self.lines
              : [];

          if (targets.length === 0) return;

          const tweenVars = {
            ...initialFromVars,
            duration,
            delay,
            ease,
            stagger,
            ...(onComplete && {
              onComplete: () => {
                onComplete();
                if (revertOnComplete && self) {
                  self.revert();
                }
              }
            })
          };

          if (triggerMode === 'scroll') {
            const scrollTriggerConfig = {
              trigger: containerRef.current,
              start: start || 'top 80%',
              ...(typeof scrollTrigger === 'object' && scrollTrigger)
            };
            if (toggleActions) {
              scrollTriggerConfig.toggleActions = toggleActions;
            }
            tweenVars.scrollTrigger = scrollTriggerConfig;
            tweenRef.current = gsap.from(targets, tweenVars);
          } else if (triggerMode === 'immediate') {
            tweenRef.current = gsap.from(targets, tweenVars);
          } else {
            tweenRef.current = gsap.from(targets, { ...tweenVars, paused: true });
            if (triggerMode === 'pageEnter' && hasPageEnteredRef.current) {
              markAnimationStarted();
              tweenRef.current.restart(true);
            }
            if (triggerMode === 'manual' && onReady) {
              onReady(() => {
                if (tweenRef.current) {
                  tweenRef.current.restart(true);
                }
              });
            }
          }

          return tweenRef.current;
        }
      };

      splitInstanceRef.current = SplitText.create(containerRef.current, splitConfig);

      return () => {
        if (tweenRef.current) {
          tweenRef.current.kill();
          tweenRef.current = null;
        }
        if (splitInstanceRef.current) {
          splitInstanceRef.current.revert();
          splitInstanceRef.current = null;
        }
      };
    },
    { scope: containerRef, dependencies: [triggerMode, fontsLoaded] }
  );

  return (
    <Tag
      ref={containerRef}
      className={className}
      data-page-enter-animation={triggerMode === 'pageEnter' ? 'true' : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}

