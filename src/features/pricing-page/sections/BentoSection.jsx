'use client';

import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { BentoTile, Tile } from '@/features/pricing-page/components/BentoTile'; // NOTE: module id: 392197
import {
  awardFig,
  agentFig,
  formatsFig,
  valuesFig,
  codeFig,
  weeklyFig,
  formats,
  values,
  weekly,
} from '@/features/pricing-page/home/bento.config'; // NOTE: module id: 392197

// NOTE: module id: 392197
export { Tile, formats, values, weekly };

// Variable Mapping: a -> renderTile
// NOTE: module id: 392197
export default function BentoSection({ count = 0 }) {
  const renderTile = (key, fig, className, params) => (
    <BentoTile
      key={key}
      className={className}
      fig={fig}
      title={t(`home-v3.bento.${key}.title`)}
      line={t(`home-v3.bento.${key}.line`, params)}
    />
  );

  return (
    <section
      data-theme="dark"
      className="bg-background py-64 text-foreground lg:py-160"
    >
      <div className="v2-container flex flex-col gap-48 lg:gap-64">
        <RevealHeading
          as="h2"
          sizeClass="text-h2"
          className="max-w-[18ch] font-medium text-balance"
          trigger="scroll"
        >
          {t('home-v3.bento.headline')}
        </RevealHeading>
        <div className="v3-rail grid grid-cols-12 gap-px border border-border bg-border [--rail-gap:0px] max-md:border-0 max-md:bg-transparent max-md:*:border-y max-md:*:border-r max-md:*:border-border max-md:[&>:first-child]:border-l">
          {renderTile('award', awardFig, 'md:col-span-6 lg:col-span-5')}
          {renderTile('agent', agentFig, 'md:col-span-6 lg:col-span-4')}
          {renderTile('formats', formatsFig, 'md:col-span-6 lg:col-span-3')}
          {renderTile('values', valuesFig, 'md:col-span-6 lg:col-span-3')}
          {renderTile('code', codeFig, 'md:col-span-6 lg:col-span-4')}
          {renderTile('weekly', weeklyFig, 'md:col-span-6 lg:col-span-5', {
            count,
          })}
        </div>
        <FadeIn trigger="scroll" className="flex justify-center">
          <Button href="/animations" theme="brand">
            {t('home-v3.bento.browse')}
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
