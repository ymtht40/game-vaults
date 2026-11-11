import { notFound } from 'next/navigation';
import MenuKitLayout from '@/features/kits/menu/MenuKitLayout';
import { getKitPageData } from '@/libs/server/kits';

export const metadata = { title: 'Menu Kit' };

export default async function Page() {
  const data = await getKitPageData('menu');
  if (!data) notFound();

  return (
    <MenuKitLayout
      kit={data.kit}
      owns={data.owns}
      priceId={data.priceId}
      images={data.images}
      isAuthenticated={data.isAuthenticated}
    />
  );
}
