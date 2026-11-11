import { notFound } from 'next/navigation';
import RevealKitLayout from '@/features/kits/reveal/RevealKitLayout';
import { getKitPageData } from '@/libs/server/kits';

export const metadata = { title: 'Reveal Kit' };

export default async function Page() {
  const data = await getKitPageData('reveal');
  if (!data) notFound();

  return (
    <RevealKitLayout
      kit={data.kit}
      owns={data.owns}
      priceId={data.priceId}
      images={data.images}
      videos={data.videos}
      isAuthenticated={data.isAuthenticated}
    />
  );
}
