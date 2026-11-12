// Variable Mapping: W -> MenuCodeSection?

import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import { CodeViewer } from '@/features/animation-detail/components/CodeViewer'; // NOTE: module id: 343931 // UNRESOLVED: name guessed from usage
import { MENU_CODE_ANIMATION, MENU_CODE_STATE } from '@/features/kits/utils/menu-kit.config'; // NOTE: module id: 37418

// NOTE: module id: 37418
export function MenuCodeSection() {
  return (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="v2-container pt-64 pb-64 lg:pt-96 lg:pb-96">
        <div className="grid grid-cols-12 gap-x-24 gap-y-40 lg:items-center">
          <div className="col-span-12 lg:col-span-4 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">The code</span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 font-medium"
            >
              Each menu is one drop-in component.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body mt-16 leading-relaxed text-foreground-muted"
            >
              Everything lives inside it: the trigger, the surface, the
              choreography, the accessibility floor. Pass your page in as
              children, wire the callbacks you need, ship it. React, Vue, and
              plain HTML - GSAP only, nothing else to install.
            </AnimatedText>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-7">
            <div className="h-[480px] lg:h-[400px]">
              <CodeViewer
                codeState={MENU_CODE_STATE}
                animation={MENU_CODE_ANIMATION}
                defaultPlatform="react"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
