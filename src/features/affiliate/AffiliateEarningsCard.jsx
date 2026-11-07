'use client';

// Variable Mapping: c -> soloYearlyCommission, t -> soloYearlyCommission, d -> monthlyNewEarnings, u -> firstYearTotal, m -> studioFiveSeatsPrice, f -> formatEuro, z -> formatEuro, h -> CHART_BARS, p -> maxBarValue, g -> BREAKDOWN_ROWS, U -> AffiliateEarningsCard, s -> containerRef, o -> counterRef, c_ref -> timelineRef

import { useRef } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { pricingConfig, formatMonthlyPrice } from '@/libs/data/pricing'; // NOTE: module id: 516799 
import { calculateStudioTotalCents as calculateBaseVolumePrice, calculateTieredStudioTotalCents as calculateDiscountedPrice } from '@/libs/data/seat-prices'; // NOTE: module id: 59011

import { AFFILIATE_COMMISSION_RATE } from '@/libs/config/affiliate'; // NOTE: module id: 664294
import { useRevealTimeline } from '@/hooks/useRevealTimeline'; // NOTE: module id: 228414

// NOTE: module id: 664466
export const soloYearlyCommission =
  formatMonthlyPrice(
  pricingConfig.stripe.landingPlans.find((plan) => plan.key === 'solo')?.yearly
  ) * AFFILIATE_COMMISSION_RATE;

const monthlyNewEarnings = 5 * soloYearlyCommission;
const firstYearTotal = 12 * monthlyNewEarnings;

const studioFiveSeatsPrice =
  calculateBaseVolumePrice(5, pricingConfig.studioPricing?.yearly, calculateDiscountedPrice?.yearly) / 100;

export const formatEuro = (amount) =>
  Number.isInteger(amount)
    ? `€${amount.toLocaleString('en-US')}`
    : `€${amount.toFixed(2)}`;

const CHART_BARS = Array.from({ length: 18 }, (_, index) => ({
  fresh: monthlyNewEarnings,
  renewal: index >= 12 ? monthlyNewEarnings : 0
}));

const maxBarValue = 2 * monthlyNewEarnings;

const BREAKDOWN_ROWS = [
  { label: 'Solo, yearly, renewal', value: soloYearlyCommission, renewal: true },
  { label: 'Studio, 5 seats', value: studioFiveSeatsPrice * AFFILIATE_COMMISSION_RATE },
  { label: 'Landmark Kit', value: 149 * AFFILIATE_COMMISSION_RATE }
];

export function AffiliateEarningsCard({ className = '', reveal = null }) {
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const timelineRef = useRef(null);

  const { play } = useRevealTimeline(containerRef, {
    mode: reveal === 'hero' ? 'hero' : 'manual',
    build: () => {
      const q = gsap.utils.selector(containerRef.current);
      const counterState = { v: 0 };
      const tl = gsap
        .timeline({ paused: true })
        .fromTo(
          q('[data-bar]'),
          { scaleY: 0 },
          { scaleY: 1, duration: 0.5, ease: 'expo.out', stagger: 0.03 },
          0
        )
        .fromTo(
          counterState,
          { v: 0 },
          {
            v: firstYearTotal,
            duration: 0.9,
            ease: 'expo.out',
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.textContent = formatEuro(Math.round(counterState.v));
              }
            }
          },
          0
        )
        .fromTo(
          q('[data-row]'),
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: 'expo.out', stagger: 0.08 },
          0.35
        );

      if (reveal !== 'hero') tl.progress(1);
      timelineRef.current = tl;
      return tl;
    }
  });

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          if (!timelineRef.current?.isActive()) play();
        }
      }}
      aria-hidden="true"
      data-theme="dark"
      className={cn('w-full max-w-[360px] bg-background text-foreground', className)}
    >
      <div className="flex items-center justify-between border-b border-foreground/10 px-16 py-12">
        <span className="text-body-sm font-medium">Earnings</span>
        <span className="text-body-sm text-foreground-muted">{5} referrals a month</span>
      </div>
      <div className="px-16 pt-16">
        <p className="text-body-sm text-foreground-muted">Your first year</p>
        <p ref={counterRef} className="h3 font-medium tabular-nums">
          {formatEuro(firstYearTotal)}
        </p>
      </div>
      <div className="flex h-[88px] items-end gap-[3px] px-16 pt-16">
        {CHART_BARS.map((bar, index) => (
          <div
            key={index}
            data-bar={true}
            className="flex h-full flex-1 origin-bottom flex-col justify-end"
          >
            {bar.renewal ? (
              <div
                className="bg-brand"
                style={{ height: `${(bar.renewal / maxBarValue) * 100}%` }}
              />
            ) : null}
            <div
              className="bg-foreground/25"
              style={{ height: `${(bar.fresh / maxBarValue) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-16 px-16 pt-8 pb-16">
        <span className="text-body-sm flex items-center gap-6 text-foreground-muted">
          <span className="size-8 bg-foreground/25" />
          New
        </span>
        <span className="text-body-sm flex items-center gap-6 text-foreground-muted">
          <span className="size-8 bg-brand" />
          Renewals
        </span>
      </div>
      <ul className="border-t border-foreground/10">
        {BREAKDOWN_ROWS.map((row) => (
          <li
            key={row.label}
            data-row={true}
            className="text-body-sm flex items-center justify-between border-b border-foreground/10 px-16 py-10 last:border-b-0"
          >
            <span className="text-foreground-muted">{row.label}</span>
            <span className={row.renewal ? 'tabular-nums text-brand' : 'tabular-nums'}>
              +{formatEuro(row.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

