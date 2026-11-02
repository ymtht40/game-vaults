import AttributesTable from '@/features/animation-page/components/AttributesTable'; // module id: 747198

export default function AnimationAttributes({ animation }) {
  const attributeSource = animation?.attributes;
  let attributes = [];

  if (attributeSource) {
    attributes = Array.isArray(attributeSource)
      ? attributeSource
      : [
          ...(
            attributeSource?.attributes?.selectors
            || attributeSource?.selectors
            || []
          ),
          ...(
            attributeSource?.attributes?.configurables
            || attributeSource?.configurables
            || []
          ),
        ];
  }

  if (attributes.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-foreground/10 pt-32">
      <span className="text-accent-xs text-foreground-muted">
        Attributes
      </span>

      <h2 className="text-h4 mt-12 text-foreground">
        Tune it.
      </h2>

      <div className="mt-16">
        <AttributesTable attributes={attributes} />
      </div>
    </section>
  );
}