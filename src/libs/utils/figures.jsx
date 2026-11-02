// Variable Mapping: f -> TRACK_BASE, m -> CUBE_ACCENT, x -> createTargetMarker, g -> WIDE_TRACK_BASE, h -> LANE_Y_OFFSETS, y -> createLaneCube, w -> LANE_START_X, b -> createThresholdPlane, v -> addPause, j -> fadeResetBoxes, V -> createSingleEaseFigure, E -> createMultiLaneFigure, H -> createStaggerFigure, M -> createYoyoFigure, O -> createRepeatFigure, z -> createPositionParamFigure, A -> createTimelineFigure, Z -> createDelayedCallFigure, N -> createTimeScaleFigure, k -> EASING_FIGURES, C -> TIMELINE_FIGURES, P -> CORE_API_FIGURES, L -> createScrollIndicator, S -> createSplitCharBox, _ -> SQUARE_BOARD_BASE, F -> PLUGIN_FIGURES, R -> REACT_FIGURES, T -> DOC_FIGURES, $ -> ALL_FIGURES, B -> COMMON_EASES, I -> createInteractiveEaseSpec, q -> INTERACTIVE_SPECS

import gsap from 'gsap'; // NOTE: module id: 989970
import { CustomEase } from 'gsap/CustomEase'; // NOTE: module id: 563208
import { CustomBounce } from 'gsap/CustomBounce';
import { CustomWiggle } from 'gsap/CustomWiggle'; // NOTE: module id: 885067
import { RoughEase, SlowMo } from 'gsap/EasePack'; // NOTE: module id: 757760

gsap.registerPlugin(CustomEase, CustomBounce, CustomWiggle, RoughEase, SlowMo);

CustomEase.create('figCustom', 'M0,0 C0.7,0 0.16,1 1,1');
CustomBounce.create('figBounce', { strength: 0.55, squash: 0 });
CustomWiggle.create('figWiggle', { wiggles: 6, type: 'easeOut' });

const TRACK_BASE = { x: -120, y: -20, z: 0, w: 240, d: 40, h: 6 };
const CUBE_ACCENT = {
  x: -110,
  y: -12,
  z: 6,
  w: 24,
  d: 24,
  h: 24,
  accent: true,
};
const createTargetMarker = (x, overrides = {}) => ({
  ...CUBE_ACCENT,
  x,
  h: 0,
  accent: false,
  dashed: true,
  ...overrides,
});

const WIDE_TRACK_BASE = { x: -120, y: -46, z: 0, w: 240, d: 92, h: 6 };
const LANE_Y_OFFSETS = [-40, -12, 16];
const createLaneCube = (x, laneIndex, overrides = {}) => ({
  x,
  y: LANE_Y_OFFSETS[laneIndex],
  z: 6,
  w: 20,
  d: 20,
  h: 20,
  ...overrides,
});
const LANE_START_X = -112;
const createThresholdPlane = (x, overrides = {}) => ({
  x,
  y: -46,
  z: 6,
  w: 2,
  d: 92,
  h: 34,
  dashed: true,
  ...overrides,
});

const addPause = (tl, duration) => tl.to({}, { duration });

function fadeResetBoxes(tl, targets, resetStates) {
  const groups = targets.map((item) => item.g);
  tl.to(groups, { opacity: 0, duration: 0.2 });
  targets.forEach(({ b }, index) => tl.set(b, resetStates[index]));
  tl.to(groups, { opacity: 1, duration: 0.2 });
  addPause(tl, 0.3);
}

function createSingleEaseFigure(ease, duration = 1) {
  return {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: 86, duration, ease });
      addPause(tl, 0.45);
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  };
}

function createMultiLaneFigure(animateLanes, { posts = [], tail = 0.45 } = {}) {
  return {
    model: () => [
      { ...WIDE_TRACK_BASE },
      ...posts.map((postX) => createThresholdPlane(postX)),
      ...LANE_Y_OFFSETS.map((_, laneIndex) =>
        createLaneCube(LANE_START_X, laneIndex, { accent: laneIndex === 0 })
      ),
    ],
    cycle: (tl, boxes, groups) => {
      const startIndex = 1 + posts.length;
      animateLanes(tl, boxes.slice(startIndex));
      addPause(tl, tail);
      fadeResetBoxes(
        tl,
        LANE_Y_OFFSETS.map((_, laneIndex) => ({
          b: boxes[startIndex + laneIndex],
          g: groups[startIndex + laneIndex],
        })),
        LANE_Y_OFFSETS.map(() => ({ x: LANE_START_X, z: 6 }))
      );
    },
  };
}

function createStaggerFigure(staggerAmount) {
  return {
    model: () => [
      { ...TRACK_BASE },
      ...Array.from({ length: 5 }, (_, index) => ({
        ...CUBE_ACCENT,
        x: -110 + 46 * index,
        w: 20,
        d: 20,
        h: 20,
        y: -10,
        accent: index === 0,
      })),
    ],
    cycle: (tl, boxes) => {
      boxes.slice(1).forEach((box, index) =>
        tl.to(
          box,
          {
            z: 40,
            duration: 0.35,
            ease: 'power2.inOut',
            repeat: 1,
            yoyo: true,
          },
          index * staggerAmount
        )
      );
      addPause(tl, 0.5);
    },
  };
}

function createYoyoFigure(ease, duration) {
  return {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes) => {
      tl.to(boxes[2], { x: 86, duration, ease, repeat: 1, yoyo: true });
      addPause(tl, 0.4);
    },
  };
}

function createRepeatFigure(repeat, repeatDelay) {
  return {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes) => {
      tl.to(boxes[2], {
        x: 86,
        duration: 0.5,
        ease: 'power2.inOut',
        repeat,
        repeatDelay,
      });
      tl.set(boxes[2], { x: -110 });
      addPause(tl, 0.5);
    },
  };
}

