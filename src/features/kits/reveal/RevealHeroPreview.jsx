'use client';

// Variable Mapping: x -> RevealHeroPreview?, e -> isReady, a -> setIsReady, n -> replayKey, s -> setReplayKey, l -> previewUrl

import { useState } from 'react';
import { ReplayIcon } from '@/assets/icons'; // NOTE: module id: 182006 // UNRESOLVED: name guessed from usage
import { usePageEnterAnimation } from '@/providers/AnimationProvider'; // NOTE: module id: 488463

// NOTE: module id: 301900
export function RevealHeroPreview() {
  const [isReady, setIsReady] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  usePageEnterAnimation(() => setIsReady(true), [], 'reveal-preview');

  const previewUrl = isReady
    ? `/api/sandbox/kit/reveal/pair?cover=logo-draw-split&hero=flow-field&invert=1&k=${replayKey}`
    : null;

  return (
    <div className="relative overflow-hidden border border-foreground/15 bg-surface shadow-[0_24px_64px_-24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-12 border-b border-foreground/15 px-16 py-12">
        <div className="flex items-center gap-8" aria-hidden="true">
          <span className="size-8 bg-foreground/15" />
          <span className="size-8 bg-foreground/15" />
          <span className="size-8 bg-foreground/15" />
        </div>
        <div className="mx-auto flex w-full max-w-[280px] items-center justify-center bg-foreground/[0.06] px-12 py-4">
          <span className="text-accent-xs text-foreground-muted/70">
            yourstudio.com
          </span>
        </div>
        <button
          type="button"
          onClick={() => setReplayKey((prev) => prev + 1)}
          aria-label="Replay the handoff"
          className="flex shrink-0 items-center gap-6 bg-foreground px-10 py-10 lg:py-6 text-accent-xs text-background transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90"
        >
          <ReplayIcon size={12} />
          Replay
        </button>
      </div>
      <div className="relative min-h-[560px] overflow-hidden bg-background lg:min-h-[820px]">
        {previewUrl ? (
          <iframe
            key={replayKey}
            src={previewUrl}
            title="Preloader and hero handoff preview"
            className="absolute inset-0 block size-full border-0"
          />
        ) : null}
      </div>
    </div>
  );
}
