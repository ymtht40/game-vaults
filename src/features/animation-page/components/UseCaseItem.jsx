export default function UseCaseItem({ item }) {
  if (typeof item === 'string') {
    return (
      <li className="text-reading flex gap-12 text-foreground-reading">
        <span
          aria-hidden="true"
          className="mt-[0.55em] block size-6 shrink-0 bg-brand"
        />

        <span>{item}</span>
      </li>
    );
  }

  const useCase = item || {};

  return (
    <li className="flex gap-12">
      <span
        aria-hidden="true"
        className="mt-[0.55em] block size-6 shrink-0 bg-brand"
      />

      <div>
        {useCase.title && (
          <span className="text-reading font-medium text-foreground">
            {useCase.title}
            {'.'}
            {' '}
          </span>
        )}

        {useCase.description && (
          <span className="text-reading text-foreground-reading">
            {useCase.description}
          </span>
        )}
      </div>
    </li>
  );
}