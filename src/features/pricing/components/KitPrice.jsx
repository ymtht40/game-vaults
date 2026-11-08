import { getAddonTierPrice, ADDON_PRICING } from '@/libs/utils/pricingUtils';

import { usePppTier } from '@/hooks/usePppGeo';
export default function KitPrice({
  kitSlug,
  fallback = null,
  struckClassName = '',
}) {
  const pppTier = usePppTier();
  const effectivePrice = pppTier
    ? getAddonTierPrice(kitSlug, pppTier)
    : null;

  if (effectivePrice == null) {
    return fallback;
  }

  const listPrice = ADDON_PRICING[kitSlug]?.list;
  return (
    <span aria-label={`€${effectivePrice}, regularly €${listPrice}`}>
      €{effectivePrice}{' '}
      <s
        aria-hidden="true"
        className={struckClassName}>
        €{listPrice}
      </s>
    </span>
  );
}
