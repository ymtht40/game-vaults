// Variable Mapping: e -> kit, i -> owns, s -> priceId, o -> className, a -> size, l -> buyLabel

import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import KitCheckoutButton from '@/components/kits/Kitcheckoutbutton'; // NOTE: module id: 569424

// NOTE: module id: 787160
export function KitPurchaseCta({
  kit,
  owns = false,
  priceId = null,
  className = '',
  size,
  buyLabel,
}) {
  return owns ? (
    <div className={className}>
      <Button href={`/account/kits/${kit.slug}`} theme="primary" size={size || 'sm'}>
        Open in your Kits
      </Button>
    </div>
  ) : (
    <div className={className}>
      <KitCheckoutButton
        priceId={priceId}
        kitSlug={kit.slug}
        kitTitle={kit.title}
        size={size}
        {...(buyLabel ? { label: buyLabel } : {})}
      />
    </div>
  );
}

export default KitPurchaseCta;