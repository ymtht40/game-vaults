'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import gsap from 'gsap';

import { formatImageUrl } from '@/libs/utils/formatImageUrl';

const defaultLayout = {
  cardW: 320,
  cardH: 180,
  gap: 48,
  cols: 6,
  rowCount: 6,
  offsetX: 184,
};

export const ImageShowcase = forwardRef(function ImageShowcase(
  {
    images,
    className = '',
    cursorRef = null,
    layout = null,
    entrance = null,
    driftVx = -28,
    driftVy = -14,
  },
  ref,
) {
  const resolvedLayout = useMemo(
    () => ({
      ...defaultLayout,
      ...(layout || {}),
    }),
    [layout],
  );

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const cardsRef = useRef([]);

  const positionRef = useRef({
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
  });

  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });

  const viewportRef = useRef({ w: 0, h: 0 });

  const driftRef = useRef({
    enabled: true,
    vx: driftVx,
    vy: driftVy,
  });

  driftRef.current.vx = driftVx;
  driftRef.current.vy = driftVy;

  const frameRef = useRef(0);
  const previousTimeRef = useRef(0);
  const isVisibleRef = useRef(true);
  const hasRevealedRef = useRef(false);

  const cards = useMemo(() => {
    const items = [];
    const columnStep = resolvedLayout.cardW + resolvedLayout.gap;
    const rowStep = resolvedLayout.cardH + resolvedLayout.gap;
    let imageIndex = 0;

    for (
      let rowIndex = 0;
      rowIndex < resolvedLayout.rowCount;
      rowIndex++
    ) {
      const rowOffset =
        rowIndex % 2 == 0 ? resolvedLayout.offsetX : 0;
      const cardY = rowIndex * rowStep;

      for (
        let columnIndex = 0;
        columnIndex < resolvedLayout.cols;
        columnIndex++
      ) {
        const cardX = rowOffset + columnIndex * columnStep;
        const source = images[imageIndex % images.length];

        items.push({
          x: cardX,
          y: cardY,
          src: formatImageUrl(source, { width: 640 }),
        });

        imageIndex++;
      }
    }

    return items;
  }, [images, resolvedLayout]);

  const registerCard = useCallback(
    (cardIndex) => (element) => {
      if (!element) {
        return;
      }

      if (!cardsRef.current[cardIndex]) {
        cardsRef.current[cardIndex] = {};
      }

      const card = cardsRef.current[cardIndex];

      card.el = element;
      card.img = element.querySelector('img');
      card.x = cards[cardIndex].x;
      card.y = cards[cardIndex].y;
      card.w = resolvedLayout.cardW;
      card.h = resolvedLayout.cardH;
      card.extraX = 0;
      card.extraY = 0;

      if (entrance === 'center-out' && !hasRevealedRef.current) {
        element.style.opacity = '0';
      }
    },
    [cards, resolvedLayout, entrance],
  );

  const reveal = useCallback(() => {
    if (entrance !== 'center-out' || hasRevealedRef.current) {
      return;
    }

    hasRevealedRef.current = true;

    const viewport = viewportRef.current;
    const centerX = viewport.w / 2;
    const centerY = viewport.h / 2;
    const position = positionRef.current.current;

    cardsRef.current.forEach((card) => {
      if (!card?.el) {
        return;
      }

      const distance = Math.hypot(
        card.x +
          position.x +
          (card.extraX || 0) +
          card.w / 2 -
          centerX,
        card.y +
          position.y +
          (card.extraY || 0) +
          card.h / 2 -
          centerY,
      );

      gsap.to(card.el, {
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
    if (entrance !== 'center-out') {
      return;
    }

    const timeoutId = window.setTimeout(reveal, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [entrance, reveal]);

  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;

    if (!container || !wrapper) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    driftRef.current.enabled = !prefersReducedMotion;

    const gridWidth =
      resolvedLayout.cols *
      (resolvedLayout.cardW + resolvedLayout.gap);

    const gridHeight =
      resolvedLayout.rowCount *
      (resolvedLayout.cardH + resolvedLayout.gap);

    const updateViewport = () => {
      const bounds = container.getBoundingClientRect();

      viewportRef.current.w = bounds.width;
      viewportRef.current.h = bounds.height;
    };

    updateViewport();

    positionRef.current.current.x =
      positionRef.current.target.x = -(0.1 * viewportRef.current.w);

    positionRef.current.current.y =
      positionRef.current.target.y = -(0.1 * viewportRef.current.h);

    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: '200px' },
    );

    observer.observe(container);
    window.addEventListener('resize', updateViewport);

    const startDrag = (clientX, clientY) => {
      dragRef.current.active = true;
      dragRef.current.startX = clientX;
      dragRef.current.startY = clientY;
      dragRef.current.baseX = positionRef.current.target.x;
      dragRef.current.baseY = positionRef.current.target.y;

      wrapper.classList.add('is-dragging');

      if (!prefersReducedMotion) {
        cardsRef.current.forEach((card) => {
          if (card?.img) {
            gsap.to(card.img, {
              scale: 0.95,
              duration: 0.3,
              ease: 'expo.out',
              overwrite: true,
            });
          }
        });
      }
    };

    const moveDrag = (clientX, clientY) => {
      if (dragRef.current.active) {
        positionRef.current.target.x =
          dragRef.current.baseX + (clientX - dragRef.current.startX);

        positionRef.current.target.y =
          dragRef.current.baseY + (clientY - dragRef.current.startY);
      }
    };

    const endDrag = () => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        wrapper.classList.remove('is-dragging');

        cardsRef.current.forEach((card) => {
          if (card?.img) {
            gsap.to(card.img, {
              scale: 1,
              duration: 0.3,
              ease: 'expo.out',
              overwrite: true,
            });
          }
        });
      }
    };

    const handleMouseDown = (event) => {
      if (event.button === 0) {
        event.preventDefault();
        startDrag(event.clientX, event.clientY);
      }
    };

    const handleMouseMove = (event) => {
      moveDrag(event.clientX, event.clientY);
    };

    const handleMouseUp = () => endDrag();

    const handleTouchStart = (event) => {
      const touch = event.touches[0];

      startDrag(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (event) => {
      if (!dragRef.current.active) {
        return;
      }

      event.preventDefault();

      const touch = event.touches[0];

      moveDrag(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => endDrag();

    wrapper.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    wrapper.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });

    wrapper.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });

    wrapper.addEventListener('touchend', handleTouchEnd);

    const handlePointerEnter = () => {
      cursorRef?.current?.setLabel?.('Drag');
    };

    const handlePointerLeave = () => {
      cursorRef?.current?.clearLabel?.();
    };

    wrapper.addEventListener('pointerenter', handlePointerEnter);
    wrapper.addEventListener('pointerleave', handlePointerLeave);

    const animate = (timestamp) => {
      frameRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current) {
        previousTimeRef.current = timestamp;
        return;
      }

      const deltaTime = previousTimeRef.current
        ? (timestamp - previousTimeRef.current) / 1000
        : 0;

      previousTimeRef.current = timestamp;

      if (
        driftRef.current.enabled &&
        !dragRef.current.active &&
        deltaTime > 0
      ) {
        positionRef.current.target.x +=
          driftRef.current.vx * deltaTime;

        positionRef.current.target.y +=
          driftRef.current.vy * deltaTime;
      }

      const position = positionRef.current;

      position.current.x +=
        (position.target.x - position.current.x) * 0.08;

      position.current.y +=
        (position.target.y - position.current.y) * 0.08;

      const viewport = viewportRef.current;

      cardsRef.current.forEach((card) => {
        if (!card?.el) {
          return;
        }

        let cardX = card.x + position.current.x + card.extraX;
        let cardY = card.y + position.current.y + card.extraY;

        while (cardX + card.w < 0) {
          card.extraX += gridWidth;
          cardX += gridWidth;
        }

        while (cardX > viewport.w) {
          card.extraX -= gridWidth;
          cardX -= gridWidth;
        }

        while (cardY + card.h < 0) {
          card.extraY += gridHeight;
          cardY += gridHeight;
        }

        while (cardY > viewport.h) {
          card.extraY -= gridHeight;
          cardY -= gridHeight;
        }

        card.el.style.transform =
          `translate3d(${cardX}px, ${cardY}px, 0)`;
      });
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();

      window.removeEventListener('resize', updateViewport);
      wrapper.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      wrapper.removeEventListener('touchstart', handleTouchStart);
      wrapper.removeEventListener('touchmove', handleTouchMove);
      wrapper.removeEventListener('touchend', handleTouchEnd);
      wrapper.removeEventListener('pointerenter', handlePointerEnter);
      wrapper.removeEventListener('pointerleave', handlePointerLeave);

      cursorRef?.current?.clearLabel?.();

      cardsRef.current.forEach((card) => {
        if (card?.img) {
          gsap.killTweensOf(card.img);
        }
      });
    };
  }, [resolvedLayout]);

  return (
    <div
      ref={containerRef}
      className={`library-showcase relative h-full w-full overflow-hidden ${className}`.trim()}
      aria-hidden="true"
    >
      <div
        ref={wrapperRef}
        className="library-showcase-wrap absolute inset-0 cursor-grab select-none [&.is-dragging]:cursor-grabbing"
      >
        {cards.map((card, cardIndex) => (
          <div
            key={cardIndex}
            ref={registerCard(cardIndex)}
            className="absolute left-0 top-0 will-change-transform"
            style={{
              width: `${resolvedLayout.cardW}px`,
              height: `${resolvedLayout.cardH}px`,
            }}
          >
            <img
              src={card.src}
              alt=""
              loading="lazy"
              draggable="false"
              className="block object-cover opacity-90 transition-opacity duration-300 hover:opacity-100"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

