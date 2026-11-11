'use client';

// Variable Mapping: e -> priceId, s -> kitSlug, o -> kitTitle, a -> size, l -> theme, u -> className, c -> label, d -> isPurchasable, h -> pppTier

import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { usePppTier } from '@/hooks/usePppGeo'; // NOTE: module id: 12895

// NOTE: module id: 569424
export default function KitCheckoutButton({
  priceId,
  kitSlug,
  kitTitle,
  size,
  theme = 'brand',
  className = '',
  label = 'Get the Kit',
}) {
  const isPurchasable = !!priceId && !!kitSlug;
  const pppTier = usePppTier();

  return (
    <Button
      href={isPurchasable ? `/checkout?kit=${kitSlug}` : undefined}
      onClick={() =>
        analytics.track?.('kit_checkout_cta_clicked', {
          kit: kitTitle,
          ...(pppTier ? { ppp_tier: pppTier } : {}),
        })
      }
      theme={theme}
      size={size || 'default'}
      className={className}
      disabled={!isPurchasable}
    >
      {label}
    </Button>
  );
}