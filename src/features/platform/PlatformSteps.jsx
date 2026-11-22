'use client';

import {
  CopyIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  SlidersIcon,
} from '@phosphor-icons/react';
// UNRESOLVED: CopyIcon is inferred from the copy step. The 999723.f definition is absent.

import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { V3SectionHeader } from '@/features/home-v3/V3SectionHeader'; // NOTE: module id: 118970
import V3StepRail from '@/sections/v3/V3StepRail'; // NOTE: module id: 838507
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391

/* Variable Mapping:
 * m -> stepIcons, e/t/l -> count/categories/action, r -> steps, map a/l -> step/index
 */
const stepIcons = [MagnifyingGlassIcon, SlidersIcon, CopyIcon, RocketLaunchIcon];

// NOTE: module id: 107865
export default function PlatformSteps({ count, categories, action = null }) {
  const steps = t('platform-v3.steps.items').map((step, index) => ({
    title: step.title,
    body: step.body.replace('{count}', count).replace('{categories}', categories),
    icon: stepIcons[index],
  }));

  return (
    <section data-theme="light" className="bg-background py-64 text-foreground lg:py-160">
      <div className="v2-container flex flex-col gap-48 lg:gap-64">
        <V3SectionHeader action={action} className="max-w-[16ch]">
          {t('platform-v3.steps.headline')}
        </V3SectionHeader>
        <FadeIn trigger="scroll">
          <V3StepRail steps={steps} />
        </FadeIn>
      </div>
    </section>
  );
}
