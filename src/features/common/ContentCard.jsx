'use client';

// Variable Mapping: s -> ContentCard, e -> href, l -> eyebrow, u -> title, c -> description, d -> media, p -> size, f -> className, m -> isSmall, x -> handleClick, g -> paddingClass, h -> cardBody

import Link from 'next/link'; // NOTE: module id: 522016
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { formatImageUrll } from '@/libs/utils/formatImageUrl'; // NOTE: module id: 632021
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // NOTE: module id: 995289
import { formatInlineMarkdownHtml } from '@/features/docs/components/DocBlockRenderer'; // NOTE: module id: 120322

// NOTE: module id: 292917
export default function ContentCard({
  href,
  eyebrow,
  title,
  description,
  media,
  size = 'default',
  className,
}) {
  const isSmall = size === 'sm';
  const handleClick = useTransitionLinkClick(href);
  const paddingClass = isSmall ? 'px-16 py-12' : 'px-20 py-16';

  const cardBody = (
    <>
      {eyebrow ? (
        <span className="text-accent-xs text-foreground-muted">{eyebrow}</span>
      ) : null}
      <span
        className={cn(
          'font-medium text-foreground transition-colors group-hover:text-brand',
          isSmall ? 'text-body-sm' : 'text-body',
          eyebrow && 'mt-4'
        )}
      >
        {title}
      </span>
      {description ? (
        <span
          className="text-body-sm mt-6 leading-relaxed text-foreground-muted"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownHtml(description) }}
        />
      ) : null}
    </>
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'group flex h-full flex-col border border-foreground/10 bg-foreground/[0.02]',
        'transition-colors duration-(--duration-fast) ease-(--ease-power3-out)',
        'hover:bg-foreground/[0.05] hover:border-foreground/40',
        !media && paddingClass,
        className
      )}
    >
      {media ? (
        <span className="relative block aspect-[16/10] overflow-hidden bg-foreground/[0.04]">
          <img
            src={formatImageUrll(media, { width: 640 })}
            alt=""
            className="block object-cover"
            style={{ width: '100%', height: '100%' }}
          />
        </span>
      ) : null}
      {media ? (
        <span className={cn('flex flex-col', paddingClass)}>{cardBody}</span>
      ) : (
        cardBody
      )}
    </Link>
  );
}

