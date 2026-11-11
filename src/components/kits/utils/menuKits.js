// Variable Mapping: t -> MENU_CATEGORIES, e -> items / kit / tags, r -> itemBySlugMap, n -> assignedSlugs, i -> groupedCategories, s -> uncategorizedItems

const MENU_CATEGORIES = [
  {
    id: 'cover',
    label: 'Cover the page',
    blurb: 'The menu takes the whole viewport. The page is still there, underneath, untouched.',
    slugs: ['accordion', 'preview-index', 'curtain', 'tile-grid', 'split-screen'],
  },
  {
    id: 'move',
    label: 'Move the page',
    blurb: 'No overlay. The page itself gets tilted or pushed aside to make room.',
    slugs: ['context-shift', 'push-down'],
  },
  {
    id: 'float',
    label: 'Float beside it',
    blurb: 'Non-modal. The menu opens as its own surface and the page keeps running behind it.',
    slugs: ['island', 'pillar'],
  },
  {
    id: 'drill',
    label: 'Drill into it',
    blurb: 'For deep navigation. Levels stack instead of replacing each other, so the path stays visible.',
    slugs: ['stacked-drawer'],
  },
];

// NOTE: module id: 12426
export const KIT_MEMBER_DISCOUNT_NOTE =
  'Library members get 20% off every Kit, for as long as the subscription is active.';

export const KIT_EXCLUSION_NOTE = 'Not for Webflow.';

export const KIT_MEMBER_DISCOUNT_PERCENT = 20;

export function groupMenuItemsByCategory(items = []) {
  const itemBySlugMap = new Map(items.map((item) => [item.slug, item]));
  const assignedSlugs = new Set();

  const groupedCategories = MENU_CATEGORIES.map((category) => {
    const categoryItems = category.slugs
      .map((slug) => {
        const matchedItem = itemBySlugMap.get(slug);
        if (matchedItem) {
          assignedSlugs.add(slug);
        }
        return matchedItem;
      })
      .filter(Boolean);

    return {
      ...category,
      items: categoryItems,
    };
  }).filter((category) => category.items.length > 0);

  const uncategorizedItems = items.filter((item) => !assignedSlugs.has(item.slug));

  if (uncategorizedItems.length) {
    groupedCategories.push({
      id: 'more',
      label: 'More',
      blurb: '',
      slugs: uncategorizedItems.map((item) => item.slug),
      items: uncategorizedItems,
    });
  }

  return groupedCategories;
}

export function isKitAvailable(kit) {
  return kit?.status === 'available';
}

export function getKitItemBadge(tags) {
  if (!tags) {
    return null;
  }
  if (tags.includes('cover')) {
    return { id: 'cover', label: 'Cover' };
  }
  if (tags.includes('reveal')) {
    return { id: 'hero', label: 'Hero' };
  }
  return null;
}