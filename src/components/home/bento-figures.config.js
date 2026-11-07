// Variable Mapping: o -> awardHeights, c -> award, d -> formats, u -> agent, g -> getEasedHeight, h -> values, p -> codeOffsets, f -> code, m -> weekly

// UNRESOLVED: original source path or export names are absent from this chunk.
import { ANNNIMATE_EASE, setBoxAccentElement } from '@/features/common/IsometricFigure'; // NOTE: module id: 576720



const awardHeights = [50, 80, 32];
// NOTE: module id: 392197
export const award = {
  model: () => [
    ...[-1, 0, 1].map((offset, index) => ({
      x: -24 + 50 * offset,
      y: -24 - 50 * offset,
      z: 0,
      w: 48,
      d: 48,
      h: awardHeights[index],
    })),
    {
      x: -12,
      y: -12,
      z: awardHeights[1],
      w: 24,
      d: 24,
      h: 24,
      accent: true,
    },
  ],
  cycle: (timeline, boxes) => {
    timeline
      .to(
        boxes.slice(0, 3),
        {
          h: 6,
          duration: 0.6,
          ease: ANNNIMATE_EASE,
          stagger: 0.05,
        },
        0,
      )
      .to(
        boxes[3],
        {
          z: 6,
          duration: 0.6,
          ease: ANNNIMATE_EASE,
        },
        0.05,
      )
      .to(
        boxes[0],
        {
          h: awardHeights[0],
          duration: 0.8,
          ease: ANNNIMATE_EASE,
        },
        0.9,
      )
      .to(
        boxes[2],
        {
          h: awardHeights[2],
          duration: 0.8,
          ease: ANNNIMATE_EASE,
        },
        1,
      )
      .to(
        boxes[1],
        {
          h: awardHeights[1],
          duration: 0.9,
          ease: ANNNIMATE_EASE,
        },
        1.15,
      )
      .to(
        boxes[3],
        {
          z: awardHeights[1],
          duration: 0.9,
          ease: ANNNIMATE_EASE,
        },
        1.15,
      )
      .to(
        {},
        {
          duration: 0.5,
        },
      );
  },
};
// NOTE: module id: 392197
export const formats = {
  model: () =>
    [-1, 0, 1].map((offset) => ({
      x: -28 + 52 * offset,
      y: -28 - 52 * offset,
      z: 0,
      w: 56,
      d: 56,
      h: 56,
      accent: 0 === offset,
    })),
  cycle: (timeline, boxes) => {
    timeline.to(
      boxes,
      {
        x: -28,
        y: -28,
        duration: 0.7,
        ease: ANNNIMATE_EASE,
      },
      0,
    );
    boxes.forEach((box) =>
      timeline.to(
        box,
        {
          x: box.x,
          y: box.y,
          duration: 0.8,
          ease: ANNNIMATE_EASE,
        },
        1,
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
// NOTE: module id: 392197
export const agent = {
  model: () => {
    const boxes = [];
    for (let column = 0; column < 3; column++)
      for (let row = 0; row < 3; row++)
        (1 !== column || 1 !== row) &&
          boxes.push({
            x: -68 + 48 * column,
            y: -68 + 48 * row,
            z: 0,
            w: 40,
            d: 40,
            h: 4,
            depth: column + row,
          });
    boxes.sort((first, second) => first.depth - second.depth);
    const insertionIndex = boxes.findIndex((box) => box.depth > 2);
    boxes.splice(
      insertionIndex,
      0,
      {
        x: -20,
        y: -20,
        z: 0,
        w: 40,
        d: 40,
        h: 0,
        dashed: true,
      },
      {
        x: -20,
        y: -20,
        z: 0,
        w: 40,
        d: 40,
        h: 40,
        accent: true,
        piece: true,
      },
    );
    return boxes;
  },
  cycle: (timeline, boxes) => {
    const piece = boxes.find((box) => box.piece);
    timeline
      .to(
        piece,
        {
          z: 80,
          duration: 0.7,
          ease: ANNNIMATE_EASE,
        },
        0,
      )
      .to(
        piece,
        {
          z: 0,
          duration: 0.7,
          ease: ANNNIMATE_EASE,
        },
        1,
      )
      .to(
        {},
        {
          duration: 0.6,
        },
      );
  },
};
const getEasedHeight = (index) => 14 + 96 * (1 - Math.pow(2, (-10 * index) / 8));
// NOTE: module id: 392197
export const values = {
  model: () =>
    Array.from(
      {
        length: 9,
      },
      (unused, index) => ({
        x: -66 + 16 * index,
        y: -32,
        z: 0,
        w: 5,
        d: 64,
        h: getEasedHeight(index),
        accent: 8 === index,
      }),
    ),
  cycle: (timeline, boxes) => {
    const progress = {
      v: 0,
    };
    const updateHeights = () =>
      boxes.forEach(
        (box, index) =>
          (box.h =
            getEasedHeight(index) +
            (14 + (index / 8) * 96 - getEasedHeight(index)) * progress.v),
      );
    timeline
      .to(
        progress,
        {
          v: 1,
          duration: 0.9,
          ease: ANNNIMATE_EASE,
          onUpdate: updateHeights,
        },
        0,
      )
      .to(
        progress,
        {
          v: 0,
          duration: 0.9,
          ease: ANNNIMATE_EASE,
          onUpdate: updateHeights,
        },
        1.3,
      )
      .to(
        {},
        {
          duration: 0.5,
        },
      );
  },
};
const codeOffsets = [
  [-18, 10],
  [14, -16],
  [-10, -14],
  [16, 12],
];
// NOTE: module id: 392197
export const code = {
  model: () =>
    codeOffsets.map((unused, index) => ({
      x: -45,
      y: -45,
      z: 16 * index,
      w: 90,
      d: 90,
      h: 10,
      accent: index === codeOffsets.length - 1,
    })),
  cycle: (timeline, boxes) => {
    boxes.forEach((box, index) =>
      timeline.to(
        box,
        {
          x: box.x + codeOffsets[index][0],
          y: box.y + codeOffsets[index][1],
          duration: 0.6,
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
        0.9 + (boxes.length - 1 - index) * 0.05,
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
// NOTE: module id: 392197
export const weekly = {
  model: () => [
    ...Array.from(
      {
        length: 9,
      },
      (unused, index) => ({
        x: -117 + 26 * index,
        y: -40,
        z: 0,
        w: 4,
        d: 80,
        h: 110,
        accent: 8 === index,
      }),
    ),
    {
      x: 117,
      y: -40,
      z: 0,
      w: 4,
      d: 80,
      h: 110,
      accent: true,
      o: 0,
    },
  ],
  cycle: (timeline, boxes, elements) => {
    boxes.slice(0, 9).forEach((box, index) =>
      timeline.to(
        box,
        {
          x: -117 + 26 * (index - 1),
          duration: 0.8,
          ease: ANNNIMATE_EASE,
        },
        0,
      ),
    );
    timeline
      .to(
        elements[0],
        {
          opacity: 0,
          duration: 0.8,
          ease: ANNNIMATE_EASE,
        },
        0,
      )
      .add(() => setBoxAccentElement(elements[8], false), 0.15)
      .to(
        boxes[9],
        {
          x: 91,
          duration: 0.8,
          ease: ANNNIMATE_EASE,
        },
        0.1,
      )
      .to(
        elements[9],
        {
          opacity: 1,
          duration: 0.8,
          ease: ANNNIMATE_EASE,
        },
        0.1,
      )
      .to(
        {},
        {
          duration: 0.5,
        },
      )
      .add(() => {
        boxes.slice(0, 9).forEach((box, index) => (box.x = -117 + 26 * index));
        boxes[9].x = 117;
      })
      .set(elements[0], {
        opacity: 1,
      })
      .add(() => setBoxAccentElement(elements[8], true))
      .set(elements[9], {
        opacity: 0,
      });
  },
};
