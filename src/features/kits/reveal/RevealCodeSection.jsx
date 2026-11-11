'use client';

// Variable Mapping: H -> RevealCodeSection?

import JSXStyle from 'styled-jsx/style'; // NOTE: module id: 437902
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import SplitTextReveal from '@/features/demos/SplitTextReveal'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import { CodeViewer } from '@/features/animation-detail/components/CodeViewer'; // NOTE: module id: 343931 // UNRESOLVED: name guessed from usage
import {
  REVEAL_CODE_ANIMATION,
  REVEAL_CODE_STATE,
} from '@/features/kits/utils/reveal-kit.config'; // NOTE: module id: 301900

// NOTE: module id: 301900
export function RevealCodeSection() {
  return (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="jsx-d0166576148eee8d v2-container pt-64 pb-64 lg:pt-96 lg:pb-96">
        <div className="jsx-d0166576148eee8d grid grid-cols-12 gap-x-24 gap-y-40 lg:items-center">
          <div className="jsx-d0166576148eee8d col-span-12 lg:col-span-4 lg:col-start-2">
            <span className="jsx-d0166576148eee8d text-mono-sm text-foreground-muted">
              The code
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 font-medium"
            >
              Code you would have written anyway.
            </RevealHeading>
            <SplitTextReveal
              triggerMode="scroll"
              className="text-body mt-16 leading-relaxed text-foreground-muted"
            >
              Real React, Vue, and HTML. Typed, SSR-safe, reduced-motion aware.
              GSAP for the motion, Three.js for the WebGL variants. Paste it and
              ship.
            </SplitTextReveal>
          </div>
          <div className="jsx-d0166576148eee8d col-span-12 lg:col-span-5 lg:col-start-7">
            <div className="jsx-d0166576148eee8d reveal-code-panel h-[340px] lg:h-[400px]">
              <CodeViewer
                codeState={REVEAL_CODE_STATE}
                animation={REVEAL_CODE_ANIMATION}
                defaultPlatform="react"
              />
            </div>
          </div>
        </div>
        <JSXStyle id="d0166576148eee8d">
          {
            '.reveal-code-panel.jsx-d0166576148eee8d [data-lenis-prevent]{pointer-events:none;overflow:hidden!important}'
          }
        </JSXStyle>
      </div>
    </section>
  );
}