function createPositionParamFigure(position) {
  return createMultiLaneFigure((tl, laneBoxes) => {
    tl.to(laneBoxes[0], { x: 92, duration: 0.9, ease: 'power3.inOut' })
      .to(
        laneBoxes[1],
        { x: 92, duration: 0.9, ease: 'power3.inOut' },
        position
      )
      .to(laneBoxes[2], { x: 92, duration: 0.9, ease: 'power3.inOut' }, '<');
  });
}

function createTimelineFigure(duration) {
  return createMultiLaneFigure((tl, laneBoxes) =>
    laneBoxes.forEach((box) =>
      tl.to(box, { x: 92, duration, ease: 'power3.inOut' })
    )
  );
}

function createDelayedCallFigure(delay) {
  return {
    model: () => [
      { ...TRACK_BASE },
      { x: -110, y: 24, z: 6, w: 80, d: 4, h: 4 },
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[1], { w: 0, duration: delay, ease: 'none' }).to(boxes[2], {
        x: 86,
        duration: 0.7,
        ease: 'expo.out',
      });
      addPause(tl, 0.4);
      tl.set(boxes[1], { w: 80 });
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  };
}

function createTimeScaleFigure(scale) {
  return {
    model: () => [
      { ...WIDE_TRACK_BASE },
      createLaneCube(LANE_START_X, 0, { accent: true }),
      createLaneCube(LANE_START_X, 2),
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[1], { x: 92, duration: 1.2, ease: 'power2.inOut' }, 0).to(
        boxes[2],
        { x: 92, duration: 1.2 / scale, ease: 'power2.inOut' },
        0
      );
      addPause(tl, 0.45);
      fadeResetBoxes(
        tl,
        [
          { b: boxes[1], g: groups[1] },
          { b: boxes[2], g: groups[2] },
        ],
        [{ x: LANE_START_X }, { x: LANE_START_X }]
      );
    },
  };
}

const EASING_FIGURES = {
  'back-out': createSingleEaseFigure('back.out(2)'),
  circ: createSingleEaseFigure('circ.out'),
  'custom-bounce': createSingleEaseFigure('figBounce', 1.4),
  'custom-ease': createSingleEaseFigure('figCustom'),
  'custom-wiggle': {
    model: () => [{ ...TRACK_BASE }, { ...CUBE_ACCENT, x: -12 }],
    cycle: (tl, boxes) => {
      tl.to(boxes[1], { x: 28, duration: 1.4, ease: 'figWiggle' });
      addPause(tl, 0.5);
    },
  },
  'ease-in-out': createSingleEaseFigure('power3.inOut'),
  'ease-reverse': {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes) => {
      tl.to(boxes[2], { x: 86, duration: 0.9, ease: 'expo.out' });
      addPause(tl, 0.35);
      tl.to(boxes[2], { x: -110, duration: 0.9, ease: 'expo.out' });
      addPause(tl, 0.4);
    },
  },
  'elastic-ease': createSingleEaseFigure('elastic.out(1, 0.35)', 1.6),
  'expo-out': createSingleEaseFigure('expo.out'),
  'power4-out': createSingleEaseFigure('power4.out'),
  rough: createSingleEaseFigure(
    'rough({ strength: 1.5, points: 24, template: power2.out, taper: none, randomize: false, clamp: false })',
    1.2
  ),
  sine: createSingleEaseFigure('sine.inOut'),
  slow: createSingleEaseFigure('slow(0.7, 0.7, false)', 1.6),
  steps: createSingleEaseFigure('steps(6)', 1.2),
};

const TIMELINE_FIGURES = {
  'gsap-timeline': createTimelineFigure(0.5),
  keyframes: {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-30),
      createTargetMarker(50),
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[3], {
        keyframes: [
          { x: -30, duration: 0.45, ease: 'power2.inOut' },
          { z: 40, duration: 0.3, ease: 'power2.out' },
          { x: 50, duration: 0.45, ease: 'power2.inOut' },
          { z: 6, duration: 0.3, ease: 'power2.in' },
        ],
      });
      addPause(tl, 0.4);
      fadeResetBoxes(tl, [{ b: boxes[3], g: groups[3] }], [{ x: -110 }]);
    },
  },
  'nested-timelines': createMultiLaneFigure((tl, laneBoxes) =>
    laneBoxes.forEach((box, index) => {
      const nestedTl = gsap.timeline();
      nestedTl
        .to(box, { z: 30, duration: 0.25, ease: 'power2.out' })
        .to(box, { z: 6, duration: 0.25, ease: 'power2.in' })
        .to(box, { x: 92, duration: 0.5, ease: 'power3.inOut' });
      tl.add(nestedTl, 0.35 * index);
    })
  ),
  'position-parameter': createPositionParamFigure('<0.3'),
  'repeat-repeatdelay': createRepeatFigure(2, 0.3),
  'seamless-loop': {
    model: () => [
      { ...TRACK_BASE },
      ...Array.from({ length: 5 }, (_, index) => ({
        ...CUBE_ACCENT,
        x: -110 + 44 * index,
        w: 20,
        d: 20,
        h: 20,
        y: -10,
        accent: index === 4,
      })),
      {
        ...CUBE_ACCENT,
        x: -154,
        w: 20,
        d: 20,
        h: 20,
        y: -10,
        accent: false,
        o: 0,
      },
    ],
    cycle: (tl, boxes, groups) => {
      const visibleCubes = boxes.slice(1, 6);
      visibleCubes.forEach((cube) =>
        tl.to(cube, { x: cube.x + 44, duration: 0.8, ease: 'none' }, 0)
      );
      tl.to(groups[5], { opacity: 0, duration: 0.8, ease: 'none' }, 0)
        .to(boxes[6], { x: -110, duration: 0.8, ease: 'none' }, 0)
        .to(groups[6], { opacity: 1, duration: 0.8, ease: 'none' }, 0)
        .add(() => {
          visibleCubes.forEach((cube, index) => {
            cube.x = -110 + 44 * index;
          });
          boxes[6].x = -154;
        })
        .set(groups[5], { opacity: 1 })
        .set(groups[6], { opacity: 0 });
    },
  },
  stagger: createStaggerFigure(0.08),
  'timeline-controls': {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: -12, duration: 0.6, ease: 'none' });
      addPause(tl, 0.4);
      tl.to(boxes[2], { x: -50, duration: 0.3, ease: 'none' });
      addPause(tl, 0.25);
      tl.to(boxes[2], { x: 86, duration: 0.9, ease: 'none' });
      addPause(tl, 0.35);
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  },
  'timeline-labels': {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-50),
      createTargetMarker(10),
      createTargetMarker(86),
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      [-50, 10, 86].forEach((stopX) => {
        tl.to(boxes[4], { x: stopX, duration: 0.4, ease: 'power3.inOut' });
        addPause(tl, 0.25);
      });
      fadeResetBoxes(tl, [{ b: boxes[4], g: groups[4] }], [{ x: -110 }]);
    },
  },
  timescale: createTimeScaleFigure(2),
  yoyo: createYoyoFigure('power2.inOut', 0.8),
};

