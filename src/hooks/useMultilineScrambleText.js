'use client';

// Variable Mapping: u -> defaultOptions, t -> elementRef, n -> timelineRef, r -> originalTextRef, l -> originalHtmlRef, F -> initialSizeRef, E -> lineMetricsRef, i -> lineSpansRef, C -> isAnimatingRef, c -> isSplitPreparedRef, h -> killTimeline, s -> prepareLines, m -> scramble, o -> kill

import { useRef, useEffect, useCallback } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'; // NOTE: module id: 437302
import { DEFAULT_SCRAMBLE_CHARS } from '@/hooks/useScramble'; // NOTE: module id: 254359

gsap.registerPlugin(ScrambleTextPlugin);

function detectRenderedLines(element) {
  const fullText = element.innerText || '';
  if (fullText.trim().length === 0) return [];
  if (fullText.includes('\n')) {
    return fullText.split('\n').filter((line) => line.length > 0);
  }

  const firstChild = element.firstChild;
  if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) {
    return [fullText];
  }

  const range = document.createRange();
  const lines = [];
  let currentLine = '';
  let prevTop = null;
  const nodeLength = firstChild.length;

  for (let index = 0; index < fullText.length && index < nodeLength; index++) {
    range.setStart(firstChild, index);
    range.setEnd(firstChild, index + 1);
    const rect = range.getBoundingClientRect();
    if (prevTop !== null && Math.abs(rect.top - prevTop) > 2) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = '';
    }
    currentLine += fullText[index];
    prevTop = rect.top;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [fullText];
}

function generateRandomLineText(sourceText, charPool = DEFAULT_SCRAMBLE_CHARS) {
  let result = '';
  for (let index = 0; index < sourceText.length; index++) {
    const ch = sourceText[index];
    if (ch === ' ') {
      result += ch;
    } else {
      result += charPool[Math.floor(Math.random() * charPool.length)];
    }
  }
  return result;
}

