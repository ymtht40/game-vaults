import Link from 'next/link';

// Server components only. No 'use client' needed.
// <article> + <h2 id> is what TableOfContents (selector: "main article h2[id]") reads.

export function LegalDocument({ title, intro, lastUpdated, children }) {
  return (
    <article className="flex flex-col gap-80 pb-96 lg:gap-128">
      <header className="flex flex-col">
        <h1 className="text-h2 text-foreground">{title}</h1>
        {intro ? (
          <p className="text-body mt-16 max-w-[64ch] leading-relaxed text-foreground-reading">
            {intro}
          </p>
        ) : null}
        {lastUpdated ? (
          <p className="text-mono-sm mt-16 text-foreground-muted">
            Last updated {lastUpdated}
          </p>
        ) : null}
      </header>
      {children}
    </article>
  );
}

export function LegalSection({ id, title, children }) {
  return (
    <section>
      <h2 id={id} className="text-h3 scroll-mt-96 text-foreground">
        {title}
      </h2>
      <div className="mt-24 flex flex-col gap-24 lg:mt-32">{children}</div>
    </section>
  );
}

// Nested heading. h3 on purpose, so the TOC only lists top-level sections.
export function LegalSubsection({ id, title, children }) {
  return (
    <section>
      <h3 id={id} className="text-h4 scroll-mt-96 text-foreground">
        {title}
      </h3>
      <div className="mt-16 flex flex-col gap-16">{children}</div>
    </section>
  );
}

export function LegalP({ children }) {
  return <p className="text-reading text-foreground-reading">{children}</p>;
}

export function LegalList({ items }) {
  return (
    <ul className="flex flex-col gap-10">
      {items.map((item, i) => (
        <li key={i} className="text-reading flex gap-12 text-foreground-reading">
          <span
            aria-hidden="true"
            className="mt-[0.875em] block h-px w-10 shrink-0 bg-foreground/40"
          />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

const LINK_CLASS = 'underline underline-offset-4 hover:text-foreground';

export function LegalLink({ href, children }) {
  const external = /^(mailto:|https?:)/.test(href);
  if (external) {
    return (
      <a href={href} className={LINK_CLASS}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={LINK_CLASS}>
      {children}
    </Link>
  );
}
