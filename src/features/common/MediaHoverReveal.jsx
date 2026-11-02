'use client';

// Variable Mapping: l -> CLIP_PATH_CSS, e -> containerRef, s -> items, o -> width, c -> aspect, u -> frameClassName, d -> scopeRef, m -> frameRef, f -> mediaRefs, p -> quickToXRef, h -> quickToYRef, g -> targetPosRef, x -> pointerPosRef, w -> isVisibleRef, b -> activeIndexRef, v -> zIndexCounterRef, y -> isTouchDevice, j -> setIsTouchDevice, C -> prefersReducedMotion, k -> setPrefersReducedMotion, N -> isEnabled, S -> contextSafe, T -> showItem, _ -> hidePreview, R -> updateHoveredItem

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { f as cn } from '@/libs/config/stripe'; // NOTE: module id: 103746

gsap.registerPlugin(useGSAP);

const CLIP_PATH_CSS =
  'inset(var(--clip-t, 50%) var(--clip-r, 50%) var(--clip-b, 50%) var(--clip-l, 50%))';

// NOTE: module id: 934783
export function MediaHoverReveal({
  containerRef,
  items = [],
  width = 320,
  aspect = '16 / 10',
  frameClassName = '',
}) {
  const scopeRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRefs = useRef([]);
  const quickToXRef = useRef(null);
  const quickToYRef = useRef(null);
  const targetPosRef = useRef({ x: 0, y: 0 });
  const pointerPosRef = useRef({ x: -1, y: -1 });
  const isVisibleRef = useRef(false);
  const activeIndexRef = useRef(-1);
  const zIndexCounterRef = useRef(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none)').matches
    );
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const isEnabled = !isTouchDevice && !prefersReducedMotion && items.length > 0;
  const { contextSafe } = useGSAP({ scope: scopeRef });

  useGSAP(
    () => {
      if (isEnabled && frameRef.current) {
        gsap.set(frameRef.current, { opacity: 0, scale: 0.5 });
        mediaRefs.current.forEach((mediaEl) => {
          if (mediaEl) {
            gsap.set(mediaEl, {
              '--clip-t': '50%',
              '--clip-r': '50%',
              '--clip-b': '50%',
              '--clip-l': '50%',
              filter: 'brightness(1)',
            });
          }
        });
        quickToXRef.current = gsap.quickTo(frameRef.current, 'x', {
          duration: 0.5,
          ease: 'power3.out',
        });
        quickToYRef.current = gsap.quickTo(frameRef.current, 'y', {
          duration: 0.5,
          ease: 'power3.out',
        });
      }
    },
    { scope: scopeRef, dependencies: [isEnabled, items.length] }
  );

  const showItem = contextSafe((index) => {
    const mediaEl = mediaRefs.current[index];
    if (
      !frameRef.current ||
      !mediaEl ||
      (isVisibleRef.current && activeIndexRef.current === index)
    ) {
      return;
    }

    const wasVisible = isVisibleRef.current;
    const prevIndex = activeIndexRef.current;
    activeIndexRef.current = index;
    isVisibleRef.current = true;

    if (!wasVisible) {
      gsap.killTweensOf(frameRef.current, 'opacity,scale');
      gsap.set(frameRef.current, {
        x: targetPosRef.current.x,
        y: targetPosRef.current.y,
      });
      gsap.fromTo(
        frameRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' }
      );
    }

    if (prevIndex >= 0 && prevIndex !== index) {
      const prevMediaEl = mediaRefs.current[prevIndex];
      if (prevMediaEl) {
        gsap.killTweensOf(prevMediaEl);
        gsap.to(prevMediaEl, {
          filter: 'brightness(0.7)',
          duration: 0.5,
          ease: 'power3.out',
        });
        prevMediaEl.pause?.();
      }
    }

    zIndexCounterRef.current += 1;
    gsap.killTweensOf(mediaEl);
    gsap.set(mediaEl, {
      zIndex: zIndexCounterRef.current,
      filter: 'brightness(1)',
      '--clip-t': '50%',
      '--clip-r': '50%',
      '--clip-b': '50%',
      '--clip-l': '50%',
    });
    gsap.to(mediaEl, {
      '--clip-t': '0%',
      '--clip-r': '0%',
      '--clip-b': '0%',
      '--clip-l': '0%',
      duration: 0.5,
      ease: 'power3.out',
    });

    if (mediaEl.tagName === 'VIDEO') {
      mediaEl.currentTime = 0;
      mediaEl.play?.().catch(() => {});
    }
  });

  const hidePreview = contextSafe(() => {
    if (!isVisibleRef.current) return;

    isVisibleRef.current = false;
    activeIndexRef.current = -1;

    if (frameRef.current) {
      gsap.killTweensOf(frameRef.current, 'opacity,scale');
      gsap.to(frameRef.current, {
        opacity: 0,
        scale: 0.6,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => {
          if (!isVisibleRef.current) {
            mediaRefs.current.forEach((mediaEl) => {
              if (mediaEl) {
                gsap.set(mediaEl, {
                  '--clip-t': '50%',
                  '--clip-r': '50%',
                  '--clip-b': '50%',
                  '--clip-l': '50%',
                  filter: 'brightness(1)',
                  zIndex: 0,
                });
                mediaEl.pause?.();
              }
            });
            zIndexCounterRef.current = 0;
          }
        },
      });
    }
  });

  const updateHoveredItem = contextSafe(() => {
    const containerEl = containerRef?.current;
    if (!containerEl || pointerPosRef.current.x < 0) return;

    const hitElement = document.elementFromPoint(
      pointerPosRef.current.x,
      pointerPosRef.current.y
    );
    const rowElement =
      hitElement && containerEl.contains(hitElement)
        ? hitElement.closest('[data-hfp-index]')
        : null;

    if (rowElement) {
      const index = Number(rowElement.getAttribute('data-hfp-index'));
      if (!Number.isNaN(index)) {
        showItem(index);
      }
    } else {
      hidePreview();
    }
  });

  useEffect(() => {
    if (!isEnabled) return;

    const handlePointerMove = (event) => {
      pointerPosRef.current.x = event.clientX;
      pointerPosRef.current.y = event.clientY;
      const frameHeight = frameRef.current?.offsetHeight || 0;
      targetPosRef.current.x = event.clientX + 24;
      targetPosRef.current.y = event.clientY - frameHeight / 2;
      updateHoveredItem();

      if (isVisibleRef.current) {
        quickToXRef.current?.(targetPosRef.current.x);
        quickToYRef.current?.(targetPosRef.current.y);
      }
    };

    const handleScroll = () => updateHoveredItem();

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isEnabled, updateHoveredItem]);

  if (!isEnabled) return null;

  return (
    <span ref={scopeRef} aria-hidden="true" className="contents">
      <div
        ref={frameRef}
        className={cn(
          'pointer-events-none fixed left-0 top-0 z-50 overflow-hidden bg-background opacity-0',
          frameClassName
        )}
        style={{ width, aspectRatio: aspect }}
      >
        {items.map((item, index) =>
          item?.src ? (
            item.type === 'video' ? (
              <video
                key={index}
                ref={(el) => {
                  mediaRefs.current[index] = el;
                }}
                src={item.src}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 size-full object-cover"
                style={{ clipPath: CLIP_PATH_CSS }}
              />
            ) : (
              <img
                key={index}
                ref={(el) => {
                  mediaRefs.current[index] = el;
                }}
                src={item.src}
                alt=""
                decoding="async"
                className="absolute inset-0 size-full object-cover"
                style={{ clipPath: CLIP_PATH_CSS }}
              />
            )
          ) : null
        )}
      </div>
    </span>
  );
}
