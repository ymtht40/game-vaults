'use client';

// Variable Mapping: a -> prefersReducedMotion, s -> COS_30, l -> projectIsoPoint, h -> formatPoint, u -> getBoxFaces, c -> DEFAULT_STROKE_OPACITIES, g -> ACCENT_STROKE_OPACITIES, f -> computeViewBox, p -> DEFAULT_BOX_CLASS, d -> ACCENT_BOX_CLASS

import { useRef, useMemo } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { CustomEase } from 'gsap/CustomEase'; // NOTE: module id: 563208
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747

gsap.registerPlugin(CustomEase);

CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1');
CustomEase.create('annnimate', 'M0,0 C0.3,0.9 0.1,1 1,1');

export const ANNNIMATE_EASE = 'annnimate';
export const ANNNIMATE_IN_OUT_EASE = 'annnimateInOut';

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const COS_30 = Math.cos(Math.PI / 6);

const projectIsoPoint = (x, y, z) => [(x - y) * COS_30, (x + y) * 0.5 - z];

export const formatPoint = (point) =>
  `${point[0].toFixed(2)},${point[1].toFixed(2)}`;

export function getBoxFaces({ x, y, z, w, d, h }) {
  return [
    [
      projectIsoPoint(x, y + d, z),
      projectIsoPoint(x + w, y + d, z),
      projectIsoPoint(x + w, y + d, z + h),
      projectIsoPoint(x, y + d, z + h),
    ],
    [
      projectIsoPoint(x + w, y, z),
      projectIsoPoint(x + w, y + d, z),
      projectIsoPoint(x + w, y + d, z + h),
      projectIsoPoint(x + w, y, z + h),
    ],
    [
      projectIsoPoint(x, y, z + h),
      projectIsoPoint(x + w, y, z + h),
      projectIsoPoint(x + w, y + d, z + h),
      projectIsoPoint(x, y + d, z + h),
    ],
  ];
}

const DEFAULT_STROKE_OPACITIES = [0.46, 0.4, 0.52];
const ACCENT_STROKE_OPACITIES = [0.75, 0.88, 1];

export function computeViewBox(boxes, padding = 24) {
  const allPoints = boxes
    .filter((box) => box.o !== 0)
    .flatMap((box) => getBoxFaces(box).flat());
  const xCoords = allPoints.map((pt) => pt[0]);
  const yCoords = allPoints.map((pt) => pt[1]);
  const minX = Math.min(...xCoords) - padding;
  const minY = Math.min(...yCoords) - padding;

  return `${minX} ${minY} ${Math.max(...xCoords) + padding - minX} ${
    Math.max(...yCoords) + padding - minY
  }`;
}

const DEFAULT_BOX_CLASS = 'fill-background text-foreground';
const ACCENT_BOX_CLASS = 'fill-background text-brand';

export const setBoxAccentElement = (groupEl, isAccent) => {
  groupEl.setAttribute('class', isAccent ? ACCENT_BOX_CLASS : DEFAULT_BOX_CLASS);
  [...groupEl.children].forEach((polygonEl, faceIndex) =>
    polygonEl.setAttribute(
      'stroke-opacity',
      (isAccent ? ACCENT_STROKE_OPACITIES : DEFAULT_STROKE_OPACITIES)[faceIndex]
    )
  );
};

// NOTE: module id: 576720
export function IsometricFigure({ boxes }) {
  return (
    <svg
      viewBox={computeViewBox(boxes)}
      className="h-full w-full overflow-visible"
      strokeLinejoin="miter"
    >
      {boxes.map((box, boxIndex) => (
        <g
          key={boxIndex}
          data-box={true}
          className={box.accent ? ACCENT_BOX_CLASS : DEFAULT_BOX_CLASS}
          strokeDasharray={box.dashed ? '3 3' : undefined}
          style={box.o != null ? { opacity: box.o } : undefined}
        >
          {getBoxFaces(box).map((facePoints, faceIndex) => (
            <polygon
              key={faceIndex}
              points={facePoints.map(formatPoint).join(' ')}
              stroke="currentColor"
              strokeOpacity={
                (box.accent
                  ? ACCENT_STROKE_OPACITIES
                  : DEFAULT_STROKE_OPACITIES)[faceIndex]
              }
              strokeDasharray={
                faceIndex !== 0 || box.dashed ? undefined : '2 1.5'
              }
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function useIsometricFigureAnimation(containerRef, figureSpec, deps = []) {
  const timelineRef = useRef(null);
  const isHoveredRef = useRef(false);
  const restBoxes = useMemo(() => figureSpec.model(), [figureSpec, ...deps]);

  useGSAP(
    () => {
      const boxGroupElements = gsap.utils.selector(containerRef.current)(
        '[data-box]'
      );
      const animatedBoxes = figureSpec.model();
      const tl = gsap.timeline({
        paused: true,
        onUpdate: () =>
          animatedBoxes.forEach((box, boxIndex) =>
            getBoxFaces(box).forEach((facePoints, faceIndex) =>
              boxGroupElements[boxIndex]?.children[faceIndex]?.setAttribute(
                'points',
                facePoints.map(formatPoint).join(' ')
              )
            )
          ),
        onComplete: () =>
          !figureSpec.hold && isHoveredRef.current && tl.restart(),
      });

      figureSpec.cycle(tl, animatedBoxes, boxGroupElements);
      timelineRef.current = tl;

      return () => tl.kill();
    },
    { scope: containerRef, dependencies: [figureSpec, ...deps] }
  );

  return {
    rest: restBoxes,
    onEnter: () => {
      isHoveredRef.current = true;
      const tl = timelineRef.current;
      if (!prefersReducedMotion() && tl) {
        if (figureSpec.hold) {
          tl.play();
        } else if (!tl.isActive()) {
          tl.restart();
        }
      }
    },
    onLeave: () => {
      isHoveredRef.current = false;
      if (figureSpec.hold) {
        timelineRef.current?.reverse();
      }
    },
    play: () => {
      isHoveredRef.current = false;
      const tl = timelineRef.current;
      if (!prefersReducedMotion() && tl) {
        tl.restart();
      }
    },
  };
}

export {
  ANNNIMATE_EASE as a,
  IsometricFigure as N,
  ANNNIMATE_IN_OUT_EASE as B,
  getBoxFaces as A,
  prefersReducedMotion as P,
  formatPoint as L,
  setBoxAccentElement as v,
  useIsometricFigureAnimation as t,
  computeViewBox as O,
};
