import PricingSection from '@/features/pricing/PricingSection';
import LibraryOrKit from '@/features/pricing/LibraryOrKit';
import StudentsSection from '@/features/pricing/StudentsSection'; 
import ValueMath from '@/features/landing/ValueMath';
import LibraryPreview from '@/components/ui/LibraryPreview';
import Testimonials from '@/features/landing/Testimonials';
import V3Faq from '@/features/landing/V3Faq';
import V3EndCta from '@/features/common/V3EndCta';

import { t } from '@/libs/utils/i18n';
import { KITS } from '@/libs/data/kits';
import { getActivePrice } from '@/libs/config/appConfig';
import { soloPlan, DEFAULT_COMPONENT_COUNT } from '@/features/pricing/utils/pricing.config';
import { formatEuro, roundCurrency } from '@/libs/config/pricingFormatters';
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

const PRICING_FAQ_LINKS = [
  {},
  {},
  { '14-day money-back guarantee': '/refund' },
  {},
  { 'Landmark Kit': '/account/kits' },
  { 'live preview': '/animations' },
];

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

      <LibraryOrKit
        count={count}
        perMonth={perMonth}
        kits={KITS}
        theme="dark"
        kitHref="/account/kits"
      />

      <ValueMath
        cta={{
          label: soloPlan?.cta || 'Get Solo',
          href: '/checkout?plan=solo&cycle=yearly',
        }}
      />

      <LibraryPreview items={animations} count={count} />
      <Testimonials images={imageUrls} />
      <StudentsSection />

      <V3Faq
        ns="pricing-v3.faq"
        links={PRICING_FAQ_LINKS}
        vars={{ cap: 25 }}
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
