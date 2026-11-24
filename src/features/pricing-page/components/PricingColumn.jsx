'use client';

import { useRef } from 'react';
import {
  IsometricFigure,
  useIsometricFigureAnimation,
} from '@/components/motion/IsometricFigure';
import Button from '@/components/ui/Button';
import SpecList from '@/components/ui/SpecList';

export function PricingColumn({
  fig,
  title,
  line,
  facts,
  cta,
  href,
  action = null,
}) {
  const containerRef = useRef(null);
  const {
    rest: boxes,
    onEnter: handleMouseEnter,
    onLeave: handleMouseLeave,
  } = useIsometricFigureAnimation(containerRef, fig);

  return (
    <article
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="col-span-12 flex flex-col gap-32 bg-background p-24 md:col-span-6 lg:p-40"
    >
      <div
        aria-hidden="true"
        className="flex h-[140px] items-center justify-center md:h-[200px]"
      >
        <IsometricFigure boxes={boxes} />
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

export { PricingColumn as Column };
export default PricingColumn;
