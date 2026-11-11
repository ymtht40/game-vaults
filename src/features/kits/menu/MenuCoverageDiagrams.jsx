// Variable Mapping: N -> DIAGRAM_VIEWBOX, k -> STROKE_RECT_PROPS, L -> DiagramFrameRect?, F -> COVERAGE_DIAGRAMS, e -> x, a -> y, r -> w, n -> h, l -> opacity, i -> transform

const DIAGRAM_VIEWBOX = '0 0 96 60';

const STROKE_RECT_PROPS = {
  stroke: 'currentColor',
  strokeWidth: '1',
  fill: 'none',
};

function DiagramFrameRect({
  x = 8,
  y = 8,
  w = 80,
  h = 44,
  opacity = 1,
  transform,
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      opacity={opacity}
      transform={transform}
      {...STROKE_RECT_PROPS}
    />
  );
}

// NOTE: module id: 37418
export const COVERAGE_DIAGRAMS = {
  cover: function () {
    return (
      <svg
        viewBox={DIAGRAM_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <DiagramFrameRect opacity="0.35" />
        <rect
          x="8"
          y="8"
          width="80"
          height="44"
          fill="currentColor"
          opacity="0.12"
        />
        <DiagramFrameRect />
      </svg>
    );
  },
  move: function () {
    return (
      <svg
        viewBox={DIAGRAM_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <rect
          x="8"
          y="8"
          width="18"
          height="44"
          fill="currentColor"
          opacity="0.12"
        />
        <DiagramFrameRect x={34} y={8} w={54} h={44} />
      </svg>
    );
  },
  float: function () {
    return (
      <svg
        viewBox={DIAGRAM_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <DiagramFrameRect />
        <rect
          x="14"
          y="16"
          width="26"
          height="28"
          rx="3"
          fill="currentColor"
          opacity="0.12"
        />
        <rect
          x="14"
          y="16"
          width="26"
          height="28"
          rx="3"
          {...STROKE_RECT_PROPS}
        />
      </svg>
    );
  },
  drill: function () {
    return (
      <svg
        viewBox={DIAGRAM_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <DiagramFrameRect opacity="0.35" />
        <rect
          x="52"
          y="8"
          width="36"
          height="44"
          fill="currentColor"
          opacity="0.12"
        />
        <rect x="52" y="8" width="36" height="44" {...STROKE_RECT_PROPS} />
        <rect
          x="56"
          y="13"
          width="1.5"
          height="34"
          fill="currentColor"
          opacity="0.5"
        />
        <rect
          x="61"
          y="13"
          width="1.5"
          height="34"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>
    );
  },
};
