// Variable Mapping: l -> DEFAULT_PLATFORM, r -> EVENTS, A -> PLATFORM_OPTIONS, s -> STARTER_ANIMATION_SLUG

// NOTE: module id: 734601
export const DEFAULT_PLATFORM = 'react';

export const EVENTS = {
  copied: 'anm:animation-copied',
  tuned: 'anm:animation-tuned'
};

export const PLATFORM_OPTIONS = [
  { value: 'react', label: 'React', hint: 'useGSAP, typed props' },
  { value: 'vue', label: 'Vue', hint: 'Single-file component' },
  { value: 'html', label: 'Vanilla', hint: 'HTML, CSS, JS' },
  { value: 'webflow', label: 'Webflow', hint: 'Designer + custom code' }
];

export const STARTER_ANIMATION_SLUG = 'dual-scramble';