const CORE_API_FIGURES = {
  callbacks: {
    model: () => [
      { ...TRACK_BASE },
      { x: 116, y: -18, z: 6, w: 4, d: 4, h: 0, accent: true },
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: 86, duration: 0.8, ease: 'expo.out' }).to(boxes[1], {
        h: 40,
        duration: 0.3,
        ease: 'back.out(2)',
      });
      addPause(tl, 0.5);
      tl.to(boxes[1], { h: 0, duration: 0.2 });
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  },
  'delayed-call': createDelayedCallFigure(0.8),
  'get-property': createMultiLaneFigure((tl, laneBoxes) => {
    tl.to(laneBoxes[0], { x: 20, duration: 0.7, ease: 'expo.out' });
    addPause(tl, 0.2);
    tl.to(laneBoxes[2], { x: 20, duration: 0.5, ease: 'power3.out' });
  }),
  'gsap-effects': createMultiLaneFigure((tl, laneBoxes) =>
    laneBoxes.forEach((box, index) => {
      tl.to(
        box,
        { z: 30, x: LANE_START_X + 60, duration: 0.3, ease: 'power2.out' },
        0.25 * index
      ).to(box, { z: 6, duration: 0.25, ease: 'power2.in' }, 0.25 * index + 0.3);
    })
  ),
  'gsap-set': {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes) => {
      addPause(tl, 0.2);
      tl.set(boxes[2], { x: 86 });
      addPause(tl, 0.9);
      tl.set(boxes[2], { x: -110 });
      addPause(tl, 0.6);
    },
  },
  'gsap-ticker': {
    model: () => [
      { ...TRACK_BASE },
      ...Array.from({ length: 6 }, (_, index) => ({
        x: -106 + 38 * index,
        y: -6,
        z: 6,
        w: 8,
        d: 8,
        h: 0,
        accent: index === 5,
      })),
    ],
    cycle: (tl, boxes) => {
      boxes.slice(1).forEach((bar, index) =>
        tl.to(bar, { h: 30, duration: 0.08, ease: 'none' }, 0.2 * index)
      );
      addPause(tl, 0.4);
      tl.to(boxes.slice(1), { h: 0, duration: 0.25, ease: 'power2.in' });
      addPause(tl, 0.3);
    },
  },
  'gsap-utils': {
    model: () => [
      { ...TRACK_BASE, y: -46 },
      { x: -60, y: 6, z: 0, w: 120, d: 40, h: 6 },
      { ...CUBE_ACCENT, y: -38 },
      { ...CUBE_ACCENT, x: -54, y: 14, w: 20, d: 20, h: 20, accent: false },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: 86, duration: 1, ease: 'power2.inOut' }, 0).to(
        boxes[3],
        { x: 34, duration: 1, ease: 'power2.inOut' },
        0
      );
      addPause(tl, 0.4);
      fadeResetBoxes(
        tl,
        [
          { b: boxes[2], g: groups[2] },
          { b: boxes[3], g: groups[3] },
        ],
        [{ x: -110 }, { x: -54 }]
      );
    },
  },
  'immediate-render': {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-110),
      { ...CUBE_ACCENT, x: 86 },
    ],
    cycle: (tl, boxes) => {
      addPause(tl, 0.2);
      tl.set(boxes[2], { x: -110 });
      addPause(tl, 0.35);
      tl.to(boxes[2], { x: 86, duration: 0.8, ease: 'expo.out' });
      addPause(tl, 0.6);
    },
  },
  snap: {
    model: () => [
      ...Array.from({ length: 5 }, (_, index) => ({
        x: -120 + 49 * index,
        y: -20,
        z: 0,
        w: 45,
        d: 40,
        h: 6,
      })),
      { ...CUBE_ACCENT, x: -110 },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[5], { x: -12, duration: 0.6, ease: 'power3.out' });
      addPause(tl, 0.3);
      tl.to(boxes[5], { x: 86, duration: 0.6, ease: 'power3.out' });
      addPause(tl, 0.35);
      fadeResetBoxes(tl, [{ b: boxes[5], g: groups[5] }], [{ x: -110 }]);
    },
  },
  'to-from-fromto': {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-110),
      createTargetMarker(86),
      { ...CUBE_ACCENT, x: -12 },
    ],
    cycle: (tl, boxes, groups) => {
      addPause(tl, 0.2);
      tl.set(boxes[3], { x: -110 });
      tl.to(boxes[3], { x: 86, duration: 0.8, ease: 'expo.out' }, '+=0.25');
      addPause(tl, 0.4);
      fadeResetBoxes(tl, [{ b: boxes[3], g: groups[3] }], [{ x: -12 }]);
    },
  },
};

