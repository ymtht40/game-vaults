// Variable Mapping: s -> systemBlocks, l -> system, o -> properly, c -> getPlatformX, d -> forever

// UNRESOLVED: original source path or export names are absent from this chunk.
import { ANNNIMATE_EASE } from '@/components/motion/IsometricFigure'; // NOTE: module id: 576720

const systemBlocks = [
  [0, 0, 56, true],
  [1, 0, 32],
  [0, 1, 40],
  [1, 1, 20],
];
// NOTE: module id: 913846
export const system = {
  model: () =>
    systemBlocks.map(([column, row, height, accent]) => ({
      x: -44 + 44 * column,
      y: -44 + 44 * row,
      z: 0,
      w: 44,
      d: 44,
      h: height,
      accent: !!accent,
    })),
  cycle: (timeline, boxes) => {
    boxes.forEach((box, index) =>
      timeline.to(
        box,
        {
          x: box.x + (systemBlocks[index][0] ? 20 : -20),
          y: box.y + (systemBlocks[index][1] ? 20 : -20),
          duration: 0.7,
          ease: ANNNIMATE_EASE,
        },
        0.05 * index,
      ),
    );
    boxes.forEach((box, index) =>
      timeline.to(
        box,
        {
          x: box.x,
          y: box.y,
          duration: 0.8,
          ease: ANNNIMATE_EASE,
        },
        1 + 0.05 * index,
      ),
    );
    timeline.to(
      {},
      {
        duration: 0.5,
      },
    );
  },
};
// NOTE: module id: 913846
export const properly = {
  model: () =>
    Array.from(
      {
        length: 5,
      },
      (unused, index) => {
        const size = 104 - 20 * index;
        return {
          x: -size / 2,
          y: -size / 2,
          z: 14 * index,
          w: size,
          d: size,
          h: 14,
          accent: 4 === index,
        };
      },
    ),
  cycle: (timeline, boxes, elements) => {
    for (let i = 4; i > 0; i--) {
      const n = (4 - i) * 0.08;
      timeline
        .to(
          boxes[i],
          {
            z: 14 * i + 56,
            duration: 0.5,
            ease: ANNNIMATE_EASE,
          },
          n,
        )
        .to(
          elements[i],
          {
            opacity: 0,
            duration: 0.4,
            ease: ANNNIMATE_EASE,
          },
          n,
        );
    }
    for (let i = 1; i < 5; i++) {
      const n = 1 + (i - 1) * 0.14 + 0.12 * (4 === i);
      timeline
        .to(
          boxes[i],
          {
            z: 14 * i,
            duration: 0.6,
            ease: ANNNIMATE_EASE,
          },
          n,
        )
        .to(
          elements[i],
          {
            opacity: 1,
            duration: 0.4,
            ease: ANNNIMATE_EASE,
          },
          n,
        );
    }
    timeline.to(
      {},
      {
        duration: 0.5,
      },
    );
  },
};
const getPlatformX = (index) => -30 + (index - 1) * 76;
// NOTE: module id: 913846
export const forever = {
  model: () =>
    [0, 1, 2].flatMap((index) => [
      {
        x: getPlatformX(index),
        y: -30,
        z: 0,
        w: 60,
        d: 60,
        h: 6,
      },
      {
        x: getPlatformX(index) + 16,
        y: -14,
        z: 6,
        w: 28,
        d: 28,
        h: 28,
        accent: true,
        ...(index
          ? {
              o: 0,
            }
          : {}),
      },
    ]),
  cycle: (timeline, boxes, elements) => {
    [1, 2].forEach((index, offset) => {
      const position = 0.35 * offset;
      timeline
        .set(
          boxes[2 * index + 1],
          {
            z: 76,
          },
          0,
        )
        .to(
          boxes[2 * index + 1],
          {
            z: 6,
            duration: 0.7,
            ease: ANNNIMATE_EASE,
          },
          position,
        )
        .to(
          elements[2 * index + 1],
          {
            opacity: 1,
            duration: 0.5,
            ease: ANNNIMATE_EASE,
          },
          position,
        );
    });
    timeline
      .to(
        [elements[3], elements[5]],
        {
          opacity: 0,
          duration: 0.5,
          ease: ANNNIMATE_EASE,
        },
        1.9,
      )
      .to(
        {},
        {
          duration: 0.3,
        },
      );
  },
};
