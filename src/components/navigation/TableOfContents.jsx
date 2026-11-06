'use client';

// Variable Mapping: e -> minHeadings, n -> sticky, o -> selector, i -> label, s -> pathname, d -> headings, c -> setHeadings, u -> activeId, f -> setActiveId, m -> headingIds, x -> handleHeadingClick

import { useCallback, useEffect, useState } from 'react'; // NOTE: module id: 271645
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

function getScrollContainer(element) {
  let parent = element?.parentElement;
  while (parent) {
    const overflowY = getComputedStyle(parent).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

// NOTE: module id: 214070
export default function TableOfContents({
  minHeadings = 2,
  sticky = true,
  selector = 'main article h2[id]',
  label = 'On this page',
}) {
  const pathname = usePathname();
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const elements = Array.from(document.querySelectorAll(selector));
      setHeadings(
        elements.map((element) => ({
          id: element.id,
          label: element.textContent.trim(),
        }))
      );
      setActiveId(elements[0]?.id ?? null);
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  const headingIds = headings.map((heading) => heading.id).join(',');

  useEffect(() => {
    if (!headings.length) return;

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean);
    if (!headingElements.length) return;

    const scrollContainer = getScrollContainer(headingElements[0]);
    const scrollTarget = scrollContainer === window ? window : scrollContainer;

    const updateActiveHeading = () => {
      let currentId = headingElements[0].id;
      for (const element of headingElements) {
        if (element.getBoundingClientRect().top - 140 <= 0) {
          currentId = element.id;
        }
      }
      setActiveId(currentId);
    };

    updateActiveHeading();
    scrollTarget.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [headingIds]);

  const handleHeadingClick = useCallback((id) => {
    const targetElement = document.getElementById(id);
    if (targetElement) {
      setActiveId(id);
      if (window.lenis) {
        window.lenis.scrollTo(targetElement, { offset: -120, duration: 1 });
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  if (headings.length < minHeadings) {
    return null;
  }

  return (
    <nav
      aria-label={label}
      className={cn(
        'hidden lg:flex lg:flex-col pb-16',
        sticky &&
          'sticky top-[var(--v2-sticky-top)] max-h-[calc(100dvh-var(--v2-sticky-top)-4rem)] self-start overflow-y-auto overscroll-contain'
      )}
    >
      <span className="text-accent-xs mb-12 text-foreground-muted">{label}</span>
      <ul className="flex flex-col">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              type="button"
              onClick={() => handleHeadingClick(heading.id)}
              data-active={activeId === heading.id ? 'true' : undefined}
              className={cn(
                'flex min-h-32 w-full items-center border-l border-foreground/20 py-4 pl-16 text-left text-body-sm text-foreground-reading/75',
                'transition-colors duration-(--duration-fast) ease-(--ease-power3-out)',
                'hover:border-foreground/40 hover:text-foreground',
                'data-[active=true]:border-brand data-[active=true]:text-foreground'
              )}
            >
              <span className="min-w-0 flex-1">{heading.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}