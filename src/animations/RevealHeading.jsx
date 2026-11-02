'use client';

import { forwardRef, useRef, useState, useLayoutEffect, useImperativeHandle, Fragment } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { useRevealTimeline } from '@/hooks/useRevealTimeline'; // NOTE: module id: 228414

// NOTE: module id: 963160
const RevealHeading = forwardRef(function (
  {
    children,
    as: Tag = 'h2',
    sizeClass = 'text-h2',
    className = '',
    trigger = 'scroll',
    start = 'top 80%',
    skip = false
  },
  ref
) {
  const headingRef = useRef(null);
  const [lines, setLines] = useState(null);

  const extractText = (node) =>
    node == null || node === false
      ? ''
      : typeof node === 'string' || typeof node === 'number'
      ? String(node)
      : Array.isArray(node)
      ? node.map(extractText).join('')
      : '';

  const plainText = extractText(children);

  useLayoutEffect(() => {
    if (!headingRef.current) return;
    const wordElements = headingRef.current.querySelectorAll('[data-rh-word]');
    if (wordElements.length === 0) return;

    const computedLines = [];
    let currentLineWords = [];
    let prevTop = -Infinity;
    let prevExplicitLine = -1;

    for (const wordEl of wordElements) {
      const top = wordEl.getBoundingClientRect().top;
      const explicitLine = Number(wordEl.dataset.rhExplicit ?? -1);
      const isNewExplicitLine = explicitLine !== prevExplicitLine && prevExplicitLine !== -1;

      if ((prevTop > -Infinity && top - prevTop > 2) || isNewExplicitLine) {
        computedLines.push(currentLineWords.join(' '));
        currentLineWords = [];
      }

      currentLineWords.push(wordEl.textContent || '');
      prevTop = top;
      prevExplicitLine = explicitLine;
    }

    if (currentLineWords.length > 0) {
      computedLines.push(currentLineWords.join(' '));
    }

    setLines(computedLines);
  }, [plainText]);

  const { reveal } = useRevealTimeline(headingRef, {
    mode: trigger === 'pageEnter' ? 'hero' : trigger === 'manual' ? 'manual' : 'scroll',
    build:
      skip || !lines
        ? null
        : (element) => {
            const tl = gsap.timeline({ paused: true });
            const lineElements = element.querySelectorAll('[data-rh-line]');

            for (let i = 0; i < lineElements.length; i++) {
              const brandBar = lineElements[i].querySelector('[data-rh-brand]');
              const fgBar = lineElements[i].querySelector('[data-rh-fg]');
              if (!brandBar || !fgBar) continue;

              gsap.set([brandBar, fgBar], { scaleX: 1, transformOrigin: 'right' });
              const offset = 0.12 * i;
              tl.to(fgBar, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, offset);
              tl.to(
                brandBar,
                { scaleX: 0, duration: 0.5, ease: 'power3.inOut' },
                offset + 0.1
              );
            }

            return tl;
          },
    start,
    deps: [lines, skip]
  });

  useImperativeHandle(ref, () => ({ reveal }), [reveal]);

  const combinedClassName = `${sizeClass} ${className}`.trim();

  if (!lines) {
    const rawLines = plainText.split('\n');
    return (
      <Tag
        ref={headingRef}
        className={combinedClassName}
        style={{ visibility: 'hidden' }}
      >
        {rawLines.map((lineText, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {lineText
              .split(/\s+/)
              .filter(Boolean)
              .map((word, wordIndex) => (
                <Fragment key={wordIndex}>
                  {wordIndex > 0 && ' '}
                  <span data-rh-word={true} data-rh-explicit={lineIndex}>
                    {word}
                  </span>
                </Fragment>
              ))}
          </Fragment>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={headingRef} className={combinedClassName}>
      {lines.map((lineText, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          <span data-rh-line={true} className="relative inline-block">
            <span className="block whitespace-nowrap">{lineText}</span>
            {!skip && (
              <>
                <span
                  data-rh-brand={true}
                  aria-hidden="true"
                  className="absolute -inset-x-[0.1em] -inset-y-[0.1em] block bg-brand"
                />
                <span
                  data-rh-fg={true}
                  aria-hidden="true"
                  className="absolute -inset-x-[0.1em] -inset-y-[0.1em] block bg-foreground"
                />
              </>
            )}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
});

export default RevealHeading;