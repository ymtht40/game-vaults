
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DoubleSide, PlaneGeometry } from 'three';

const CARD_GEOMETRY = new PlaneGeometry(0.6, 0.44);

export default function ImageCard({
  position,
  rotation,
  texture,
  wantsPlay,
  revealDelay,
  reducedMotion,
}) {
  const meshRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        Number(Boolean(reducedMotion)),
      );
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!wantsPlay || !meshRef.current) {
      return;
    }

    if (reducedMotion) {
      meshRef.current.scale.setScalar(1);
      return;
    }

    tweenRef.current?.kill();

    tweenRef.current = gsap.to(meshRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.1,
      ease: 'power3.out',
      delay: revealDelay,
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [wantsPlay, revealDelay, reducedMotion]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      geometry={CARD_GEOMETRY}
      frustumCulled={false}
    >
      <meshBasicMaterial
        map={texture}
        side={DoubleSide}
      />
    </mesh>
  );
}

