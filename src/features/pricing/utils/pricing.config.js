/* Variable Mapping:
   p -> DEFAULT_COMPONENT_COUNT
   b -> landingPlans
   j -> soloPlan
   v -> studioPlan
   N -> soloFig
   E -> emptyFig
   z -> revealFig
   C -> menuFig
*/

import { appConfig } from '@/libs/config/appConfig'; // NOTE: module id: 516799 // UNRESOLVED: name guessed from usage
import { ANNNIMATE_IN_OUT_EASE } from '@/components/motion/IsometricFigure'; // NOTE: module id: 576720 // UNRESOLVED: name guessed from usage

// NOTE: module id: 586818
export const DEFAULT_COMPONENT_COUNT = appConfig?.animationStats?.totalCount ?? 50;

// NOTE: module id: 586818
export const landingPlans = appConfig.stripe.landingPlans;

// NOTE: module id: 586818
export const soloPlan = landingPlans.find((plan) => plan.key === 'solo');

// NOTE: module id: 586818
export const studioPlan = landingPlans.find((plan) => plan.perSeat);

// NOTE: module id: 586818
export const soloFig = {
  model: () => [
    { x: -60, y: -60, z: 0, w: 120, d: 120, h: 4 },
    { x: -26, y: -26, z: 4, w: 52, d: 52, h: 52, accent: true },
  ],
  cycle: (tl, boxes) => {
    tl.to(boxes[1], { z: 40, duration: 0.6, ease: ANNNIMATE_IN_OUT_EASE }, 0)
      .to(boxes[1], { z: 4, duration: 0.6, ease: ANNNIMATE_IN_OUT_EASE }, 0.8)
      .to({}, { duration: 0.5 });
  },
};

// NOTE: module id: 586818
export const emptyFig = {
  model: () => [],
  cycle: () => {},
};

// NOTE: module id: 586818
export const revealFig = {
  model: () => [
    { x: -70, y: -45, z: 0, w: 140, d: 90, h: 4 },
    { x: -58, y: -32, z: 4, w: 64, d: 14, h: 0, o: 0 },
    { x: -58, y: -8, z: 4, w: 40, d: 10, h: 0, o: 0 },
    { x: 22, y: -30, z: 4, w: 36, d: 50, h: 0, o: 0 },
    { x: -70, y: -45, z: 6, w: 140, d: 90, h: 4, accent: true },
  ],
  cycle: (tl, boxes, elements) => {
    tl.to(boxes[4], { z: 96, duration: 0.8, ease: ANNNIMATE_IN_OUT_EASE }, 0).to(
      elements[4],
      { opacity: 0, duration: 0.5, ease: ANNNIMATE_IN_OUT_EASE },
      0.35
    );
    [1, 2, 3].forEach((boxIdx, stepIdx) => {
      tl.to(elements[boxIdx], { opacity: 1, duration: 0.2, ease: 'none' }, 0.45 + 0.1 * stepIdx).to(
        boxes[boxIdx],
        { h: boxIdx === 3 ? 30 : 6, duration: 0.6, ease: ANNNIMATE_IN_OUT_EASE },
        0.45 + 0.1 * stepIdx
      );
    });
    tl.to(boxes.slice(1, 4), { h: 0, duration: 0.5, ease: ANNNIMATE_IN_OUT_EASE, stagger: 0.05 }, 2)
      .to(elements.slice(1, 4), { opacity: 0, duration: 0.2, ease: 'none' }, 2.4)
      .to(elements[4], { opacity: 1, duration: 0.4, ease: ANNNIMATE_IN_OUT_EASE }, 2.1)
      .to(boxes[4], { z: 6, duration: 0.7, ease: ANNNIMATE_IN_OUT_EASE }, 2.1)
      .to({}, { duration: 0.4 });
  },
};

// NOTE: module id: 586818
export const menuFig = {
  model: () => [
    { x: -70, y: -45, z: 0, w: 140, d: 90, h: 4 },
    { x: -70, y: -45, z: 4, w: 4, d: 90, h: 4, accent: true },
    ...[0, 1, 2].map((idx) => ({
      x: -64,
      y: -36 + 26 * idx,
      z: 8,
      w: 40,
      d: 14,
      h: 0,
      o: 0,
    })),
  ],
  cycle: (tl, boxes, elements) => {
    tl.to(boxes[1], { w: 56, duration: 0.7, ease: ANNNIMATE_IN_OUT_EASE }, 0);
    [2, 3, 4].forEach((boxIdx, stepIdx) => {
      tl.to(elements[boxIdx], { opacity: 1, duration: 0.2, ease: 'none' }, 0.45 + 0.1 * stepIdx).to(
        boxes[boxIdx],
        { h: 5, duration: 0.5, ease: ANNNIMATE_IN_OUT_EASE },
        0.45 + 0.1 * stepIdx
      );
    });
    tl.to(boxes.slice(2), { h: 0, duration: 0.4, ease: ANNNIMATE_IN_OUT_EASE, stagger: { each: 0.05, from: 'end' } }, 1.8)
      .to(elements.slice(2), { opacity: 0, duration: 0.2, ease: 'none' }, 2.1)
      .to(boxes[1], { w: 4, duration: 0.6, ease: ANNNIMATE_IN_OUT_EASE }, 2.1)
      .to({}, { duration: 0.4 });
  },
};
