'use client';

// Variable Mapping: x -> Tile, o -> tileRef

import { useRef } from 'react';
// UNRESOLVED: original source path or export names are absent from this chunk.
import { IsometricFigure, useIsometricFigureAnimation } from '@/features/common/IsometricFigure'; // NOTE: module id: 576720

// NOTE: module id: 392197
export function Tile({ className = '', fig, title, line, children = null }) {
  const tileRef = useRef(null);
  const { rest, onEnter, onLeave } = useIsometricFigureAnimation(tileRef, fig);
  return (
    <div
      ref={tileRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`col-span-12 flex flex-col gap-32 bg-background p-24 lg:p-40 ${className}`}
    >
      <div
        aria-hidden="true"
        className="flex h-[160px] items-center justify-center md:h-[200px] lg:h-[260px]"
      >
        <IsometricFigure boxes={rest} />
      </div>
      <div className="flex flex-col gap-8">
        <h3 className="text-body font-medium">{title}</h3>
        <p className="text-body-sm max-w-[44ch] text-foreground-muted">{line}</p>
      </div>
      {children}
    </div>
  );
}
