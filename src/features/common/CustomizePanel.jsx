'use client';

// Variable Mapping: x -> ConfigurableControl, g -> configurables, p -> hasTrackedUsageRef, h -> handleValueChange, v -> handleValueCommit, C -> visibleControls, w -> lockedControls, j -> hasCustomValues, N -> soloMonthlyPrice, e -> animation, l -> values, i -> onChange, s -> onCommit, u -> onReset, c -> locked, f -> only, m -> className

import { useMemo, useRef } from 'react'; // NOTE: module id: 271645
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { EVENTS } from '@/libs/config/onboarding'; // NOTE: module id: 734601
import { formatMonthlyPrice, pricingConfig } from '@/libs/data/pricing'; // NOTE: module id: 516799
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { Switch } from '@/animations/Switch'; // NOTE: module id: 870777
import EaseSelect from '@/animations/EaseSelect'; // NOTE: module id: 666542
import RangeSlider from '@/features/common/RangeSlider'; // NOTE: module id: 125303
import Select from '@/features/common/Select'; // NOTE: module id: 977805
import { getValidConfigurables } from '@/libs/config/configurables'; // NOTE: module id: 726368

function ConfigurableControl({
  configurable,
  value,
  onChange,
  onCommit,
  disabled = false,
}) {
  const type = String(configurable.type || '').toLowerCase();
  const currentValue = value ?? configurable.value ?? '';
  const label =
    configurable.label ||
    String(
      configurable.name || configurable.attribute.replace(/^data-anm-/, '')
    )
      .replace(/[-_]+/g, ' ')
      .replace(/^\w/, (char) => char.toUpperCase());

  if (type === 'number' || type === 'float') {
    return (
      <li title={configurable.description || undefined}>
        <RangeSlider
          label={label}
          value={Number(currentValue)}
          min={configurable.min}
          max={configurable.max}
          step={Number(configurable.step) || (type === 'float' ? 0.05 : 1)}
          disabled={disabled}
          onChange={(nextValue) => onChange(configurable.attribute, nextValue)}
          onCommit={(nextValue) =>
            onCommit?.(configurable.attribute, nextValue)
          }
        />
      </li>
    );
  }

  return (
    <li
      title={configurable.description || undefined}
      className={`flex h-40 items-center justify-between gap-12 border border-foreground/[0.08] bg-foreground/[0.04] pl-12 pr-6 ${
        disabled ? 'opacity-45' : ''
      }`}
    >
      <span className="truncate text-body-sm text-foreground/80">{label}</span>

      {type === 'boolean' ? (
        <Switch
          checked={String(currentValue) === 'true'}
          disabled={disabled}
          onChange={(nextChecked) => {
            onChange(configurable.attribute, String(nextChecked));
            onCommit?.(configurable.attribute, String(nextChecked));
          }}
          label={label}
        />
      ) : type === 'select' && /ease/i.test(configurable.attribute) ? (
        <EaseSelect
          value={String(currentValue)}
          disabled={disabled}
          onChange={(nextValue) => {
            onChange(configurable.attribute, nextValue);
            onCommit?.(configurable.attribute, nextValue);
          }}
          align="right"
          ariaLabel={label}
          className="w-[55%] shrink-0"
        />
      ) : type === 'select' ? (
        <Select
          value={String(currentValue)}
          disabled={disabled}
          onChange={(nextValue) => {
            onChange(configurable.attribute, nextValue);
            onCommit?.(configurable.attribute, nextValue);
          }}
          options={(configurable.options || []).map((option) => ({
            value: String(option),
            label: String(option),
          }))}
          size="sm"
          labelSize="xs"
          align="right"
          ariaLabel={label}
          className="max-w-[55%] shrink-0"
        />
      ) : type === 'color' ? (
        <span className="flex shrink-0 items-center gap-8">
          <input
            type="color"
            aria-label={label}
            className="size-20 cursor-pointer border border-foreground/15 bg-transparent p-0"
            value={
              /^#/.test(String(currentValue)) ? String(currentValue) : '#ffffff'
            }
            disabled={disabled}
            onChange={(event) => {
              onChange(configurable.attribute, event.target.value);
              onCommit?.(configurable.attribute, event.target.value);
            }}
          />
          <span className="border border-foreground/10 bg-background/60 px-8 py-2 text-[12px] tabular-nums text-foreground-muted">
            {String(currentValue)}
          </span>
        </span>
      ) : null}
    </li>
  );
}

