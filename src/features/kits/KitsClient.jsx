'use client';

import { translate } from '@/libs/utils/i18n';
import { KITS, KIT_PRICE, KIT_RING_IMAGES } from '@/libs/data/kits';
import KitsHero from '@/features/kits/KitsHero';
import KitsInside from '@/features/kits/KitsInside';
import KitsWhy from '@/features/kits/KitsWhy';
import LibraryOrKit from '@/features/pricing/LibraryOrKit';
import V3Faq from '@/features/landing/V3Faq';
import V3EndCta from '@/features/landing/V3EndCta';

// Only answers 1 and 5 contain inline links (matches the production page).
const KITS_FAQ_LINKS = [
  { 'Library subscription': '/pricing' },
  {},
  {},
  {},
  { 'final sale': '/refund' },
];

// The "Inside" tabs list Menu first, while the hero lists Reveal first.
const INSIDE_KITS = [...KITS].reverse();

export default function KitsClient({ libraryCount = 0 }) {
  return (
    <>
      <KitsHero kits={KITS} />
      <KitsInside
        headline={translate('kits-v3.inside.headline')}
        sub={translate('kits-v3.inside.sub')}
        kits={INSIDE_KITS}
      />
      <KitsWhy price={KIT_PRICE} />
      <LibraryOrKit count={libraryCount} kits={KITS} theme="light" />
      <V3Faq ns="kits-v3.faq" links={KITS_FAQ_LINKS} vars={{ price: KIT_PRICE }} />
      <V3EndCta
        images={KIT_RING_IMAGES}
        headline={translate('kits-v3.endCta.headline')}
        subtext={translate('kits-v3.endCta.subtext', { price: KIT_PRICE })}
        primaryCta={{
          label: translate('kits-v3.hero.cta', { title: 'Menu' }),
          href: '/kits/menu',
        }}
        secondaryCta={{
          label: translate('kits-v3.hero.cta', { title: 'Reveal' }),
          href: '/kits/reveal',
        }}
      />
    </>
  );
}
