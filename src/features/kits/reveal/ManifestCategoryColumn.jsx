// Variable Mapping: S -> ManifestCategoryColumn?, e -> eyebrow, r -> items, a -> className

// NOTE: module id: 301900
export function ManifestCategoryColumn({ eyebrow, items, className = '' }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-accent-2xs text-foreground-muted">{eyebrow}</span>
      <ul className="mt-16 flex flex-col divide-y divide-foreground/10 border-y border-foreground/10">
        {items.map((item) => (
          <li
            key={item.key}
            data-hfp-index={item.index}
            className="-mx-12 flex items-center gap-12 px-12 py-16 transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/[0.04]"
          >
            <span aria-hidden="true" className="size-8 shrink-0 bg-brand" />
            <span className="text-h5 text-foreground">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
