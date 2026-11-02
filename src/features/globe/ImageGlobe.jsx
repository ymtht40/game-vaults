
'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';

import { logGlobePerformance } from '@/features/globe/utils/globeDiagnostics';

import ImageGlobeScene from '@/features/globe/ImageGlobeScene'; // module id: 607601
import WebGLWarmup from '@/features/globe/WebGLWarmup'; // module id: 607601

import { useWebGLSupport } from '@/hooks/useWebGLSupport'; // module id: 143848

export default function ImageGlobe({
  images = [],
  wantsPlay = false,
  active = true,
}) {
  logGlobePerformance('mount');

  const [reducedMotion, setReducedMotion] =
    useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    setReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener?.(
      'change',
      handleChange,
    );

    return () => {
      mediaQuery.removeEventListener?.(
        'change',
        handleChange,
      );
    };
  }, []);

  const isWebGLSupported = useWebGLSupport();

  if (!isWebGLSupported) {
    return null;
  }

  return (
    <Canvas
      className="size-full block"
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      }}
      camera={{
        position: [0, 0, 11],
        fov: 35,
      }}
      style={{
        background: 'transparent',
      }}
      onCreated={({ gl }) => {
        logGlobePerformance('r3f-created');

        gl.domElement.addEventListener(
          'webglcontextlost',
          (event) => event.preventDefault(),
        );
      }}
    >
      <WebGLWarmup />

      <ImageGlobeScene
        images={images}
        wantsPlay={wantsPlay}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

