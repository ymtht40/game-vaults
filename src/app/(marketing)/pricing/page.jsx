import PricingSection from '@/features/landing/PricingSection';
import BuildCostSection from '@/features/pricing-page/sections/BuildCostSection';

import LibraryOrKitSection from '@/features/pricing-page/sections/LibraryOrKitSection';
import StudentsSection from '@/features/pricing-page/sections/StudentsSection';

import TestimonialsSection from '@/features/pricing-page/testimonials/TestimonialsSection';

import V3Faq from '@/components/shared/faq/V3Faq';

import V3EndCta from '@/components/shared/cta/V3EndCta';

import { t } from '@/libs/utils/i18n';
import { KITS } from '@/libs/data/kits';
import { getActivePrice } from '@/libs/config/appConfig';
import { soloPlan, DEFAULT_COMPONENT_COUNT } from '@/features/pricing/utils/pricing.config';
import { formatEuro, roundCurrency } from '@/libs/utils/pricingFormatters';
import {
  getPublishedAnimations,
  getShippedRecently,
} from '@/libs/supabase/latestAnimation';

export const revalidate = 60;

export const metadata = {
  title: t('seo.pricing.title'),
  description: t('seo.pricing.description'),
  openGraph: {
    title: t('seo.pricing.og.title'),
    description: t('seo.pricing.og.description'),
  },
};

export default async function PricingPage() {
  const [animations, shippedRecently] = await Promise.all([
    getPublishedAnimations(),
    getShippedRecently(),
  ]);

  const count = animations.length || DEFAULT_COMPONENT_COUNT;
  const imageUrls = [
    ...new Set(animations.map((a) => a.preview_image_url).filter(Boolean)),
  ];

  const yearlyPrice = getActivePrice(soloPlan?.yearly) ?? 199;
  const quarterlyTotal = soloPlan?.quarterly?.cycleTotal ?? 60;
  const perMonth = roundCurrency(yearlyPrice / 12);

  return (
    <div className="pricing-page">
      <PricingSection
        headingAs="h1"
        headline={t('pricing-v3.plans.headline', {
          perMonth: formatEuro(perMonth),
        })}
        sub={t('pricing-v3.plans.sub', {
          yearly: formatEuro(yearlyPrice),
          quarterly: formatEuro(quarterlyTotal),
        })}
        kits={KITS}
        shippedRecently={shippedRecently}
        count={count}
      />
      
      <BuildCostSection
        yearly={yearlyPrice}
        count={count}
      />

      <LibraryOrKitSection
        count={count}
        perMonth={perMonth}
        kits={KITS}
        theme="dark"
        kitHref="/account/kits"
      />
      <TestimonialsSection images={imageUrls} />
      
      <StudentsSection />

      <V3Faq 
      ns="pricing-v3.faq" 
      />

      <V3EndCta
        images={imageUrls}
        count={count}
        headline={t('pricing-v3.endCta.headline', {
          count,
          perMonth: formatEuro(perMonth),
        })}
        secondaryCta={{
          label: t('pricing-v3.libraryOrKit.library.cta'),
          href: '/animations',
        }}
      />
    </div>
  );
}