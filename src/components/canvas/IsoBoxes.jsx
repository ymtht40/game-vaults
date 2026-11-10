'use client';

import { useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(CustomEase);
CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1');
CustomEase.create('annnimate', 'M0,0 C0.3,0.9 0.1,1 1,1');

// NOTE: module id: 576720
export const annnimateEase = 'annnimate';
// NOTE: module id: 576720
export const boxEase = 'annnimateInOut';
// NOTE: module id: 576720
export const annnimateInOutEase = 'annnimateInOut';

// NOTE: module id: 576720
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const COS_30 = Math.cos(Math.PI / 6);

// Variable Mapping: t -> x, e -> y, n -> z
// NOTE: module id: 576720
export const projectPoint = (x, y, z) => [
  (x - y) * COS_30,
  (x + y) * 0.5 - z,
];

// Variable Mapping: t -> point
// NOTE: module id: 576720
export const formatPoint = (point) => `${point[0].toFixed(2)},${point[1].toFixed(2)}`;

// Variable Mapping: t -> x, e -> y, n -> z, r -> w, o -> d, i -> h
// NOTE: module id: 576720
export function getBoxFaces({ x, y, z, w, d, h }) {
  return [
    [
      projectPoint(x, y + d, z),
      projectPoint(x + w, y + d, z),
      projectPoint(x + w, y + d, z + h),
      projectPoint(x, y + d, z + h),
    ],
    [
      projectPoint(x + w, y, z),
      projectPoint(x + w, y + d, z),
      projectPoint(x + w, y + d, z + h),
      projectPoint(x + w, y, z + h),
    ],
    [
      projectPoint(x, y, z + h),
      projectPoint(x + w, y, z + h),
      projectPoint(x + w, y + d, z + h),
      projectPoint(x, y + d, z + h),
    ],
  ];
}

const DEFAULT_OPACITIES = [0.46, 0.4, 0.52];
const ACCENT_OPACITIES = [0.75, 0.88, 1];

// Variable Mapping: t -> boxes, e -> padding
// NOTE: module id: 576720
export function computeViewBox(boxes, padding = 24) {
  const points = boxes
    .filter((box) => box.o !== 0)
    .flatMap((box) => getBoxFaces(box).flat());
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const width = Math.max(...xs) + padding - minX;
  const height = Math.max(...ys) + padding - minY;
  return `${minX} ${minY} ${width} ${height}`;
}

const DEFAULT_BOX_CLASS = 'fill-background text-foreground';
const ACCENT_BOX_CLASS = 'fill-background text-brand';

// Variable Mapping: t -> element, e -> isAccent
// NOTE: module id: 576720
export const setBoxVisibility = (element, isAccent) => {
  element.setAttribute('class', isAccent ? ACCENT_BOX_CLASS : DEFAULT_BOX_CLASS);
  [...element.children].forEach((child, index) =>
    child.setAttribute('stroke-opacity', (isAccent ? ACCENT_OPACITIES : DEFAULT_OPACITIES)[index])
  );
};

// Variable Mapping: t -> boxes
// NOTE: module id: 576720
export function IsoBoxes({ boxes }) {
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
          {getBoxFaces(box).map((face, faceIndex) => (
            <polygon
              key={faceIndex}
              points={face.map(formatPoint).join(' ')}
              stroke="currentColor"
              strokeOpacity={(box.accent ? ACCENT_OPACITIES : DEFAULT_OPACITIES)[faceIndex]}
              strokeDasharray={faceIndex !== 0 || box.dashed ? undefined : '2 1.5'}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

// Variable Mapping: t -> targetRef, e -> fig, o -> deps, s -> timelineRef, l -> isHoveredRef, c -> restBoxes, n -> boxElements, i -> timeline
// NOTE: module id: 576720
export function useIsoBoxes(targetRef, fig, deps = []) {
  const timelineRef = useRef(null);
  const isHoveredRef = useRef(false);
  const restBoxes = useMemo(() => fig.model(), [fig, ...deps]);

  useGSAP(
    () => {
      const boxElements = gsap.utils.selector(targetRef.current)('[data-box]');
      const modelBoxes = fig.model();
      const timeline = gsap.timeline({
        paused: true,
        onUpdate: () =>
          modelBoxes.forEach((box, boxIndex) =>
            getBoxFaces(box).forEach((face, faceIndex) =>
              boxElements[boxIndex]?.children[faceIndex]?.setAttribute(
                'points',
                face.map(formatPoint).join(' ')
              )
            )
          ),
        onComplete: () => !fig.hold && isHoveredRef.current && timeline.restart(),
      });

      fig.cycle(timeline, modelBoxes, boxElements);
      timelineRef.current = timeline;

      return () => timeline.kill();
    },
    {
      scope: targetRef,
      dependencies: [fig, ...deps],
    }
  );

  return {
    rest: restBoxes,
    onEnter: () => {
      isHoveredRef.current = true;
      const timeline = timelineRef.current;
      if (!prefersReducedMotion() && timeline) {
        if (fig.hold) {
          timeline.play();
        } else if (!timeline.isActive()) {
          timeline.restart();
        }
      }
    },
    onLeave: () => {
      isHoveredRef.current = false;
      if (fig.hold) {
        timelineRef.current?.reverse();
      }
    },
    play: () => {
      isHoveredRef.current = false;
      const timeline = timelineRef.current;
      if (!prefersReducedMotion() && timeline) {
        timeline.restart();
      }
    },
  };
}

// Turbopack original export mappings:
// a -> annnimateEase, N -> IsoBoxes, B -> boxEase, A -> getBoxFaces, P -> prefersReducedMotion,
// L -> formatPoint, v -> setBoxVisibility, t -> useIsoBoxes, O -> computeViewBox
// NOTE: module id: 576720
export {
  annnimateEase as a,
  IsoBoxes as N,
  boxEase as B,
  getBoxFaces as A,
  prefersReducedMotion as P,
  formatPoint as L,
  setBoxVisibility as v,
  useIsoBoxes as t,
  computeViewBox as O,
};

// NOTE: module id: 576720
export default IsoBoxes;
