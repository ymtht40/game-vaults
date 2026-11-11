'use client';

// Variable Mapping: e -> kit, a -> owns, r -> priceId, n -> images, l -> isAuthenticated, i -> coverage, s -> craft

import { KitClosingCta } from '@/features/kits/components/Kitclosingcta'; // NOTE: module id: 752959 // UNRESOLVED: name guessed from usage
import { KitFaqSection } from '@/features/kits/components/Kitfaqsection'; // NOTE: module id: 498872 // UNRESOLVED: name guessed from usage
import { KitFloatingBuyBar } from '@/features/kits/components/Kitfloatingbuybar'; // NOTE: module id: 525425 // UNRESOLVED: name guessed from usage
import KitPricingSection from '@/features/kits/components/Kitpricingsection'; // NOTE: module id: 509259 // UNRESOLVED: name guessed from usage
import { BrandLogoSection } from '@/components/ui/BrandLogoSection'; // NOTE: module id: 950377 // UNRESOLVED: name guessed from usage
import { StarterPackModal } from '@/features/kits/components/Starterpackmodal'; // NOTE: module id: 573564 // UNRESOLVED: name guessed from usage
import { MenuCodeSection } from '@/features/kits/menu/MenuCodeSection'; // NOTE: module id: 37418
import { MenuCoverageSection } from '@/features/kits/menu/MenuCoverageSection'; // NOTE: module id: 37418
import { MenuCraftSection } from '@/features/kits/menu/MenuCraftSection'; // NOTE: module id: 37418
import { MenuHeroSection } from '@/features/kits/menu/MenuHeroSection'; // NOTE: module id: 37418
import { MenuStageSection } from '@/features/kits/menu/MenuStageSection'; // NOTE: module id: 37418
import {
  MENU_FAQS,
  MENU_INCLUDED_ITEMS,
  MENU_SHOWREEL_POSTER_URL,
  MENU_SHOWREEL_VIDEO_URL,
} from '@/features/kits/utils/menu-kit.config'; // NOTE: module id: 37418

// NOTE: module id: 37418
export default function MenuKitLayout({
  kit,
  owns = false,
  priceId = null,
  images = [],
  isAuthenticated = false,
  coverage = null,
  craft = null,
}) {
  return (
    <>
      <StarterPackModal
        isAuthenticated={isAuthenticated}
        source="kit-menu-ad"
        idPrefix="kit-menu-modal"
        delayMs={30000}
        storageKey="anm_kit_menu_prompt_dismissed_v1"
        eyebrow="Free starter pack"
        title="Not ready for the full Kit? Take the free components."
        description="Production GSAP for React, Vue, and HTML/CSS/JS - the same craft that is in the Menu Kit. In your inbox the moment you subscribe."
        buttonLabel="Send it to me"
      />
      <div className="relative">
        <MenuHeroSection kit={kit} owns={owns} priceId={priceId} />
        <BrandLogoSection />
        <MenuStageSection kit={kit} />
        {coverage ?? <MenuCoverageSection kit={kit} />}
        {craft ?? <MenuCraftSection />}
        <MenuCodeSection />
        <KitPricingSection
          kit={kit}
          owns={owns}
          priceId={priceId}
          included={MENU_INCLUDED_ITEMS}
          media={{
            type: 'video',
            src: MENU_SHOWREEL_VIDEO_URL,
            poster: MENU_SHOWREEL_POSTER_URL,
          }}
        />
        <KitFaqSection kit={kit} faqs={MENU_FAQS} />
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
