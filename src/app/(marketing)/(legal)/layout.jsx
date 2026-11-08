import ReferenceSearchButton from '@/components/ui/ReferenceSearchButton'; // module 6648
import MobileSectionNav from '@/components/navigation/MobileSectionNav'; // module 816887
import DesktopSectionNav from '@/components/navigation/DesktopSectionNav'; // module 912596
import TableOfContents from '@/components/navigation/TableOfContents'; // module 214070
import { LEGAL_SECTIONS } from '@/features/legal/legalNav';

// Rendered inside AppShell's <main> (public route), so this uses <div>, not a second <main>.
export default function LegalLayout({ children }) {
  return (
    <div
      data-theme="dark"
      className="v2-marketing min-h-screen bg-background text-foreground"
    >
      <div className="v2-container pt-[calc(var(--v2-header-h)+var(--v2-header-gap)+32px)] pb-32 lg:pt-[calc(var(--v2-header-h)+var(--v2-header-gap)+48px)] lg:pb-48">
        <div className="group/ref grid grid-cols-12 gap-x-24">
          <aside className="col-span-12 lg:col-span-2">
            <ReferenceSearchButton />
            <MobileSectionNav
              ariaLabel="Legal documents"
              variant="sliding-bar"
              sections={LEGAL_SECTIONS}
            />
            <DesktopSectionNav
              ariaLabel="Legal documents"
              variant="sliding-bar"
              sections={LEGAL_SECTIONS}
            />
          </aside>

          <div className="col-span-12 mt-24 min-w-0 lg:col-span-7 lg:col-start-4 lg:mt-0 lg:group-has-[[data-wide]]/ref:col-span-9">
            <div className="v2-reading v2-reading-start">{children}</div>
          </div>

          <aside className="hidden lg:block lg:col-span-2 lg:col-start-11 lg:group-has-[[data-wide]]/ref:hidden">
            <TableOfContents />
          </aside>
        </div>
      </div>
    </div>
  );
}
