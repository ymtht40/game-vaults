import CodeBlock from '@/features/common/CodeBlock'; // module id: 317840

const URL_PATTERN = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

function renderLinkedText(text) {
  if (typeof text !== 'string' || text.indexOf('http') === -1) {
    return text;
  }

  return text.split(URL_PATTERN).map((part, index) => {
    if (!/^https?:\/\//.test(part)) {
      return part;
    }

    return (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:decoration-foreground"
      >
        {part.replace(/^https?:\/\//, '')}
      </a>
    );
  });
}

function detectCodeLanguage(code) {
  if (!code) {
    return 'plaintext';
  }

  if (
    code.includes('data-anm-')
    || code.includes('<div')
    || code.includes('<button')
  ) {
    return 'html';
  }

  if (
    code.includes('{')
    && (
      code.includes('animation')
      || code.includes('transform')
    )
  ) {
    return 'css';
  }

  if (code.includes('gsap.') || code.includes('function')) {
    return 'javascript';
  }

  return 'html';
}

export default function TipItem({ item }) {
  if (typeof item === 'string') {
    return (
      <article>
        <p className="text-reading text-foreground-reading">
          {renderLinkedText(item)}
        </p>
      </article>
    );
  }

  const code = item.code || item.code_example;
  const language = code ? detectCodeLanguage(code) : null;

  return (
    <article>
      {item.title && (
        <h3 className="text-body font-medium text-foreground">
          {item.title}
        </h3>
      )}

      {item.content && (
        <p className="text-reading mt-8 text-foreground-reading">
          {renderLinkedText(item.content)}
        </p>
      )}

      {code && (
        <div className="mt-12">
          <CodeBlock
            language={language}
            copyable
          >
            {code}
          </CodeBlock>
        </div>
      )}
    </article>
  );
}