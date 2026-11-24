'use client';

import { KitClosingCta } from '@/features/kits/components/Kitclosingcta';
import { KitFaqSection } from '@/features/kits/components/Kitfaqsection';
import { KitFloatingBuyBar } from '@/features/kits/components/Kitfloatingbuybar';
import { BrandLogoSection } from '@/components/ui/BrandLogoSection';
import StarterPackPopup from '@/features/newsletter/StarterPackPopup';
import { RevealCaptureSection } from '@/features/kits/reveal/RevealCaptureSection';
import { RevealCodeSection } from '@/features/kits/reveal/RevealCodeSection';
import { RevealHeroSection } from '@/features/kits/reveal/RevealHeroSection';
import { RevealManifestSection } from '@/features/kits/reveal/RevealManifestSection';
import { RevealPairingSection } from '@/features/kits/reveal/RevealPairingSection';
import { RevealPricingSection } from '@/features/kits/reveal/RevealPricingSection';
import { REVEAL_FAQS } from '@/features/kits/utils/reveal-kit.config';

export default function RevealKitLayout({
  kit,
  owns = false,
  priceId = null,
  images = [],
  videos = [],
  isAuthenticated = false,
  manifest = null,
  capture = null,
  pricing = null,
}) {
  return (
    <>
      <StarterPackPopup
        isAuthenticated={isAuthenticated}
        source="kit-reveal-ad"
        idPrefix="kit-reveal-modal"
        delayMs={30000}
        storageKey="anm_kit_reveal_prompt_dismissed_v1"
        eyebrow="Free starter pack"
        title="Not ready for the full Kit? Take the free components."
        description="Production GSAP for React, Vue, and HTML/CSS/JS - the same craft that is in Reveal. In your inbox the moment you subscribe."
        buttonLabel="Send it to me"
      />
      <div className="relative">
        <RevealHeroSection
          kit={kit}
          owns={owns}
          priceId={priceId}
          images={images}
        />
        <BrandLogoSection />
        <RevealPairingSection kit={kit} />
        {manifest ?? <RevealManifestSection kit={kit} videos={videos} />}
        {owns ? null : (capture ?? <RevealCaptureSection />)}
        <RevealCodeSection />
        {pricing ?? (
          <RevealPricingSection kit={kit} owns={owns} priceId={priceId} />
        )}
        <KitFaqSection kit={kit} faqs={REVEAL_FAQS} />
        <KitClosingCta kit={kit} owns={owns} priceId={priceId} />
      </div>
      <KitFloatingBuyBar
        kit={kit}
        owns={owns}
        priceId={priceId}
        images={images}
      />
    </>
  );
}
