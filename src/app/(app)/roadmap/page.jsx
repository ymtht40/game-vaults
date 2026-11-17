// src/app/roadmap/page.jsx
import RoadmapPage from '@/features/marketing/roadmap/RoadmapPage';
import { getPublishedAnimations } from '@/libs/supabase/latestAnimation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Roadmap',
};

export default async function Page() {
  const animations = await getPublishedAnimations();

  const roadmap = { is_authenticated: false, sections: [] };

  return (
    <RoadmapPage
      roadmap={roadmap}
      animations={animations}
      lastShippedDaysAgo={0}
    />
  );
}

