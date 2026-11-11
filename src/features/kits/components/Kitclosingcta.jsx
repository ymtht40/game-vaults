// Variable Mapping: e -> kit, r -> owns, a -> priceId, l -> images, u -> resolvedImages

import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import { ImageRing } from '@/features/kits/components/Imagering'; // NOTE: module id: 809214
import { KitPurchaseCta } from '@/features/kits/components/Kitpurchasecta'; // NOTE: module id: 787160

// NOTE: module id: 525425
export function KitClosingCta({ kit, owns = false, priceId = null, images = [] }) {
  const resolvedImages = images.length
    ? images
    : [kit?.preview_image_url].filter(Boolean);

  return (
    <section
      data-theme="dark"
      className="relative bg-background text-foreground"
      style={{ clipPath: 'inset(0 0 -100vh 0)' }}
    >
      <ImageRing side="left" images={resolvedImages} />
      <ImageRing side="right" images={resolvedImages} />
      <div className="v2-container relative z-10 py-96 lg:py-160">
        <div className="grid grid-cols-12">
          <div className="col-span-12 flex flex-col items-center text-center lg:col-span-6 lg:col-start-4">
            <RevealHeading
              as="h2"
              sizeClass="text-h1"
              trigger="scroll"
              className="font-medium"
            >
              {owns ? "It's yours." : 'Built once. Yours forever.'}
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-subheadline mt-16 max-w-[44ch] text-foreground-muted"
            >
              {owns
                ? 'Open the Kit and start building.'
                : 'One purchase, every project, forever.'}
            </AnimatedText>
            <div className="mt-32 flex w-full justify-center">
              <KitPurchaseCta kit={kit} owns={owns} priceId={priceId} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default KitClosingCta;