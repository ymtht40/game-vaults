import MobileSectionNav from '@/components/navigation/MobileSectionNav';
import DesktopSectionNav from '@/components/navigation/DesktopSectionNav';
import NewsletterForm from '@/features/newsletter/NewsletterForm';
import { DOCS_SECTIONS } from '@/features/docs/docsNav';

export default function DocsLayout({ children }) {
  return (
    <div
      data-theme="dark"
      className="v2-marketing min-h-screen bg-background text-foreground"
    >
      <div className="v2-container pt-[calc(var(--v2-header-h)+var(--v2-header-gap)+32px)] pb-32 lg:pt-[calc(var(--v2-header-h)+var(--v2-header-gap)+48px)] lg:pb-48">
        <div className="group/ref grid grid-cols-12 gap-x-24">
          <aside className="col-span-12 lg:col-span-2">
            {/* module 6648 (the ⌘K search button) is not available, so it is omitted */}
            <MobileSectionNav
              ariaLabel="Documentation"
              variant="sliding-bar"
              sections={DOCS_SECTIONS}
            />
            <DesktopSectionNav
              ariaLabel="Documentation"
              variant="sliding-bar"
              sections={DOCS_SECTIONS}
            />
          </aside>

          <main
            data-transition-content="true"
            className="col-span-12 mt-24 min-w-0 lg:col-span-7 lg:col-start-4 lg:mt-0 lg:group-has-[[data-wide]]/ref:col-span-9"
          >
            <div className="v2-reading v2-reading-start">{children}</div>
          </main>

          <aside className="hidden lg:block lg:col-span-2 lg:col-start-11 lg:group-has-[[data-wide]]/ref:hidden">
            <div className="sticky top-[var(--v2-sticky-top)] flex max-h-[calc(100dvh-var(--v2-sticky-top)-4rem)] flex-col gap-24 overflow-y-auto overscroll-contain">
              <aside className="flex flex-col gap-12 bg-foreground/[0.04] p-20">
                <p className="text-body-sm m-0 font-medium text-foreground">
                  Try the library before you decide.
                </p>
                <p className="text-body-sm m-0 text-foreground-muted">
                  Free production components in React, Vue and HTML. No card, no catch.
                </p>
                <NewsletterForm
                  source="reference-rail"
                  idPrefix="reference-rail"
                  buttonLabel="Get the free pack"
                  fieldStyle="boxed"
                  consent="notice"
                  compact={true}
                  buttonFullWidth={true}
                  className="mt-8"
                />
              </aside>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