// NOTE: module id: 135178
export function CustomizePanel({
  animation,
  values = {},
  onChange,
  onCommit,
  onReset,
  locked = false,
  only = null,
  className = '',
}) {
  const configurables = useMemo(() => {
    const validList = getValidConfigurables(animation);
    return only
      ? only
          .map(({ attribute, label }) => {
            const matched = validList.find(
              (item) => item.attribute === attribute
            );
            return matched ? { ...matched, label } : null;
          })
          .filter(Boolean)
      : validList;
  }, [animation, only]);

  const hasTrackedUsageRef = useRef(false);

  if (configurables.length === 0) return null;

  const handleValueChange = (attribute, nextValue) => {
    if (!hasTrackedUsageRef.current) {
      hasTrackedUsageRef.current = true;
      analytics.track('customize_used', {
        animation_slug: animation.slug,
        locked_state: locked,
      });
      window.dispatchEvent(
        new CustomEvent(EVENTS.tuned, {
          detail: { slug: animation.slug },
        })
      );
    }
    onChange?.(attribute, nextValue);
  };

  const handleValueCommit = (attribute, nextValue) =>
    onCommit?.(attribute, nextValue);

  const visibleControls = locked ? configurables.slice(0, 3) : configurables;
  const lockedControls = locked ? configurables.slice(3) : [];
  const hasCustomValues = Object.keys(values).length > 0;
  const soloMonthlyPrice = formatMonthlyPrice(
    pricingConfig.stripe?.landingPlans?.find((plan) => plan.key === 'solo')
      ?.quarterly
  );

  return (
    <div className={`flex flex-col gap-12 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-h5 font-medium text-foreground">Customize</p>
        {hasCustomValues && (
          <button
            type="button"
            onClick={onReset}
            className="text-body-sm text-foreground-muted underline-offset-4 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <ul className="m-0 flex list-none flex-col gap-8 p-0">
        {visibleControls.map((item) => (
          <ConfigurableControl
            key={item.attribute}
            configurable={item}
            value={values[item.attribute]}
            onChange={handleValueChange}
            onCommit={handleValueCommit}
          />
        ))}
      </ul>

      {lockedControls.length > 0 && (
        <div className="relative min-h-[150px]">
          <ul
            aria-hidden="true"
            className="pointer-events-none m-0 flex list-none flex-col gap-8 p-0 select-none"
          >
            {lockedControls.slice(0, 4).map((item) => (
              <ConfigurableControl
                key={item.attribute}
                configurable={item}
                value={undefined}
                onChange={() => {}}
                disabled
              />
            ))}
          </ul>

          <div
            className="absolute inset-0 flex flex-col items-start justify-end gap-10"
            style={{
              background:
                'linear-gradient(to bottom, transparent, var(--background) 62%)',
            }}
          >
            <p className="text-body-sm text-foreground">
              Members customize everything
              {lockedControls.length > 4
                ? ` - ${lockedControls.length} more controls.`
                : '.'}
            </p>
            <Button
              href={`/checkout?plan=solo&cycle=quarterly${
                animation?.slug ? `&component=${animation.slug}` : ''
              }`}
              onClick={() =>
                analytics.track('customize_unlock_clicked', {
                  animation_slug: animation.slug,
                })
              }
              theme="surface"
              size="xs"
            >
              {soloMonthlyPrice
                ? `Unlock everything - €${soloMonthlyPrice}/mo`
                : 'Unlock everything'}
            </Button>
            <p className="text-accent-xs text-foreground-muted">
              Cancel anytime · 14-day money-back
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
