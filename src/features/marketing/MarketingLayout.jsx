// Variable Mapping: u -> children, l -> animationCount, i -> latestAnimation

import { Suspense } from 'react'; // NOTE: module id: 271645
import MarketingHeader from '@/components/header/Header'; // NOTE: module id: 76624
import MarketingFooter from '@/components/footer/Footer'; // NOTE: module id: 297428
import LenisProvider from '@/providers/LenisProvider'; // NOTE: module id: 776017
import { PppBanner } from '@/features/marketing/PppBanner'; // NOTE: module id: 245647

// NOTE: module id: 724083
export default function MarketingLayout({ children, animationCount, latestAnimation }) {
  return (
    <LenisProvider>
      <div className="v2-marketing flex flex-col min-h-screen">
        <PppBanner />
        <Suspense fallback={null}>
          <MarketingHeader latestAnimation={latestAnimation} />
        </Suspense>
        <main
          className="flex-1 relative z-[2] bg-background"
          data-transition-content={true}
        >
          {children}
        </main>
        <MarketingFooter
          animationCount={animationCount}
          latestAnimation={latestAnimation}
        />
      </div>
    </LenisProvider>
  );
}