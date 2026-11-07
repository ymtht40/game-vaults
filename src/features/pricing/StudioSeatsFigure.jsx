'use client';

/* Variable Mapping:
   w -> getSeatBoxPosition
   k -> buildSeatBoxes
   $ -> parseViewBox
   q -> StudioSeatsFigure
   e -> seats
   l -> containerRef
   n -> clampedSeats
   i -> initialBoxes
   s -> animStateRef
   o -> syncSvgDom
*/

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  ANNNIMATE_IN_OUT_EASE,
  IsometricFigure,
  computeViewBox,
  formatPoint,
  prefersReducedMotion,
  getBoxFaces,
} from '@/features/common/IsometricFigure'; // NOTE: module id: 576720 // UNRESOLVED: name guessed from usage getBoxFaces

const getSeatBoxPosition = (index, total) => ({
  x: -16 + (index - (total - 1) / 2) * 30,
  y: -16 - (index - (total - 1) / 2) * 30,
});

const buildSeatBoxes = (seatCount) =>
  Array.from({ length: 8 }, (_, idx) => ({
    ...getSeatBoxPosition(Math.min(idx, seatCount - 1), seatCount),
    z: 0,
    w: 32,
    d: 32,
    h: 32,
    o: +(idx < seatCount),
    accent: idx === 0,
  }));

const parseViewBox = (viewBoxStr) => {
  const [x, y, w, h] = viewBoxStr.split(' ').map(Number);
  return { x, y, w, h };
};

// NOTE: module id: 586818
export function StudioSeatsFigure({ seats }) {
  const containerRef = useRef(null);
  const clampedSeats = Math.min(seats, 8);
  const [initialBoxes] = useState(() => buildSeatBoxes(clampedSeats));
  const animStateRef = useRef(null);

  if (!animStateRef.current) {
    animStateRef.current = {
      m: initialBoxes.map((box) => ({ ...box })),
      n: clampedSeats,
      vb: parseViewBox(computeViewBox(initialBoxes)),
    };
  }

  const syncSvgDom = () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const { m: boxes, vb: viewBox } = animStateRef.current;
    const boxGroups = svgEl.querySelectorAll('[data-box]');
    boxes.forEach((box, idx) => {
      const groupEl = boxGroups[idx];
      if (groupEl) {
        getBoxFaces(box).forEach((facePoints, faceIdx) =>
          groupEl.children[faceIdx]?.setAttribute('points', facePoints.map(formatPoint).join(' '))
        );
        groupEl.style.opacity = box.o;
      }
    });
    svgEl.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
  };

  useEffect(() => {
    const state = animStateRef.current;
    if (clampedSeats === state.n) return;
    const prevSeats = state.n;
    state.n = clampedSeats;
    const duration = 0.7 * !prefersReducedMotion();
    const tl = gsap.timeline({ onUpdate: syncSvgDom });

    state.tl?.kill();
    state.hop?.kill();

    state.m.forEach((box, idx) => {
      const targetPos = getSeatBoxPosition(idx, clampedSeats);
      if (idx < clampedSeats) {
        if (box.o < 0.05) {
          gsap.set(box, { ...targetPos, z: 40, o: 0 });
        }
        tl.to(
          box,
          { ...targetPos, z: 0, o: 1, duration, ease: ANNNIMATE_IN_OUT_EASE },
          idx >= prevSeats ? (idx - prevSeats) * 0.06 : 0
        );
      } else if (box.o > 0 || box.z !== 40) {
        tl.to(
          box,
          { z: 40, o: 0, duration: 0.8 * duration, ease: ANNNIMATE_IN_OUT_EASE },
          idx < prevSeats ? (prevSeats - 1 - idx) * 0.06 : 0
        );
      }
    });

    tl.to(
      state.vb,
      { ...parseViewBox(computeViewBox(buildSeatBoxes(clampedSeats))), duration, ease: ANNNIMATE_IN_OUT_EASE },
      0
    );
    state.tl = tl;
  }, [clampedSeats]);

  useEffect(() => {
    const articleEl = containerRef.current?.closest('article');
    if (!articleEl) return;

    const handleMouseEnter = () => {
      if (
        prefersReducedMotion() ||
        animStateRef.current.hop?.isActive() ||
        animStateRef.current.tl?.isActive()
      ) {
        return;
      }
      const activeBoxes = animStateRef.current.m.slice(0, animStateRef.current.n);
      const hopTl = (animStateRef.current.hop = gsap.timeline({ onUpdate: syncSvgDom }));
      activeBoxes.forEach((box, idx) =>
        hopTl
          .to(box, { z: 22, duration: 0.45, ease: ANNNIMATE_IN_OUT_EASE }, 0.07 * idx)
          .to(box, { z: 0, duration: 0.45, ease: ANNNIMATE_IN_OUT_EASE }, 0.5 + 0.07 * idx)
      );
    };

    articleEl.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      articleEl.removeEventListener('mouseenter', handleMouseEnter);
      animStateRef.current.hop?.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <IsometricFigure boxes={initialBoxes} />
    </div>
  );
}
