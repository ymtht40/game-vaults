'use client';

// Variable Mapping: e -> kit, r -> owns, n -> priceId, a -> isMounted, l -> setIsMounted, u -> isHidden, c -> setIsHidden, d -> barRef, h -> fallbackPriceDisplay

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import { createPortal } from 'react-dom'; // NOTE: module id: 174080
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import KitPrice from '@/features/pricing/components/KitPrice'; // NOTE: module id: 597274
import { KitPurchaseCta } from '@/features/kits/components/Kitpurchasecta'; // NOTE: module id: 787160
import { hasKitPricing } from '@/features/kits/utils/menuKits'; // NOTE: module id: 12426

gsap.registerPlugin(useGSAP);

// NOTE: module id: 752959
export function KitFloatingBuyBar({ kit, owns = false, priceId = null }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const barRef = useRef(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted || owns) return;

    const barEl = barRef.current;
    const hideTargets = new Set();

    document
      .querySelectorAll(
        'main a[href^="/checkout?kit="], main form, [data-starter-pack-band], [data-buybar-hide]'
      )
      .forEach((node) => {
        if (!barEl?.contains(node)) {
          hideTargets.add(node.closest('section') || node);
        }
      });

    if (!hideTargets.size) {
      setIsHidden(false);
      return;
    }

    const intersectingTargets = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) =>
        entry.isIntersecting
          ? intersectingTargets.add(entry.target)
          : intersectingTargets.delete(entry.target)
      );
      setIsHidden(intersectingTargets.size > 0);
    });

    hideTargets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [isMounted, owns]);

  useGSAP(
    () => {
      if (barRef.current) {
        gsap.set(barRef.current, { yPercent: 150, force3D: true });
      }
    },
    { dependencies: [isMounted] }
  );

  useGSAP(
    () => {
      const barEl = barRef.current;
      if (!barEl) return;

      barEl.inert = isHidden;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      gsap.to(barEl, {
        yPercent: 150 * !!isHidden,
        duration: 0.3 * !prefersReducedMotion,
        ease: 'expo.out',
        overwrite: true,
        force3D: true,
      });
    },
    { dependencies: [isHidden, isMounted] }
  );

  if (owns || !isMounted) return null;

  const fallbackPriceDisplay =
    kit?.metadata?.price_display ||
    (hasKitPricing(kit) ? 'One-time' : 'Announced at launch');

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[10] flex justify-center px-16 lg:bottom-32">
      <div
        ref={barRef}
        data-theme="dark"
        className="pointer-events-auto flex w-full items-center justify-between gap-16 border border-foreground/15 bg-surface px-16 py-12 text-foreground lg:w-auto lg:justify-start"
      >
        <div className="flex flex-col">
          <span className="text-mono-sm text-foreground">{kit.title}</span>
          <span className="text-body-sm text-foreground-muted">
            <KitPrice kitSlug={kit?.slug} fallback={fallbackPriceDisplay} />
          </span>
        </div>
        <span
          aria-hidden="true"
          className="h-32 w-px bg-foreground/15 max-lg:hidden"
        />
        <KitPurchaseCta kit={kit} owns={owns} priceId={priceId} size="sm" />
      </div>
    </div>,
    document.body
  );
}

export default KitFloatingBuyBar;