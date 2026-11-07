'use client';

// Variable Mapping: eo -> OnboardingComplete, e -> onClose, r -> headingRef, n -> scramble, l -> kill, i -> isScaled, s -> setIsScaled, (effect) e -> frameId

import { useEffect, useState } from 'react'; // NOTE: module id: 271645
import { X } from '@phosphor-icons/react'; // NOTE: module id: 137410
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { useMultilineScrambleText } from '@/hooks/useMultilineScrambleText'; // NOTE: module id: 798851

// NOTE: module id: 583246
export default function OnboardingComplete({ onClose }) {
  const { ref: headingRef, scramble, kill } = useMultilineScrambleText();
  const [isScaled, setIsScaled] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsScaled(true));
    scramble({ duration: 0.7 });
    return () => {
      cancelAnimationFrame(frameId);
      kill();
    };
  }, [scramble, kill]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="absolute right-0 top-0 flex size-24 items-center justify-center text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
      >
        <X size={14} />
      </button>
      <span
        className={`mb-16 block size-12 bg-brand transition-transform duration-(--duration-snap) ease-(--ease-back-out) ${
          isScaled ? 'scale-100' : 'scale-0'
        }`}
      />
      <h3 ref={headingRef} className="text-h5 m-0 text-foreground">
        You're shipping.
      </h3>
      <p className="text-body-sm mt-12 text-foreground-muted">
        Copy, tune, paste - the whole library works exactly like this.
      </p>
      <div className="mt-20">
        <Button
          href="/animations"
          onClick={onClose}
          theme="brand"
          size="xs"
          className="w-full"
        >
          Explore the library
        </Button>
      </div>
    </div>
  );
}
