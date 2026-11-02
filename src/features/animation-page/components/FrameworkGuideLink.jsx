'use client';

import { cx } from '@/libs/utils/className';

import Link from 'next/link'; // module id: 522016
import HtmlIcon from '@/assets/icons/HtmlIcon'; // module id: 732633
import ReactIcon from '@/assets/icons/ReactIcon'; // module id: 408125
import VueIcon from '@/assets/icons/VueIcon'; // module id: 900128
import { Tooltip } from '@/contexts/TooltipProvider'; // module id: 672706

import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // module id: 995289

const FRAMEWORK_LABELS = {
  react: 'React',
  vue: 'Vue',
  html: 'HTML/CSS/JS',
};

const FRAMEWORK_ICONS = {
  react: ReactIcon,
  vue: VueIcon,
  html: HtmlIcon,
};

export default function FrameworkGuideLink({
  slug,
  framework,
  compact = false,
}) {
  const Icon = FRAMEWORK_ICONS[framework];
  const label = FRAMEWORK_LABELS[framework];
  const href = `/animations/${slug}/${framework}`;
  const handleClick = useTransitionLinkClick(href);

  return (
    <Tooltip
      id={`framework-variant-${framework}`}
      content={compact ? `${label} guide` : label}
    >
      <Link
        href={href}
        onClick={handleClick}
        aria-label={label}
        role="listitem"
        className={cx(
          'group relative flex items-center justify-center',
          compact ? 'h-28 w-36' : 'h-44 flex-1 lg:h-64',
          'transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
          'text-foreground-muted hover:bg-foreground/[0.04] hover:text-foreground',
        )}
      >
        {Icon && (
          <span
            className={
              compact
                ? 'flex size-14 shrink-0 items-center justify-center'
                : 'flex size-18 shrink-0 items-center justify-center lg:size-24'
            }
          >
            <Icon />
          </span>
        )}
      </Link>
    </Tooltip>
  );
}