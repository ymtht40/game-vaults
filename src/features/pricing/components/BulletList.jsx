/* Variable Mapping:
   r -> SIZE_STYLES
   e -> items
   a -> size
   l -> className
   n -> itemClassName
   i -> sizeStyle
*/

const SIZE_STYLES = {
  sm: {
    rect: 'size-8 mt-[0.35em]',
    gap: 'gap-12',
    text: 'text-body leading-snug',
  },
  default: {
    rect: 'size-12 mt-[0.4em]',
    gap: 'gap-16',
    text: 'text-body-lg leading-snug',
  },
};

// NOTE: module id: 702954
// UNRESOLVED: name guessed from usage (exported as "f", imported unused in 586818)
export function BulletList({
  items = [],
  size = 'sm',
  className = '',
  itemClassName = '',
}) {
  const sizeStyle = SIZE_STYLES[size] ?? SIZE_STYLES.sm;

  return (
    <ul className={`m-0 list-none space-y-2 p-0 ${className}`}>
      {items.map((item, idx) => {
        const normalized = typeof item === 'string' ? { label: item } : item;
        const textColor = normalized.muted ? 'text-foreground/40' : 'text-foreground-muted';
        const markerColor = normalized.muted ? 'bg-brand/40' : 'bg-brand';

        return (
          <li
            key={idx}
            className={`flex items-start ${sizeStyle.gap} ${sizeStyle.text} ${textColor} ${itemClassName} ${normalized.className || ''}`}
          >
            <span
              className={`block shrink-0 ${sizeStyle.rect} ${markerColor}`}
              aria-hidden="true"
            />
            <span>{normalized.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
