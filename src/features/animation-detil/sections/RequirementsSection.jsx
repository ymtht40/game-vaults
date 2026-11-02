// Variable Mapping: S -> RequirementsSection, C -> DEPENDENCY_LABELS, e -> animation / dep / concept, s -> concepts, a -> dependencies, n -> conceptList, _.f -> ConceptChip

import ConceptChip from '@/components/ui/ConceptChip'; // NOTE: module id: 506935

const DEPENDENCY_LABELS = {
  gsap: 'GSAP',
};

// NOTE: module id: 521041
export default function RequirementsSection({ animation, concepts = [] }) {
  const dependencies = Array.isArray(animation?.dependencies) ? animation.dependencies : [];
  const conceptList = Array.isArray(concepts) ? concepts : [];

  if (dependencies.length === 0 && conceptList.length === 0) return null;

  return (
    <section className="border-t border-foreground/10 pt-32">
      <span className="text-accent-xs text-foreground-muted">Required</span>
      <h2 className="text-h4 mt-12 text-foreground">What you&apos;ll need.</h2>
      <div className="mt-16 grid grid-cols-3 gap-x-12 gap-y-16">
        {dependencies.length > 0 && (
          <div>
            <p className="text-mono-sm mb-8 text-foreground-muted">Install</p>
            <ul className="flex flex-wrap items-center gap-8 m-0 p-0 list-none">
              {dependencies.map((dep) => (
                <li
                  key={dep}
                  className="text-accent-xs bg-foreground/[0.06] px-8 py-4 normal-case text-foreground"
                >
                  {DEPENDENCY_LABELS[dep] ?? dep}
                </li>
              ))}
            </ul>
          </div>
        )}
        {conceptList.length > 0 && (
          <div>
            <p className="text-mono-sm mb-8 text-foreground-muted">Concepts</p>
            <ul className="flex flex-wrap items-center gap-8 m-0 p-0 list-none">
              {conceptList.map((concept) => (
                <li key={`${concept.category}/${concept.slug}`}>
                  <ConceptChip category={concept.category} slug={concept.slug}>
                    {concept.title}
                  </ConceptChip>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
