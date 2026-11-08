// src/app/roadmap/page.jsx
import RoadmapPage from '@/features/roadmap/RoadmapPage';
import { getPublishedAnimations } from '@/libs/supabase/latestAnimation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Roadmap',
};

export default async function Page() {
  const animations = await getPublishedAnimations();

  // roadmap data ကို ကိုယ့် data source ကနေ ယူပါ (အောက်မှာ ရှင်းထားတယ်)
  const roadmap = { is_authenticated: false, sections: [] };

  return (
    <RoadmapPage
      roadmap={roadmap}
      animations={animations}
      lastShippedDaysAgo={0}
    />
  );
}

