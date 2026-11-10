'use client';

// Variable Mapping: g -> pricingTextAnimation, p -> priceDisplay, f -> kitNames, m -> kitPrice

// UNRESOLVED: original source path or export names are absent from this chunk.
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
// UNRESOLVED: original source path or export names are absent from this chunk.
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
// UNRESOLVED: original source path or export names are absent from this chunk.
import SplitTextReveal from '@/features/demos/SplitTextReveal'; // NOTE: module id: 218091
// UNRESOLVED: original source path or export names are absent from this chunk.
import { revealFig } from '@/features/pricing/PricingSection'; // NOTE: module id: 586818
// UNRESOLVED: original source path or export names are absent from this chunk.
import { translate } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { weekly } from '@/features/landing/bento-figures.config'; // NOTE: module id: 392197
import { Column } from '@/features/pricing/components/Column'; // NOTE: module id: 547118
import { interpolateFacts } from '@/features/pricing/utils/interpolateFacts'; // NOTE: module id: 547118

const pricingTextAnimation = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
};
// NOTE: module id: 547118
export default function LibraryOrKit({
  count = 0,
  perMonth = 20,
  kits = [],
  theme = 'dark',
  kitHref = '/kits',
}) {
  let priceDisplay;
  const kitNames = kits.map((kit) => kit.title).join(' and ');
  const kitPrice =
    ('string' == typeof (priceDisplay = kits[0]?.priceDisplay)
      ? priceDisplay.replace(/^EUR\s*/, '€')
      : priceDisplay) || '€149';
  return (
    <section data-theme={theme} className="bg-background py-64 text-foreground lg:py-160">
      <div className="v2-container flex flex-col gap-48 lg:gap-64">
        <div className="grid grid-cols-12 items-end gap-y-24 lg:gap-x-24">
          <div className="col-span-12 flex flex-col gap-16 md:col-span-6">
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              className="max-w-[22ch] font-medium text-balance"
              trigger="scroll"
            >
              {translate('pricing-v3.libraryOrKit.headline')}
            </RevealHeading>
            <SplitTextReveal
              tag="p"
              className="text-body-lg max-w-[46ch] text-foreground-muted"
              {...pricingTextAnimation}
              triggerMode="scroll"
              delay={0.25}
            >
              {translate('pricing-v3.libraryOrKit.sub')}
            </SplitTextReveal>
          </div>
          <SplitTextReveal
            tag="p"
            className="text-body-lg col-span-12 max-w-[46ch] md:col-span-6 md:col-start-7"
            {...pricingTextAnimation}
            triggerMode="scroll"
            delay={0.35}
          >
            {translate('pricing-v3.libraryOrKit.stack')}
          </SplitTextReveal>
        </div>
        <FadeIn
          trigger="scroll"
          className="grid grid-cols-12 gap-px border border-border bg-border"
        >
          <Column
            fig={weekly}
            title={translate('pricing-v3.libraryOrKit.library.title')}
            line={translate('pricing-v3.libraryOrKit.library.line')}
            facts={interpolateFacts(translate('pricing-v3.libraryOrKit.library.facts'), {
              count,
              perMonth: `€${perMonth}`,
            })}
            cta={translate('pricing-v3.libraryOrKit.library.cta')}
            href="/animations"
          />
          <Column
            fig={revealFig}
            title={translate('pricing-v3.libraryOrKit.kit.title')}
            line={translate('pricing-v3.libraryOrKit.kit.line')}
            facts={interpolateFacts(translate('pricing-v3.libraryOrKit.kit.facts'), {
              names: kitNames,
              price: kitPrice,
            })}
            cta={translate('pricing-v3.libraryOrKit.kit.cta')}
            href={kitHref}
          />
        </FadeIn>
      </div>
    </section>
  );
}
