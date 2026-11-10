'use client';

// Variable Mapping: W -> LoadingScreen, e -> type

import { ScrambleText } from '@/components/motion/ScrambleText'; // NOTE: module id: 531530
import Loader from '@/components/ui/Loader'; // NOTE: module id: 461376

// NOTE: module id: 583246
export function LoadingScreen({ type = 'app' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-16 bg-background">
      <Loader size="45" />
      <ScrambleText className="text-mono-sm text-foreground-muted" />
    </div>
  );
}