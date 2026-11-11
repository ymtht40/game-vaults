'use client';

import { useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(CustomEase);
CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1');
CustomEase.create('annnimate', 'M0,0 C0.3,0.9 0.1,1 1,1');

export const annnimateEase = 'annnimate';
export const boxEase = 'annnimateInOut';
export const annnimateInOutEase = 'annnimateInOut';

const COS_30 = Math.cos(Math.PI / 6);
const DEFAULT_OPACITIES = [0.46, 0.4, 0.52];
const ACCENT_OPACITIES = [0.75, 0.88, 1];
const DEFAULT_BOX_CLASS = 'fill-background text-foreground';
const ACCENT_BOX_CLASS = 'fill-background text-brand';

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const projectPoint = (x, y, z) => [
  (x - y) * COS_30,
  (x + y) * 0.5 - z,
];

export const formatPoint = (point) => `${point[0].toFixed(2)},${point[1].toFixed(2)}`;

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

export const setBoxVisibility = (element, isAccent) => {
  element.setAttribute('class', isAccent ? ACCENT_BOX_CLASS : DEFAULT_BOX_CLASS);

  const opacities = isAccent ? ACCENT_OPACITIES : DEFAULT_OPACITIES;
  [...element.children].forEach((child, index) => {
    child.setAttribute('stroke-opacity', opacities[index]);
  });
};

function applyBoxPoints(element, box) {
  getBoxFaces(box).forEach((face, faceIndex) => {
    element?.children[faceIndex]?.setAttribute('points', face.map(formatPoint).join(' '));
  });
}

export function useIsoBoxes(targetRef, fig, deps = []) {
  const timelineRef = useRef(null);
  const isHoveredRef = useRef(false);
  const restBoxes = useMemo(() => fig.model(), [fig, ...deps]);

  useGSAP(() => {
    const boxElements = gsap.utils.selector(targetRef.current)('[data-box]');
    const modelBoxes = fig.model();

    function onUpdate() {
      modelBoxes.forEach((box, boxIndex) => applyBoxPoints(boxElements[boxIndex], box));
    }

    function onComplete() {
      if (!fig.hold && isHoveredRef.current) timeline.restart();
    }

    const timeline = gsap.timeline({
      paused: true,
      onUpdate,
      onComplete,
    });

    fig.cycle(timeline, modelBoxes, boxElements);
    timelineRef.current = timeline;

    return function cleanup() {
      timeline.kill();
    };
  }, { scope: targetRef, dependencies: [fig, ...deps] });

  const onEnter = () => {
    isHoveredRef.current = true;
    const timeline = timelineRef.current;
    if (prefersReducedMotion() || !timeline) return;

    if (fig.hold) {
      timeline.play();
      return;
    }

    if (!timeline.isActive()) timeline.restart();
  };

  const onLeave = () => {
    isHoveredRef.current = false;
    if (!fig.hold) return;

    timelineRef.current?.reverse();
  };

  const play = () => {
    isHoveredRef.current = false;
    const timeline = timelineRef.current;
    if (prefersReducedMotion() || !timeline) return;

    timeline.restart();
  };

  return {
    rest: restBoxes,
    onEnter,
    onLeave,
    play,
  };
}

function IsoBoxFace({ box, face, faceIndex }) {
  return (
    <polygon
      points={face.map(formatPoint).join(' ')}
      stroke="currentColor"
      strokeOpacity={(box.accent ? ACCENT_OPACITIES : DEFAULT_OPACITIES)[faceIndex]}
      strokeDasharray={faceIndex !== 0 || box.dashed ? undefined : '2 1.5'}
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
    />
  );
}

function IsoBox({ box }) {
  return (
    <g
      data-box
      className={box.accent ? ACCENT_BOX_CLASS : DEFAULT_BOX_CLASS}
      strokeDasharray={box.dashed ? '3 3' : undefined}
      style={box.o != null ? { opacity: box.o } : undefined}
    >
      {getBoxFaces(box).map((face, faceIndex) => (
        <IsoBoxFace key={faceIndex} box={box} face={face} faceIndex={faceIndex} />
      ))}
    </g>
  );
}

export function IsoBoxes({ boxes }) {
  return (
    <svg
      viewBox={computeViewBox(boxes)}
      className="h-full w-full overflow-visible"
      strokeLinejoin="miter"
    >
      {boxes.map((box, boxIndex) => (
        <IsoBox key={boxIndex} box={box} />
      ))}
    </svg>
  );
}

export default IsoBoxes;