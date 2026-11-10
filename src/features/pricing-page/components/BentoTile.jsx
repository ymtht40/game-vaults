'use client';

import { useRef } from 'react';
import { IsoBoxes, useIsoBoxes } from '@/components/canvas/IsoBoxes'; // NOTE: module id: 576720

// Variable Mapping: c -> containerRef, o -> boxes, d -> handleMouseEnter, u -> handleMouseLeave
// NOTE: module id: 392197
export function BentoTile({
  className = '',
  fig,
  title,
  line,
  children = null,
}) {
  const containerRef = useRef(null);
  const { rest: boxes, onEnter: handleMouseEnter, onLeave: handleMouseLeave } = useIsoBoxes(containerRef, fig);

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
        <IsoBoxes boxes={boxes} />
      </div>
      <div className="flex flex-col gap-8">
        <h3 className="text-body font-medium">{title}</h3>
        <p className="text-body-sm max-w-[44ch] text-foreground-muted">{line}</p>
      </div>
      {children}
    </div>
  );
}

// NOTE: module id: 392197
export { BentoTile as Tile };
// NOTE: module id: 392197
export default BentoTile;
