'use client';

// Variable Mapping: e -> query, a -> onReset, n -> noun, s -> headingText

import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import TextLink from '@/components/navigation/NavSurface'; // NOTE: module id: 520237

// NOTE: module id: 503408
export function EmptyAnimationsState({
  query,
  onReset,
  noun = 'animations',
  heading,
  description,
  label = '0 results',
  actionLabel = 'Reset filters',
  actionHref,
  role,
}) {
  const headingText = heading || (query
    ? `No matches for "${query}".`
    : `No ${noun} match those filters.`);

  return (
    <div className="v2-container py-128" role={role}>
      <div className="grid grid-cols-12">
        <div className="col-span-12 lg:col-span-6 lg:col-start-4 lg:text-center">
          <p className="text-mono-sm mb-16 text-foreground-muted">{label}</p>
          <h2 className="text-h3 mb-16 font-medium">{headingText}</h2>
          <p className="text-body text-foreground-muted mb-32">
            {description || ('Try a shorter search or clear the filters.' + (query
              ? ' If it should exist, tell us - requests steer what ships next.'
              : ''))}
          </p>
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:justify-center lg:gap-24">
            {onReset || actionHref ? (
              <Button onClick={onReset} href={actionHref} theme="light" size="sm">
                {actionLabel}
              </Button>
            ) : null}
            {query ? (
              <TextLink href="/roadmap" className="text-foreground-muted">
                Suggest it on the roadmap
              </TextLink>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

