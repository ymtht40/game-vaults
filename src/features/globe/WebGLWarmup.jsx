
'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

import { logGlobePerformance } from '@/features/globe/utils/globeDiagnostics';

export default function WebGLWarmup() {
  const { gl, scene, camera } = useThree();
  const hasWarmedUpRef = useRef(false);

  useEffect(() => {
    if (hasWarmedUpRef.current) {
      return;
    }

    hasWarmedUpRef.current = true;

    const warmup = () => {
      const startTime = performance.now();

      try {
        gl.compile(scene, camera);
      } catch {
      }

      logGlobePerformance(
        `warmup ${(performance.now() - startTime).toFixed(1)}ms`,
      );
    };

    if (typeof requestIdleCallback === 'function') {
      const requestId = requestIdleCallback(warmup, {
        timeout: 500,
      });

      return () => {
        cancelIdleCallback(requestId);
      };
    }

    const timeoutId = setTimeout(warmup, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [gl, scene, camera]);

  return null;
}

