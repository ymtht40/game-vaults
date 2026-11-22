'use client';

import { useId, useState } from 'react';

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
// UNRESOLVED: The class-name helper path is inferred.
import CodeBlock from '@/features/animation-detail/components/CodeBlock'; // NOTE: module id: 317840

/* Variable Mapping:
 * e/n -> tabs/maxHeight, c/o -> activeIndex/setActiveIndex, s -> panelId, i -> activeTab
 */
// NOTE: module id: 113133
export default function CodeTabs({ tabs = [], maxHeight = '360px' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelId = useId();
  if (!tabs.length) return null;

  const activeTab = tabs[activeIndex] || tabs[0];

  return (
    <div className="flex flex-col">
      <div
        role="tablist"
        aria-label="Code format"
        className="flex items-center gap-2 border border-b-0 border-foreground/10 bg-foreground/[0.04] px-8 py-6"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-controls={panelId}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'text-accent-xs px-10 py-4 max-lg:px-14 max-lg:py-10 transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
              index === activeIndex
                ? 'bg-foreground text-background'
                : 'text-foreground-muted hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={panelId} aria-label={activeTab.label}>
        <CodeBlock
          language={activeTab.language}
          filename={activeTab.filename}
          maxHeight={maxHeight}
        >
          {activeTab.code}
        </CodeBlock>
      </div>
    </div>
  );
}
