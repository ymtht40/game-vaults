/* Variable Mapping:
   e -> images
   a -> count
   l -> freeCount
   s -> headline
   i -> subtext
   c -> href
   o -> primaryCta
   u -> secondaryCta
   d -> children
   f -> bleedTop
*/

import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import EndCta from '@/features/landing/EndCta'; // NOTE: module id: 482232

// NOTE: module id: 896659
export default function V3EndCta({
  images = [],
  count = 0,
  freeCount = 0,
  headline = t('home-v3.endCta.headline'),
  subtext = t('home-v3.endCta.subtext', { count }),
  href = '/checkout?plan=solo&cycle=quarterly',
  primaryCta = null,
  secondaryCta = null,
  children = null,
  bleedTop = 40,
}) {
  return (
    <div className="v3-end-cta">
      <EndCta
        headline={headline}
        subtext={subtext}
        primaryCta={
          primaryCta || {
            label: t('home-v3.hero.cta'),
            href,
          }
        }
        secondaryCta={
          secondaryCta || {
            label: t('home-v3.hero.ctaFree', { count: freeCount }),
            href: '/starter-pack',
          }
        }
        images={images}
        bleed={true}
        bleedTop={bleedTop}
        ringOvershoot={1}
        ringPush={0.3}
      >
        {children}
      </EndCta>
    </div>
  );
}
