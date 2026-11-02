export default function TimelineRowTooltip({ row, hasAccess }) {
  const details = [];

  if (row.full && hasAccess) {
    details.push(['Duration', `${row.full.durSec}s`]);

    if (row.full.ease) {
      details.push(['Ease', row.full.ease]);
    }

    if (row.full.staggerSec) {
      details.push(['Stagger', `${row.full.staggerSec}s each`]);
    }

    details.push(['Starts', `${row.full.startSec}s`]);
  }

  if (row.targetCount > 1) {
    details.push(['Targets', String(row.targetCount)]);
  }

  if (row.props?.length) {
    details.push(['Animates', row.props.slice(0, 4).join(', ')]);
  }

  if (!details.length) {
    return null;
  }

  return (
    <div className="pointer-events-none min-w-[200px] border border-foreground/10 bg-surface p-12">
      <dl className="grid grid-cols-[auto_1fr] gap-x-16 gap-y-4">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="contents"
          >
            <dt className="text-accent-base normal-case text-foreground-muted">
              {label}
            </dt>

            <dd className="text-accent-base normal-case text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}