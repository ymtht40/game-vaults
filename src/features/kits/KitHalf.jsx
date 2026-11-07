'use client';

// Variable Mapping: f -> KitHalf, e -> kit, r -> active, n -> halfRef

// UNRESOLVED: original source path or export names are absent from this chunk.
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
// UNRESOLVED: original source path or export names are absent from this chunk.
import { translate } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import GifPreview from '@/features/kits/GifPreview'; // NOTE: module id: 898767
import VideoPreview from '@/features/kits/VideoPreview'; // NOTE: module id: 898767
import SpecList from '@/components/ui/SpecList'; // NOTE: module id: 567874

// NOTE: module id: 898767
export default function KitHalf({ kit, active, onEnter, onTap, halfRef }) {
  return (
    <article
      ref={halfRef}
      onPointerEnter={onEnter}
      onClick={onTap}
      className="relative grid min-h-[480px] min-w-0 flex-1 grid-rows-[1fr_auto] overflow-hidden bg-black md:min-h-[560px] lg:min-h-[max(520px,calc(100svh-280px))]"
    >
      {kit.background ? (
        <img
          src={kit.background}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 object-cover object-right"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      ) : null}
      <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.9)_32%,transparent_65%)]"
      />
      <div className="relative">
        <div className="absolute inset-x-24 top-24 bottom-0 flex items-center justify-center lg:inset-x-40 lg:top-40">
          <div className="aspect-[16/10] h-full max-h-[288px] max-w-full">
            {kit.video ? (
              <VideoPreview src={kit.video} playing={active} />
            ) : (
              <GifPreview src={kit.gif} playing={active} alt={`${kit.title} Kit preview`} />
            )}
          </div>
        </div>
      </div>
      <div className="relative flex flex-col gap-16 p-24 lg:p-40">
        <div className="flex flex-col gap-8">
          <h2 className="text-h3 font-medium">{kit.title}</h2>
          <p className="text-body max-w-[40ch] text-foreground-muted">{kit.tagline}</p>
        </div>
        <SpecList
          className="w-full max-w-[420px]"
          items={[
            {
              label: translate('kits-v3.hero.specs.components'),
              value: kit.count,
            },
            {
              label: translate('kits-v3.hero.specs.formats'),
              value: translate('kits-v3.hero.specs.formatsValue'),
            },
            kit.price
              ? {
                  label: translate('kits-v3.hero.specs.price'),
                  value: translate('kits-v3.hero.specs.priceValue', {
                    price: kit.price,
                  }),
                }
              : null,
          ].filter(Boolean)}
        />
        <div>
          <Button href={`/kits/${kit.slug}`} theme="brand">
            {translate('kits-v3.hero.cta', {
              title: kit.title,
            })}
          </Button>
        </div>
      </div>
    </article>
  );
}
