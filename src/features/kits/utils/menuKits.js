// Variable Mapping: t -> MENU_COVERAGE_GROUPS, h -> KIT_LICENSE_NOTE, X -> KIT_FORMATS_NOTE, f -> KIT_MEMBER_DISCOUNT_PERCENT?, E -> groupComponentsByKind, x -> hasKitPricing, y -> getVariantKindMeta, e -> components / kit / variantKind, r -> bySlug, n -> matchedSlugs, a -> groups, s -> remaining

const MENU_COVERAGE_GROUPS = [
  {
    id: 'cover',
    label: 'Cover the page',
    blurb:
      'The menu takes the whole viewport. The page is still there, underneath, untouched.',
    slugs: [
      'accordion',
      'preview-index',
      'curtain',
      'tile-grid',
      'split-screen',
    ],
  },
  {
    id: 'move',
    label: 'Move the page',
    blurb:
      'No overlay. The page itself gets tilted or pushed aside to make room.',
    slugs: ['context-shift', 'push-down'],
  },
  {
    id: 'float',
    label: 'Float beside it',
    blurb:
      'Non-modal. The menu opens as its own surface and the page keeps running behind it.',
    slugs: ['island', 'pillar'],
  },
  {
    id: 'drill',
    label: 'Drill into it',
    blurb:
      'For deep navigation. Levels stack instead of replacing each other, so the path stays visible.',
    slugs: ['stacked-drawer'],
  },
];

// NOTE: module id: 12426
export const KIT_LICENSE_NOTE =
  'Library members get 20% off every Kit, for as long as the subscription is active.';

// NOTE: module id: 12426
export const KIT_FORMATS_NOTE = 'Not for Webflow.';

// NOTE: module id: 12426
export const KIT_MEMBER_DISCOUNT_PERCENT = 20; // UNRESOLVED: export name guessed from value and license note

// NOTE: module id: 12426
export function groupComponentsByKind(components = []) {
  const bySlug = new Map(components.map((item) => [item.slug, item]));
  const matchedSlugs = new Set();
  const groups = MENU_COVERAGE_GROUPS.map((group) => {
    const items = group.slugs
      .map((slug) => {
        const matched = bySlug.get(slug);
        if (matched) matchedSlugs.add(slug);
        return matched;
      })
      .filter(Boolean);
    return {
      ...group,
      items,
    };
  }).filter((group) => group.items.length > 0);

  const remaining = components.filter((item) => !matchedSlugs.has(item.slug));
  if (remaining.length) {
    groups.push({
      id: 'more',
      label: 'More',
      blurb: '',
      slugs: remaining.map((item) => item.slug),
      items: remaining,
    });
  }
  return groups;
}

// NOTE: module id: 12426
export function hasKitPricing(kit) {
  return kit?.status === 'available';
}

// NOTE: module id: 12426
export function getVariantKindMeta(variantKind) {
  return variantKind
    ? variantKind.includes('cover')
      ? {
          id: 'cover',
          label: 'Cover',
        }
      : variantKind.includes('reveal')
        ? {
            id: 'hero',
            label: 'Hero',
          }
        : null
    : null;
}