const createScrollIndicator = (x = LANE_START_X) =>
  createLaneCube(x, 0, { h: 10 });
const createSplitCharBox = (index, overrides = {}) => ({
  x: -110 + 44 * index,
  y: -10,
  z: 6,
  w: 44,
  d: 20,
  h: 14,
  accent: index === 0,
  ...overrides,
});
const SQUARE_BOARD_BASE = { x: -100, y: -80, z: 0, w: 200, d: 160, h: 6 };

const PLUGIN_FIGURES = {
  draggable: {
    model: () => [
      { ...SQUARE_BOARD_BASE },
      { ...CUBE_ACCENT, x: -86, y: -66 },
    ],
    cycle: (tl, boxes) => {
      tl.to(boxes[1], {
        keyframes: [
          { x: -10, y: -60, duration: 0.4, ease: 'power1.inOut' },
          { x: 20, y: 10, duration: 0.45, ease: 'power1.inOut' },
          { x: 60, y: 40, duration: 0.4, ease: 'power2.out' },
        ],
      });
      addPause(tl, 0.35);
      tl.to(boxes[1], { x: -86, y: -66, duration: 0.6, ease: 'power3.inOut' });
      addPause(tl, 0.3);
    },
  },
  flip: {
    model: () => [
      { ...TRACK_BASE },
      { ...CUBE_ACCENT, x: 86, accent: false },
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes) => {
      tl.to(boxes[2], { x: 86, duration: 0.8, ease: 'power3.inOut' }, 0)
        .to(
          boxes[2],
          { z: 40, duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 },
          0
        )
        .to(boxes[1], { x: -110, duration: 0.8, ease: 'power3.inOut' }, 0);
      addPause(tl, 0.4);
      tl.to(boxes[2], { x: -110, duration: 0.8, ease: 'power3.inOut' }, '>')
        .to(
          boxes[2],
          { z: 40, duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 },
          '<'
        )
        .to(boxes[1], { x: 86, duration: 0.8, ease: 'power3.inOut' }, '<');
      addPause(tl, 0.3);
    },
  },
  inertia: createSingleEaseFigure('power4.out', 1.6),
  'match-media': {
    model: () => [
      { ...SQUARE_BOARD_BASE },
      ...[0, 1, 2].map((index) => ({
        ...CUBE_ACCENT,
        x: -80 + 60 * index,
        y: -12,
        accent: index === 0,
      })),
    ],
    cycle: (tl, boxes) => {
      boxes.slice(1).forEach((box, index) =>
        tl.to(
          box,
          { x: -12, y: -66 + 46 * index, duration: 0.6, ease: 'power3.inOut' },
          0
        )
      );
      boxes.slice(1).forEach((box, index) =>
        tl.to(
          box,
          { x: -80 + 60 * index, y: -12, duration: 0.6, ease: 'power3.inOut' },
          1.1
        )
      );
      addPause(tl, 0.4);
    },
  },
  'motion-path': {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: 86, duration: 1.1, ease: 'power1.inOut' }, 0).to(
        boxes[2],
        { z: 64, duration: 0.55, ease: 'sine.out', yoyo: true, repeat: 1 },
        0
      );
      addPause(tl, 0.4);
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  },
  observer: {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-46),
      createTargetMarker(18),
      createTargetMarker(86),
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      [-46, 18, 86].forEach((stopX) => {
        tl.to(boxes[4], { x: stopX, duration: 0.35, ease: 'expo.out' });
        addPause(tl, 0.35);
      });
      fadeResetBoxes(tl, [{ b: boxes[4], g: groups[4] }], [{ x: -110 }]);
    },
  },
  'quick-to': {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(-40), { ...CUBE_ACCENT }],
    cycle: (tl, boxes) => {
      [-40, 50, -10, 86, -110].forEach((targetX, index) => {
        tl.set(boxes[1], { x: targetX }, 0.45 * index).to(
          boxes[2],
          { x: targetX, duration: 0.5, ease: 'power3.out' },
          0.45 * index + 0.05
        );
      });
      tl.set(boxes[1], { x: -40 });
      addPause(tl, 0.4);
    },
  },
};

const REACT_FIGURES = {
  'use-gsap': {
    model: () => [
      { ...TRACK_BASE },
      { ...TRACK_BASE, h: 0, dashed: true },
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: 86, duration: 0.8, ease: 'expo.out' });
      addPause(tl, 0.4);
      tl.to(groups[1], { opacity: 0, duration: 0.15 })
        .set(boxes[2], { x: -110 })
        .to(groups[1], { opacity: 1, duration: 0.15 });
      addPause(tl, 0.5);
    },
  },
  'gsap-context': createMultiLaneFigure(
    (tl, laneBoxes) => {
      tl.to(laneBoxes[0], { x: 40, duration: 0.6, ease: 'expo.out' }, 0)
        .to(laneBoxes[1], { x: 92, duration: 0.8, ease: 'expo.out' }, 0.1)
        .to(laneBoxes[2], { x: -20, z: 30, duration: 0.6, ease: 'expo.out' }, 0.2);
      addPause(tl, 0.4);
      tl.set(laneBoxes, { x: LANE_START_X, z: 6 });
    },
    { tail: 0.5 }
  ),
};

