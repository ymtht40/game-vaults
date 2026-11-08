// Variable Mapping: h -> HERO_SUBTEXT_ANIMATION, C -> CARD_VARIANT_CLASSES, M -> BOARD_COLUMNS

// NOTE: module id: 626171
export const HERO_SUBTEXT_ANIMATION = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: { yPercent: 100 },
  triggerMode: 'pageEnter',
};

// NOTE: module id: 626171
export const CARD_VARIANT_CLASSES = {
  'in-progress': 'border-foreground/15 bg-surface',
  'next-up': 'border-foreground/10',
  'under-consideration': 'border-foreground/10',
};

// NOTE: module id: 626171
export const BOARD_COLUMNS = [
  {
    id: 'in-progress',
    index: '01',
    label: 'Building now',
    variant: 'in-progress',
    sortByVotes: false,
  },
  {
    id: 'next-up',
    index: '02',
    label: 'Next up',
    variant: 'next-up',
    sortByVotes: true,
  },
  {
    id: 'under-consideration',
    index: '03',
    label: 'Under consideration',
    variant: 'under-consideration',
    sortByVotes: true,
    showSuggestTile: true,
  },
];
