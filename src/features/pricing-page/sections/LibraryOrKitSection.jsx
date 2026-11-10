'use client';

import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import { weekly as weeklyFig } from '@/features/landing/bento-figures.config'; // NOTE: module id: 392197
import { revealFig } from '@/features/pricing/utils/pricing.config'; // NOTE: module id: 586818
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import PricingColumn, { Column } from '@/features/pricing-page/components/PricingColumn'; // NOTE: module id: 547118

const textRevealProps = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
};

const interpolateFacts = (facts, params) =>
  facts.map((item) => ({
    label: item.label,
    value: item.value.replace(/\{(\w+)\}/g, (match, key) =>
      params[key] != null ? String(params[key]) : match
    ),
  }));

// NOTE: module id: 547118
export { Column };

// Variable Mapping: f -> kitNames, g -> kitPrice, p -> interpolateFacts
// NOTE: module id: 547118
export default function LibraryOrKitSection({
  count = 0,
  perMonth = 20,
  kits = [],
  theme = 'dark',
  kitHref = '/kits',
}) {
  const kitNames = kits.map((kit) => kit.title).join(' and ');
  const rawPrice = kits[0]?.priceDisplay;
  const kitPrice =
    (typeof rawPrice === 'string'
      ? rawPrice.replace(/^EUR\s*/, '€')
      : rawPrice) || '€149';

  return (
    <section
      data-theme={theme}
      className="bg-background py-64 text-foreground lg:py-160"
    >
      <div className="v2-container flex flex-col gap-48 lg:gap-64">
        <div className="grid grid-cols-12 items-end gap-y-24 lg:gap-x-24">
          <div className="col-span-12 flex flex-col gap-16 md:col-span-6">
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              className="max-w-[22ch] font-medium text-balance"
              trigger="scroll"
            >
              {t('pricing-v3.libraryOrKit.headline')}
            </RevealHeading>
            <AnimatedText
              tag="p"
              className="text-body-lg max-w-[46ch] text-foreground-muted"
              {...textRevealProps}
              triggerMode="scroll"
              delay={0.25}
            >
              {t('pricing-v3.libraryOrKit.sub')}
            </AnimatedText>
          </div>
          <AnimatedText
            tag="p"
            className="text-body-lg col-span-12 max-w-[46ch] md:col-span-6 md:col-start-7"
            {...textRevealProps}
            triggerMode="scroll"
            delay={0.35}
          >
            {t('pricing-v3.libraryOrKit.stack')}
          </AnimatedText>
        </div>
        <FadeIn
          trigger="scroll"
          className="grid grid-cols-12 gap-px border border-border bg-border"
        >
          <PricingColumn
            fig={weeklyFig}
            title={t('pricing-v3.libraryOrKit.library.title')}
            line={t('pricing-v3.libraryOrKit.library.line')}
            facts={interpolateFacts(
              t('pricing-v3.libraryOrKit.library.facts'),
              {
                count,
                perMonth: `€${perMonth}`,
              }
            )}
            cta={t('pricing-v3.libraryOrKit.library.cta')}
            href="/animations"
          />
          <PricingColumn
            fig={revealFig}
            title={t('pricing-v3.libraryOrKit.kit.title')}
            line={t('pricing-v3.libraryOrKit.kit.line')}
            facts={interpolateFacts(t('pricing-v3.libraryOrKit.kit.facts'), {
              names: kitNames,
              price: kitPrice,
            })}
            cta={t('pricing-v3.libraryOrKit.kit.cta')}
            href={kitHref}
          />
        </FadeIn>
      </div>
    </section>
  );
}
