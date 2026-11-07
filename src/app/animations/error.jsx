'use client';

import { startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyAnimationsState } from '@/features/common/EmptyAnimationsState';

export default function AnimationsError({ reset }) {
  const router = useRouter();
  return (
    <div data-theme="dark" className="bg-background text-foreground">
      <EmptyAnimationsState
        role="alert"
        label="Library unavailable"
        heading="Unable to load animations."
        description="Please try again in a moment."
        actionLabel="Try again"
        onReset={() => startTransition(() => {
          router.refresh();
          reset();
        })}
      />
    </div>
  );
}
