export default function FaqSection({
  items = [],
  heading = 'FAQ',
  className = '',
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className={className}>
      <h2 className="text-h4 m-0 font-medium">
        {heading}
      </h2>

      <dl className="m-0 mt-8">
        {items.map(({ q: question, a: answer }) => (
          <div
            key={question}
            className="border-t border-foreground/10 py-20 first:mt-16"
          >
            <dt className="text-body m-0 font-medium">
              {question}
            </dt>

            <dd className="text-body-sm m-0 mt-8 max-w-[64ch] text-foreground-reading">
              {answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}