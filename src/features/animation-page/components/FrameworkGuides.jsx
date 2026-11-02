'use client';

import { TooltipProvider } from '@/contexts/TooltipProvider'; // module id: 672706
import FrameworkGuideLink from '@/features/animation-page/components/FrameworkGuideLink'; // module id: 367649

const FRAMEWORK_CODE_FIELDS = {
  react: 'react_code',
  vue: 'vue_code',
  html: 'html_code',
};

export default function FrameworkGuides({
  animation,
  availableFormats = null,
  compact = false,
}) {
  if (!animation?.slug) {
    return null;
  }

  const slug = animation.slug;

  const variants = availableFormats
    ? Object.keys(FRAMEWORK_CODE_FIELDS)
        .filter((framework) => availableFormats.includes(framework))
        .map((framework) => [framework])
    : Object.entries(FRAMEWORK_CODE_FIELDS)
        .filter(([, codeField]) => Boolean(animation[codeField]));

  if (!variants.length) {
    return null;
  }

  const guides = (
    <TooltipProvider
      delayDuration={250}
      flipDuration={0.2}
      flipEase="power3.out"
      side={compact ? 'bottom' : 'top'}
      sideOffset={8}
    >
      <div
        className="flex items-stretch divide-x divide-foreground/10 border border-foreground/10 bg-foreground/[0.06]"
        role="list"
      >
        {variants.map(([framework]) => (
          <FrameworkGuideLink
            key={framework}
            slug={slug}
            framework={framework}
            compact={compact}
          />
        ))}
      </div>
    </TooltipProvider>
  );

  if (compact) {
    return (
      <div className="flex flex-col items-start gap-6">
        <span className="text-accent-2xs text-foreground-muted">
          Guides
        </span>

        {guides}
      </div>
    );
  }

  return (
    <section>
      <p className="text-mono-sm text-foreground-muted mb-12">
        Framework guides
      </p>

      {guides}
    </section>
  );
}