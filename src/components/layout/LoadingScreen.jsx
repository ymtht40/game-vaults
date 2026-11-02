// Variable Mapping: W -> LoadingScreen, e -> type

import { InlineLoader } from '@/components/ui/Loader'; // NOTE: module id: 461376
import { ScrambleText } from '@/animations/ScrambleText'; // NOTE: module id: 531530

// NOTE: module id: 583246
export default function LoadingScreen({ type = 'app' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-16 bg-background">
      <InlineLoader size="45" />
      <ScrambleText className="text-mono-sm text-foreground-muted" />
    </div>
  );
}
