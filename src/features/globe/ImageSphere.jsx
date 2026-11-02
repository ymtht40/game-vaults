'use client';

// Variable Mapping: c -> TILT_ANGLE, d -> GOLDEN_ANGLE, f -> CARD_GEOMETRY, m -> debugLog, p -> ShaderWarmup, g -> SphereCard, h -> SphereScene, w -> uploaded, x -> cardTransforms, y -> gl

import { useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import { Canvas } from '@react-three/fiber'; // NOTE: module id: 575056
import { useFrame } from '@react-three/fiber'; // NOTE: module id: 925234
import { useThree } from '@react-three/fiber'; // NOTE: module id: 828600
import {
  CanvasTexture,
  DoubleSide,
  Euler,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from 'three'; // NOTE: module id: 190072
import gsap from 'gsap'; // NOTE: module id: 989970
import { loadImageBitmap } from '@/libs/utils/loadImageBitmap'; // NOTE: module id: 457714
import { useWebGLSupport } from '@/hooks/useWebGLSupport'; // NOTE: module id: 143848

const TILT_ANGLE = Math.PI / 7;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const CARD_GEOMETRY = new PlaneGeometry(0.6, 0.44);

function debugLog(message) {}

function ShaderWarmup() {
  const { gl, scene, camera } = useThree();
  const warmedUpRef = useRef(false);

  useEffect(() => {
    if (warmedUpRef.current) return;
    warmedUpRef.current = true;

    const compileScene = () => {
      const startTime = performance.now();
      try {
        gl.compile(scene, camera);
      } catch (err) {}
      debugLog(`warmup ${(performance.now() - startTime).toFixed(1)}ms`);
    };

    if (typeof requestIdleCallback === 'function') {
      const idleId = requestIdleCallback(compileScene, { timeout: 500 });
      return () => cancelIdleCallback(idleId);
    }

    const timerId = setTimeout(compileScene, 0);
    return () => clearTimeout(timerId);
  }, [gl, scene, camera]);

  return null;
}

function SphereCard({
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
      meshRef.current.scale.setScalar(+!!reducedMotion);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (wantsPlay && meshRef.current) {
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
      return () => tweenRef.current?.kill();
    }
  }, [wantsPlay, revealDelay, reducedMotion]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      geometry={CARD_GEOMETRY}
      frustumCulled={false}
    >
      <meshBasicMaterial map={texture} side={DoubleSide} />
    </mesh>
  );
}

function useSphereTextures(images) {
  const { gl } = useThree();
  const [, setTick] = useState(0);
  const stateRef = useRef({
    textures: [],
    uploaded: new Set(),
    target: 0,
    loadedCount: 0,
    initialized: false,
  });

  useEffect(() => {
    const state = stateRef.current;
    if (state.initialized) return;
    state.initialized = true;

    const targetCount = Math.min(70, images.length);
    state.target = targetCount;
    if (targetCount === 0) return;

    const startTime = performance.now();
    let cancelled = false;
    let nextIndex = 0;
    let activeWorkers = 0;
    const pendingHandles = new Set();

    function scheduleNext() {
      if (!cancelled) {
        while (activeWorkers < 4 && nextIndex < targetCount) {
          const currentIndex = nextIndex++;
          activeWorkers++;
          const handle =
            typeof requestIdleCallback === 'function'
              ? requestIdleCallback(
                  () => loadAndUpload(currentIndex, handle),
                  { timeout: 2000 }
                )
              : setTimeout(() => loadAndUpload(currentIndex, null), 0);
          if (handle) {
            pendingHandles.add(handle);
          }
        }
      }
    }

    async function loadAndUpload(index, handle) {
      if (handle) {
        pendingHandles.delete(handle);
      }
      if (!cancelled) {
        try {
          const bitmap = await loadImageBitmap(images[index], {
            maxWidth: 384,
          });
          if (cancelled) {
            bitmap.close?.();
            return;
          }

          const texture = new CanvasTexture(bitmap);
          texture.colorSpace = SRGBColorSpace;
          texture.anisotropy = Math.min(
            4,
            gl.capabilities.getMaxAnisotropy()
          );
          texture.flipY = false;
          texture.needsUpdate = true;

          const uploadStart = performance.now();
          gl.initTexture(texture);
          const uploadDuration = performance.now() - uploadStart;
          if (uploadDuration > 10) {
            debugLog(`upload-slow #${index} ${uploadDuration.toFixed(1)}ms`);
          }

          state.textures[index] = texture;
          state.uploaded.add(index);
          state.loadedCount++;
          setTick(( count ) => count + 1);

          if (state.loadedCount === targetCount) {
            debugLog(
              `textures-ready (${(performance.now() - startTime).toFixed(0)}ms total)`
            );
          }
        } catch (err) {
          state.loadedCount++;
        } finally {
          activeWorkers--;
          scheduleNext();
        }
      }
    }

    scheduleNext();

    return () => {
      cancelled = true;
      for (const handle of pendingHandles) {
        if (typeof cancelIdleCallback === 'function') {
          try {
            cancelIdleCallback(handle);
          } catch (err) {
            clearTimeout(handle);
          }
        } else {
          clearTimeout(handle);
        }
      }
      pendingHandles.clear();
      for (const tex of state.textures) {
        tex?.dispose();
      }
      state.textures = [];
      state.uploaded.clear();
      state.target = 0;
      state.loadedCount = 0;
      state.initialized = false;
    };
  }, [images, gl]);

  return {
    textures: stateRef.current.textures,
    uploaded: stateRef.current.uploaded,
  };
}

function SphereScene({ images, wantsPlay, reducedMotion }) {
  const groupRef = useRef(null);
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

  const { textures, uploaded } = useSphereTextures(images);

  const cardTransforms = useMemo(() => {
    const items = [];
    for (let i = 0; i < 70; i++) {
      const yNorm = 1 - (i / 69) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
      const theta = i * GOLDEN_ANGLE;
      const x = Math.cos(theta) * radiusAtY * 3;
      const y = 3 * yNorm;
      const z = Math.sin(theta) * radiusAtY * 3;

      const lookMatrix = new Matrix4().lookAt(
        new Vector3(x, y, z),
        new Vector3(2 * x, 2 * y, 2 * z),
        new Vector3(0, 1, 0)
      );
      const quaternion = new Quaternion().setFromRotationMatrix(lookMatrix);
      const euler = new Euler().setFromQuaternion(quaternion);

      items.push({
        position: [x, y, z],
        rotation: [euler.x, euler.y, euler.z],
        revealDelay: 0.7 * Math.random(),
      });
    }
    return items;
  }, []);

  useFrame((state, dt) => {
    const data = interactionRef.current;
    data.frames++;
    if (dt > data.maxDt) {
      data.maxDt = dt;
    }
    if (dt > 0.033) {
      data.droppedFrames++;
    }
    if (!data.firstRenderLogged) {
      data.firstRenderLogged = true;
      debugLog('first-render');
    }

    const dragDelta = -0.0015 * data.dragAccum;
    data.dragAccum = 0;

    if (data.dragging) {
      data.inertia =
        dt > 0 ? Math.max(-1.4, Math.min(1.4, dragDelta / dt)) : 0;
    } else {
      data.inertia *= Math.exp(-2.4 * dt);
    }

    if (!reducedMotion) {
      data.spin += -0.05 * dt;
    }
    data.spin += dragDelta;
    if (!data.dragging) {
      data.spin += data.inertia * dt;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = data.spin;
    }

    const now = performance.now();
    if (now - data.lastLog > 1000) {
      const fps = data.frames / ((now - data.lastLog) / 1000);
      debugLog(
        `fps=${fps.toFixed(0)} maxDt=${(1000 * data.maxDt).toFixed(1)}ms dropped=${data.droppedFrames}`
      );
      data.frames = 0;
      data.droppedFrames = 0;
      data.maxDt = 0;
      data.lastLog = now;
    }
  });

  const { gl } = useThree();

  useEffect(() => {
    const domElement = gl.domElement;
    const data = interactionRef.current;

    function onPointerDown(event) {
      data.dragging = true;
      data.lastX = event.clientX;
      domElement.setPointerCapture?.(event.pointerId);
      domElement.style.cursor = 'grabbing';
    }

    function onPointerMove(event) {
      if (data.dragging) {
        data.dragAccum += event.clientX - data.lastX;
        data.lastX = event.clientX;
      }
    }

    function onPointerUp(event) {
      if (data.dragging) {
        data.dragging = false;
        domElement.releasePointerCapture?.(event.pointerId);
        domElement.style.cursor = 'grab';
      }
    }

    domElement.style.cursor = 'grab';
    domElement.style.touchAction = 'pan-y';
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerUp);

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerUp);
    };
  }, [gl]);

  return (
    <group rotation={[-TILT_ANGLE, 0, -(0.4 * TILT_ANGLE)]}>
      <group ref={groupRef}>
        {cardTransforms.map((item, index) => {
          const texture = textures[index];
          return texture && uploaded.has(index) ? (
            <SphereCard
              key={index}
              position={item.position}
              rotation={item.rotation}
              texture={texture}
              wantsPlay={wantsPlay}
              revealDelay={item.revealDelay}
              reducedMotion={reducedMotion}
            />
          ) : null;
        })}
      </group>
    </group>
  );
}

if (typeof performance !== 'undefined') {
  performance.now();
}

// NOTE: module id: 607601
export default function ImageSphere({
  images = [],
  wantsPlay = false,
  active = true,
}) {
  debugLog('mount');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const onChange = (event) => setReducedMotion(event.matches);
    mediaQuery.addEventListener?.('change', onChange);
    return () => mediaQuery.removeEventListener?.('change', onChange);
  }, []);

  const hasWebGL = useWebGLSupport();

  return hasWebGL ? (
    <Canvas
      className="size-full block"
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      }}
      camera={{ position: [0, 0, 11], fov: 35 }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        debugLog('r3f-created');
        gl.domElement.addEventListener('webglcontextlost', (event) =>
          event.preventDefault()
        );
      }}
    >
      <ShaderWarmup />
      <SphereScene
        images={images}
        wantsPlay={wantsPlay}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  ) : null;
}
