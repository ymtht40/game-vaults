'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import gsap from 'gsap'; // NOTE: module id: 989970
import { formatImageUrl } from '@/libs/utils/formatImageUrl'; // NOTE: module id: 632021

const DEFAULT_LAYOUT = {
  cardW: 320,
  cardH: 180,
  gap: 48,
  cols: 6,
  rowCount: 6,
  offsetX: 184,
};

// NOTE: module id: 73062
export const DraggableGrid = forwardRef(function DraggableGrid(
  {
    images,
    className = '',
    cursorRef = null,
    layout = null,
    entrance = null,
    driftVx = -28,
    driftVy = -14,
  },
  ref
) {
  const resolvedLayout = useMemo(() => ({ ...DEFAULT_LAYOUT, ...(layout || {}) }), [layout]);

  const containerRef = useRef(null);
  const wrapRef = useRef(null);
  const itemsRef = useRef([]);
  const positionRef = useRef({ current: { x: 0, y: 0 }, target: { x: 0, y: 0 } });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const driftRef = useRef({ enabled: true, vx: driftVx, vy: driftVy });

  driftRef.current.vx = driftVx;
  driftRef.current.vy = driftVy;

  const animFrameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isIntersectingRef = useRef(true);
  const isRevealedRef = useRef(false);

  const gridItems = useMemo(() => {
    const list = [];
    const stepX = resolvedLayout.cardW + resolvedLayout.gap;
    const stepY = resolvedLayout.cardH + resolvedLayout.gap;
    let imageIdx = 0;

    for (let row = 0; row < resolvedLayout.rowCount; row++) {
      const rowOffset = row % 2 === 0 ? resolvedLayout.offsetX : 0;
      const posY = row * stepY;
      for (let col = 0; col < resolvedLayout.cols; col++) {
        const posX = rowOffset + col * stepX;
        const src = images[imageIdx % images.length];
        list.push({
          x: posX,
          y: posY,
          src: formatImageUrl(src, { width: 640 }),
        });
        imageIdx++;
      }
    }
    return list;
  }, [images, resolvedLayout]);

  const bindItemRef = useCallback(
    (index) => (el) => {
      if (!el) return;
      if (!itemsRef.current[index]) {
        itemsRef.current[index] = {};
      }
      const item = itemsRef.current[index];
      item.el = el;
      item.img = el.querySelector('img');
      item.x = gridItems[index].x;
      item.y = gridItems[index].y;
      item.w = resolvedLayout.cardW;
      item.h = resolvedLayout.cardH;
      item.extraX = 0;
      item.extraY = 0;

      if (entrance === 'center-out' && !isRevealedRef.current) {
        el.style.opacity = '0';
      }
    },
    [gridItems, resolvedLayout, entrance]
  );

  const reveal = useCallback(() => {
    if (entrance !== 'center-out' || isRevealedRef.current) return;
    isRevealedRef.current = true;

    const { w, h } = sizeRef.current;
    const centerX = w / 2;
    const centerY = h / 2;
    const pos = positionRef.current.current;

    itemsRef.current.forEach((item) => {
      if (!item?.el) return;
      const distance = Math.hypot(
        item.x + pos.x + (item.extraX || 0) + item.w / 2 - centerX,
        item.y + pos.y + (item.extraY || 0) + item.h / 2 - centerY
      );
      gsap.to(item.el, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.0016 * distance,
        overwrite: true,
      });
    });
  }, [entrance]);

  useImperativeHandle(ref, () => ({ reveal }), [reveal]);

  useEffect(() => {
    if (entrance !== 'center-out') return;
    const timer = window.setTimeout(reveal, 4000);
    return () => window.clearTimeout(timer);
  }, [entrance, reveal]);

  useEffect(() => {
    const container = containerRef.current;
    const wrap = wrapRef.current;
    if (!container || !wrap) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    driftRef.current.enabled = !prefersReducedMotion;

    const totalWidth = resolvedLayout.cols * (resolvedLayout.cardW + resolvedLayout.gap);
    const totalHeight = resolvedLayout.rowCount * (resolvedLayout.cardH + resolvedLayout.gap);

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current.w = rect.width;
      sizeRef.current.h = rect.height;
    };

    updateSize();
    positionRef.current.current.x = positionRef.current.target.x = -(0.1 * sizeRef.current.w);
    positionRef.current.current.y = positionRef.current.target.y = -(0.1 * sizeRef.current.h);

    const observer = new IntersectionObserver(
      (entries) => {
        isIntersectingRef.current = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: '200px' }
    );
    observer.observe(container);
    window.addEventListener('resize', updateSize);

    const onDragStart = (clientX, clientY) => {
      dragRef.current.active = true;
      dragRef.current.startX = clientX;
      dragRef.current.startY = clientY;
      dragRef.current.baseX = positionRef.current.target.x;
      dragRef.current.baseY = positionRef.current.target.y;
      wrap.classList.add('is-dragging');

      if (!prefersReducedMotion) {
        itemsRef.current.forEach((item) => {
          if (item?.img) {
            gsap.to(item.img, { scale: 0.95, duration: 0.3, ease: 'expo.out', overwrite: true });
          }
        });
      }
    };

    const onDragMove = (clientX, clientY) => {
      if (dragRef.current.active) {
        positionRef.current.target.x = dragRef.current.baseX + (clientX - dragRef.current.startX);
        positionRef.current.target.y = dragRef.current.baseY + (clientY - dragRef.current.startY);
      }
    };

    const onDragEnd = () => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        wrap.classList.remove('is-dragging');
        itemsRef.current.forEach((item) => {
          if (item?.img) {
            gsap.to(item.img, { scale: 1, duration: 0.3, ease: 'expo.out', overwrite: true });
          }
        });
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        e.preventDefault();
        onDragStart(e.clientX, e.clientY);
      }
    };
    const handleMouseMove = (e) => onDragMove(e.clientX, e.clientY);
    const handleMouseUp = () => onDragEnd();

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      onDragStart(touch.clientX, touch.clientY);
    };
    const handleTouchMove = (e) => {
      if (!dragRef.current.active) return;
      e.preventDefault();
      const touch = e.touches[0];
      onDragMove(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = () => onDragEnd();

    wrap.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    wrap.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrap.addEventListener('touchmove', handleTouchMove, { passive: false });
    wrap.addEventListener('touchend', handleTouchEnd);

    const onPointerEnter = () => {
      cursorRef?.current?.setLabel?.('Drag');
    };
    const onPointerLeave = () => {
      cursorRef?.current?.clearLabel?.();
    };

    wrap.addEventListener('pointerenter', onPointerEnter);
    wrap.addEventListener('pointerleave', onPointerLeave);

    const tick = (time) => {
      animFrameRef.current = requestAnimationFrame(tick);
      if (!isIntersectingRef.current) {
        lastTimeRef.current = time;
        return;
      }

      const delta = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;

      if (driftRef.current.enabled && !dragRef.current.active && delta > 0) {
        positionRef.current.target.x += driftRef.current.vx * delta;
        positionRef.current.target.y += driftRef.current.vy * delta;
      }

      const pos = positionRef.current;
      pos.current.x += (pos.target.x - pos.current.x) * 0.08;
      pos.current.y += (pos.target.y - pos.current.y) * 0.08;

      const viewport = sizeRef.current;
      itemsRef.current.forEach((item) => {
        if (!item?.el) return;
        let x = item.x + pos.current.x + item.extraX;
        let y = item.y + pos.current.y + item.extraY;

        while (x + item.w < 0) {
          item.extraX += totalWidth;
          x += totalWidth;
        }
        while (x > viewport.w) {
          item.extraX -= totalWidth;
          x -= totalWidth;
        }
        while (y + item.h < 0) {
          item.extraY += totalHeight;
          y += totalHeight;
        }
        while (y > viewport.h) {
          item.extraY -= totalHeight;
          y -= totalHeight;
        }

        item.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
      wrap.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      wrap.removeEventListener('touchstart', handleTouchStart);
      wrap.removeEventListener('touchmove', handleTouchMove);
      wrap.removeEventListener('touchend', handleTouchEnd);
      wrap.removeEventListener('pointerenter', onPointerEnter);
      wrap.removeEventListener('pointerleave', onPointerLeave);
      cursorRef?.current?.clearLabel?.();
      itemsRef.current.forEach((item) => {
        if (item?.img) {
          gsap.killTweensOf(item.img);
        }
      });
    };
  }, [resolvedLayout, cursorRef]);

  return (
    <div
      ref={containerRef}
      className={`library-showcase relative h-full w-full overflow-hidden ${className}`.trim()}
      aria-hidden="true"
    >
      <div
        ref={wrapRef}
        className="library-showcase-wrap absolute inset-0 cursor-grab select-none [&.is-dragging]:cursor-grabbing"
      >
        {gridItems.map((item, idx) => (
          <div
            key={idx}
            ref={bindItemRef(idx)}
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: `${resolvedLayout.cardW}px`, height: `${resolvedLayout.cardH}px` }}
          >
            <img
              src={item.src}
              alt=""
              loading="lazy"
              draggable="false"
              className="block object-cover opacity-90 transition-opacity duration-300 hover:opacity-100"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});