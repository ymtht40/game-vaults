'use client';

import { MagnifyingGlassIcon } from '@phosphor-icons/react'; 
// NOTE: module id: 6648
export default function ReferenceSearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('anm:reference-search'))}
      className="mb-24 hidden w-full items-center justify-between gap-8 border border-foreground/15 px-12 py-8 text-accent-xs text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-power3-out) hover:border-foreground/30 hover:text-foreground lg:flex"
    >
      <span className="flex items-center gap-8">
        <MagnifyingGlassIcon className="size-12" aria-hidden="true" />
        <span>Search</span>
      </span>
      <kbd className="text-accent-2xs bg-foreground/10 px-4 py-2 font-medium">⌘K</kbd>
    </button>
  );
}