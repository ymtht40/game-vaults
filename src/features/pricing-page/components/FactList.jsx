// Variable Mapping: e -> items, a -> className, l -> align, r -> stack, s -> layoutClasses, n -> alignClasses
// NOTE: module id: 567874
export default function FactList({
  items = [],
  className = '',
  align = 'right',
  stack = false,
}) {
  const layoutClasses =
    align === 'left'
      ? 'flex flex-col gap-4 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-16'
      : stack
        ? 'flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-24'
        : 'flex items-baseline justify-between gap-24';
  const alignClasses = stack ? 'sm:text-right' : 'text-right';

  return (
    <dl className={`text-body-sm m-0 flex flex-col ${className}`}>
      {items.map((item, index) => {
        const entry = typeof item === 'string' ? { value: item } : item;
        return (
          <div
            key={index}
            className={`${layoutClasses} border-b border-foreground/15 py-10 last:border-b-0`}
          >
            {entry.label ? (
              <dt className="shrink-0 whitespace-nowrap text-foreground-muted">
                {entry.label}
              </dt>
            ) : null}
            <dd
              className={`m-0 text-foreground ${entry.label && align === 'right' ? alignClasses : ''}`}
            >
              {entry.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
