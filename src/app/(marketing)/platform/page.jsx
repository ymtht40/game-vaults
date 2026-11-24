import Button from '@/components/ui/Button';
import FadeIn from '@/components/motion/FadeIn';
import V3Hero from '@/features/home-v3/V3Hero';
import V3Spotlight from '@/features/home-v3/V3Spotlight';
import PlatformMockup from '@/features/platform/PlatformMockup';
import PlatformSteps from '@/features/platform/PlatformSteps';
import PlatformCode from '@/features/platform/PlatformCode';
import PlatformDocs from '@/features/platform/PlatformDocs';
import LibraryOrKit from '@/features/pricing/LibraryOrKit';
import V3Ground from '@/components/ui/V3Ground';
import V3EndCta from '@/components/shared/end-cta/V3EndCta';
import { t } from '@/libs/utils/i18n';
import { KITS } from '@/libs/data/kits';
import { getActivePrice } from '@/libs/config/appConfig';
import {
  soloPlan,
  DEFAULT_COMPONENT_COUNT,
} from '@/features/pricing/utils/pricing.config';
import { roundCurrency } from '@/libs/utils/pricingFormatters';
import {
  getPublishedAnimations,
  getCategories,
  getAnimationBySlug,
} from '@/libs/supabase/latestAnimation';

export const revalidate = 60;

export const metadata = {
  title: t('seo.platform.title'),
  description: t('seo.platform.description'),
  openGraph: {
    title: t('seo.platform.og.title'),
    description: t('seo.platform.og.description'),
  },
};

export default async function PlatformPage() {
  const [animations, categories] = await Promise.all([
    getPublishedAnimations(),
    getCategories(),
  ]);

  const count = animations.length || DEFAULT_COMPONENT_COUNT;
  const freeCount = animations.filter((a) => a.is_free_preview).length;
  const imageUrls = [
    ...new Set(animations.map((a) => a.preview_image_url).filter(Boolean)),
  ];

  const firstSlug = animations[0]?.slug ?? null;
  const spotlightAnimation = firstSlug
    ? await getAnimationBySlug(firstSlug)
    : null;

  const yearlyPrice = getActivePrice(soloPlan?.yearly) ?? 199;
  const perMonth = roundCurrency(yearlyPrice / 12);

  return (
    <div className="platform-page">
      <V3Hero
        headline={t('platform-v3.hero.headline')}
        body={t('platform-v3.hero.body', { count })}
        pad={false}
        ground={<V3Ground tone="blue" priority />}
        actions={
          <div className="flex flex-wrap items-center gap-12">
            <Button href="/pricing" theme="brand">
              {t('platform-v3.hero.cta')}
            </Button>
            <Button href="/animations" theme="surface">
              {t('platform-v3.hero.secondary')}
            </Button>
          </div>
        }
        visual={
          <div className="h-full w-full px-32 pt-40 max-lg:[mask-image:linear-gradient(to_bottom,black_65%,transparent)] lg:px-96 lg:pt-64">
            <FadeIn delay={0.2}>
              <PlatformMockup
                animations={animations}
                totalCount={count}
                revealOnPageEnter
                className="rounded-none shadow-none"
              />
            </FadeIn>
          </div>
        }
      />

      <PlatformSteps
        count={count}
        categories={categories.length}
      />

      {spotlightAnimation ? (
        <V3Spotlight
          animation={spotlightAnimation}
          formats={['html', 'react', 'vue']}
          count={count}
        />
      ) : null}

      <PlatformCode />

      <PlatformDocs
        action={
          <Button href="/docs" theme="brand" size="sm">
            {t('platform-v3.docs.cta')}
          </Button>
        }
      />

      <LibraryOrKit
        count={count}
        perMonth={perMonth}
        kits={KITS}
        theme="dark"
      />

      <V3EndCta
        images={imageUrls}
        count={count}
        freeCount={freeCount}
      />
    </div>
  );
}
