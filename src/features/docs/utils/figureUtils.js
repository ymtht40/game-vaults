'use client';

import { gsap, CustomEase } from '@/libs/utils/vendor';

gsap.registerPlugin(CustomEase);

export const FIGURE_EASE = 'annnimate';
export const FIGURE_IN_OUT_EASE = 'annnimateInOut';

CustomEase.create(
  FIGURE_IN_OUT_EASE,
  'M0,0 C0.7,0 0.16,1 1,1',
);

CustomEase.create(
  FIGURE_EASE,
  'M0,0 C0.3,0.9 0.1,1 1,1',
);

const ISOMETRIC_COSINE = Math.cos(Math.PI / 6);

export const DEFAULT_BOX_CLASS_NAME = 'fill-background text-foreground';
export const ACCENT_BOX_CLASS_NAME = 'fill-background text-brand';

export const DEFAULT_STROKE_OPACITIES = [0.46, 0.4, 0.52];
export const ACCENT_STROKE_OPACITIES = [0.75, 0.88, 1];

function projectPoint(worldX, worldY, worldZ) {
  return [
    (worldX - worldY) * ISOMETRIC_COSINE,
    (worldX + worldY) * 0.5 - worldZ,
  ];
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function formatPoint(point) {
  return `${point[0].toFixed(2)},${point[1].toFixed(2)}`;
}

export function getBoxFaces({
  x: boxX,
  y: boxY,
  z: boxZ,
  w: width,
  d: depth,
  h: height,
}) {
  return [
    [
      projectPoint(boxX, boxY + depth, boxZ),
      projectPoint(boxX + width, boxY + depth, boxZ),
      projectPoint(boxX + width, boxY + depth, boxZ + height),
      projectPoint(boxX, boxY + depth, boxZ + height),
    ],
    [
      projectPoint(boxX + width, boxY, boxZ),
      projectPoint(boxX + width, boxY + depth, boxZ),
      projectPoint(boxX + width, boxY + depth, boxZ + height),
      projectPoint(boxX + width, boxY, boxZ + height),
    ],
    [
      projectPoint(boxX, boxY, boxZ + height),
      projectPoint(boxX + width, boxY, boxZ + height),
      projectPoint(boxX + width, boxY + depth, boxZ + height),
      projectPoint(boxX, boxY + depth, boxZ + height),
    ],
  ];
}

export function getFigureDefinitionViewBox(boxes, padding = 24) {
  const points = boxes
    .filter((box) => box.o !== 0)
    .flatMap((box) => getBoxFaces(box).flat());

  const xCoordinates = points.map((point) => point[0]);
  const yCoordinates = points.map((point) => point[1]);

  const minX = Math.min(...xCoordinates) - padding;
  const minY = Math.min(...yCoordinates) - padding;

  const width = Math.max(...xCoordinates) + padding - minX;
  const height = Math.max(...yCoordinates) + padding - minY;

  return `${minX} ${minY} ${width} ${height}`;
}

export function setBoxAccent(group, isAccent) {
  group.setAttribute(
    'class',
    isAccent ? ACCENT_BOX_CLASS_NAME : DEFAULT_BOX_CLASS_NAME,
  );

  [...group.children].forEach((polygon, faceIndex) => {
    polygon.setAttribute(
      'stroke-opacity',
      (isAccent ? ACCENT_STROKE_OPACITIES : DEFAULT_STROKE_OPACITIES)[faceIndex],
    );
  });
}
