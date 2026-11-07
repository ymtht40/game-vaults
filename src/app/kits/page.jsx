import KitsClient from '@/features/kits/KitsClient';
import { translate } from '@/libs/utils/i18n';
import { getPublishedAnimations } from '@/libs/supabase/latestAnimation';

export const revalidate = 60;

export const metadata = {
  title: translate('seo.kits.title'),
  description: translate('seo.kits.description'),
  openGraph: {
    title: translate('seo.kits.og.title'),
    description: translate('seo.kits.og.description'),
  },
};

export default async function KitsPage() {
  const animations = await getPublishedAnimations();
  return <KitsClient libraryCount={animations.length} />;
}
