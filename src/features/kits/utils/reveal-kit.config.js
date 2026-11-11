export const TAGLINE_REVEAL_PROPS = {
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

export const REVEAL_REACT_CODE = `import RevealCounterColumns from "./reveal/counter-columns";

export default function Layout({ children }) {
  return (
    <>
      <RevealCounterColumns minDuration={4000} exit="up" />
      {children}
    </>
  );
}`;

export const REVEAL_VUE_CODE = `<script setup>
import RevealCounterColumns from "./reveal/counter-columns.vue";
</script>

<template>
  <RevealCounterColumns :min-duration="4000" exit="up" />
  <slot />
</template>`;

export const REVEAL_HTML_CODE = `<div
  data-anm-kit-reveal-counter-columns
  data-anm-min-duration="4000"
  data-anm-exit="up"
  role="status"
  aria-busy="true"
>
  <!-- columns + counter markup from the kit files -->
</div>`;

export const REVEAL_CSS_CODE = `/* Each component ships themeable tokens on its root. */
[data-anm-kit-reveal-counter-columns] {
  --reveal-counter-columns-bg: #0a0a0a;
  --reveal-counter-columns-stroke: #f4efe9;
}`;

export const REVEAL_JS_CODE = `// The vanilla build self-initializes and exposes a
// namespaced public handle - collision-safe next to
// any Library animation on the same page.
window.Anm.kit.reveal.counterColumns.forceComplete();

// Sync your page entrance to the release frame:
document.addEventListener("reveal:opening", startEntrances);`;

export const REVEAL_CODE_STATE = {
  react: REVEAL_REACT_CODE,
  vue: REVEAL_VUE_CODE,
  html: REVEAL_HTML_CODE,
  css: REVEAL_CSS_CODE,
  js: REVEAL_JS_CODE,
};

export const REVEAL_CODE_ANIMATION = {
  id: 'reveal-kit-usage',
  slug: 'reveal',
  title: 'Reveal',
  category: 'kit',
  react_code: REVEAL_REACT_CODE,
  vue_code: REVEAL_VUE_CODE,
  html_code: REVEAL_HTML_CODE,
  css_code: REVEAL_CSS_CODE,
  js_code: REVEAL_JS_CODE,
};

export const PRICING_FEATURES = [
  'Every Reveal component, in React, Vue and HTML / CSS / JS. Not for Webflow.',
  'A perpetual license. Yours forever, on unlimited commercial projects.',
  'Lifetime updates, every future addition to this Kit at no extra cost.',
  'Production-ready. Typed, SSR-safe, reduced-motion aware. GSAP and Three.js.',
];

export const REVEAL_FAQS = [
  {
    q: 'Is the Reveal Kit part of the Library subscription?',
    a: 'No. The Reveal Kit is a stand-alone product, bought once and owned forever. The Library is a separate yearly subscription, billed and accessed independently from any Kit.',
  },
  {
    q: 'Which frameworks does it ship in?',
    a: 'The Reveal Kit ships in React, Vue, and plain HTML / CSS / JS. It is not built for Webflow.',
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
    q: 'Do I have to use both WebGL and GSAP? Can I mix them?',
    a: 'No. Reveal is a mix-and-match system: pair any preloader cover with any hero section, in WebGL or GSAP, and use only the variants your project needs.',
  },
  {
    q: 'What does the Reveal Kit depend on?',
    a: 'The GSAP variants need GSAP. The WebGL variants also need Three.js. Both are standard, widely used libraries, and GSAP is free including every plugin.',
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
    a: "The Reveal Kit is final sale. You get the full code the moment you pay, so the purchase can't be returned or refunded. Every component is on this page to watch before you buy, and the refund policy has the details.",
  },
];
