'use client';

// Variable Mapping: i -> HOUSE_EASES, o -> EASE_FAMILIES, s -> EASE_DIRECTIONS, u -> EaseCurve, c -> EaseOption, p -> isOpen, h -> setIsOpen, b -> direction, x -> setDirection, v -> containerRef, C -> handleSelect, w -> easeOptions, d -> disabled, f -> align, m -> ariaLabel, g -> className

import { useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import { CaretDown } from '@phosphor-icons/react'; // NOTE: module id: 815330
import gsap from 'gsap'; // NOTE: module id: 989970
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

const HOUSE_EASES = [
  { value: 'annnimate', label: 'GameVault Drift', bezier: [0.3, 0.9, 0.1, 1] },
  { value: 'annnimateInOut', label: 'GameVault Punch', bezier: [0.7, 0, 0.16, 1] },
];

const EASE_FAMILIES = [
  'power1',
  'power2',
  'power3',
  'power4',
  'expo',
  'circ',
  'sine',
  'back',
  'elastic',
  'bounce',
];

const EASE_DIRECTIONS = [
  { id: 'out', label: 'Out' },
  { id: 'in', label: 'In' },
  { id: 'inOut', label: 'In-out' },
];

function sampleCubicBezier(progress, x1, y1, x2, y2) {
  const inverse = 1 - progress;
  return {
    x:
      3 * inverse * inverse * progress * x1 +
      3 * inverse * progress * progress * x2 +
      progress * progress * progress,
    y:
      3 * inverse * inverse * progress * y1 +
      3 * inverse * progress * progress * y2 +
      progress * progress * progress,
  };
}

function sampleEasePoints(easeValue, steps = 48) {
  let parseFn;
  const houseEase = HOUSE_EASES.find((item) => item.value === easeValue);
  const points = [];

  if (houseEase) {
    const [x1, y1, x2, y2] = houseEase.bezier;
    for (let stepIndex = 0; stepIndex <= steps; stepIndex++) {
      points.push(sampleCubicBezier(stepIndex / steps, x1, y1, x2, y2));
    }
    return points;
  }

  try {
    parseFn = gsap.parseEase(easeValue);
  } catch {
    parseFn = null;
  }

  if (!parseFn) {
    parseFn = (progress) => progress;
  }

  for (let stepIndex = 0; stepIndex <= steps; stepIndex++) {
    const progress = stepIndex / steps;
    points.push({ x: progress, y: parseFn(progress) });
  }

  return points;
}

function formatEaseLabel(easeValue) {
  const houseEase = HOUSE_EASES.find((item) => item.value === easeValue);
  if (houseEase) return houseEase.label;
  if (!easeValue || easeValue === 'none' || easeValue === 'linear') return 'Linear';

  const [family, direction] = String(easeValue).split('.');
  const familyLabel = family.charAt(0).toUpperCase() + family.slice(1);
  const directionLabel = direction === 'inOut' ? 'in-out' : direction || '';
  return directionLabel ? `${familyLabel} ${directionLabel}` : familyLabel;
}

function EaseCurve({ value, className = '' }) {
  const pathData = useMemo(() => {
    const points = sampleEasePoints(value);
    const yValues = points.map((point) => point.y);
    const minY = Math.min(0, ...yValues);
    const maxY = Math.max(1, ...yValues);

    return points
      .map((point, index) => {
        const x = 3 + 38 * point.x;
        const y = 3 + (1 - (point.y - minY) / (maxY - minY)) * 20;
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [value]);

  return (
    <svg
      viewBox="0 0 44 26"
      aria-hidden="true"
      className={cn('h-16 w-28 shrink-0', className)}
    >
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function EaseOption({ value, label, active, onSelect, house = false }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-col items-center gap-4 border px-4 py-6 transition-colors',
        active
          ? 'border-foreground/40 bg-foreground/[0.08] text-foreground'
          : 'border-foreground/[0.06] bg-foreground/[0.02] text-foreground-muted hover:bg-foreground/[0.06] hover:text-foreground'
      )}
    >
      <EaseCurve
        value={value}
        className={house && !active ? 'text-brand/80' : undefined}
      />
      <span className="max-w-full truncate text-[11px] font-sans leading-none">
        {label}
      </span>
    </button>
  );
}

// NOTE: module id: 666542
export default function EaseSelect({
  value,
  onChange,
  disabled = false,
  align = 'right',
  ariaLabel = 'Easing',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState(() => {
    const initialDir = String(value || '').split('.')[1];
    return EASE_DIRECTIONS.some((item) => item.id === initialDir)
      ? initialDir
      : 'out';
  });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (nextValue) => {
    onChange?.(nextValue);
    setIsOpen(false);
  };

  const easeOptions = [
    ...EASE_FAMILIES.map((family) => ({
      value: `${family}.${direction}`,
      label: family.charAt(0).toUpperCase() + family.slice(1),
    })),
    { value: 'none', label: 'Linear' },
  ];

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-28 w-full items-center justify-between gap-8 border border-foreground/10 bg-foreground/[0.05] px-10 text-[13px] font-sans text-foreground transition-colors hover:bg-foreground/[0.08] focus-visible:border-foreground/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
      >
        <span className="flex min-w-0 items-center gap-8">
          <EaseCurve value={value} className="text-foreground-muted" />
          <span className="truncate">{formatEaseLabel(value)}</span>
        </span>
        <CaretDown
          aria-hidden="true"
          className={cn(
            'size-12 shrink-0 text-foreground-muted transition-transform duration-(--duration-quick) ease-(--ease-expo-out)',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute top-[calc(100%+4px)] z-30 w-[264px] border border-foreground/10 bg-surface p-8',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="mb-8 flex gap-4">
            {EASE_DIRECTIONS.map((dirOption) => (
              <button
                key={dirOption.id}
                type="button"
                onClick={() => setDirection(dirOption.id)}
                className={cn(
                  'flex-1 border px-8 py-4 text-[12px] font-sans transition-colors',
                  direction === dirOption.id
                    ? 'border-foreground/30 bg-foreground/[0.08] text-foreground'
                    : 'border-transparent text-foreground-muted hover:text-foreground'
                )}
              >
                {dirOption.label}
              </button>
            ))}
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            {HOUSE_EASES.map((houseOption) => (
              <button
                key={houseOption.value}
                type="button"
                role="option"
                aria-selected={value === houseOption.value}
                onClick={() => handleSelect(houseOption.value)}
                className={cn(
                  'flex w-full flex-col items-center gap-4 border px-8 py-6 transition-colors',
                  value === houseOption.value
                    ? 'border-foreground/40 bg-foreground/[0.08] text-foreground'
                    : 'border-foreground/[0.06] bg-foreground/[0.02] text-foreground-muted hover:bg-foreground/[0.06] hover:text-foreground'
                )}
              >
                <EaseCurve
                  value={houseOption.value}
                  className={
                    value === houseOption.value ? undefined : 'text-brand/80'
                  }
                />
                <span className="truncate text-[12px] font-sans">
                  {houseOption.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mb-8 h-px bg-foreground/10" />

          <div className="grid grid-cols-3 gap-4">
            {easeOptions.map((option) => (
              <EaseOption
                key={option.value}
                value={option.value}
                label={option.label}
                active={value === option.value}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
