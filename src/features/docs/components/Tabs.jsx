'use client';
import { useCallback, useRef } from 'react';
import { cx } from '@/libs/utils/className';
import FlipPill from '@/features/docs/components/FlipPill'; // module id: 876355

export function Tabs({
  tabs,
  activeId,
  onChange,
  ariaLabel = 'Tabs',
  className = '',
  fill = false,
  iconSize = 'size-12',
}) {
  const containerRef = useRef(null);

  const handleKeyDown = useCallback(
    (event, tabIndex) => {
      const tabElements = containerRef.current?.querySelectorAll(
        '[data-flip-id]',
      );

      if (!tabElements?.length) {
        return;
      }

      let nextIndex = null;

      switch (event.key) {
        case 'ArrowRight':
          nextIndex = (tabIndex + 1) % tabElements.length;
          break;

        case 'ArrowLeft':
          nextIndex =
            (tabIndex - 1 + tabElements.length) % tabElements.length;
          break;

        case 'Home':
          nextIndex = 0;
          break;

        case 'End':
          nextIndex = tabElements.length - 1;
          break;

        case ' ':
        case 'Enter':
          event.preventDefault();
          onChange(tabs[tabIndex].id);
          return;

        default:
          return;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        tabElements[nextIndex]?.focus();
      }
    },
    [onChange, tabs],
  );

  return (
    <div ref={containerRef} className={cx(fill && 'w-full')}>
      <FlipPill
        activeId={activeId}
        containerClassName={cx(
          'items-stretch overflow-x-auto bg-foreground/[0.04]',
          fill && 'w-full',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className,
        )}
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab, tabIndex) => {
          const isActive = activeId === tab.id;
          const Icon = tab.Icon;

          return (
            <button
              key={tab.id}
              type="button"
              data-flip-id={tab.id}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, tabIndex)}
              aria-selected={isActive}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              className={cx(
                'relative z-10 inline-flex items-center gap-8 whitespace-nowrap px-16 py-12 text-mono-sm',
                fill ? 'flex-1 justify-center' : 'shrink-0',
                'transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/30',
                isActive
                  ? 'text-foreground'
                  : 'text-foreground/55 hover:text-foreground',
              )}
              style={isActive && tab.color ? { color: tab.color } : undefined}
            >
              {Icon ? (
                <span
                  className={cx(
                    'flex shrink-0 items-center justify-center',
                    iconSize,
                  )}
                  style={tab.color ? { color: tab.color } : undefined}
                >
                  <Icon className={iconSize} />
                </span>
              ) : null}

              <span>{tab.label}</span>
            </button>
          );
        })}
      </FlipPill>
    </div>
  );
}
export default Tabs