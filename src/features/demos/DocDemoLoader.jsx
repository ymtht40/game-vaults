'use client';


import dynamic from 'next/dynamic'; // NOTE: module id: 770703

const DEMO_COMPONENTS = {
  'easing-graph': dynamic(() => import('@/features/demos/EasingGraph'), { // NOTE: module id: 318968
    ssr: false,
  }),
  stagger: dynamic(() => import('@/features/demos/StaggerDemo'), { // NOTE: module id: 919926
    ssr: false,
  }),
  'split-text': dynamic(() => import('@/components/motion/AnimatedText'), { // NOTE: module id: 432247
    ssr: false,
  }),
  'scrub-sim': dynamic(() => import('@/features/demos/ScrubDemo'), { // NOTE: module id: 978787
    ssr: false,
  }),
};

export default function DocDemoLoader({ kind, caption, options }) {
  const DemoComponent = DEMO_COMPONENTS[kind];
  return DemoComponent ? (
    <DemoComponent caption={caption} options={options} />
  ) : null;
}

