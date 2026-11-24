'use client';

import { KitClosingCta } from '@/features/kits/components/Kitclosingcta';
import { KitFaqSection } from '@/features/kits/components/Kitfaqsection';
import { KitFloatingBuyBar } from '@/features/kits/components/Kitfloatingbuybar';
import KitPricingSection from '@/features/kits/components/Kitpricingsection';
import { BrandLogoSection } from '@/components/ui/BrandLogoSection';
import StarterPackPopup from '@/features/newsletter/StarterPackPopup';
import { MenuCodeSection } from '@/features/kits/menu/MenuCodeSection';
import { MenuCoverageSection } from '@/features/kits/menu/MenuCoverageSection';
import { MenuCraftSection } from '@/features/kits/menu/MenuCraftSection';
import { MenuHeroSection } from '@/features/kits/menu/MenuHeroSection';
import { MenuStageSection } from '@/features/kits/menu/MenuStageSection';
import {
  MENU_FAQS,
  MENU_INCLUDED_ITEMS,
  MENU_SHOWREEL_POSTER_URL,
  MENU_SHOWREEL_VIDEO_URL,
} from '@/features/kits/utils/menu-kit.config';

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
      <StarterPackPopup
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
