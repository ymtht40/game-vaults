'use client';

import {
  ACCENT_BOX_CLASS_NAME,
  ACCENT_STROKE_OPACITIES,
  DEFAULT_BOX_CLASS_NAME,
  DEFAULT_STROKE_OPACITIES,
  formatPoint,
  getBoxFaces,
  getFigureDefinitionViewBox
} from '@/features/docs/utils/figureUtils';

export default function FigureBoxes({ boxes }) {
  return (
    <svg
      viewBox={getFigureDefinitionViewBox(boxes)}
      className="h-full w-full overflow-visible"
      strokeLinejoin="miter"
    >
      {boxes.map((box, boxIndex) => (
        <g
          key={boxIndex}
          data-box={true}
          className={
            box.accent ? ACCENT_BOX_CLASS_NAME : DEFAULT_BOX_CLASS_NAME
          }
          strokeDasharray={box.dashed ? '3 3' : undefined}
          style={box.o != null ? { opacity: box.o } : undefined}
        >
          {getBoxFaces(box).map((face, faceIndex) => (
            <polygon
              key={faceIndex}
              points={face.map(formatPoint).join(' ')}
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