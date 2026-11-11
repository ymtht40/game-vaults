export const MENU_SHOWREEL_VIDEO_URL =
  'https://annnimate.b-cdn.net/video-thumbnails/kits/menu/menu-showreel.mp4';

export const MENU_SHOWREEL_POSTER_URL =
  'https://annnimate.b-cdn.net/video-thumbnails/kits/menu/menu-showreel_poster.avif';

export const HERO_TAGLINE_REVEAL_PROPS = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
  triggerMode: 'pageEnter',
};

export const MENU_CRAFT_ITEMS = [
  {
    title: 'Your nav never leaves the DOM',
    body: 'A closed menu is visibility: hidden plus inert - never display: none. Crawlers and screen readers get the full navigation whether the menu has ever been opened or not.',
  },
  {
    title: 'Real dialog semantics',
    body: 'Modal surfaces carry role="dialog" and aria-modal, the trigger tracks aria-expanded, focus moves in on open and returns to the trigger on close. Escape closes, always, immediately.',
  },
  {
    title: 'Scroll lock that finds your scroller',
    body: "The lock targets the layout's actual scroll source - Lenis when present, the real scroller otherwise - instead of blindly freezing the body and hoping.",
  },
  {
    title: 'Reduced motion, same menu',
    body: 'With prefers-reduced-motion the open completes in under 150ms and content lands settled. Functionality is identical - nobody gets a lesser menu.',
  },
  {
    title: 'GPU properties only',
    body: 'Transforms, opacity, clip-path. No width or height tweens, no layout thrash, no per-frame DOM reads. Surfaces that grow are clipped or scaled, not resized.',
  },
  {
    title: 'One motion language',
    body: 'Every menu opens on the same easing family and closes on the house state curve, with content exiting first and the surface retracting through its tail. Ten designs, one hand.',
  },
];

export const MENU_REACT_CODE = `import MenuPreviewIndex from "./menu/preview-index";

export default function Layout({ children }) {
  return (
    <MenuPreviewIndex
      onOpening={() => pauseHeroVideo()}
      onClose={() => resumeHeroVideo()}
    >
      {children}
    </MenuPreviewIndex>
  );
}`;

export const MENU_VUE_CODE = `<script setup>
import MenuPreviewIndex from "./menu/preview-index.vue";
</script>

<template>
  <MenuPreviewIndex @opening="pauseHeroVideo" @close="resumeHeroVideo">
    <slot />
  </MenuPreviewIndex>
</template>`;

export const MENU_HTML_CODE = `<div
  data-anm-kit-menu-preview-index
  data-anm-duration="0"
  data-anm-ease="expo.out"
  data-anm-stagger="0.07"
>
  <!-- trigger + surface markup from the kit files -->
  <!-- your page goes in the stage slot -->
</div>`;

export const MENU_CSS_CODE = `/* Every menu stamps its live phase on the container:
   closed -> opening -> open -> closing. Style YOUR page
   against it - no JS required. */
[data-anm-kit-menu-preview-index][data-anm-menu-phase="open"] ~ .site-header {
  opacity: 0;
}`;

export const MENU_JS_CODE = `// The vanilla build self-initializes and exposes a
// namespaced handle - collision-safe next to any
// Library animation on the same page.
window.Anm.kit.menu.previewIndex.toggle();

// Page-level hooks: every menu dispatches
// menu:opening / open / closing / closed on its container.
container.addEventListener("menu:opening", dimThePage);`;

export const MENU_CODE_STATE = {
  react: MENU_REACT_CODE,
  vue: MENU_VUE_CODE,
  html: MENU_HTML_CODE,
  css: MENU_CSS_CODE,
  js: MENU_JS_CODE,
};

export const MENU_CODE_ANIMATION = {
  id: 'menu-kit-usage',
  slug: 'menu',
  title: 'Menu',
  category: 'kit',
  react_code: MENU_REACT_CODE,
  vue_code: MENU_VUE_CODE,
  html_code: MENU_HTML_CODE,
  css_code: MENU_CSS_CODE,
  js_code: MENU_JS_CODE,
};

export const MENU_FAQS = [
  {
    q: 'Is the Menu Kit part of the Library subscription?',
    a: 'No. The Menu Kit is a stand-alone product, bought once and owned forever. The Library is a separate yearly subscription, billed and accessed independently from any Kit.',
  },
  {
    q: 'Which frameworks does it ship in?',
    a: 'The Menu Kit ships in React, Vue, and plain HTML / CSS / JS. It is not built for Webflow.',
  },
  {
    q: 'How is this different from the menu components in the Library?',
    a: 'The Library goes broad; this Kit goes deep. Every menu here is authored as part of one navigation system - same props, same events, same accessibility floor - so swapping one menu for another is a component swap, not a re-integration. Nothing in the Kit is unlocked by a Library subscription.',
  },
  {
    q: 'Will it work with my existing site?',
    a: 'Yes - that is what the Kit is organized around. Four menus cover the page, three move it, two float beside it, and one drills into deep navigation, so there is a menu for whatever your layout can take. Your page passes in as children; the menu never dictates your markup.',
  },
  {
    q: 'What about accessibility and SEO?',
    a: 'Every menu keeps your nav links in the DOM while closed (visibility plus inert, never display: none), traps and returns focus, closes on Escape, locks scroll against the real scroller, and completes near-instantly under prefers-reduced-motion. That floor is part of the shared contract, not per-menu effort.',
  },
  {
    q: 'What does it depend on?',
    a: 'GSAP, and nothing else. No Three.js, no component framework beyond the one you already use. GSAP is free, including every plugin.',
  },
  {
    q: 'Do I own it forever, and are updates included?',
    a: 'Yes. One purchase gives you a perpetual license plus every future update to the Kit at no extra cost. Nothing renews and nothing expires.',
  },
  {
    q: 'Can I use it on client and commercial projects?',
    a: 'Yes. The license covers unlimited commercial and client projects. The only thing you cannot do is repackage or resell the components as a competing product.',
  },
  {
    q: 'How do I get the code after I buy?',
    a: 'After purchase the Kit lives in your account, separate from the Library. You can browse and copy every component in the app, or download the whole Kit as a ZIP.',
  },
  {
    q: 'I subscribe to the Library. Do I get a discount?',
    a: 'Yes. Library members get 20% off every Kit for as long as the subscription is active. Buy a Kit first and you get 20% off your first year of any Library plan.',
  },
  {
    q: 'What is the refund policy?',
    a: "The Menu Kit is final sale. You get the full code the moment you pay, so the purchase can't be returned or refunded. Every menu is on this page to watch before you buy, and the refund policy has the details.",
  },
];

export const MENU_INCLUDED_ITEMS = [
  'All ten menus, in React, Vue and HTML / CSS / JS',
  'Perpetual license, unlimited commercial projects',
  'Lifetime updates to this Kit, at no extra cost',
  'One contract across all ten - same props, same events, same accessibility floor',
];
