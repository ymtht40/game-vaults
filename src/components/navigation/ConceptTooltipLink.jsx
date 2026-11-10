'use client';

// Variable Mapping: e -> href / handleScroll / event, s -> title, l -> line, u -> figure, c -> strong, d -> children, p -> tooltipPosition, f -> setTooltipPosition, m -> figureDefinition, t -> rect, a -> hasSpaceBelow

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // NOTE: module id: 174080
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836
import { IsometricFigure } from '@/components/motion/IsometricFigure'; // NOTE: module id: 576720
import { getFigureDefinition } from '@/libs/utils/figures'; // NOTE: module id: 158024

// NOTE: module id: 514120
export default function ConceptTooltipLink({
  href,
  title,
  line,
  figure,
  strong = false,
  children,
}) {
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const figureDefinition = getFigureDefinition(figure);

  useEffect(() => {
    if (!tooltipPosition) return;
    const handleScroll = () => setTooltipPosition(null);
    window.addEventListener('scroll', handleScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [tooltipPosition]);

  return (
    <>
      <TransitionLink
        href={href}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'mouse') return;
          const rect = event.currentTarget.getBoundingClientRect();
          const hasSpaceBelow = window.innerHeight - rect.bottom > 226;
          setTooltipPosition({
            left: Math.min(Math.max(8, rect.left), window.innerWidth - 280 - 8),
            top: hasSpaceBelow ? rect.bottom + 8 : rect.top - 8,
            up: !hasSpaceBelow,
            theme:
              event.currentTarget
                .closest('[data-theme]')
                ?.getAttribute('data-theme') || 'dark',
          });
        }}
        onPointerLeave={() => setTooltipPosition(null)}
        className={
          strong
            ? 'font-medium text-foreground underline decoration-foreground/30 decoration-dotted underline-offset-4 transition-colors duration-200 hover:decoration-foreground'
            : 'bg-foreground/[0.06] px-6 py-1 font-mono text-[0.9em] text-foreground underline decoration-foreground/30 decoration-dotted underline-offset-4 transition-colors duration-200 hover:decoration-foreground'
        }
      >
        {children}
      </TransitionLink>
      {tooltipPosition
        ? createPortal(
            <span
              role="tooltip"
              data-theme={tooltipPosition.theme}
              style={{
                left: tooltipPosition.left,
                top: tooltipPosition.top,
                width: 280,
                transform: tooltipPosition.up ? 'translateY(-100%)' : undefined,
              }}
              className="pointer-events-none fixed z-[70] flex flex-col border border-foreground/15 bg-background text-left text-foreground shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
            >
              {figureDefinition ? (
                <span
                  aria-hidden="true"
                  className="flex h-[96px] items-center justify-center border-b border-foreground/10 px-16 py-12"
                >
                  <IsometricFigure boxes={figureDefinition.model()} />
                </span>
              ) : null}
              <span className="flex flex-col gap-4 px-14 py-12">
                <span className="text-body-sm font-medium text-foreground">
                  {title}
                </span>
                {line ? (
                  <span className="text-body-sm line-clamp-3 text-foreground-muted">
                    {line}
                  </span>
                ) : null}
              </span>
            </span>,
            document.body
          )
        : null}
    </>
  );
}

