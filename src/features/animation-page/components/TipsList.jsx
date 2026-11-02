'use client';

import { useState } from 'react';

import { CaretDown } from '@phosphor-icons/react'; // module id: 815330
import TipItem from '@/features/animation-page/components/TipItem'; // module id: 799422

export default function TipsList({ tips }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleTips = isExpanded ? tips : tips.slice(0, 1);
  const remainingCount = tips.length - 1;

  return (
    <>
      <div className="mt-16 flex flex-col gap-24">
        {visibleTips.map((tip, index) => (
          <TipItem
            key={index}
            item={tip}
          />
        ))}
      </div>

      {remainingCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="text-accent-xs mt-16 flex w-full items-center justify-center gap-6 border-t border-foreground/10 bg-foreground/[0.04] py-10 text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
        >
          <CaretDown
            size={12}
            className={`transition-transform duration-(--duration-quick) ${isExpanded ? 'rotate-180' : ''}`}
          />

          {isExpanded ? 'Show less' : `Show ${remainingCount} more`}
        </button>
      ) : null}
    </>
  );
}