const DOC_FIGURES = {
  'doc-installation': {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-12),
      { ...CUBE_ACCENT, x: -12 },
    ],
    cycle: (tl, boxes) => {
      tl.to(boxes[2], { z: 70, duration: 0.5, ease: 'power2.out' }).to(
        boxes[2],
        { z: 6, duration: 0.6, ease: 'bounce.out' },
        '+=0.15'
      );
      addPause(tl, 0.5);
    },
  },
  'doc-quick-start': {
    model: () => [
      { x: -120, y: -20, z: 0, w: 90, d: 40, h: 6 },
      { x: 30, y: -20, z: 0, w: 90, d: 40, h: 6 },
      createTargetMarker(-90),
      createTargetMarker(64),
      { ...CUBE_ACCENT, x: -90 },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[4], { x: 64, duration: 0.9, ease: 'power3.inOut' }, 0).to(
        boxes[4],
        { z: 46, duration: 0.45, ease: 'sine.out', yoyo: true, repeat: 1 },
        0
      );
      addPause(tl, 0.5);
      fadeResetBoxes(tl, [{ b: boxes[4], g: groups[4] }], [{ x: -90 }]);
    },
  },
  'doc-customization': createMultiLaneFigure((tl, laneBoxes) => {
    tl.to(laneBoxes[0], { x: 92, duration: 0.6, ease: 'expo.out' }, 0)
      .to(laneBoxes[1], { x: 92, duration: 1.1, ease: 'power2.inOut' }, 0)
      .to(laneBoxes[2], { x: 92, duration: 0.8, ease: 'back.out(2)' }, 0);
  }),
  'doc-production': createMultiLaneFigure((tl, laneBoxes) => {
    tl.to(laneBoxes[0], { x: 92, duration: 0.9, ease: 'expo.out' }, 0).set(
      laneBoxes[2],
      { x: 92 },
      0.45
    );
  }),
  'doc-mcp': {
    model: () => [
      { x: -120, y: -20, z: 40, w: 70, d: 40, h: 6, dashed: true },
      { x: 40, y: -20, z: 0, w: 80, d: 40, h: 6 },
      createTargetMarker(68),
      { ...CUBE_ACCENT, x: -96, z: 46 },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[3], { x: 68, duration: 1, ease: 'power2.inOut' }, 0).to(
        boxes[3],
        { z: 6, duration: 1, ease: 'power2.in' },
        0
      );
      addPause(tl, 0.5);
      fadeResetBoxes(tl, [{ b: boxes[3], g: groups[3] }], [{ x: -96, z: 46 }]);
    },
  },
  'doc-webflow': {
    model: () => [
      ...[0, 1, 2, 3].map((index) => ({
        x: -100 + (index % 2) * 104,
        y: -60 + 64 * Math.floor(index / 2),
        z: 0,
        w: 96,
        d: 56,
        h: 4,
      })),
      createTargetMarker(16, { y: 8, z: 4 }),
      { ...CUBE_ACCENT, x: 16, y: 8, z: 4 },
    ],
    cycle: (tl, boxes) => {
      tl.set(boxes[5], { z: 70 }).to(
        boxes[5],
        { z: 4, duration: 0.7, ease: 'expo.out' },
        '+=0.15'
      );
      addPause(tl, 0.6);
    },
  },
};

