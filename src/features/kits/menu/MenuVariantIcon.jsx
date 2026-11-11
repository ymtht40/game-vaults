// Variable Mapping: j -> ICON_SVG_PROPS, M -> TwoLinesGlyph?, Z -> MENU_VARIANT_ICONS, A -> MenuVariantIcon?, e -> slug, a -> className, r -> IconComponent

const ICON_SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': 'true',
};

function TwoLinesGlyph() {
  return (
    <svg {...ICON_SVG_PROPS}>
      <rect x="1" y="7.25" width="22" height="1.5" fill="currentColor" />
      <rect x="1" y="15.25" width="22" height="1.5" fill="currentColor" />
    </svg>
  );
}

const MENU_VARIANT_ICONS = {
  'preview-index': TwoLinesGlyph,
  'mask-type': TwoLinesGlyph,
  curtain: function () {
    return (
      <svg {...ICON_SVG_PROPS}>
        <rect x="3.75" y="4" width="1.5" height="9" fill="currentColor" />
        <rect x="8.75" y="4" width="1.5" height="14" fill="currentColor" />
        <rect x="13.75" y="4" width="1.5" height="9" fill="currentColor" />
      </svg>
    );
  },
  'tile-grid': function () {
    return (
      <svg {...ICON_SVG_PROPS}>
        <rect x="5" y="5" width="5" height="5" fill="currentColor" />
        <rect x="14" y="5" width="5" height="5" fill="currentColor" />
        <rect x="5" y="14" width="5" height="5" fill="currentColor" />
        <rect x="14" y="14" width="5" height="5" fill="currentColor" />
      </svg>
    );
  },
  accordion: function () {
    const coords = [4, 11, 18];
    return (
      <svg {...ICON_SVG_PROPS}>
        {coords.map((y) =>
          coords.map((x) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="2.5"
              height="2.5"
              fill="currentColor"
            />
          ))
        )}
      </svg>
    );
  },
  'context-shift': function () {
    return (
      <svg {...ICON_SVG_PROPS}>
        <rect x="2" y="5" width="3" height="14" fill="currentColor" />
        <rect
          x="7.75"
          y="5.75"
          width="14.5"
          height="12.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  },
  'split-screen': function () {
    return (
      <svg {...ICON_SVG_PROPS}>
        <rect x="2" y="11.25" width="7" height="1.5" fill="currentColor" />
        <rect x="11.25" y="4" width="1.5" height="16" fill="currentColor" />
        <rect x="15" y="11.25" width="7" height="1.5" fill="currentColor" />
      </svg>
    );
  },
  'push-down': function () {
    return (
      <svg {...ICON_SVG_PROPS}>
        <rect x="2" y="6" width="20" height="2" fill="currentColor" />
        <rect x="6" y="13" width="12" height="6" fill="currentColor" />
      </svg>
    );
  },
  island: function () {
    return (
      <svg {...ICON_SVG_PROPS}>
        <rect
          x="2.75"
          y="8.75"
          width="18.5"
          height="9.5"
          rx="4.75"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  },
  pillar: function () {
    return (
      <svg {...ICON_SVG_PROPS}>
        <rect x="5" y="7.25" width="14" height="1.5" fill="currentColor" />
        <rect x="5" y="11.25" width="14" height="1.5" fill="currentColor" />
        <rect x="5" y="15.25" width="14" height="1.5" fill="currentColor" />
      </svg>
    );
  },
  'stacked-drawer': function () {
    return (
      <svg {...ICON_SVG_PROPS}>
        <rect x="6.25" y="4" width="1.5" height="16" fill="currentColor" />
        <rect x="11.25" y="4" width="1.5" height="16" fill="currentColor" />
        <rect x="16.25" y="4" width="1.5" height="16" fill="currentColor" />
      </svg>
    );
  },
};

// NOTE: module id: 37418
export function MenuVariantIcon({ slug, className = '' }) {
  const IconComponent = MENU_VARIANT_ICONS[slug];
  return IconComponent ? (
    <span className={`block size-20 shrink-0 ${className}`}>
      <IconComponent />
    </span>
  ) : null;
}
