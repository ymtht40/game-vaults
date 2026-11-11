'use client';

// Variable Mapping: e -> kit, r -> owns, a -> priceId, n -> images, s -> videos, l -> isAuthenticated, i -> manifest, o -> capture, c -> pricing

import { KitClosingCta } from '@/features/kits/components/Kitclosingcta'; // NOTE: module id: 752959 // UNRESOLVED: name guessed from usage
import { KitFaqSection } from '@/features/kits/components/Kitfaqsection'; // NOTE: module id: 498872 // UNRESOLVED: name guessed from usage
import { KitFloatingBuyBar } from '@/features/kits/components/Kitfloatingbuybar'; // NOTE: module id: 525425 // UNRESOLVED: name guessed from usage
import { BrandLogoSection } from '@/components/ui/BrandLogoSection'; // NOTE: module id: 950377 // UNRESOLVED: name guessed from usage
import { StarterPackModal } from '@/features/kits/components/Starterpackmodal'; // NOTE: module id: 573564 // UNRESOLVED: name guessed from usage
import { RevealCaptureSection } from '@/features/kits/reveal/RevealCaptureSection'; // NOTE: module id: 301900
import { RevealCodeSection } from '@/features/kits/reveal/RevealCodeSection'; // NOTE: module id: 301900
import { RevealHeroSection } from '@/features/kits/reveal/RevealHeroSection'; // NOTE: module id: 301900
import { RevealManifestSection } from '@/features/kits/reveal/RevealManifestSection'; // NOTE: module id: 301900
import { RevealPairingSection } from '@/features/kits/reveal/RevealPairingSection'; // NOTE: module id: 301900
import { RevealPricingSection } from '@/features/kits/reveal/RevealPricingSection'; // NOTE: module id: 301900
import { REVEAL_FAQS } from '@/features/kits/utils/reveal-kit.config'; // NOTE: module id: 301900

// NOTE: module id: 301900
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
      <StarterPackModal
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
