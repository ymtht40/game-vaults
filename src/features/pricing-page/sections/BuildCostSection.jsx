'use client';

import { useState } from 'react';
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import RangeSlider from '@/components/ui/RangeSlider'; // NOTE: module id: 125303
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import AnimatedEuro, { formatEuro } from '@/features/pricing-page/components/AnimatedEuro'; // NOTE: module id: 314670
import AnimatedBar from '@/features/pricing-page/components/AnimatedBar'; // NOTE: module id: 23692

function formatPaybackTime(ratio, translate) {
  if (ratio < 1) {
    return translate('pricing-v3.buildCost.minutes', {
      n: Math.max(5, 5 * Math.round((60 * ratio) / 5)),
    });
  }
  const roundedHours = Math.round(2 * ratio) / 2;
  return translate(
    roundedHours === 1
      ? 'pricing-v3.buildCost.hour'
      : 'pricing-v3.buildCost.hours',
    {
      n: roundedHours,
    }
  );
}

// Variable Mapping: e -> yearly, l -> count, r -> rate, u -> setRate, m -> hours, x -> setHours, h -> totalCost, f -> maxCost
// NOTE: module id: 23692
export default function BuildCostSection({ yearly = 240, count = 0 }) {
  const [rate, setRate] = useState(80);
  const [hours, setHours] = useState(8);
  const totalCost = rate * hours;
  const maxCost = Math.max(totalCost, yearly);

  return (
    <section
      data-theme="light"
      className="bg-background pb-96 text-foreground lg:pb-160"
    >
      <div className="v2-container grid grid-cols-12 items-end gap-y-48 lg:gap-x-24">
        <div className="col-span-12 flex flex-col gap-48 lg:col-span-5">
          <div className="flex flex-col gap-16">
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              className="max-w-[22ch] font-medium text-balance"
              trigger="scroll"
            >
              {t('pricing-v3.buildCost.headline', {
                count,
                yearly: formatEuro(yearly),
              })}
            </RevealHeading>
            <FadeIn
              as="p"
              trigger="scroll"
              delay={0.25}
              className="text-body-lg text-foreground-muted"
            >
              {t('pricing-v3.buildCost.payback', {
                time: formatPaybackTime(yearly / rate, t),
              })}
            </FadeIn>
          </div>
          <FadeIn trigger="scroll" className="flex flex-col gap-12">
            <RangeSlider
              label={t('pricing-v3.buildCost.rate')}
              value={rate}
              min={30}
              max={200}
              step={5}
              unit="€/h"
              labelPosition="above"
              onChange={(value) => setRate(Number(value))}
            />
            <RangeSlider
              label={t('pricing-v3.buildCost.hoursLabel')}
              value={hours}
              min={2}
              max={24}
              step={1}
              unit="h"
              labelPosition="above"
              onChange={(value) => setHours(Number(value))}
            />
          </FadeIn>
        </div>
        <FadeIn
          trigger="scroll"
          delay={0.15}
          className="col-span-12 grid grid-cols-2 gap-24 border border-border p-24 lg:col-span-6 lg:col-start-7 lg:gap-32 lg:p-32"
        >
          <div className="flex flex-col gap-16">
            <div className="h-[200px]">
              <AnimatedBar
                share={totalCost / maxCost}
                className="bg-foreground"
              />
            </div>
            <div className="flex flex-col gap-4">
              <AnimatedEuro
                value={totalCost}
                className="text-h3 font-medium tabular-nums"
              />
              <p className="text-body-sm text-foreground-muted">
                {t('pricing-v3.buildCost.yours')}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-16">
            <div className="h-[200px]">
              <AnimatedBar
                share={yearly / maxCost}
                className="bg-brand"
              />
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-h3 font-medium tabular-nums text-brand">
                {formatEuro(yearly)}
              </span>
              <p className="text-body-sm text-foreground-muted">
                {t('pricing-v3.buildCost.ours', {
                  count,
                })}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
