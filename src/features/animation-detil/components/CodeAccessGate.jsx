// Variable Mapping: u -> CodeAccessGate, m -> CodeSkeleton, e -> hasAccess / indentClasses, s -> loading / line, a -> isAuthenticated / index, n -> animation, r -> starterPack, i -> children, d.U -> PaywallBlock

import { PaywallBlock } from '@/features/paywall/PaywallBlock'; // NOTE: module id: 993603

const SKELETON_LINES = [
  { w: 'w-3/4', indent: 0 },
  { w: 'w-full', indent: 0 },
  { w: 'w-1/2', indent: 1 },
  { w: 'w-2/3', indent: 1 },
  { w: 'w-5/12', indent: 2 },
  { w: 'w-full', indent: 0 },
  { w: 'w-3/5', indent: 1 },
  { w: 'w-4/5', indent: 0 },
  { w: 'w-1/3', indent: 1 },
  { w: 'w-full', indent: 0 },
  { w: 'w-5/6', indent: 0 },
  { w: 'w-1/2', indent: 1 },
  { w: 'w-2/5', indent: 2 },
  { w: 'w-full', indent: 0 },
  { w: 'w-3/4', indent: 1 },
];

function CodeSkeleton() {
  const indentClasses = {
    0: 'ml-0',
    1: 'ml-16',
    2: 'ml-32',
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-foreground/10 p-12">
        <div className="flex gap-8 bg-foreground/[0.06] p-2">
          <div className="h-20 w-48 bg-foreground/15" />
          <div className="h-20 w-48 bg-foreground/[0.08]" />
          <div className="h-20 w-48 bg-foreground/[0.08]" />
          <div className="h-20 w-48 bg-foreground/[0.08]" />
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-foreground/10 px-12 py-10">
        <div className="h-12 w-96 bg-foreground/15" />
        <div className="h-16 w-80 bg-foreground/[0.08]" />
      </div>
      <div className="min-h-0 flex-1 space-y-8 overflow-hidden p-16">
        {SKELETON_LINES.map((line, index) => (
          <div
            key={index}
            className={`h-10 bg-foreground/15 ${line.w} ${indentClasses[line.indent]}`}
          />
        ))}
      </div>
    </div>
  );
}

// NOTE: module id: 521041
export default function CodeAccessGate({
  hasAccess,
  loading = false,
  isAuthenticated = false,
  animation,
  starterPack = null,
  children,
}) {
  if (!loading && hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[420px] overflow-hidden bg-background lg:min-h-0 lg:h-full">
      <div
        className="pointer-events-none absolute inset-0 select-none opacity-50 blur-md"
        aria-hidden="true"
      >
        <CodeSkeleton />
      </div>
      {!loading && (
        <div className="relative flex flex-col items-center justify-start gap-24 bg-background/70 px-24 py-40 backdrop-blur-md lg:absolute lg:inset-0 lg:py-0 lg:pt-16">
          <PaywallBlock
            animation={animation}
            isAuthenticated={isAuthenticated}
            starterPack={starterPack}
          />
        </div>
      )}
    </div>
  );
}
