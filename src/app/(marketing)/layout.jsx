import MarketingLayout from '@/features/marketing/MarketingLayout';
import {
  getLatestAnimation,
  getPublishedAnimations,
} from '@/libs/supabase/latestAnimation';

export default async function Layout({ children }) {
  const [latestAnimation, animations] = await Promise.all([
    getLatestAnimation(),
    getPublishedAnimations(),
  ]);

  return (
    <MarketingLayout
      animationCount={animations.length}
      latestAnimation={latestAnimation}
    >
      {children}
    </MarketingLayout>
  );
}

