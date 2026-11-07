'use client';

// Variable Mapping: L -> CircularSlider, g -> scopeRef, h -> wrapRef, p -> containerRef, m -> svgRef, x -> circleRef, v -> itemRefs, y -> prevRef, b -> nextRef, w -> sliderStateRef
// Variable Mapping (effect): j -> state, N -> layout, k -> stopAutoplay, _ -> rotateByStep, P -> startAutoplay, B -> setupDraggable

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin, MotionPathPlugin);
// NOTE: module id: 8545
export default function CircularSlider({
  className = '',
  images = [],
  type = 'snap',
  autoplay = 0,
  duration = 1,
  ease = 'elastic.out(1, 0.8)',
  showControls = true,
  height,
}) {
  const scopeRef = useRef(null);
  const wrapRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const circleRef = useRef(null);
  const itemRefs = useRef([]);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const sliderStateRef = useRef({
    isDragging: false,
    arrowAnimating: false,
    autoplayTimer: null,
    autoplayTween: null,
    draggableInstance: null,
    resizeTimeout: null,
    circlePath: null,
    targetRotation: 0,
  });
  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const container = containerRef.current;
      const svg = svgRef.current;
      const circle = circleRef.current;
      const items = itemRefs.current.filter(Boolean);
      if (
        !wrap ||
        !container ||
        !svg ||
        !circle ||
        !items.length ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return;
      const itemCount = items.length;
      const stepAngle = 360 / itemCount;
      const isSnap = 'snap' === type;
      const state = sliderStateRef.current;
      state.isDragging = false;
      state.circlePath = null;
      state.targetRotation = 0;
      const layout = (preserveRotation = false) => {
        const viewportWidth = window.innerWidth;
        const firstImage = items[0]?.querySelector('.circular_slider_image');
        const circleSize = Math.max(
          (firstImage ? firstImage.offsetWidth : 360) *
            (parseFloat(
              getComputedStyle(wrap).getPropertyValue('--anm-circle-multiplier') || '',
            ) || 8),
          viewportWidth + 800,
        );
        const rotation =
          preserveRotation && state.draggableInstance
            ? gsap.getProperty(container, 'rotation')
            : 0;
        state.targetRotation =
          preserveRotation && isSnap ? gsap.utils.snap(stepAngle, rotation) : rotation;
        gsap.set(container, {
          position: 'absolute',
          width: circleSize,
          height: circleSize,
          left: '50%',
          top: '50%',
          xPercent: -50,
          display: 'block',
          overflow: 'visible',
          padding: 0,
          gap: 0,
          rotation,
          force3D: true,
        });
        gsap.set(svg, {
          display: 'block',
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        });
        gsap.set(items, {
          position: 'absolute',
          flex: 'none',
        });
        if (!state.circlePath) {
          state.circlePath = MotionPathPlugin.convertToPath(circle, false)[0];
          state.circlePath.id = 'cs-path-' + Math.random().toString(36).slice(2, 9);
          svg.prepend(state.circlePath);
        }
        gsap.set(items, {
          force3D: true,
          motionPath: {
            path: state.circlePath,
            align: state.circlePath,
            alignOrigin: [0.5, 0.5],
            start: -0.25,
            end: (index) => index / itemCount - 0.25,
            autoRotate: true,
          },
        });
      };
      const stopAutoplay = () => {
        state.autoplayTimer &&
          (clearInterval(state.autoplayTimer), (state.autoplayTimer = null));
        state.autoplayTween && (state.autoplayTween.kill(), (state.autoplayTween = null));
      };
      const rotateByStep = (direction) => {
        if (state.draggableInstance) {
          if (!state.arrowAnimating) {
            const rotation = gsap.getProperty(container, 'rotation');
            state.targetRotation = isSnap ? gsap.utils.snap(stepAngle, rotation) : rotation;
          }
          state.targetRotation += direction * stepAngle;
          state.arrowAnimating = true;
          gsap.to(container, {
            rotation: state.targetRotation,
            duration,
            ease,
            overwrite: 'auto',
            force3D: true,
          });
        }
      };
      const startAutoplay = () => {
        if (!(autoplay <= 0) && !state.isDragging)
          if (isSnap)
            state.autoplayTimer ||
              (state.autoplayTimer = setInterval(() => {
                state.isDragging || rotateByStep(-1);
              }, autoplay));
          else {
            const rotation = gsap.getProperty(container, 'rotation');
            state.autoplayTween = gsap.to(container, {
              rotation: rotation - 360,
              duration: (autoplay / 1e3) * 10,
              ease: 'none',
              repeat: -1,
            });
          }
      };
      const setupDraggable = () => {
        state.draggableInstance &&
          (state.draggableInstance.kill(), (state.draggableInstance = null));
        state.draggableInstance = Draggable.create(container, {
          type: 'rotation',
          inertia: true,
          cursor: 'grab',
          activeCursor: 'grabbing',
          allowNativeTouchScrolling: true,
          snap: !!isSnap && ((angle) => gsap.utils.snap(stepAngle, angle)),
          onDragStart() {
            state.isDragging = true;
            state.arrowAnimating = false;
            stopAutoplay();
          },
          onDragEnd() {
            state.isDragging = false;
            startAutoplay();
          },
        })[0];
      };
      layout();
      setupDraggable();
      startAutoplay();
      const handleResize = () => {
        clearTimeout(state.resizeTimeout);
        state.resizeTimeout = setTimeout(() => {
          stopAutoplay();
          layout(true);
          setupDraggable();
          state.isDragging || startAutoplay();
        }, 250);
      };
      const handleVisibility = () => {
        document.hidden ? stopAutoplay() : state.isDragging || startAutoplay();
      };
      const prevButton = prevRef.current;
      const nextButton = nextRef.current;
      const handlePrevious = () => {
        stopAutoplay();
        rotateByStep(1);
        startAutoplay();
      };
      const handleNext = () => {
        stopAutoplay();
        rotateByStep(-1);
        startAutoplay();
      };
      window.addEventListener('resize', handleResize);
      document.addEventListener('visibilitychange', handleVisibility);
      prevButton?.addEventListener('click', handlePrevious);
      nextButton?.addEventListener('click', handleNext);
      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibility);
        prevButton?.removeEventListener('click', handlePrevious);
        nextButton?.removeEventListener('click', handleNext);
        clearTimeout(state.resizeTimeout);
        stopAutoplay();
        state.draggableInstance &&
          (state.draggableInstance.kill(), (state.draggableInstance = null));
        state.circlePath?.parentNode &&
          state.circlePath.parentNode.removeChild(state.circlePath);
        state.circlePath = null;
      };
    },
    {
      scope: scopeRef,
      dependencies: [type, autoplay, duration, ease, images.length],
      revertOnUpdate: true,
    },
  );
  return (
    <div
      ref={scopeRef}
      className={['circular_slider_demo_wrap', className].filter(Boolean).join(' ')}
    >
      <div
        ref={wrapRef}
        className="circular_slider_wrap"
        data-anm-circular-slider
        style={
          height
            ? {
                '--anm-slider-height': height,
              }
            : undefined
        }
      >
        <div
          ref={containerRef}
          className="circular_slider_container"
          data-anm-circular-slider-container
        >
          <svg ref={svgRef} className="circular_slider_svg" viewBox="0 0 200 200">
            <circle
              ref={circleRef}
              className="circular_slider_path"
              data-anm-circular-slider-path
              cx="100"
              cy="100"
              r="100"
            />
          </svg>
          {images.map((image, index) => (
            <div
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className="circular_slider_item"
              data-anm-circular-slider-item
              key={index}
            >
              <img src={image.src} alt={image.alt} className="circular_slider_image" />
            </div>
          ))}
        </div>
      </div>
      {showControls && (
        <div className="circular_slider_controls">
          <button
            ref={prevRef}
            className="circular_slider_arrow"
            data-anm-circular-slider-prev
            aria-label="Previous slide"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            ref={nextRef}
            className="circular_slider_arrow"
            data-anm-circular-slider-next
            aria-label="Next slide"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
