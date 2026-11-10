'use client';

/* Variable Mapping:
   e -> cycle
   c -> onChange
   u -> variant
   d -> hint
   m -> isQuarterly
   f -> maxSavingsPercent
   x -> showSavingsHint
   h -> handleSelectCycle
   g -> getPillButtonClass
*/

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import { appConfig, getActivePrice } from '@/libs/config/appConfig'; // NOTE: module id: 516799
import { Switch } from '@/components/ui/Switch'; // NOTE: module id: 870777 // UNRESOLVED: name guessed from usage
import PillContainer from '@/components/ui/PillContainer'; // NOTE: module id: 876355 // UNRESOLVED: name guessed from usage
import { PingIndicator } from '@/components/ui/PingIndicator'; // NOTE: module id: 400545 // UNRESOLVED: name guessed from usage

// NOTE: module id: 821980
// UNRESOLVED: name guessed from usage (exported as "f")
export function PricingCycleToggle({
  cycle,
  onChange,
  variant = 'default',
  hint = true,
}) {
  const isQuarterly = cycle === 'quarterly';

  const maxSavingsPercent = (function () {
    const plans = appConfig.stripe?.landingPlans || [];
    let maxPct = 0;
    for (const plan of plans) {
      const quarterlyMonthly = getActivePrice(plan.quarterly);
      const yearlyTotal = getActivePrice(plan.yearly);
      if (!quarterlyMonthly || !yearlyTotal) continue;
      const annualizedQuarterly = 12 * quarterlyMonthly;
      if (annualizedQuarterly <= 0) continue;
      const pct = Math.round(((annualizedQuarterly - yearlyTotal) / annualizedQuarterly) * 100);
      if (pct > maxPct) {
        maxPct = pct;
      }
    }
    return maxPct > 0 ? maxPct : null;
  })();

  const showSavingsHint = hint && isQuarterly && !!maxSavingsPercent;

  const handleSelectCycle = (nextCycle) => {
    analytics.track('pricing_cycle_toggled', { cycle: nextCycle });
    onChange(nextCycle);
  };

  if (variant === 'compact') {
    const getCompactButtonClass = (isActive) =>
      cn(
        'text-mono-sm transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
        isActive ? 'text-foreground' : 'text-foreground-muted hover:text-foreground'
      );

    return (
      <div className="inline-flex items-center gap-12">
        <button
          type="button"
          onClick={() => handleSelectCycle('quarterly')}
          className={getCompactButtonClass(isQuarterly)}
        >
          Quarterly
        </button>
        <Switch
          checked={!isQuarterly}
          onChange={(checked) => handleSelectCycle(checked ? 'yearly' : 'quarterly')}
          label={t('pricing.cycle.toggleAria')}
        />
        <button
          type="button"
          onClick={() => handleSelectCycle('yearly')}
          className={getCompactButtonClass(!isQuarterly)}
        >
          Yearly
        </button>
        {isQuarterly && maxSavingsPercent ? (
          <span className="text-mono-sm text-brand">−{maxSavingsPercent}%</span>
        ) : null}
      </div>
    );
  }

  const getPillButtonClass = (isActive) =>
    cn(
      'relative z-10 px-24 py-12 text-mono-sm transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
      isActive ? 'text-background' : 'text-foreground-muted hover:text-foreground'
    );

  return (
    <div className="inline-flex flex-col items-center">
      <PillContainer
        activeId={cycle}
        pillClassName="bg-foreground"
        containerClassName="border border-foreground/15 p-4"
        role="radiogroup"
        aria-label={t('pricing.cycle.toggleAria')}
      >
        <button
          type="button"
          role="radio"
          aria-checked={isQuarterly}
          data-flip-id="quarterly"
          onClick={() => handleSelectCycle('quarterly')}
          className={getPillButtonClass(isQuarterly)}
        >
          Quarterly
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!isQuarterly}
          data-flip-id="yearly"
          onClick={() => handleSelectCycle('yearly')}
          className={getPillButtonClass(!isQuarterly)}
        >
          Yearly
        </button>
      </PillContainer>
      <div
        className="grid w-full overflow-hidden transition-[grid-template-rows,opacity] duration-(--duration-snap) ease-(--ease-power3-out)"
        style={{
          gridTemplateRows: showSavingsHint ? '1fr' : '0fr',
          opacity: +!!showSavingsHint,
        }}
        aria-hidden={!showSavingsHint}
      >
        <div className="min-h-0">
          <button
            type="button"
            onClick={() => handleSelectCycle('yearly')}
            tabIndex={showSavingsHint ? 0 : -1}
            className="text-mono-sm mt-12 inline-flex items-center gap-8 text-brand transition-opacity duration-(--duration-fast) ease-(--ease-power3-out) hover:opacity-80"
          >
            <PingIndicator />
            {t('pricing.cycle.savingsHint', { percent: maxSavingsPercent })}
          </button>
        </div>
      </div>
    </div>
  );
}