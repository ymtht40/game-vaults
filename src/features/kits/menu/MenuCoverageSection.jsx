// Variable Mapping: S -> MenuCoverageSection?, e -> kit, a -> groups

import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391 // UNRESOLVED: name guessed from usage
import SplitTextReveal from '@/features/demos/SplitTextReveal'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import { groupComponentsByKind } from '@/features/kits/utils/menuKits'; // NOTE: module id: 12426 // UNRESOLVED: name guessed from usage
import { COVERAGE_DIAGRAMS } from '@/features/kits/menu/MenuCoverageDiagrams'; // NOTE: module id: 37418
import { MenuVariantIcon } from '@/features/kits/menu/MenuVariantIcon'; // NOTE: module id: 37418

// NOTE: module id: 37418
export function MenuCoverageSection({ kit }) {
  const groups = groupComponentsByKind(kit?.components || []);

  return groups.length ? (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">Coverage</span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[26ch] font-medium"
            >
              Four things a menu can do to a page.
            </RevealHeading>
            <SplitTextReveal
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[62ch] leading-relaxed text-foreground-muted"
            >
              The useful question is not which effect you like, it is what your
              layout can survive. A site with a pinned hero cannot take a menu
              that shoves the page down. One with a live canvas behind it should
              not be covered. The Kit has all four, so the answer is already in
              it.
            </SplitTextReveal>
            <FadeIn
              trigger="scroll"
              stagger={0.08}
              y={20}
              className="mt-40 grid grid-cols-1 gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-4"
            >
              {groups.map((group) => {
                const DiagramComponent = COVERAGE_DIAGRAMS[group.id];
                return (
                  <div
                    key={group.id}
                    className="flex flex-col bg-background p-20 lg:row-span-2 lg:grid lg:grid-rows-subgrid"
                  >
                    <div className="flex flex-col gap-16 lg:pb-24">
                      <div className="max-w-[128px] text-foreground/45">
                        {DiagramComponent ? <DiagramComponent /> : null}
                      </div>
                      <div className="flex flex-col gap-8">
                        <span className="flex items-center gap-8 text-mono-sm text-foreground">
                          <span
                            aria-hidden="true"
                            className="size-6 shrink-0 bg-brand"
                          />
                          {group.label}
                        </span>
                        <span className="text-body-sm leading-relaxed text-foreground-muted">
                          {group.blurb}
                        </span>
                      </div>
                    </div>
                    <ul className="mt-24 flex flex-col gap-6 border-t border-foreground/10 pt-24 lg:mt-0 lg:self-start">
                      {group.items.map((item) => (
                        <li
                          key={item.slug}
                          className="flex items-center gap-8 text-mono-sm text-foreground-muted"
                        >
                          <MenuVariantIcon
                            slug={item.slug}
                            className="size-16 text-foreground/50"
                          />
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  ) : null;
}
