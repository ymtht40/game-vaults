'use client';

import { useRef } from 'react';
import {
  IsometricFigure,
  useIsometricFigureAnimation,
} from '@/components/motion/IsometricFigure';

export function BentoTile({
  className = '',
  fig,
  title,
  line,
  children = null,
}) {
  const containerRef = useRef(null);
  const {
    rest: boxes,
    onEnter: handleMouseEnter,
    onLeave: handleMouseLeave,
  } = useIsometricFigureAnimation(containerRef, fig);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`col-span-12 flex flex-col gap-32 bg-background p-24 lg:p-40 ${className}`}
    >
      <div
        aria-hidden="true"
        className="flex h-[160px] items-center justify-center md:h-[200px] lg:h-[260px]"
      >
        <IsometricFigure boxes={boxes} />
      </div>
      <div className="flex flex-col gap-8">
        <h3 className="text-body font-medium">{title}</h3>
        <p className="text-body-sm max-w-[44ch] text-foreground-muted">{line}</p>
      </div>
      {children}
    </div>
  );
}

export { BentoTile as Tile };
export default BentoTile;
