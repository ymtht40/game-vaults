import { Suspense } from 'react';
import SignInPage from '@/features/auth/SignInPage';
import { getPublishedAnimations } from '@/libs/supabase/latestAnimation';

export const metadata = {
  title: 'Sign in',
  robots: { index: false },
};
export const revalidate = 60;

export default async function Page() {
  const animations = await getPublishedAnimations();
  const images = [...new Set(
    animations.map((animation) => animation.preview_image_url).filter(Boolean),
  )];

  return (
    <Suspense fallback={null}>
      <SignInPage images={images} />
    </Suspense>
  );
}
