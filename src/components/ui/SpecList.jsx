// Variable Mapping: e -> items, r -> className, i -> align, a -> stack, n -> rowClass, s -> valueAlignment

// NOTE: module id: 567874
export default function SpecList({
  items = [],
  className = '',
  align = 'right',
  stack = false,
}) {
  const rowClass =
    'left' === align
      ? 'flex flex-col gap-4 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-16'
      : stack
        ? 'flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-24'
        : 'flex items-baseline justify-between gap-24';
  const valueAlignment = stack ? 'sm:text-right' : 'text-right';
  return (
    <dl className={`text-body-sm m-0 flex flex-col ${className}`}>
      {items.map((item, index) => {
        const fact =
          'string' == typeof item
            ? {
                value: item,
              }
            : item;
        return (
          <div
            className={`${rowClass} border-b border-foreground/15 py-10 last:border-b-0`}
            key={index}
          >
            {fact.label ? (
              <dt className="shrink-0 whitespace-nowrap text-foreground-muted">
                {fact.label}
              </dt>
            ) : null}
            <dd
              className={`m-0 text-foreground ${fact.label && 'right' === align ? valueAlignment : ''}`}
            >
              {fact.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
