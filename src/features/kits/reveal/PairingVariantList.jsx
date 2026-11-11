'use client';

// Variable Mapping: N -> PairingVariantList?, e -> label, r -> items, a -> value, n -> onSelect

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

// NOTE: module id: 301900
export function PairingVariantList({ label, items, value, onSelect }) {
  return (
    <div className="flex flex-col">
      <span className="text-mono-sm text-foreground border-b border-foreground/15 pb-8">
        {label}
      </span>
      <ul className="mt-8 flex flex-col max-lg:-mx-16 max-lg:snap-x max-lg:flex-row max-lg:gap-8 max-lg:overflow-x-auto max-lg:scroll-px-16 max-lg:px-16 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isSelected = item.slug === value;
          return (
            <li key={item.slug} className="max-lg:shrink-0 max-lg:snap-start">
              <button
                type="button"
                onClick={() => onSelect(item.slug)}
                aria-pressed={isSelected}
                className={cn(
                  'flex w-full items-center gap-8 py-6 text-left text-mono-sm transition-colors duration-(--duration-fast) ease-(--ease-expo-out) max-lg:border max-lg:border-foreground/15 max-lg:px-12 max-lg:py-10',
                  isSelected
                    ? 'text-foreground'
                    : 'text-foreground/55 hover:text-foreground'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-6 shrink-0',
                    isSelected ? 'bg-brand' : 'bg-transparent max-lg:hidden'
                  )}
                />
                <span className="truncate">{item.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
