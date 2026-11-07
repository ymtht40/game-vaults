'use client';

// Variable Mapping: e -> count, r -> renderTile

// UNRESOLVED: original source path or export names are absent from this chunk.
import RevealHeading from '@/animations/AnimatedHeadline'; // NOTE: module id: 963160
// UNRESOLVED: original source path or export names are absent from this chunk.
import FadeIn from '@/animations/FadeIn'; // NOTE: module id: 46039

// UNRESOLVED: original source path or export names are absent from this chunk.
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
// UNRESOLVED: original source path or export names are absent from this chunk.
import { translate } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { agent, award, code, formats, values, weekly } from '@/components/home/bento-figures.config'; // NOTE: module id: 392197
import { Tile } from '@/components/home/Tile'; // NOTE: module id: 392197

// NOTE: module id: 392197
export default function HomeBento({ count = 0 }) {
  const renderTile = (key, figure, tileClass, replacements) => (
    <Tile
      className={tileClass}
      fig={figure}
      title={translate(`home-v3.bento.${key}.title`)}
      line={translate(`home-v3.bento.${key}.line`, replacements)}
      key={key}
    />
  );
  return (
    <section data-theme="dark" className="bg-background py-64 text-foreground lg:py-160">
      <div className="v2-container flex flex-col gap-48 lg:gap-64">
        <RevealHeading
          as="h2"
          sizeClass="text-h2"
          className="max-w-[18ch] font-medium text-balance"
          trigger="scroll"
        >
          {translate('home-v3.bento.headline')}
        </RevealHeading>
        <div
          className={
            'v3-rail grid grid-cols-12 gap-px border border-border bg-border [--rail-gap:0px] max-md:border-0 max-md:bg-transparent max-md:*:border-y max-md:*:border-r max-md:*:border-border max-md:[&>:first-child]:border-l'
          }
        >
          {renderTile('award', award, 'md:col-span-6 lg:col-span-5')}
          {renderTile('agent', agent, 'md:col-span-6 lg:col-span-4')}
          {renderTile('formats', formats, 'md:col-span-6 lg:col-span-3')}
          {renderTile('values', values, 'md:col-span-6 lg:col-span-3')}
          {renderTile('code', code, 'md:col-span-6 lg:col-span-4')}
          {renderTile('weekly', weekly, 'md:col-span-6 lg:col-span-5', {
            count,
          })}
        </div>
        <FadeIn trigger="scroll" className="flex justify-center">
          <Button href="/animations" theme="brand">
            {translate('home-v3.bento.browse')}
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
