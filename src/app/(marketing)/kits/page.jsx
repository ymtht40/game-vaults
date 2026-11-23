import KitsClient from '@/features/kits/KitsClient';
import { t } from '@/libs/utils/i18n';
import { DEFAULT_COMPONENT_COUNT } from '@/features/pricing/utils/pricing.config';
import { getPublishedAnimations } from '@/libs/supabase/latestAnimation';

export const revalidate = 60;

export const metadata = {
  title: t('seo.kits.title'),
  description: t('seo.kits.description'),
  openGraph: {
    title: t('seo.kits.og.title'),
    description: t('seo.kits.og.description'),
  },
};

export default async function KitsPage() {
  const animations = await getPublishedAnimations();
  const libraryCount = animations.length || DEFAULT_COMPONENT_COUNT;

  return <KitsClient libraryCount={libraryCount} />;
}
