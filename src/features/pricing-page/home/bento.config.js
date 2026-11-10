import { boxEase, setBoxVisibility } from '@/components/canvas/IsoBoxes'; // NOTE: module id: 576720

const awardHeights = [50, 80, 32];

// NOTE: module id: 392197
export const awardFig = {
  model: () => [
    ...[-1, 0, 1].map((step, idx) => ({
      x: -24 + 50 * step,
      y: -24 - 50 * step,
      z: 0,
      w: 48,
      d: 48,
      h: awardHeights[idx],
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
          ease: boxEase,
          stagger: 0.05,
        },
        0
      )
      .to(
        boxes[3],
        {
          z: 6,
          duration: 0.6,
          ease: boxEase,
        },
        0.05
      )
      .to(
        boxes[0],
        {
          h: awardHeights[0],
          duration: 0.8,
          ease: boxEase,
        },
        0.9
      )
      .to(
        boxes[2],
        {
          h: awardHeights[2],
          duration: 0.8,
          ease: boxEase,
        },
        1
      )
      .to(
        boxes[1],
        {
          h: awardHeights[1],
          duration: 0.9,
          ease: boxEase,
        },
        1.15
      )
      .to(
        boxes[3],
        {
          z: awardHeights[1],
          duration: 0.9,
          ease: boxEase,
        },
        1.15
      )
      .to(
        {},
        {
          duration: 0.5,
        }
      );
  },
};

// NOTE: module id: 392197
export const formatsFig = {
  model: () =>
    [-1, 0, 1].map((step) => ({
      x: -28 + 52 * step,
      y: -28 - 52 * step,
      z: 0,
      w: 56,
      d: 56,
      h: 56,
      accent: step === 0,
    })),
  cycle: (timeline, boxes) => {
    timeline.to(
      boxes,
      {
        x: -28,
        y: -28,
        duration: 0.7,
        ease: boxEase,
      },
      0
    );
    boxes.forEach((box) =>
      timeline.to(
        box,
        {
          x: box.x,
          y: box.y,
          duration: 0.8,
          ease: boxEase,
        },
        1
      )
    );
    timeline.to(
      {},
      {
        duration: 0.5,
      }
    );
  },
};

// NOTE: module id: 392197
export const agentFig = {
  model: () => {
    const boxes = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row !== 1 || col !== 1) {
          boxes.push({
            x: -68 + 48 * row,
            y: -68 + 48 * col,
            z: 0,
            w: 40,
            d: 40,
            h: 4,
            depth: row + col,
          });
        }
      }
    }
    boxes.sort((a, b) => a.depth - b.depth);
    const insertIdx = boxes.findIndex((box) => box.depth > 2);
    boxes.splice(
      insertIdx,
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
      }
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
          ease: boxEase,
        },
        0
      )
      .to(
        piece,
        {
          z: 0,
          duration: 0.7,
          ease: boxEase,
        },
        1
      )
      .to(
        {},
        {
          duration: 0.6,
        }
      );
  },
};

const easeCurve = (step) => 14 + 96 * (1 - Math.pow(2, (-10 * step) / 8));

// NOTE: module id: 392197
export const valuesFig = {
  model: () =>
    Array.from({ length: 9 }, (_, idx) => ({
      x: -66 + 16 * idx,
      y: -32,
      z: 0,
      w: 5,
      d: 64,
      h: easeCurve(idx),
      accent: idx === 8,
    })),
  cycle: (timeline, boxes) => {
    const state = { v: 0 };
    const update = () =>
      boxes.forEach((box, idx) => {
        box.h =
          easeCurve(idx) +
          (14 + (idx / 8) * 96 - easeCurve(idx)) * state.v;
      });
    timeline
      .to(
        state,
        {
          v: 1,
          duration: 0.9,
          ease: boxEase,
          onUpdate: update,
        },
        0
      )
      .to(
        state,
        {
          v: 0,
          duration: 0.9,
          ease: boxEase,
          onUpdate: update,
        },
        1.3
      )
      .to(
        {},
        {
          duration: 0.5,
        }
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
export const codeFig = {
  model: () =>
    codeOffsets.map((offset, idx) => ({
      x: -45,
      y: -45,
      z: 16 * idx,
      w: 90,
      d: 90,
      h: 10,
      accent: idx === codeOffsets.length - 1,
    })),
  cycle: (timeline, boxes) => {
    boxes.forEach((box, idx) =>
      timeline.to(
        box,
        {
          x: box.x + codeOffsets[idx][0],
          y: box.y + codeOffsets[idx][1],
          duration: 0.6,
          ease: boxEase,
        },
        0.05 * idx
      )
    );
    boxes.forEach((box, idx) =>
      timeline.to(
        box,
        {
          x: box.x,
          y: box.y,
          duration: 0.8,
          ease: boxEase,
        },
        0.9 + (boxes.length - 1 - idx) * 0.05
      )
    );
    timeline.to(
      {},
      {
        duration: 0.5,
      }
    );
  },
};

// NOTE: module id: 392197
export const weeklyFig = {
  model: () => [
    ...Array.from({ length: 9 }, (_, idx) => ({
      x: -117 + 26 * idx,
      y: -40,
      z: 0,
      w: 4,
      d: 80,
      h: 110,
      accent: idx === 8,
    })),
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
    boxes.slice(0, 9).forEach((box, idx) =>
      timeline.to(
        box,
        {
          x: -117 + 26 * (idx - 1),
          duration: 0.8,
          ease: boxEase,
        },
        0
      )
    );
    timeline
      .to(
        elements[0],
        {
          opacity: 0,
          duration: 0.8,
          ease: boxEase,
        },
        0
      )
      .add(() => setBoxVisibility(elements[8], false), 0.15)
      .to(
        boxes[9],
        {
          x: 91,
          duration: 0.8,
          ease: boxEase,
        },
        0.1
      )
      .to(
        elements[9],
        {
          opacity: 1,
          duration: 0.8,
          ease: boxEase,
        },
        0.1
      )
      .to(
        {},
        {
          duration: 0.5,
        }
      )
      .add(() => {
        boxes.slice(0, 9).forEach((box, idx) => {
          box.x = -117 + 26 * idx;
        });
        boxes[9].x = 117;
      })
      .set(elements[0], {
        opacity: 1,
      })
      .add(() => setBoxVisibility(elements[8], true))
      .set(elements[9], {
        opacity: 0,
      });
  },
};

export { formatsFig as formats, valuesFig as values, weeklyFig as weekly };
