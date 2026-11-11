// Variable Mapping: T -> MenuCraftSection?

import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391 // UNRESOLVED: name guessed from usage
import SplitTextReveal from '@/features/demos/SplitTextReveal'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import { MENU_CRAFT_ITEMS } from '@/features/kits/utils/menu-kit.config'; // NOTE: module id: 37418

// NOTE: module id: 37418
export function MenuCraftSection() {
  return (
    <section data-theme="light" className="bg-background text-foreground">
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">
              The hard part
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[26ch] font-medium"
            >
              A menu is where sites quietly break.
            </RevealHeading>
            <SplitTextReveal
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[62ch] leading-relaxed text-foreground-muted"
            >
              Focus, scroll, SEO, keyboards, interrupts - navigation is the one
              component where the animation is the easy half. The Kit's contract
              handles the other half the same way in all ten, so you don't
              re-audit it per menu.
            </SplitTextReveal>
            <FadeIn
              trigger="scroll"
              stagger={0.06}
              y={20}
              className="mt-40 grid grid-cols-1 gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-3"
            >
              {MENU_CRAFT_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col gap-8 bg-background px-20 py-24"
                >
                  <span className="flex items-center gap-8 text-mono-sm text-foreground">
                    <span
                      aria-hidden="true"
                      className="size-6 shrink-0 bg-brand"
                    />
                    {item.title}
                  </span>
                  <span className="text-body-sm leading-relaxed text-foreground-muted">
                    {item.body}
                  </span>
                </div>
              ))}
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