// NOTE: module id: 798851
export function useMultilineScrambleText(defaultOptions = {}) {
  const elementRef = useRef(null);
  const timelineRef = useRef(null);
  const originalTextRef = useRef('');
  const originalHtmlRef = useRef('');
  const initialSizeRef = useRef(null);
  const lineMetricsRef = useRef([]);
  const lineSpansRef = useRef([]);
  const isAnimatingRef = useRef(false);
  const isSplitPreparedRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current) return;
    const el = elementRef.current;
    const text = el.innerText ?? '';
    if (text.trim().length > 0) {
      originalTextRef.current = text;
      originalHtmlRef.current = el.innerHTML;
      initialSizeRef.current = {
        width: el.offsetWidth,
        height: el.offsetHeight,
      };
    }
  }, []);

  const killTimeline = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
      isAnimatingRef.current = false;
    }
  }, []);

  const prepareLines = useCallback(() => {
    if (!elementRef.current || isSplitPreparedRef.current) return;
    const el = elementRef.current;
    if ((originalTextRef.current || el.innerText || '').trim().length === 0) {
      return;
    }

    if (!initialSizeRef.current) {
      initialSizeRef.current = {
        width: el.offsetWidth,
        height: el.offsetHeight,
      };
    }

    const detectedLines = detectRenderedLines(el);
    const measureDiv = document.createElement('div');
    measureDiv.style.cssText =
      'position: absolute; visibility: hidden; pointer-events: none; white-space: nowrap;';

    const computedStyle = window.getComputedStyle(el);
    measureDiv.style.font = computedStyle.font;
    measureDiv.style.fontSize = computedStyle.fontSize;
    measureDiv.style.fontFamily = computedStyle.fontFamily;
    measureDiv.style.fontWeight = computedStyle.fontWeight;
    measureDiv.style.letterSpacing = computedStyle.letterSpacing;
    measureDiv.style.textTransform = computedStyle.textTransform;

    document.body.appendChild(measureDiv);
    lineMetricsRef.current = detectedLines.map((lineText) => {
      measureDiv.textContent = lineText;
      return {
        text: lineText,
        width: measureDiv.offsetWidth,
        height: measureDiv.offsetHeight,
      };
    });
    document.body.removeChild(measureDiv);

    const maxLineWidth = Math.max(
      ...lineMetricsRef.current.map((line) => line.width)
    );
    const totalLineHeight = lineMetricsRef.current.reduce(
      (sum, line) => sum + line.height,
      0
    );
    const targetWidth = Math.max(
      initialSizeRef.current?.width ?? 0,
      maxLineWidth
    );
    const targetHeight = Math.max(
      initialSizeRef.current?.height ?? 0,
      totalLineHeight
    );

    isSplitPreparedRef.current = true;
    gsap.set(el, {
      width: targetWidth,
      height: targetHeight,
      display: 'inline-block',
      overflow: 'hidden',
    });

    el.innerHTML = '';
    lineSpansRef.current = [];

    lineMetricsRef.current.forEach((lineMetric) => {
      const span = document.createElement('span');
      span.style.cssText = `display: block; opacity: 0; width: ${lineMetric.width}px; height: ${lineMetric.height}px; overflow: hidden; white-space: nowrap;`;
      span.innerText = lineMetric.text;
      el.appendChild(span);
      lineSpansRef.current.push(span);
    });

    gsap.set(el, { opacity: 1 });
  }, []);

  const scramble = useCallback(
    (callOptions = {}) => {
      if (!elementRef.current) return null;
      if (isAnimatingRef.current) return timelineRef.current;

      prepareLines();

      const mergedOptions = { ...defaultOptions, ...callOptions };
      const duration = mergedOptions.duration ?? 1;
      const speed = mergedOptions.speed ?? 1;
      const chars = mergedOptions.chars ?? DEFAULT_SCRAMBLE_CHARS;
      const firstColorClass = mergedOptions.firstColorClass ?? 'scramble-brand';
      const secondColorClass =
        mergedOptions.secondColorClass ?? 'scramble-foreground';
      const stagger = mergedOptions.stagger ?? 0.08;

      const lineMetrics = lineMetricsRef.current;
      const lineSpans = lineSpansRef.current;

      if (lineMetrics.length === 0 || lineSpans.length === 0) return null;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        lineSpans.forEach((span, index) => {
          const metric = lineMetrics[index];
          if (metric) {
            span.innerText = metric.text;
          }
          span.style.opacity = '1';
          span.className = span.className.replace(/\bscramble-\w+\b/g, '');
        });
        mergedOptions.onComplete?.();
        return null;
      }

      killTimeline();
      isAnimatingRef.current = true;

      timelineRef.current = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          timelineRef.current = null;
          mergedOptions.onComplete?.();
        },
      });

      lineSpans.forEach((span, index) => {
        const metric = lineMetrics[index];
        if (!metric) return;

        const lineText = metric.text;
        const startTime = index * stagger;
        const randomText = generateRandomLineText(lineText, chars);
        const nonSpaceCount = lineText.replace(/\s/g, '').length;
        const placeholderNbsp = lineText.replace(/[^\s]/g, '\u00a0');

        timelineRef.current?.add(() => {
          gsap.set(span, { opacity: 1 });
          span.innerText = placeholderNbsp;
        }, startTime);

        timelineRef.current?.to(
          span,
          {
            duration,
            scrambleText: {
              text: randomText,
              chars,
              speed,
              revealDelay: 0.1,
              oldClass: firstColorClass,
              newClass: firstColorClass,
            },
            ease: 'none',
          },
          startTime
        );

        timelineRef.current?.to(
          span,
          {
            duration,
            scrambleText: {
              text: lineText,
              chars,
              speed,
              revealDelay: 0.1,
              oldClass: firstColorClass,
              newClass: secondColorClass,
            },
            ease: 'none',
          },
          startTime + (nonSpaceCount > 0 ? duration / nonSpaceCount : 0)
        );
      });

      return timelineRef.current;
    },
    [defaultOptions, killTimeline, prepareLines]
  );

  const kill = useCallback(() => {
    killTimeline();
    if (elementRef.current && isSplitPreparedRef.current) {
      elementRef.current.innerHTML =
        originalHtmlRef.current || originalTextRef.current;
      gsap.set(elementRef.current, {
        opacity: 1,
        width: 'auto',
        height: 'auto',
        overflow: 'visible',
      });
      lineSpansRef.current = [];
      lineMetricsRef.current = [];
      isSplitPreparedRef.current = false;
    }
  }, [killTimeline]);

  useEffect(
    () => () => {
      killTimeline();
      lineSpansRef.current = [];
      lineMetricsRef.current = [];
      isSplitPreparedRef.current = false;
    },
    [killTimeline]
  );

  return {
    ref: elementRef,
    scramble,
    kill,
  };
}

export { useMultilineScrambleText as f };

