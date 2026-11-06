import CopyPageButton from '@/features/docs/components/CopyPageButton';
import DocCard from '@/features/docs/components/DocCard';
import DocsQuickStart from '@/features/docs/components/DocsQuickStart';
import { DOC_CARDS } from '@/features/docs/docsNav';

export const metadata = {
  title: 'Documentation | GameVault',
  description:
    'Install GameVault, copy your first component, and learn how the components are built to be tuned.',
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function DocSection({ title, children }) {
  return (
    <section>
      <h2 id={slugify(title)} className="text-h3 scroll-mt-96 text-foreground">
        {title}
      </h2>
      <div className="mt-24 flex flex-col gap-24 lg:mt-32">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <article className="flex flex-col gap-80 pb-96 lg:gap-128">
      <header className="flex flex-col">
        <div className="flex items-center justify-between gap-16">
          <span />
          <CopyPageButton aiActions={false} />
        </div>

        <div className="mt-12">
          <div className="flex min-w-0 flex-col">
            <h1 className="text-h2 text-foreground">Documentation.</h1>
            <p className="text-body mt-16 leading-relaxed text-foreground-reading max-w-[64ch]">
              Install GameVault, copy your first component, and learn how the components are built to be tuned. Every component also has its own doc on its library page.
            </p>
          </div>
        </div>
      </header>

      <DocsQuickStart />

      <DocSection title="Real components, not a black box.">
        <p className="text-reading text-foreground-reading">
          You copy the real component. The markup and the GSAP timeline, not a wrapper around code you can&apos;t see. Open it, read it, change it.
        </p>
        <p className="text-reading text-foreground-reading">
          You tune it with attributes. Every component takes the same data-anm-* attributes, or props in React and Vue, so timing, easing, and motion change without rewriting anything. And each one is built from motion that shipped on real sites. Its page tells you where it came from.
        </p>
      </DocSection>

      {Object.entries(DOC_CARDS).map(([group, cards]) => (
        <DocSection key={group} title={group}>
          <ul className="grid grid-cols-1 gap-12 sm:grid-cols-2">
            {cards.map((card) => (
              <li key={card.href} className="min-w-0">
                <DocCard {...card} />
              </li>
            ))}
          </ul>
        </DocSection>
      ))}
    </article>
  );
}
