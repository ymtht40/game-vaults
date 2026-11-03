'use client';

// Variable Mapping: e -> ariaLabel, d -> indexHref, c -> indexLabel, u -> variant, f -> sections, m -> pathname, x -> isOpen, h -> setIsOpen, p -> closeMenu, g -> handleIndexClick, v -> activeTitle, b -> CaretDownIcon

// NOTE: module id: 816887

import { useState } from 'react';
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import { CaretDownIcon } from '@phosphor-icons/react'; // NOTE: module id: 815330
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import BaseLink from 'next/link'; // NOTE: module id: 522016
import { SectionBlock } from '@/components/navigation/DesktopSectionNav'; // NOTE: module id: 912596
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // NOTE: module id: 995289

function getActiveTitle(pathname, sections, fallbackTitle) {
  for (const section of sections) {
    if (section.href === pathname) {
      return section.title;
    }
    for (const item of section.items || []) {
      if (item.href === pathname) {
        return item.title;
      }
    }
  }
  return fallbackTitle;
}

export default function MobileSectionNav({
  ariaLabel,
  indexHref,
  indexLabel,
  variant = 'left-border',
  sections = []
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const handleIndexClick = useTransitionLinkClick(indexHref || '', {
    onClick: closeMenu
  });

  const activeTitle = getActiveTitle(pathname, sections, ariaLabel);

  const containerLayoutClasses = sections.some((section) => section.title)
    ? 'flex flex-col gap-20'
    : 'flex flex-col';

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between border border-foreground/10 bg-surface px-16 py-12 text-body-sm text-foreground"
      >
        <span className="text-mono-sm text-foreground-muted">
          {activeTitle}
        </span>
        <CaretDownIcon
          className={cn(
            'size-18 text-foreground-muted transition-transform duration-(--duration-fast) ease-(--ease-power3-out)',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'mt-8 border border-foreground/10 bg-surface',
            variant === 'sliding-bar' ? 'p-12' : 'p-16',
            containerLayoutClasses
          )}
        >
          {indexHref && indexLabel ? (
            <div className="border-b border-foreground/10 pb-12">
              <BaseLink
                href={indexHref}
                onClick={handleIndexClick}
                className="text-mono-sm text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-power3-out) hover:text-foreground"
              >
                {indexLabel}
              </BaseLink>
            </div>
          ) : null}

          {sections.map((section, index) => (
            <SectionBlock
              key={section.title || section.href || index}
              section={section}
              variant={variant}
              onNavigate={closeMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}
