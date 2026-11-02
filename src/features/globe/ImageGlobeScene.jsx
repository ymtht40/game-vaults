
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Euler,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';

import { logGlobePerformance } from '@/features/globe/utils/globeDiagnostics';

import ImageCard from '@/features/globe/ImageCard'; // module id: 607601

import { useImageTextures } from '@/hooks/useImageTextures'; // module id: 607601

const TILT_ANGLE = Math.PI / 7;

const GOLDEN_ANGLE =
  Math.PI * (3 - Math.sqrt(5));

export default function ImageGlobeScene({
  images,
  wantsPlay,
  reducedMotion,
}) {
  const rotatingGroupRef = useRef(null);

  const interactionRef = useRef({
    spin: 0,
    inertia: 0,
    dragAccum: 0,
    dragging: false,
    lastX: 0,
    firstRenderLogged: false,
    frames: 0,
    droppedFrames: 0,
    maxDt: 0,
    lastLog: performance.now(),
  });

  const {
    textures,
    uploaded,
  } = useImageTextures(images);

  const imagePositions = useMemo(() => {
    const positions = [];

    for (let index = 0; index < 70; index++) {
      const normalizedY = 1 - (index / 69) * 2;

      const horizontalRadius = Math.sqrt(
        Math.max(
          0,
          1 - normalizedY * normalizedY,
        ),
      );

      const angle = index * GOLDEN_ANGLE;

      const x =
        Math.cos(angle) * horizontalRadius * 3;

      const y = 3 * normalizedY;

      const z =
        Math.sin(angle) * horizontalRadius * 3;

      const orientationMatrix = new Matrix4().lookAt(
        new Vector3(x, y, z),
        new Vector3(2 * x, 2 * y, 2 * z),
        new Vector3(0, 1, 0),
      );

      const quaternion = new Quaternion()
        .setFromRotationMatrix(orientationMatrix);

      const euler = new Euler()
        .setFromQuaternion(quaternion);

      positions.push({
        position: [x, y, z],
        rotation: [euler.x, euler.y, euler.z],
        revealDelay: 0.7 * Math.random(),
      });
    }

    return positions;
  }, []);

  useFrame((_state, delta) => {
    const interaction = interactionRef.current;

    interaction.frames++;

    if (delta > interaction.maxDt) {
      interaction.maxDt = delta;
    }

    if (delta > 0.033) {
      interaction.droppedFrames++;
    }

    if (!interaction.firstRenderLogged) {
      interaction.firstRenderLogged = true;
      logGlobePerformance('first-render');
    }

    const dragDelta =
      -0.0015 * interaction.dragAccum;

    interaction.dragAccum = 0;

    if (interaction.dragging) {
      interaction.inertia =
        delta > 0
          ? Math.max(
              -1.4,
              Math.min(1.4, dragDelta / delta),
            )
          : 0;
    } else {
      interaction.inertia *= Math.exp(
        -2.4 * delta,
      );
    }

    if (!reducedMotion) {
      interaction.spin += -0.05 * delta;
    }

    interaction.spin += dragDelta;

    if (!interaction.dragging) {
      interaction.spin +=
        interaction.inertia * delta;
    }

    if (rotatingGroupRef.current) {
      rotatingGroupRef.current.rotation.y =
        interaction.spin;
    }

    const now = performance.now();

    if (now - interaction.lastLog > 1000) {
      const fps =
        interaction.frames /
        ((now - interaction.lastLog) / 1000);

      logGlobePerformance(
        `fps=${fps.toFixed(0)} maxDt=${(1000 * interaction.maxDt).toFixed(1)}ms dropped=${interaction.droppedFrames}`,
      );

      interaction.frames = 0;
      interaction.droppedFrames = 0;
      interaction.maxDt = 0;
      interaction.lastLog = now;
    }
  });

  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const interaction = interactionRef.current;

    function handlePointerDown(event) {
      interaction.dragging = true;
      interaction.lastX = event.clientX;

      canvas.setPointerCapture?.(
        event.pointerId,
      );

      canvas.style.cursor = 'grabbing';
    }

    function handlePointerMove(event) {
      if (interaction.dragging) {
        interaction.dragAccum +=
          event.clientX - interaction.lastX;

        interaction.lastX = event.clientX;
      }
    }

    function handlePointerUp(event) {
      if (interaction.dragging) {
        interaction.dragging = false;

        canvas.releasePointerCapture?.(
          event.pointerId,
        );

        canvas.style.cursor = 'grab';
      }
    }

    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'pan-y';

    canvas.addEventListener(
      'pointerdown',
      handlePointerDown,
    );

    canvas.addEventListener(
      'pointermove',
      handlePointerMove,
    );

    canvas.addEventListener(
      'pointerup',
      handlePointerUp,
    );

    canvas.addEventListener(
      'pointercancel',
      handlePointerUp,
    );

    return () => {
      canvas.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );

      canvas.removeEventListener(
        'pointermove',
        handlePointerMove,
      );

      canvas.removeEventListener(
        'pointerup',
        handlePointerUp,
      );

      canvas.removeEventListener(
        'pointercancel',
        handlePointerUp,
      );
    };
  }, [gl]);

  return (
    <group
      rotation={[
        -TILT_ANGLE,
        0,
        -(0.4 * TILT_ANGLE),
      ]}
    >
      <group ref={rotatingGroupRef}>
        {imagePositions.map((image, index) => {
          const texture = textures[index];

          return texture && uploaded.has(index) ? (
            <ImageCard
              key={index}
              position={image.position}
              rotation={image.rotation}
              texture={texture}
              wantsPlay={wantsPlay}
              revealDelay={image.revealDelay}
              reducedMotion={reducedMotion}
            />
          ) : null;
        })}
      </group>
    </group>
  );
}

