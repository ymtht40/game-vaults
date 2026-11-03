'use client';

import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/libs/utils/vendor';
import {
  formatPoint,
  getBoxFaces,
  prefersReducedMotion,
} from '@/features/docs/utils/figureUtils';

export function useFigureHover(targetRef, figure, dependencies = []) {
  const timelineRef = useRef(null);
  const isHoveredRef = useRef(false);

  const rest = useMemo(
    () => figure.model(),
    [figure, ...dependencies],
  );

  useGSAP(
    () => {
      const boxElements = gsap.utils.selector(targetRef.current)('[data-box]');
      const animatedBoxes = figure.model();

      const timeline = gsap.timeline({
        paused: true,

        onUpdate: () => {
          animatedBoxes.forEach((box, boxIndex) => {
            getBoxFaces(box).forEach((face, faceIndex) => {
              boxElements[boxIndex]?.children[faceIndex]?.setAttribute(
                'points',
                face.map(formatPoint).join(' '),
              );
            });
          });
        },

        onComplete: () =>
          !figure.hold && isHoveredRef.current && timeline.restart(),
      });

      figure.cycle(timeline, animatedBoxes, boxElements);

      timelineRef.current = timeline;

      return () => {
        timeline.kill();
      };
    },
    {
      scope: targetRef,
      dependencies: [figure, ...dependencies],
    },
  );

  return {
    rest,

    onEnter: () => {
      isHoveredRef.current = true;

      const timeline = timelineRef.current;

      if (!prefersReducedMotion() && timeline) {
        if (figure.hold) {
          timeline.play();
        } else if (!timeline.isActive()) {
          timeline.restart();
        }
      }
    },

    onLeave: () => {
      isHoveredRef.current = false;

      if (figure.hold) {
        timelineRef.current?.reverse();
      }
    },

    play: () => {
      isHoveredRef.current = false;

      const timeline = timelineRef.current;

      if (!prefersReducedMotion() && timeline) {
        timeline.restart();
      }
    },
  };
}
