// Server-side data for the /kits/[slug] pages.
// Replaces the getKit() / userOwnsKit() placeholders used in the page examples.

import { KITS, KIT_RING_IMAGES } from '@/libs/data/kits';
import { getKitPriceId } from '@/libs/config/stripeConfig';
import { createServerSupabase } from '@/libs/supabase/server';

export function getKit(slug) {
  const kit = KITS.find((item) => item.slug === slug);
  if (!kit) return null;

  return {
    ...kit,
    id: kit.slug,
    // isKitAvailable() in kitMenuUtils expects this exact value
    status: 'available',
    priceId: getKitPriceId(kit.slug),
    metadata: { price_display: kit.priceDisplay },
  };
}

// One call for everything a Kit page needs: who is viewing and whether they own it
export async function getKitPageData(slug) {
  const kit = getKit(slug);
  if (!kit) return null;

  let user = null;
  let owns = false;

  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;

    if (user) {
      // The kit_purchases RLS policy only exposes the viewer's own rows
      const { data: purchase, error } = await supabase
        .from('kit_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('kit_slug', slug)
        .maybeSingle();

      if (error) console.warn('[kits] ownership lookup failed:', error.message);
      owns = Boolean(purchase);
    }
  } catch (error) {
    // A failed lookup must not take the sales page down; treat the viewer as a visitor
    console.warn('[kits] viewer lookup failed:', error?.message);
  }

  return {
    kit,
    owns,
    priceId: kit.priceId,
    images: KIT_RING_IMAGES,
    // The Reveal manifest section matches videos to components by index
    videos: kit.components.map((component) => component.preview_video_url),
    isAuthenticated: Boolean(user),
  };
}

