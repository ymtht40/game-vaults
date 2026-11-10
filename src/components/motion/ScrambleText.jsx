'use client';

// Variable Mapping: f -> ScrambleText, e -> text, r -> className, n -> duration, s -> holdMs, o -> ref, i -> scramble, c -> kill

import { useEffect } from 'react';
import { useMultilineScrambleText } from '@/hooks/useMultilineScrambleText'; // NOTE: module id: 798851

// NOTE: module id: 531530
export function ScrambleText({
  text = 'Loading',
  className = '',
  duration = 0.65,
  holdMs = 950
}) {
  const { ref, scramble, kill } = useMultilineScrambleText();

  useEffect(() => {
    let timerId = null;
    let isCancelled = false;

    const runScramble = () => {
      if (!isCancelled) {
        scramble({
          duration,
          onComplete: () => {
            if (!isCancelled) {
              timerId = setTimeout(runScramble, holdMs);
            }
          }
        });
      }
    };

    timerId = setTimeout(runScramble, 150);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      kill();
    };
  }, [scramble, kill, duration, holdMs]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  );
}

