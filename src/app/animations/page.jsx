import { Suspense } from 'react';
import AnimationsLibrary from '@/features/animation-page/AnimationsLibrary';
import { getPublishedAnimations } from '@/libs/supabase/latestAnimation';

export const revalidate = 60;

export const metadata = {
  title: 'Library',
};

export default async function AnimationsLibraryPage() {
  const animations = await getPublishedAnimations();
  return (
    <Suspense fallback={null}>
      <AnimationsLibrary initialAnimations={animations} />
    </Suspense>
  );
}
