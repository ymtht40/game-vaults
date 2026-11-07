'use client';

// Variable Mapping: e -> price, a -> renderTile

// UNRESOLVED: original source path or export names are absent from this chunk.
import RevealHeading from '@/animations/RevealHeading'; // NOTE: module id: 963160
// UNRESOLVED: original source path or export names are absent from this chunk.
import { translate } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { Tile } from '@/components/home/Tile'; // NOTE: module id: 392197
import { forever, properly, system } from '@/features/kits/utils/why-figures.config'; // NOTE: module id: 913846

// NOTE: module id: 913846
export default function KitsWhy({ price = '€149' }) {
  const renderTile = (key, figure, replacements) => (
    <Tile
      className="lg:col-span-4"
      fig={figure}
      title={translate(`kits-v3.why.${key}.title`)}
      line={translate(`kits-v3.why.${key}.line`, replacements)}
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
          {translate('kits-v3.why.headline')}
        </RevealHeading>
        <div className="grid grid-cols-12 gap-px border border-border bg-border">
          {renderTile('system', system)}
          {renderTile('properly', properly)}
          {renderTile('forever', forever, {
            price,
          })}
        </div>
      </div>
    </section>
  );
}
