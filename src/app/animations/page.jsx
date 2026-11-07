import { Suspense } from 'react';
import AnimationsLibrary from '@/features/animation-page/AnimationsLibrary';
import { getPublishedAnimations } from '@/libs/supabase/latestAnimation';
import { getViewerContext } from '@/libs/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Library',
};

export default async function AnimationsLibraryPage() {
  const [animations, viewer] = await Promise.all([
    getPublishedAnimations({ throwOnError: true }),
    getViewerContext({ throwOnSavedError: true }),
  ]);

  return (
    <Suspense fallback={null}>
      <AnimationsLibrary
        initialAnimations={animations}
        savedAnimationIds={viewer.savedIds}
        isAuthenticated={Boolean(viewer.user)}
      />
    </Suspense>
  );
}
