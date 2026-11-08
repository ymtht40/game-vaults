'use client';

// Variable Mapping: F -> CheckoutNotice, e -> title, t -> body, n -> actionHref, a -> actionLabel

import Button from '@/components/ui/Button'; // NOTE: module id: 687989

// NOTE: module id: 769149
export function CheckoutNotice({ title, body, actionHref, actionLabel }) {
  return (
    <div className="flex flex-col items-start gap-16 p-8">
      <p className="text-body font-medium text-foreground">{title}</p>
      <p className="text-body-sm text-foreground-muted">{body}</p>
      {actionHref ? (
        <Button href={actionHref} theme="dark" size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}