const ALL_FIGURES = {
  ...EASING_FIGURES,
  ...TIMELINE_FIGURES,
  ...CORE_API_FIGURES,
  scrolltrigger: {
    model: () => [
      { ...WIDE_TRACK_BASE },
      createThresholdPlane(-20),
      createScrollIndicator(),
      createLaneCube(LANE_START_X, 2, { accent: true }),
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: 92, duration: 1.4, ease: 'none' }, 0).to(
        boxes[3],
        { x: 92, duration: 0.7, ease: 'expo.out' },
        0.62
      );
      addPause(tl, 0.4);
      fadeResetBoxes(
        tl,
        [
          { b: boxes[2], g: groups[2] },
          { b: boxes[3], g: groups[3] },
        ],
        [{ x: LANE_START_X }, { x: LANE_START_X }]
      );
    },
  },
  scrub: {
    model: () => [
      { ...WIDE_TRACK_BASE },
      createScrollIndicator(),
      createLaneCube(LANE_START_X, 2, { accent: true }),
    ],
    cycle: (tl, boxes) => {
      [
        [40, 0.7],
        [-20, 0.45],
        [92, 0.7],
        [LANE_START_X, 0.8],
      ].forEach(([targetX, duration]) => {
        tl.to(boxes[1], { x: targetX, duration, ease: 'power1.inOut' }).to(
          boxes[2],
          { x: targetX, duration, ease: 'power1.inOut' },
          '<'
        );
      });
      addPause(tl, 0.3);
    },
  },
  'toggle-actions': {
    model: () => [
      { ...WIDE_TRACK_BASE },
      createThresholdPlane(-20),
      createScrollIndicator(),
      createLaneCube(-6, 2, { accent: true }),
    ],
    cycle: (tl, boxes) => {
      tl.to(boxes[2], { x: 30, duration: 0.7, ease: 'none' }).to(
        boxes[3],
        { z: 36, duration: 0.4, ease: 'expo.out' },
        0.35
      );
      addPause(tl, 0.3);
      tl.to(boxes[2], { x: LANE_START_X, duration: 0.7, ease: 'none' }).to(
        boxes[3],
        { z: 6, duration: 0.4, ease: 'expo.in' },
        '<0.3'
      );
      addPause(tl, 0.4);
    },
  },
  pinning: {
    model: () => [
      { ...TRACK_BASE },
      { ...CUBE_ACCENT, x: 20, accent: false, w: 20, d: 20, h: 14, y: -10 },
      { ...CUBE_ACCENT, x: -40 },
    ],
    cycle: (tl, boxes) => {
      tl.to([boxes[0], boxes[1]], {
        x: '-=70',
        duration: 1,
        ease: 'power1.inOut',
      });
      addPause(tl, 0.35);
      tl.to([boxes[0], boxes[1]], {
        x: '+=70',
        duration: 0.8,
        ease: 'power1.inOut',
      });
      addPause(tl, 0.3);
    },
  },
  'horizontal-scroll': {
    model: () => [
      { ...TRACK_BASE },
      ...Array.from({ length: 5 }, (_, index) => ({
        x: -110 + 46 * index,
        y: -14,
        z: 6,
        w: 40,
        d: 28,
        h: 30,
        accent: index === 0,
      })),
    ],
    cycle: (tl, boxes) => {
      tl.to(boxes.slice(1), { x: '-=92', duration: 1.1, ease: 'none' });
      addPause(tl, 0.3);
      tl.to(boxes.slice(1), { x: '+=92', duration: 0.6, ease: 'power3.inOut' });
      addPause(tl, 0.3);
    },
  },
  'scroll-snapping': {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-30),
      createTargetMarker(50),
      createTargetMarker(86),
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      [-30, 50, 86].forEach((stopX) => {
        tl.to(boxes[4], { x: stopX - 18, duration: 0.35, ease: 'power1.out' }).to(
          boxes[4],
          { x: stopX, duration: 0.3, ease: 'power3.out' }
        );
        addPause(tl, 0.2);
      });
      fadeResetBoxes(tl, [{ b: boxes[4], g: groups[4] }], [{ x: -110 }]);
    },
  },
  'scroll-to': {
    model: () => [
      { ...TRACK_BASE },
      { x: 96, y: -20, z: 6, w: 2, d: 40, h: 34, dashed: true },
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: 72, duration: 1.1, ease: 'power2.inOut' });
      addPause(tl, 0.4);
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  },
  'scroll-smoother': {
    model: () => [
      { ...WIDE_TRACK_BASE },
      createScrollIndicator(),
      createLaneCube(LANE_START_X, 2, { accent: true }),
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[1], { x: 92, duration: 0.5, ease: 'power1.inOut' }, 0).to(
        boxes[2],
        { x: 92, duration: 1.3, ease: 'power3.out' },
        0.05
      );
      addPause(tl, 0.35);
      fadeResetBoxes(
        tl,
        [
          { b: boxes[1], g: groups[1] },
          { b: boxes[2], g: groups[2] },
        ],
        [{ x: LANE_START_X }, { x: LANE_START_X }]
      );
    },
  },
  'scroll-velocity': {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: 86, duration: 0.9, ease: 'power2.inOut' }, 0)
        .to(boxes[2], { w: 56, duration: 0.45, ease: 'power2.in' }, 0)
        .to(boxes[2], { w: 24, duration: 0.45, ease: 'power2.out' }, 0.45);
      addPause(tl, 0.4);
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  },
  'scrolltrigger-batch': {
    model: () => [
      { ...WIDE_TRACK_BASE },
      ...[0, 1, 2, 3, 4, 5].map((index) =>
        createLaneCube(-100 + (index % 3) * 70, index < 3 ? 0 : 2, {
          accent: index === 0,
          h: 0,
        })
      ),
    ],
    cycle: (tl, boxes) => {
      tl.to(
        boxes.slice(1, 4),
        { h: 22, duration: 0.4, ease: 'back.out(2)' },
        0.1
      ).to(
        boxes.slice(4),
        { h: 22, duration: 0.4, ease: 'back.out(2)' },
        0.75
      );
      addPause(tl, 0.5);
      tl.to(boxes.slice(1), { h: 0, duration: 0.25, ease: 'power2.in' });
      addPause(tl, 0.3);
    },
  },
  'invalidate-on-refresh': {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[0], { w: 170, duration: 0.5, ease: 'power2.inOut' }).to(
        boxes[1],
        { x: 16, duration: 0.5, ease: 'power2.inOut' },
        '<'
      );
      tl.to(boxes[2], { x: 16, duration: 0.8, ease: 'expo.out' });
      addPause(tl, 0.4);
      tl.to(boxes[0], { w: 240, duration: 0.4, ease: 'power2.inOut' }).to(
        boxes[1],
        { x: 86, duration: 0.4, ease: 'power2.inOut' },
        '<'
      );
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  },
  splittext: {
    model: () => [
      { ...TRACK_BASE },
      ...Array.from({ length: 5 }, (_, index) => createSplitCharBox(index)),
    ],
    cycle: (tl, boxes) => {
      boxes.slice(1).forEach((box, index) =>
        tl.to(
          box,
          {
            x: box.x + (index - 2) * 10,
            z: 6 + 6 * index,
            duration: 0.5,
            ease: 'power3.out',
          },
          0.04 * index
        )
      );
      addPause(tl, 0.4);
      boxes.slice(1).forEach((box, index) =>
        tl.to(
          box,
          { x: -110 + 44 * index, z: 6, duration: 0.5, ease: 'power3.inOut' },
          '<'
        )
      );
      addPause(tl, 0.4);
    },
  },
  'split-text-reveal': {
    model: () => [
      { ...TRACK_BASE },
      ...Array.from({ length: 5 }, (_, index) =>
        createSplitCharBox(index, { w: 40 })
      ),
    ],
    cycle: (tl, boxes) => {
      tl.set(boxes.slice(1), { h: 0 }).to(
        boxes.slice(1),
        { h: 14, duration: 0.45, ease: 'expo.out', stagger: 0.09 },
        '+=0.15'
      );
      addPause(tl, 0.6);
    },
  },
  scrambletext: {
    model: () => [
      { ...TRACK_BASE },
      ...Array.from({ length: 6 }, (_, index) => ({
        x: -108 + 37 * index,
        y: -8,
        z: 6,
        w: 12,
        d: 16,
        h: [16, 10, 20, 12, 18, 14][index],
        accent: index === 0,
      })),
    ],
    cycle: (tl, boxes) => {
      const targetHeights = [16, 10, 20, 12, 18, 14];
      for (let step = 0; step < 5; step++) {
        tl.to(boxes.slice(1), {
          h: () => 4 + Math.round(22 * Math.random()),
          duration: 0.09,
          ease: 'none',
        });
      }
      boxes.slice(1).forEach((box, index) =>
        tl.to(
          box,
          { h: targetHeights[index], duration: 0.15, ease: 'power2.out' },
          `>-${0.1 * !!index}`
        )
      );
      addPause(tl, 0.6);
    },
  },
  'text-plugin': {
    model: () => [
      { ...TRACK_BASE },
      ...Array.from({ length: 6 }, (_, index) => ({
        x: -108 + 37 * index,
        y: -8,
        z: 6,
        w: 28,
        d: 16,
        h: 12,
        accent: index === 5,
      })),
    ],
    cycle: (tl, _, groups) => {
      tl.set(groups.slice(1), { opacity: 0 });
      groups.slice(1).forEach((group, index) =>
        tl.set(group, { opacity: 1 }, 0.25 + 0.12 * index)
      );
      addPause(tl, 0.7);
    },
  },
  'draw-svg': {
    model: () => [
      { ...TRACK_BASE, h: 0, dashed: true },
      { x: -116, y: -2, z: 2, w: 226, d: 3, h: 3, accent: true },
      { x: 107, y: -2, z: 2, w: 3, d: 22, h: 3, accent: true },
    ],
    cycle: (tl, boxes) => {
      tl.set(boxes[1], { w: 0 })
        .set(boxes[2], { d: 0 })
        .to(boxes[1], { w: 226, duration: 0.8, ease: 'power2.inOut' }, '+=0.15')
        .to(boxes[2], { d: 22, duration: 0.3, ease: 'power2.out' });
      addPause(tl, 0.6);
    },
  },
  'morph-svg': {
    model: () => [{ ...TRACK_BASE }, { ...CUBE_ACCENT, x: -18 }],
    cycle: (tl, boxes) => {
      tl.to(boxes[1], {
        x: -60,
        w: 110,
        d: 34,
        h: 8,
        y: -17,
        duration: 0.55,
        ease: 'power3.inOut',
      })
        .to(
          boxes[1],
          {
            x: -10,
            w: 10,
            d: 10,
            h: 54,
            y: -5,
            duration: 0.55,
            ease: 'power3.inOut',
          },
          '+=0.15'
        )
        .to(
          boxes[1],
          {
            x: -18,
            w: 24,
            d: 24,
            h: 24,
            y: -12,
            duration: 0.55,
            ease: 'power3.inOut',
          },
          '+=0.15'
        );
      addPause(tl, 0.4);
    },
  },
  'auto-alpha': {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-12),
      { ...CUBE_ACCENT, x: -12 },
    ],
    cycle: (tl, _, groups) => {
      tl.to(groups[2], { opacity: 0, duration: 0.5, ease: 'power2.inOut' });
      addPause(tl, 0.5);
      tl.to(groups[2], { opacity: 1, duration: 0.5, ease: 'power2.inOut' });
      addPause(tl, 0.4);
    },
  },
  'force-3d': {
    model: () => [
      { ...TRACK_BASE },
      { ...TRACK_BASE, z: 34, h: 0, dashed: true, o: 0 },
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(groups[1], { opacity: 1, duration: 0.25 })
        .to(boxes[2], { z: 34, duration: 0.3, ease: 'power2.out' })
        .to(boxes[2], { x: 86, duration: 0.8, ease: 'expo.out' })
        .to(boxes[2], { z: 6, duration: 0.3, ease: 'power2.in' })
        .to(groups[1], { opacity: 0, duration: 0.25 });
      addPause(tl, 0.3);
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  },
  overwrite: {
    model: () => [{ ...TRACK_BASE }, createTargetMarker(86), { ...CUBE_ACCENT }],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: -40, duration: 0.5, ease: 'none' }, 0);
      tl.to(boxes[2], { x: -64, z: 40, duration: 0.6, ease: 'expo.out' }, 0.5);
      addPause(tl, 0.5);
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110, z: 6 }]);
    },
  },
  'will-change': {
    model: () => [
      { ...TRACK_BASE },
      {
        ...CUBE_ACCENT,
        x: -114,
        y: -16,
        w: 32,
        d: 32,
        h: 32,
        accent: false,
        dashed: true,
        o: 0,
      },
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(groups[1], { opacity: 1, duration: 0.25 })
        .to([boxes[1], boxes[2]], {
          x: (index) => (index ? 86 : 82),
          duration: 0.8,
          ease: 'expo.out',
        })
        .to(groups[1], { opacity: 0, duration: 0.25 }, '+=0.2');
      addPause(tl, 0.2);
      tl.set(boxes[1], { x: -114 });
      fadeResetBoxes(tl, [{ b: boxes[2], g: groups[2] }], [{ x: -110 }]);
    },
  },
  ...PLUGIN_FIGURES,
  ...REACT_FIGURES,
  'ssr-gsap': {
    model: () => [
      { ...TRACK_BASE },
      createTargetMarker(-12),
      { ...CUBE_ACCENT, x: -12 },
    ],
    cycle: (tl, boxes, groups) => {
      tl.set(groups[2], { opacity: 0 })
        .set(boxes[2], { z: 46 }, '+=0.2')
        .to(boxes[2], { z: 6, duration: 0.7, ease: 'expo.out' })
        .to(groups[2], { opacity: 1, duration: 0.4 }, '<');
      addPause(tl, 0.6);
    },
  },
  'vue-gsap': {
    model: () => [
      { ...TRACK_BASE },
      { ...TRACK_BASE, h: 0, dashed: true },
      { ...CUBE_ACCENT },
    ],
    cycle: (tl, boxes, groups) => {
      tl.to(boxes[2], { x: -12, z: 30, duration: 0.6, ease: 'expo.out' }).to(
        boxes[2],
        { z: 6, duration: 0.3, ease: 'power2.in' }
      );
      addPause(tl, 0.4);
      tl.to(groups[1], { opacity: 0, duration: 0.15 })
        .set(boxes[2], { x: -110 })
        .to(groups[1], { opacity: 1, duration: 0.15 });
      addPause(tl, 0.5);
    },
  },
  ...DOC_FIGURES,
};

