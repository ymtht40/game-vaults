'use client';

import { cx } from '@/libs/utils/className';
import Link from 'next/link'; // module id: 522016
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // module id: 995289

export default function BreadcrumbLink({
  href,
  label,
  innerClass,
  squareClass,
}) {
  const handleClick = useTransitionLinkClick(href);

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cx(
        'group/crumb inline-flex items-center text-foreground-muted transition-colors duration-(--duration-fast) hover:text-foreground',
        innerClass,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'shrink-0 bg-foreground/20 transition-colors duration-(--duration-fast) group-hover/crumb:bg-brand',
          squareClass,
        )}
      />

      {label}
    </Link>
  );
}
