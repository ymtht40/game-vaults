// Variable Mapping: a -> items / item, t -> className / index, l -> align, r -> stack / normalizedItem, n -> rowLayoutClass, m -> valueAlignClass

// NOTE: module id: 567874
export default function DescriptionList({
  items = [],
  className = '',
  align = 'right',
  stack = false,
}) {
  const rowLayoutClass =
    align === 'left'
      ? 'flex flex-col gap-4 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-16'
      : stack
        ? 'flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-24'
        : 'flex items-baseline justify-between gap-24';

  const valueAlignClass = stack ? 'sm:text-right' : 'text-right';

  return (
    <dl className={`text-body-sm m-0 flex flex-col ${className}`}>
      {items.map((item, index) => {
        const normalizedItem =
          typeof item === 'string' ? { value: item } : item;

        return (
          <div
            key={index}
            className={`${rowLayoutClass} border-b border-foreground/15 py-10 last:border-b-0`}
          >
            {normalizedItem.label ? (
              <dt className="shrink-0 whitespace-nowrap text-foreground-muted">
                {normalizedItem.label}
              </dt>
            ) : null}
            <dd
              className={`m-0 text-foreground ${
                normalizedItem.label && align === 'right' ? valueAlignClass : ''
              }`}
            >
              {normalizedItem.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

