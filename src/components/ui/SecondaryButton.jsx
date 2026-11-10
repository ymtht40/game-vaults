'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/libs/utils/className';
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick';

const SIZE_CLASSES = {
  xs: 'h-24 lg:h-28 px-10 lg:px-12 text-accent-xs gap-6',
  sm: 'h-32 lg:h-40 px-12 lg:px-16 text-mono gap-8',
  default: 'h-40 lg:h-48 px-16 lg:px-20 text-mono gap-10'
};

export const SecondaryButton = forwardRef(function (
  {
    children,
    className,
    href,
    size = 'default',
    icon = null,
    onClick,
    fullWidth = false,
    inline = false,
    type = 'button',
    disabled = false,
    ...props
  },
  ref
) {
  const handleLinkClick = useTransitionLinkClick(href, { onClick });
  const buttonClassName = cn(
    SIZE_CLASSES[size] ?? SIZE_CLASSES.default,
    'inline-flex items-center justify-center',
    'border border-foreground/15 bg-surface text-foreground',
    'transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
    'hover:bg-foreground/5',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
    fullWidth && 'w-full',
    className
  );

  return href ? (
    <Link
      ref={ref}
      href={href}
      className={buttonClassName}
      onClick={handleLinkClick}
      {...props}
    >
      {icon ? (
        <span className="pointer-events-none flex shrink-0 items-center">{icon}</span>
      ) : null}
      <span className="pointer-events-none">{children}</span>
    </Link>
  ) : (
    <button
      ref={ref}
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon ? (
        <span className="pointer-events-none flex shrink-0 items-center">{icon}</span>
      ) : null}
      <span className="pointer-events-none">{children}</span>
    </button>
  );
});
