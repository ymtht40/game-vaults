'use client';

// Variable Mapping: i -> BreadcrumbLink, s -> SIZE_STYLES, e -> items / href, a -> size / index, o -> label, l -> plain / squareClass, u -> handleClick / validItems, c -> sizeConfig, n -> isLast

import Link from 'next/link'; // NOTE: module id: 522016
import { CaretRight } from '@phosphor-icons/react'; // NOTE: module id: 268817
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // NOTE: module id: 995289

function BreadcrumbLink({ href, label, innerClass, squareClass }) {
  const handleClick = useTransitionLinkClick(href);

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'group/crumb inline-flex items-center text-foreground-muted transition-colors duration-(--duration-fast) hover:text-foreground',
        innerClass
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'shrink-0 bg-foreground/20 transition-colors duration-(--duration-fast) group-hover/crumb:bg-brand',
          squareClass
        )}
      />
      {label}
    </Link>
  );
}

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

// NOTE: module id: 131822
export default function Breadcrumb({
  items = [],
  size = 'default',
  className,
  plain = false,
}) {
  const validItems = (items || []).filter((item) => item && item.label);
  if (!validItems.length) return null;

  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.default;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(sizeConfig.text, 'text-foreground-muted', className)}
    >
      <ol className={cn('flex flex-wrap items-center gap-y-6', sizeConfig.gap)}>
        {validItems.map((item, index) => {
          const isLast = index === validItems.length - 1;
          const isLink = item.href && !isLast;

          return (
            <li key={index} className={cn('flex items-center', sizeConfig.gap)}>
              {index > 0 ? (
                <CaretRight
                  aria-hidden="true"
                  className={cn('shrink-0 text-foreground-muted/40', sizeConfig.caret)}
                />
              ) : null}
              {isLink ? (
                <BreadcrumbLink
                  href={item.href}
                  label={item.label}
                  innerClass={sizeConfig.inner}
                  squareClass={plain ? 'hidden' : sizeConfig.square}
                />
              ) : (
                <span
                  className={cn('inline-flex items-center text-foreground', sizeConfig.inner)}
                >
                  {plain ? null : (
                    <span
                      aria-hidden="true"
                      className={cn('shrink-0 bg-brand', sizeConfig.square)}
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

