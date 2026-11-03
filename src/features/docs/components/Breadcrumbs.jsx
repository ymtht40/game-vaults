'use client';

import { CaretRight } from '@phosphor-icons/react';
import { cx } from '@/libs/utils/className';
import BreadcrumbLink from '@/features/docs/components/BreadcrumbLink'; // module id: 131822

const SIZE_STYLES = {
  default: {
    text: 'text-mono-sm',
    gap: 'gap-x-10',
    caret: 'size-10',
    square: 'size-6',
    inner: 'gap-7',
  },
  sm: {
    text: 'text-accent-2xs',
    gap: 'gap-x-8',
    caret: 'size-8',
    square: 'size-5',
    inner: 'gap-6',
  },
};

export default function Breadcrumbs({
  items = [],
  size = 'default',
  className,
  plain = false,
}) {
  const visibleItems = (items || []).filter((item) => item && item.label);

  if (!visibleItems.length) {
    return null;
  }

  const styles = SIZE_STYLES[size] || SIZE_STYLES.default;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cx(styles.text, 'text-foreground-muted', className)}
    >
      <ol
        className={cx(
          'flex flex-wrap items-center gap-y-6',
          styles.gap,
        )}
      >
        {visibleItems.map((item, itemIndex) => {
          const isLast = itemIndex === visibleItems.length - 1;
          const isLink = item.href && !isLast;

          return (
            <li
              key={itemIndex}
              className={cx('flex items-center', styles.gap)}
            >
              {itemIndex > 0 ? (
                <CaretRight
                  aria-hidden="true"
                  className={cx(
                    'shrink-0 text-foreground-muted/40',
                    styles.caret,
                  )}
                />
              ) : null}

              {isLink ? (
                <BreadcrumbLink
                  href={item.href}
                  label={item.label}
                  innerClass={styles.inner}
                  squareClass={plain ? 'hidden' : styles.square}
                />
              ) : (
                <span
                  className={cx(
                    'inline-flex items-center text-foreground',
                    styles.inner,
                  )}
                >
                  {plain ? null : (
                    <span
                      aria-hidden="true"
                      className={cx('shrink-0 bg-brand', styles.square)}
                    />
                  )}

                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
