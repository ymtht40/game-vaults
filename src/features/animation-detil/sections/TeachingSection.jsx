// Variable Mapping: k -> TeachingSection, e -> animation / block, s -> rawBlocks / index, a -> blocks, N.B -> formatTeachingProse, N.N -> TeachingBlock 

import {
  formatInlineMarkdownHtml,
  DocBlockRenderer,
} from '@/features/docs/components/DocBlockRenderer'; // NOTE: module id: 120322

// NOTE: module id: 521041
export default function TeachingSection({ animation }) {
  const rawBlocks = animation?.metadata?.teaching?.blocks;
  const blocks = Array.isArray(rawBlocks) ? rawBlocks : [];

  if (blocks.length === 0) return null;

  return (
    <section className="pt-16">
      <span className="text-accent-xs text-foreground-muted">The craft</span>
      <h2 className="text-h4 mt-12 text-foreground">How it&apos;s built.</h2>
      <div className="mt-16 flex flex-col gap-16">
        {blocks.map((block, index) =>
          block?.type === 'prose' ? (
            <p
              key={index}
              className="text-body leading-relaxed text-foreground-reading"
              dangerouslySetInnerHTML={{
                __html: formatInlineMarkdownHtml(block.text || ''),
              }}
            />
          ) : (
            <DocBlockRenderer key={index} block={block} />
          )
        )}
      </div>
    </section>
  );
}
