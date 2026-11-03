'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { getFigureDefinition } from '@/libs/utils/figures';

import TransitionLink from '@/components/navigation/TransitionLink'; // module id: 101836
import FigureBoxes from '@/features/docs/components/FigureBoxes'; // module id: 576720

export default function ConceptLink({
  href,
  title,
  line,
  figure,
  strong = false,
  children,
}) {
  const [tooltip, setTooltip] = useState(null);
  const figureConfig = getFigureDefinition(figure);

  useEffect(() => {
    if (!tooltip) {
      return;
    }

    const closeTooltip = () => setTooltip(null);

    window.addEventListener('scroll', closeTooltip, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', closeTooltip, {
        capture: true,
      });
    };
  }, [tooltip]);

  return (
    <>
      <TransitionLink
        href={href}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'mouse') {
            return;
          }

          const bounds = event.currentTarget.getBoundingClientRect();
          const hasRoomBelow = window.innerHeight - bounds.bottom > 226;

          setTooltip({
            left: Math.min(
              Math.max(8, bounds.left),
              window.innerWidth - 280 - 8,
            ),
            top: hasRoomBelow ? bounds.bottom + 8 : bounds.top - 8,
            up: !hasRoomBelow,
            theme:
              event.currentTarget
                .closest('[data-theme]')
                ?.getAttribute('data-theme') || 'dark',
          });
        }}
        onPointerLeave={() => setTooltip(null)}
        className={
          strong
            ? 'font-medium text-foreground underline decoration-foreground/30 decoration-dotted underline-offset-4 transition-colors duration-200 hover:decoration-foreground'
            : 'bg-foreground/[0.06] px-6 py-1 font-mono text-[0.9em] text-foreground underline decoration-foreground/30 decoration-dotted underline-offset-4 transition-colors duration-200 hover:decoration-foreground'
        }
      >
        {children}
      </TransitionLink>

      {tooltip
        ? createPortal(
            <span
              role="tooltip"
              data-theme={tooltip.theme}
              style={{
                left: tooltip.left,
                top: tooltip.top,
                width: 280,
                transform: tooltip.up ? 'translateY(-100%)' : undefined,
              }}
              className="pointer-events-none fixed z-[70] flex flex-col border border-foreground/15 bg-background text-left text-foreground shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
            >
              {figureConfig ? (
                <span
                  aria-hidden="true"
                  className="flex h-[96px] items-center justify-center border-b border-foreground/10 px-16 py-12"
                >
                  <FigureBoxes boxes={figureConfig.model()} />
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
            document.body,
          )
        : null}
    </>
  );
}