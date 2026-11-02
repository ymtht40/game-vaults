'use client';

import { toast } from 'sonner';

export default function PresetItem({ item, onApply = null }) {
  const displayName = item.displayName || item.name;
  const overrides = item.attributes_override || {};

  const attributeBadges = (
    <span className="flex flex-wrap items-center gap-6">
      {Object.entries(overrides).map(([attributeName, value]) => (
        <code
          key={attributeName}
          className="bg-foreground/[0.06] px-8 py-2 font-mono text-[10px] text-foreground-muted"
        >
          {attributeName}
          {'="'}
          {value}
          {'"'}
        </code>
      ))}
    </span>
  );

  if (onApply) {
    return (
      <li>
        <button
          type="button"
          onClick={() => {
            onApply(overrides);
            toast.success(`${displayName} applied`);
          }}
          className="group flex w-full items-baseline justify-between gap-12 border border-transparent px-8 py-6 text-left transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-foreground/[0.04]"
        >
          <span className="flex flex-wrap items-baseline gap-x-12 gap-y-6">
            <span className="text-body-sm font-medium text-foreground">
              {displayName}
            </span>

            {attributeBadges}
          </span>

          <span className="text-accent-xs shrink-0 self-center text-foreground-muted opacity-0 transition-opacity duration-(--duration-quick) group-hover:opacity-100">
            Apply
          </span>
        </button>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-baseline gap-x-12 gap-y-6 px-8 py-6">
      <span className="text-body-sm font-medium text-foreground">
        {displayName}
      </span>

      {attributeBadges}
    </li>
  );
}