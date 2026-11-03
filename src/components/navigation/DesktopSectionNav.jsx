'use client';

// Variable Mapping: d -> highlightText, c -> NavItem, u -> SectionHeaderLink, f -> SectionMonoHeading, m -> SectionBlock, x -> searchQuery, h -> setSearchQuery, p -> normalizedQuery, g -> filteredSections, v -> hasTitledSections, b -> hasMonoSections

// NOTE: module id: 912596

import { Fragment, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import { 
 MagnifyingGlassIcon,
 IconContext
} from '@phosphor-icons/react';
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import Link from 'next/link'; // NOTE: module id: 522016
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // NOTE: module id: 995289

function highlightText(text, query) {
  if (!query) return text;
  const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());
  if (matchIndex < 0) return text;

  return (
    <Fragment>
      {text.slice(0, matchIndex)}
      <span className="text-brand">
        {text.slice(matchIndex, matchIndex + query.length)}
      </span>
      {text.slice(matchIndex + query.length)}
    </Fragment>
  );
}

function NavItem({
  href,
  label,
  variant = 'left-border',
  onNavigate,
  highlight = ''
}) {
  const isActive = usePathname() === href;
  const handleClick = useTransitionLinkClick(href, {
    onClick: onNavigate
  });

  if (variant === 'sliding-bar') {
    return (
      <Link
        href={href}
        onClick={handleClick}
        data-active={isActive ? 'true' : undefined}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group relative flex h-36 items-center gap-12 rounded-[2px] px-12 text-body-sm text-foreground-reading/75',
          'transition-colors duration-(--duration-fast) ease-(--ease-power3-out)',
          'hover:text-foreground data-[active=true]:text-foreground'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-0 inset-y-8 w-2 origin-left scale-x-0 bg-brand',
            'transition-transform duration-(--duration-snap) ease-(--ease-power3-out)',
            'group-data-[active=true]:scale-x-100'
          )}
        />
        <span className="pointer-events-none min-w-0 flex-1 truncate">
          {highlightText(label, highlight)}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      data-active={isActive ? 'true' : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative -ml-px flex h-28 items-center border-l border-foreground/20 pl-16 text-body-sm text-foreground-reading/75',
        'transition-colors duration-(--duration-fast) ease-(--ease-power3-out)',
        'hover:border-foreground/40 hover:text-foreground',
        'data-[active=true]:border-brand data-[active=true]:text-foreground'
      )}
    >
      <span className="pointer-events-none min-w-0 flex-1 truncate">
        {highlightText(label, highlight)}
      </span>
    </Link>
  );
}

function SectionHeaderLink({ href, label, onNavigate }) {
  const isActive = usePathname() === href;
  const handleClick = useTransitionLinkClick(href, {
    onClick: onNavigate
  });

  return (
    <Link
      href={href}
      onClick={handleClick}
      data-active={isActive ? 'true' : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex h-32 items-center text-body font-medium text-foreground',
        'transition-colors duration-(--duration-fast) ease-(--ease-power3-out)',
        'hover:text-brand',
        'data-[active=true]:text-brand'
      )}
    >
      {label}
    </Link>
  );
}

function SectionMonoHeading({ label, padded = false }) {
  return (
    <div className={cn('text-mono-sm text-foreground-muted', padded && 'px-12 pb-8')}>
      {label}
    </div>
  );
}

export function SectionBlock({
  section,
  variant,
  onNavigate,
  highlight = '',
  collapsible = false
}) {
  const pathname = usePathname();
  const visibleItems =
    ((!collapsible ||
      !section.href ||
      pathname === section.href ||
      pathname.startsWith(`${section.href}/`) ||
      !!highlight) &&
      section.items) ||
    [];

  const isMonoTitle = section.title && section.titleStyle === 'mono';
  const isStandardTitle = section.title && section.titleStyle !== 'mono';

  return (
    <div className={cn('flex flex-col gap-4', isStandardTitle && visibleItems.length > 0 && 'pb-8')}>
      {isMonoTitle && (
        <SectionMonoHeading
          label={section.title}
          padded={variant === 'sliding-bar'}
        />
      )}

      {isStandardTitle && section.href && (
        <SectionHeaderLink
          href={section.href}
          label={section.title}
          onNavigate={onNavigate}
        />
      )}

      {visibleItems.length > 0 && (
        <ul className={variant === 'sliding-bar' ? 'flex flex-col gap-2' : 'flex flex-col'}>
          {visibleItems.map((item) => (
            <li key={item.href}>
              <NavItem
                href={item.href}
                label={item.title}
                variant={variant}
                onNavigate={onNavigate}
                highlight={highlight}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DesktopSectionNav({
  ariaLabel,
  indexHref,
  indexLabel,
  variant = 'left-border',
  sections = [],
  searchable = false
}) {
  const handleIndexClick = useTransitionLinkClick(indexHref || '');
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return sections;

    return sections
      .map((section) => {
        const matchedItems = (section.title || '').toLowerCase().includes(normalizedQuery)
          ? section.items || []
          : (section.items || []).filter((item) =>
              (item.title || '').toLowerCase().includes(normalizedQuery)
            );

        return {
          ...section,
          items: matchedItems
        };
      })
      .filter(
        (section) =>
          (section.items && section.items.length) ||
          (section.title || '').toLowerCase().includes(normalizedQuery)
      );
  }, [sections, normalizedQuery]);

  const hasTitledSections = sections.some((section) => section.title);
  const hasMonoSections = sections.some(
    (section) => section.title && section.titleStyle === 'mono'
  );

  return (
    <nav
      aria-label={ariaLabel}
      data-lenis-prevent={true}
      className="hidden lg:flex lg:flex-col sticky top-[var(--v2-sticky-top)] max-h-[calc(100dvh-var(--v2-sticky-top)-4rem)] self-start overflow-y-auto overscroll-contain pb-16 pl-4 pr-8"
    >
      {indexHref && indexLabel ? (
        <div className="mb-16">
          <Link
            href={indexHref}
            onClick={handleIndexClick}
            className="text-mono-sm text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-power3-out) hover:text-foreground"
          >
            {indexLabel}
          </Link>
        </div>
      ) : null}

      {searchable ? (
        <label className="relative mb-24 flex items-center">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-12 top-1/2 size-16 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search the index"
            className="text-body-sm h-36 w-full bg-surface pl-36 pr-32 text-foreground placeholder:text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) focus:outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-8 top-1/2 flex size-20 -translate-y-1/2 items-center justify-center text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground"
            >
              <IconContext className="size-14" />
            </button>
          ) : null}
        </label>
      ) : null}

      <div
        className={
          hasTitledSections
            ? hasMonoSections
              ? 'flex flex-col gap-24'
              : 'flex flex-col gap-2'
            : 'flex flex-col'
        }
      >
        {filteredSections.map((section, index) => (
          <SectionBlock
            key={section.title || section.href || index}
            section={section}
            variant={variant}
            highlight={normalizedQuery}
            collapsible={true}
          />
        ))}

        {normalizedQuery && filteredSections.length === 0 ? (
          <p className="text-body-sm text-foreground-muted">
            No matches.
          </p>
        ) : null}
      </div>
    </nav>
  );
}
