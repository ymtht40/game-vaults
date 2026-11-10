'use client';

// Variable Mapping: eo -> OnboardingComplete, e -> onClose, r -> headingRef, n -> scramble, l -> kill, i -> isDotScaled, s -> setIsDotScaled

import { useEffect, useState } from 'react';
import { CloseIcon } from '@/assets/icons'; // NOTE: module id: 137410 // UNRESOLVED: name guessed from usage
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { useScramble } from '@/hooks/useScramble'; // NOTE: module id: 798851 // UNRESOLVED: name guessed from usage

// NOTE: module id: 583246
export function OnboardingComplete({ onClose }) {
  const { ref: headingRef, scramble, kill } = useScramble();
  const [isDotScaled, setIsDotScaled] = useState(false);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setIsDotScaled(true));
    scramble({ duration: 0.7 });
    return () => {
      cancelAnimationFrame(rafId);
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
        <CloseIcon size={14} />
      </button>
      <span
        className={`mb-16 block size-12 bg-brand transition-transform duration-(--duration-snap) ease-(--ease-back-out) ${isDotScaled ? 'scale-100' : 'scale-0'}`}
      />
      <h3 ref={headingRef} className="text-h5 m-0 text-foreground">
        You're shipping.
      </h3>
      <p className="text-body-sm mt-12 text-foreground-muted">
        Copy, tune, paste - the whole library works exactly like this.
      </p>
      <div className="mt-20">
        <Button href="/animations" onClick={onClose} theme="brand" size="xs" className="w-full">
          Explore the library
        </Button>
      </div>
    </div>
  );
}