import { notFound } from 'next/navigation';
import CheckoutPage from '@/features/checkout/CheckoutPage';
import { appConfig } from '@/libs/config/appConfig';
import { KITS, KIT_RING_IMAGES } from '@/libs/data/kits';
import { getPublishedAnimations } from '@/libs/supabase/latestAnimation';

export const metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

// Allowed billing cycles; anything else falls back to quarterly
const CYCLES = ['quarterly', 'yearly'];

export default async function Page({ searchParams }) {
  // In Next.js 15 searchParams is a Promise and must be awaited
  const params = await searchParams;

  const kitSlug = params?.kit;
  const planKey = params?.plan;
  const cycle = CYCLES.includes(params?.cycle) ? params.cycle : 'quarterly';

  // Publishable key is safe for the browser; if missing, the page shows a "no-pk" notice
  const stripePk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;

  // Background thumbnails: DB first, static kit covers as a safe fallback
  let images = [];
  try {
    const animations = await getPublishedAnimations();
    images = [
      ...new Set(animations.map((a) => a.preview_image_url).filter(Boolean)),
    ];
  } catch {
    // Ignore DB errors; the fallback below keeps the grid working
  }
  if (images.length === 0) images = KIT_RING_IMAGES;

  // Kit checkout: /checkout?kit=menu
  if (kitSlug) {
    const kit = KITS.find((k) => k.slug === kitSlug);
    if (!kit) notFound();

    return (
      <CheckoutPage
        stripePk={stripePk}
        kind="kit"
        plan={null}
        kit={kit}
        component={null}
        initialCycle={cycle}
        initialSeats={null}
        images={images}
      />
    );
  }

  // Plan checkout: /checkout?plan=solo&cycle=quarterly
  const plan = appConfig.stripe.landingPlans.find((p) => p.key === planKey);
  if (!plan) notFound();

  // Seats only matter for per-seat plans; clamp to the plan limits
  let initialSeats = null;
  if (plan.perSeat) {
    const requested = parseInt(params?.seats, 10);
    const min = plan.minSeats ?? 1;
    const max = plan.maxSeats ?? 20;
    initialSeats = Number.isFinite(requested)
      ? Math.min(Math.max(requested, min), max)
      : min;
  }

  return (
    <CheckoutPage
      stripePk={stripePk}
      kind="plan"
      plan={plan}
      kit={null}
      component={null}
      initialCycle={cycle}
      initialSeats={initialSeats}
      images={images}
    />
  );
}
