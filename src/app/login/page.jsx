import { Suspense } from 'react';
import SignInPage from '@/features/sigin/SignInPage';

export const metadata = {
  title: 'Sign in',
  robots: { index: false },
};
const CAROUSEL_IMAGES = [];
export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInPage images={CAROUSEL_IMAGES} />
    </Suspense>
  );
}
