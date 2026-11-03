'use client';

import { useRef } from 'react';

import DocCardLink from '@/features/docs/components/DocCardLink'; // module id: 613016
import FigureBoxes from '@/features/docs/components/FigureBoxes'; // module id: 576720

import { useFigureHover } from '@/hooks/useFigureHover'; // module id: 576720

export default function DocFigureCard({ fig, ...props }) {
  const cardRef = useRef(null);

  const {
    rest: boxes,
    onEnter,
    onLeave,
  } = useFigureHover(cardRef, fig);

  return (
    <DocCardLink
      {...props}
      cardRef={cardRef}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      media={
        <div
          aria-hidden="true"
          className="flex h-[132px] items-center justify-center border-b border-foreground/10 px-20 py-16"
        >
          <FigureBoxes boxes={boxes} />
        </div>
      }
    />
  );
}
