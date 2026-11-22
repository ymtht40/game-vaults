'use client';

import { useRef } from 'react';

import { IsometricFigure, useIsometricFigureAnimation } from '@/components/motion/IsometricFigure'; // NOTE: module id: 576720
// UNRESOLVED: IsometricFigure and useIsometricFigureAnimation are usage-based export names.
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import SpecList from '@/components/ui/SpecList'; // NOTE: module id: 567874

/* Variable Mapping:
 * h -> Column, e/l/r/n/i/m/d -> fig/title/line/facts/cta/href/action,
 * u -> figureRef, p -> rest, g/f -> onEnter/onLeave
 */
// NOTE: module id: 547118
export function Column({ fig, title, line, facts, cta, href, action = null }) {
  const figureRef = useRef(null);
  const { rest, onEnter, onLeave } = useIsometricFigureAnimation(figureRef, fig);

  return (
    <article
      ref={figureRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="col-span-12 flex flex-col gap-32 bg-background p-24 md:col-span-6 lg:p-40"
    >
      <div aria-hidden="true" className="flex h-[140px] items-center justify-center md:h-[200px]">
        <IsometricFigure boxes={rest} />
      </div>
      <div className="flex flex-col gap-12">
        <h3 className="text-h4 font-medium">{title}</h3>
        <p className="text-body text-foreground-muted">{line}</p>
      </div>
      <SpecList className="w-full max-w-[420px]" items={facts} />
      {action || href ? (
        <div className="mt-auto">
          {action || (
            <Button href={href} theme="surface">
              {cta}
            </Button>
          )}
        </div>
      ) : null}
    </article>
  );
}
