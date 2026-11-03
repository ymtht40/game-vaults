
'use client';

import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, Texture } from 'three';

import { loadImageBitmap } from '@/libs/utils/loadImageBitmap';
import { logGlobePerformance } from '@/features/globe/utils/globeDiagnostics';

export function useImageTextures(images) {
  const { gl } = useThree();
  const [, forceUpdate] = useState(0);

  const textureStateRef = useRef({
    textures: [],
    uploaded: new Set(),
    target: 0,
    loadedCount: 0,
    initialized: false,
  });

  useEffect(() => {
    const textureState = textureStateRef.current;

    if (textureState.initialized) {
      return;
    }

    textureState.initialized = true;

    const targetCount = Math.min(70, images.length);
    textureState.target = targetCount;

    if (targetCount === 0) {
      return;
    }

    const startTime = performance.now();

    let cancelled = false;
    let nextIndex = 0;
    let activeLoads = 0;

    const scheduledHandles = new Set();

    function scheduleNext() {
      if (cancelled) {
        return;
      }

      while (
        activeLoads < 4 &&
        nextIndex < targetCount
      ) {
        const index = nextIndex++;

        activeLoads++;

        const handle =
          typeof requestIdleCallback === 'function'
            ? requestIdleCallback(
                () => loadTexture(index, handle),
                { timeout: 2000 },
              )
            : setTimeout(
                () => loadTexture(index, null),
                0,
              );

        if (handle) {
          scheduledHandles.add(handle);
        }
      }
    }

    async function loadTexture(index, handle) {
      if (handle) {
        scheduledHandles.delete(handle);
      }

      if (cancelled) {
        return;
      }

      try {
        const bitmap = await loadImageBitmap(images[index], {
          maxWidth: 384,
        });

        if (cancelled) {
          bitmap.close?.();
          return;
        }

        const texture = new Texture(bitmap);

        texture.colorSpace = SRGBColorSpace;

        texture.anisotropy = Math.min(
          4,
          gl.capabilities.getMaxAnisotropy(),
        );

        texture.flipY = false;
        texture.needsUpdate = true;

        const uploadStart = performance.now();

        gl.initTexture(texture);

        const uploadDuration =
          performance.now() - uploadStart;

        if (uploadDuration > 10) {
          logGlobePerformance(
            `upload-slow #${index} ${uploadDuration.toFixed(1)}ms`,
          );
        }

        textureState.textures[index] = texture;
        textureState.uploaded.add(index);
        textureState.loadedCount++;

        forceUpdate((value) => value + 1);

        if (textureState.loadedCount === targetCount) {
          logGlobePerformance(
            `textures-ready (${(performance.now() - startTime).toFixed(0)}ms total)`,
          );
        }
      } catch {
        textureState.loadedCount++;
      } finally {
        activeLoads--;
        scheduleNext();
      }
    }

    scheduleNext();

    return () => {
      cancelled = true;

      for (const handle of scheduledHandles) {
        if (typeof cancelIdleCallback === 'function') {
          try {
            cancelIdleCallback(handle);
          } catch {
            clearTimeout(handle);
          }
        } else {
          clearTimeout(handle);
        }
      }

      scheduledHandles.clear();

      for (const texture of textureState.textures) {
        texture?.dispose();
      }

      textureState.textures = [];
      textureState.uploaded.clear();
      textureState.target = 0;
      textureState.loadedCount = 0;
      textureState.initialized = false;
    };
  }, [images, gl]);

  return {
    textures: textureStateRef.current.textures,
    uploaded: textureStateRef.current.uploaded,
  };
}

