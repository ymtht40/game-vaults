// Variable Mapping: i -> EMPTY_SLUG_SET, s -> normalizeConceptKey, l -> parseInlineTokens, u -> DocList, c -> DocCallout, f -> DEFAULT_LINK_SLUGS, m -> formatInlineMarkdownHtml, x -> DocBlockRenderer

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import NavLink from '@/components/navigation/NavSurface'; // NOTE: module id: 520237
import ConceptTooltipLink from '@/components/navigation/ConceptTooltipLink'; // NOTE: module id: 514120
import ContentCard from '@/components/ui/ContentCard'; // NOTE: module id: 292917
import CodeBlock from '@/features/animation-detail/components/CodeBlock'; // NOTE: module id: 317840
import DocDemoLoader from '@/features/demos/DocDemoLoader'; // NOTE: module id: 45119

const EMPTY_SLUG_SET = new Set();

function normalizeConceptKey(text = '') {
  return text
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .trim();
}

function slugify(text = '') {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseInlineTokens(
  text = '',
  linkSlugs = EMPTY_SLUG_SET,
  concepts = null
) {
  let match;
  const tokenRegex = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  const parts = [];
  let lastIndex = 0;
  let keyIndex = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      const boldText = match[1];
      const slug = slugify(boldText);
      const conceptKey = normalizeConceptKey(boldText);

      if (linkSlugs.has(slug)) {
        parts.push(
          <NavLink
            key={keyIndex}
            variant="text"
            href={`/animations/${slug}`}
            className="font-medium"
          >
            {boldText}
          </NavLink>
        );
      } else if (concepts?.[conceptKey]) {
        parts.push(
          <ConceptTooltipLink
            key={keyIndex}
            {...concepts[conceptKey]}
            strong={true}
          >
            {boldText}
          </ConceptTooltipLink>
        );
      } else {
        parts.push(<strong key={keyIndex}>{boldText}</strong>);
      }
    } else if (match[2] !== undefined && concepts?.[normalizeConceptKey(match[2])]) {
      const codeText = match[2];
      parts.push(
        <ConceptTooltipLink
          key={keyIndex}
          {...concepts[normalizeConceptKey(codeText)]}
        >
          {codeText}
        </ConceptTooltipLink>
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <code
          key={keyIndex}
          className="bg-foreground/[0.06] px-6 py-1 font-mono text-[0.9em] text-foreground"
        >
          {match[2]}
        </code>
      );
    }

    lastIndex = tokenRegex.lastIndex;
    keyIndex++;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function DocList({ items = [], className }) {
  return (
    <ul className={cn('flex flex-col gap-10', className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className="text-reading flex gap-12 text-foreground-reading"
        >
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

function DocCallout({ title, children, tone = 'note', className }) {
  return (
    <div
      className={cn(
        'border-l-2 bg-foreground/[0.04] px-16 py-12',
        tone === 'warn' ? 'border-brand' : 'border-foreground/20',
        className
      )}
    >
      {title ? (
        <p className="text-body-sm font-medium text-foreground">{title}</p>
      ) : null}
      <div className="text-body-sm mt-4 leading-relaxed text-foreground-reading">
        {children}
      </div>
    </div>
  );
}

const DEFAULT_LINK_SLUGS = new Set();

export function formatInlineMarkdownHtml(text = '') {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-foreground/[0.06] px-6 py-1 font-mono text-[0.85em] text-foreground">$1</code>'
    );
}

// NOTE: module id: 120322
export function DocBlockRenderer({
  block,
  linkSlugs = DEFAULT_LINK_SLUGS,
  concepts = null,
}) {
  switch (block.type) {
    case 'prose':
      return (
        <p className="text-reading m-0 text-foreground-reading">
          {parseInlineTokens(block.text || '', linkSlugs, concepts)}
        </p>
      );
    case 'code':
      return (
        <CodeBlock
          language={block.lang || 'javascript'}
          filename={block.filename}
          maxHeight={block.maxHeight || 'auto'}
        >
          {block.code}
        </CodeBlock>
      );
    case 'list':
      return (
        <DocList
          items={(block.items || []).map((item, index) => (
            <span key={index}>
              {parseInlineTokens(item, linkSlugs, concepts)}
            </span>
          ))}
        />
      );
    case 'note':
      return (
        <DocCallout title={block.title} tone={block.tone || 'note'}>
          <span>{parseInlineTokens(block.body || '', linkSlugs, concepts)}</span>
        </DocCallout>
      );
    case 'h3':
      return (
        <h3 className="text-h5 mt-16 m-0 text-foreground">{block.text}</h3>
      );
    case 'demo':
      return (
        <DocDemoLoader
          kind={block.kind}
          caption={block.caption}
          options={block.options}
        />
      );
    case 'components':
      return (
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {(block.items || []).map((item) => (
            <ContentCard
              key={item.href}
              href={item.href}
              title={item.title}
              description={item.description}
              media={item.media}
              size="sm"
            />
          ))}
        </div>
      );
    default:
      return null;
  }
}

export { DocBlockRenderer as N, formatInlineMarkdownHtml as B };