const COMMON_EASES = [
  'none',
  'power2.out',
  'expo.out',
  'back.out(2)',
  'elastic.out(1, 0.35)',
  'steps(6)',
];

const createInteractiveEaseSpec = (defaultEase, defaultDuration = 1) => ({
  defaults: { ease: defaultEase, duration: defaultDuration },
  options: {
    ease: [
      defaultEase,
      ...COMMON_EASES.filter((ease) => ease !== defaultEase),
    ],
    duration: [...new Set([0.5, 1, 1.5, defaultDuration])].sort(
      (a, b) => a - b
    ),
  },
  code: [
    ['gsap.to(".box", {'],
    ['  x: 196,'],
    ['  duration: ', { p: 'duration' }, ','],
    ['  ease: ', { p: 'ease' }, ','],
    ['});'],
  ],
  figure: (params) => createSingleEaseFigure(params.ease, params.duration),
});

const INTERACTIVE_SPECS = {
  'back-out': createInteractiveEaseSpec('back.out(2)'),
  circ: createInteractiveEaseSpec('circ.out'),
  'ease-in-out': createInteractiveEaseSpec('power3.inOut'),
  'elastic-ease': createInteractiveEaseSpec('elastic.out(1, 0.35)', 1.6),
  'expo-out': createInteractiveEaseSpec('expo.out'),
  'power4-out': createInteractiveEaseSpec('power4.out'),
  sine: createInteractiveEaseSpec('sine.inOut'),
  slow: createInteractiveEaseSpec('slow(0.7, 0.7, false)', 1.6),
  steps: createInteractiveEaseSpec('steps(6)', 1.2),
  stagger: {
    defaults: { stagger: 0.08 },
    options: { stagger: [0.04, 0.08, 0.16, 0.3] },
    code: [
      ['gsap.to(".box", {'],
      ['  y: -34,'],
      ['  stagger: ', { p: 'stagger' }, ','],
      ['  repeat: 1,'],
      ['  yoyo: true,'],
      ['});'],
    ],
    figure: (params) => createStaggerFigure(params.stagger),
  },
  yoyo: {
    defaults: { duration: 0.8, ease: 'power2.inOut' },
    options: {
      duration: [0.4, 0.8, 1.2],
      ease: ['power2.inOut', 'expo.out', 'none', 'back.out(2)'],
    },
    code: [
      ['gsap.to(".box", {'],
      ['  x: 196,'],
      ['  duration: ', { p: 'duration' }, ','],
      ['  ease: ', { p: 'ease' }, ','],
      ['  repeat: 1,'],
      ['  yoyo: true,'],
      ['});'],
    ],
    figure: (params) => createYoyoFigure(params.ease, params.duration),
  },
  'repeat-repeatdelay': {
    defaults: { repeat: 2, repeatDelay: 0.3 },
    options: { repeat: [1, 2, 3], repeatDelay: [0, 0.3, 0.8] },
    code: [
      ['gsap.to(".box", {'],
      ['  x: 196,'],
      ['  repeat: ', { p: 'repeat' }, ','],
      ['  repeatDelay: ', { p: 'repeatDelay' }, ','],
      ['});'],
    ],
    figure: (params) => createRepeatFigure(params.repeat, params.repeatDelay),
  },
  'position-parameter': {
    defaults: { position: '<0.3' },
    options: { position: ['<', '<0.3', '>', '-=0.4'] },
    code: [
      ['const tl = gsap.timeline();'],
      ['tl.to(".a", { x: 196 })'],
      ['  .to(".b", { x: 196 }, ', { p: 'position' }, ')'],
      ['  .to(".c", { x: 196 }, "<");'],
    ],
    figure: (params) => createPositionParamFigure(params.position),
  },
  'gsap-timeline': {
    defaults: { duration: 0.5 },
    options: { duration: [0.3, 0.5, 0.8] },
    code: [
      ['const tl = gsap.timeline({'],
      ['  defaults: { duration: ', { p: 'duration' }, ' },'],
      ['});'],
      ['tl.to(".a", { x: 196 })'],
      ['  .to(".b", { x: 196 })'],
      ['  .to(".c", { x: 196 });'],
    ],
    figure: (params) => createTimelineFigure(params.duration),
  },
  'delayed-call': {
    defaults: { delay: 0.8 },
    options: { delay: [0.3, 0.8, 1.5] },
    code: [
      ['gsap.delayedCall(', { p: 'delay' }, ', () => {'],
      ['  gsap.to(".box", { x: 196, ease: "expo.out" });'],
      ['});'],
    ],
    figure: (params) => createDelayedCallFigure(params.delay),
  },
  timescale: {
    defaults: { scale: 2 },
    options: { scale: [0.5, 1, 2, 4] },
    code: [
      ['const tween = gsap.to(".box", {'],
      ['  x: 196,'],
      ['  duration: 1.2,'],
      ['});'],
      ['tween.timeScale(', { p: 'scale' }, ');'],
    ],
    figure: (params) => createTimeScaleFigure(params.scale),
  },
};

// NOTE: module id: 158024
export function getFigureDefinition(key) {
  return ALL_FIGURES[key] || null;
}

export function getInteractiveFigureSpec(key) {
  return INTERACTIVE_SPECS[key] || null;
}

export { getFigureDefinition as I, getInteractiveFigureSpec as s };

