'use client';

import { cx } from '@/libs/utils/className';

import StaggerSegments from '@/features/animation-page/components/StaggerSegments'; // module id: 444230

const BAR_COLORS = [
  '96 165 250',
  '167 139 250',
  '232 121 249',
  '45 212 191',
  '251 191 36',
  '74 222 128',
  '251 113 133',
  '34 211 238',
];

export default function TimelineRow({
  row,
  index,
  barRef,
  inert,
  onEnter,
  onLeave,
  onBarEnter,
  onBarLeave,
}) {
  return (
    <div
      className="group relative"
      style={{ height: 28 }}
      onMouseEnter={inert ? undefined : onEnter}
      onMouseLeave={inert ? undefined : onLeave}
    >
      <div
        ref={barRef}
        onMouseEnter={inert ? undefined : onBarEnter}
        onMouseLeave={inert ? undefined : onBarLeave}
        className={cx(
          'absolute top-1/2 flex h-24 -translate-y-1/2 items-center border transition-colors duration-(--duration-quick)',
          'bg-[rgb(var(--bar-c)/0.10)] border-[rgb(var(--bar-c)/0.30)]',
          'data-[active=true]:bg-[rgb(var(--bar-c)/0.25)]',
          row.kind === 'nested' && 'border-x-2',
          row.kind === 'marker' && 'border-l-2',
        )}
        style={{
          '--bar-c': BAR_COLORS[index % BAR_COLORS.length],
          left: `${100 * row.start}%`,
          width: row.kind === 'marker'
            ? `max(4px, ${100 * row.width}%)`
            : `${100 * row.width}%`,
        }}
      >
        {row.staggerSpread > 0 && row.targetCount > 1 && (
          <StaggerSegments
            spread={row.staggerSpread}
            count={row.targetCount}
          />
        )}

        <span className="relative z-10 whitespace-nowrap pl-8 text-accent-xs leading-none text-foreground/90 group-hover:text-foreground">
          {row.label}
        </span>

        {row.staggerSpread > 0.12 && row.targetCount > 1 && (
          <span className="relative z-10 ml-auto hidden whitespace-nowrap pr-8 text-accent-2xs leading-none text-foreground/50 sm:inline">
            Stagger
          </span>
        )}
      </div>
    </div>
  );
}