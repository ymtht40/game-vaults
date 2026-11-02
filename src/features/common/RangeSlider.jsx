'use client';

// Variable Mapping: i -> DIGIT_STRIP, o -> RollingNumber, s -> RollingDigit, u -> TICK_POSITIONS, x -> isLabelAbove, v -> trackRef, C -> fillRef, w -> thumbRef, j -> quickToRef, N -> reducedMotionRef, y -> minNum, M -> maxNum, E -> internalValue, k -> setInternalValue, H -> lastEmittedValueRef, L -> rafIdRef, Z -> pendingValueRef, V -> numericValue, A -> progress, S -> progressRef, $ -> precision, F -> contextSafe, R -> isDraggingRef, U -> dragValueRef, z -> valueBadgeRef, q -> velocitySampleRef, O -> scheduleChange, B -> updateFromClientX, _ -> isEditing, D -> setIsEditing, T -> draftInput, I -> setDraftInput, P -> editHandledRef, X -> commitDraftInput, Y -> handlePointerDown, K -> sliderContent

import { useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import gsap from 'gsap'; // NOTE: module id: 989970
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

const DIGIT_STRIP = ['9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

function RollingNumber({ value, className = '' }) {
  const text = String(value ?? '');

  return (
    <span
      className={cn('inline-flex items-center tabular-nums', className)}
      aria-label={text}
    >
      {text.split('').map((char, index) =>
        /[0-9]/.test(char) ? (
          <RollingDigit key={`${text.length}-${index}`} digit={Number(char)} />
        ) : (
          <span key={`${text.length}-${index}-${char}`} aria-hidden="true">
            {char}
          </span>
        )
      )}
    </span>
  );
}

function RollingDigit({ digit }) {
  const stripRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const element = stripRef.current;
    if (!element) return;

    const targetY = -(20 * (digit + 1));
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      gsap.set(element, { y: targetY });
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    gsap.to(element, {
      y: targetY,
      duration: 0.4 * !prefersReducedMotion,
      ease: 'back.out(1.6)',
      overwrite: 'auto',
    });
  }, [digit]);

  return (
    <span
      aria-hidden="true"
      className="inline-block overflow-hidden"
      style={{ height: 20 }}
    >
      <span ref={stripRef} className="flex flex-col">
        {DIGIT_STRIP.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="flex items-center justify-center"
            style={{ height: 20 }}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}

const TICK_POSITIONS = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];

// NOTE: module id: 125303
export default function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  disabled = false,
  onChange,
  onCommit,
  labelPosition = 'inside',
  className = '',
}) {
  const isLabelAbove = labelPosition === 'above';
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const thumbRef = useRef(null);
  const quickToRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const minNum = Number(min);
  const maxNum = Number(max);
  const [internalValue, setInternalValue] = useState(value);
  const lastEmittedValueRef = useRef(value);
  const rafIdRef = useRef(0);
  const pendingValueRef = useRef(null);

  useEffect(() => {
    if (String(value) !== String(lastEmittedValueRef.current)) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => () => cancelAnimationFrame(rafIdRef.current), []);

  const numericValue = Number(internalValue);
  const progress = useMemo(
    () =>
      !Number.isFinite(numericValue) || maxNum <= minNum
        ? 0
        : Math.min(1, Math.max(0, (numericValue - minNum) / (maxNum - minNum))),
    [numericValue, minNum, maxNum]
  );
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const precision = Math.max(
    (String(step).split('.')[1] || '').length,
    (String(internalValue).split('.')[1] || '').length
  );

  const isDraggingRef = useRef(false);
  const dragValueRef = useRef(null);
  const valueBadgeRef = useRef(null);
  const velocitySampleRef = useRef({ x: 0, t: 0 });

  const { contextSafe } = useGSAP(
    () => {
      const track = trackRef.current;
      const fill = fillRef.current;
      const thumb = thumbRef.current;
      if (!track || !fill || !thumb) return;

      reducedMotionRef.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const duration = 0.3 * !reducedMotionRef.current;

      gsap.set(fill, {
        scaleX: progressRef.current,
        transformOrigin: '0% 50%',
        force3D: true,
      });
      gsap.set(track, { '--p': progressRef.current });
      gsap.set(thumb, {
        scaleY: 0.95,
        transformOrigin: '50% 50%',
        force3D: true,
      });

      quickToRef.current = {
        fill: gsap.quickTo(fill, 'scaleX', {
          duration,
          ease: 'back.out(1.4)',
        }),
        pos: gsap.quickTo(track, '--p', {
          duration,
          ease: 'back.out(1.4)',
        }),
        stretch: gsap.quickTo(thumb, 'scaleX', {
          duration: 0.25,
          ease: 'power2.out',
        }),
      };
    },
    { scope: trackRef }
  );

  useGSAP(
    () => {
      if (trackRef.current && quickToRef.current && !isDraggingRef.current) {
        quickToRef.current.fill(progress);
        quickToRef.current.pos(progress);
      }
    },
    { dependencies: [progress], scope: trackRef }
  );

  const scheduleChange = (nextValue) => {
    pendingValueRef.current = nextValue;
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = 0;
        lastEmittedValueRef.current = pendingValueRef.current;
        onChange?.(pendingValueRef.current);
      });
    }
  };

  const updateFromClientX = (clientX) => {
    const track = trackRef.current;
    if (!track || !quickToRef.current) return;

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

    quickToRef.current.fill(ratio);
    quickToRef.current.pos(ratio);
    progressRef.current = ratio;

    const now = performance.now();
    const prevSample = velocitySampleRef.current;
    if (!reducedMotionRef.current && prevSample.t) {
      const velocity =
        Math.abs(clientX - prevSample.x) / Math.max(1, now - prevSample.t);
      quickToRef.current.stretch(1 + Math.min(0.7, 0.45 * velocity));
    }
    velocitySampleRef.current = { x: clientX, t: now };

    const stepNum = Number(step) || 1;
    const snapped =
      Math.round((minNum + ratio * (maxNum - minNum) - minNum) / stepNum) *
        stepNum +
      minNum;
    const nextValue = String(
      parseFloat(Math.min(maxNum, Math.max(minNum, snapped)).toFixed(6))
    );

    if (nextValue !== dragValueRef.current) {
      dragValueRef.current = nextValue;
      setInternalValue(nextValue);
      scheduleChange(nextValue);
      if (!reducedMotionRef.current && valueBadgeRef.current) {
        gsap.fromTo(
          valueBadgeRef.current,
          { scale: 1.18, transformOrigin: '100% 50%' },
          {
            scale: 1,
            duration: 0.25,
            ease: 'back.out(2)',
            overwrite: 'auto',
          }
        );
      }
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [draftInput, setDraftInput] = useState('');
  const editHandledRef = useRef(false);

  const commitDraftInput = contextSafe((rawInput) => {
    if (editHandledRef.current) return;
    editHandledRef.current = true;
    setIsEditing(false);

    const parsed = Number(String(rawInput).replace(',', '.'));
    if (!Number.isFinite(parsed)) return;

    const clamped = Math.min(maxNum, Math.max(minNum, parsed));
    const formatted = String(parseFloat(clamped.toFixed(6)));
    if (formatted === String(internalValue)) return;

    setInternalValue(formatted);
    dragValueRef.current = formatted;
    lastEmittedValueRef.current = formatted;

    const nextProgress =
      maxNum > minNum ? (clamped - minNum) / (maxNum - minNum) : 0;
    progressRef.current = nextProgress;
    if (quickToRef.current) {
      quickToRef.current.fill(nextProgress);
      quickToRef.current.pos(nextProgress);
    }

    onChange?.(formatted);
    onCommit?.(formatted);
  });

  const handlePointerDown = contextSafe((event) => {
    if (disabled) return;

    isDraggingRef.current = true;
    trackRef.current?.setAttribute('data-dragging', 'true');

    if (!reducedMotionRef.current) {
      gsap
        .timeline({ overwrite: 'auto' })
        .to(fillRef.current, {
          scaleY: 1.08,
          duration: 0.12,
          ease: 'power2.out',
          force3D: true,
        })
        .to(fillRef.current, {
          scaleY: 0.82,
          duration: 0.38,
          ease: 'back.out(3)',
        });

      gsap.to(thumbRef.current, {
        scaleY: 1,
        duration: 0.3,
        ease: 'back.out(3)',
        overwrite: 'auto',
      });
    }

    if (event?.clientX != null) {
      updateFromClientX(event.clientX);
    }

    const handlePointerMove = (moveEvent) =>
      updateFromClientX(moveEvent.clientX);
    window.addEventListener('pointermove', handlePointerMove);

    const handlePointerUp = contextSafe(() => {
      window.removeEventListener('pointermove', handlePointerMove);
      isDraggingRef.current = false;
      trackRef.current?.removeAttribute('data-dragging');

      const finalNum = Number(dragValueRef.current ?? internalValue);
      const finalProgress =
        maxNum > minNum && Number.isFinite(finalNum)
          ? Math.min(1, Math.max(0, (finalNum - minNum) / (maxNum - minNum)))
          : 0;

      if (quickToRef.current) {
        quickToRef.current.fill(finalProgress);
        quickToRef.current.pos(finalProgress);
        quickToRef.current.stretch(1);
      }

      velocitySampleRef.current = { x: 0, t: 0 };

      if (!reducedMotionRef.current) {
        gsap.to(fillRef.current, {
          scaleY: 1,
          duration: 0.45,
          ease: 'back.out(3)',
          overwrite: 'auto',
        });
        gsap.to(thumbRef.current, {
          scaleY: 0.95,
          duration: 0.45,
          ease: 'back.out(3)',
          overwrite: 'auto',
        });
      }

      if (dragValueRef.current != null) {
        onCommit?.(dragValueRef.current);
      }
    });

    window.addEventListener('pointerup', handlePointerUp, { once: true });
    window.addEventListener('pointercancel', handlePointerUp, { once: true });
  });

  const sliderContent = (
    <div
      ref={trackRef}
      className={cn(
        'group relative h-40 select-none overflow-hidden border border-foreground/[0.08] bg-foreground/[0.04] transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-foreground/[0.055] data-[dragging]:border-foreground/[0.14] data-[dragging]:bg-foreground/[0.06]',
        disabled && 'opacity-45',
        !isLabelAbove && className
      )}
    >
      {TICK_POSITIONS.map((tick) => (
        <span
          key={tick}
          aria-hidden="true"
          className={cn(
            'absolute top-1/2 h-10 w-px -translate-y-1/2 bg-foreground/[0.12]',
            !isLabelAbove && tick < 0.5 && 'max-sm:hidden'
          )}
          style={{ left: `${100 * tick}%` }}
        />
      ))}

      <div
        ref={fillRef}
        aria-hidden="true"
        className="absolute inset-y-2 left-0 w-full bg-foreground/[0.07] transition-[background-color] duration-(--duration-quick) group-data-[dragging]:bg-foreground/[0.09]"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[13px] h-14 w-4"
        style={{ left: 'calc(var(--p, 0) * 100%)', marginLeft: -2 }}
      >
        <span
          ref={thumbRef}
          className="block h-full w-full bg-foreground/50 transition-[background-color] duration-(--duration-quick) group-hover:bg-foreground/70 group-data-[dragging]:bg-foreground"
        />
      </span>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-12">
        <span className="truncate text-body-sm text-foreground/80">
          {isLabelAbove ? null : label}
        </span>

        <span
          ref={valueBadgeRef}
          className="inline-flex items-center text-body-sm text-foreground"
        >
          {isEditing ? (
            <input
              type="text"
              inputMode="decimal"
              value={draftInput}
              autoFocus
              aria-label={`${label} value`}
              onFocus={(event) => event.target.select()}
              onChange={(event) => setDraftInput(event.target.value)}
              onBlur={() => commitDraftInput(draftInput)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitDraftInput(draftInput);
                } else if (event.key === 'Escape') {
                  editHandledRef.current = true;
                  setIsEditing(false);
                }
              }}
              style={{ width: `${Math.max(draftInput.length, 2) + 1}ch` }}
              className="pointer-events-auto bg-transparent text-right text-body-sm text-foreground outline-none"
            />
          ) : (
            <button
              type="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Edit ${label} value`}
              onClick={() => {
                if (!disabled) {
                  editHandledRef.current = false;
                  setDraftInput(
                    Number.isFinite(numericValue)
                      ? String(parseFloat(numericValue.toFixed(6)))
                      : ''
                  );
                  setIsEditing(true);
                }
              }}
              className="pointer-events-auto inline-flex cursor-text items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30"
            >
              <RollingNumber
                value={
                  Number.isFinite(numericValue)
                    ? numericValue.toFixed(precision)
                    : ''
                }
              />
              {unit ? <span>{unit}</span> : null}
            </button>
          )}
        </span>
      </div>

      <input
        type="range"
        aria-label={label}
        min={minNum}
        max={maxNum}
        step={step}
        value={Number.isFinite(numericValue) ? numericValue : minNum}
        disabled={disabled}
        onChange={(event) => {
          if (isDraggingRef.current) return;
          const nextValue = event.target.value;
          setInternalValue(nextValue);
          dragValueRef.current = nextValue;

          const parsed = Number(nextValue);
          const nextProgress =
            maxNum > minNum && Number.isFinite(parsed)
              ? Math.min(1, Math.max(0, (parsed - minNum) / (maxNum - minNum)))
              : 0;

          if (quickToRef.current) {
            quickToRef.current.fill(nextProgress);
            quickToRef.current.pos(nextProgress);
          }

          scheduleChange(nextValue);
          onCommit?.(nextValue);
        }}
        onPointerDown={handlePointerDown}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 disabled:cursor-default"
      />
    </div>
  );

  return isLabelAbove ? (
    <div className={cn('flex flex-col gap-8', className)}>
      <span aria-hidden="true" className="text-body-sm text-foreground-muted">
        {label}
      </span>
      {sliderContent}
    </div>
  ) : (
    sliderContent
  );
}
