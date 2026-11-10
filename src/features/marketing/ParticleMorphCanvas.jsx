'use client';

// Variable Mapping: P -> hashRandom, T -> SHAPE_GENERATORS, S -> getTextureDimensions, D -> createShapeDataTexture, M -> FULLSCREEN_VERT, j -> POSITION_SIM_FRAG, A -> VELOCITY_FIELD_FRAG, O -> DISPLACEMENT_SIM_FRAG, z -> PARTICLE_VERT, R -> PARTICLE_FRAG, C -> ScenePrecompiler, _ -> ParticleSimulation, F -> ParticleMorphCanvas

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'; // NOTE: module id: 271645
import * as THREE from 'three'; // NOTE: module id: 190072
import { Canvas } from '@react-three/fiber'; // NOTE: module id: 575056
import { useFrame } from '@react-three/fiber'; // NOTE: module id: 925234
import { useThree } from '@react-three/fiber'; // NOTE: module id: 828600
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495
import { useBreakpoint } from '@/hooks/useBreakpoint'; // NOTE: module id: 400701
import { useWebGLSupport } from '@/hooks/useWebGLSupport'

gsap.registerPlugin(ScrollTrigger);

const hashRandom = (index, seed) =>
  ((x, y = 1) => {
    const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return value - Math.floor(value);
  })(index + 1, seed);

const SHAPE_GENERATORS = {
  sphere: (function ({ radius = 0.95, amplitude = 0.55, jitter = 0.05 } = {}) {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return (index, total) => {
      const phi = Math.acos(1 - 2 * (total > 1 ? index / (total - 1) : 0.5));
      const theta = goldenAngle * index;
      const radialDistance =
        radius * (1 + (jitter > 0 ? (hashRandom(index, 2) - 0.5) * 2 * jitter : 0));
      return [
        radialDistance * Math.sin(phi) * Math.cos(theta),
        radialDistance * Math.cos(phi),
        radialDistance * Math.sin(phi) * Math.sin(theta),
        amplitude,
      ];
    };
  })(),
  grid: (function ({ extent = 2, jitterFrac = 0.16 } = {}) {
    return (index, total) => {
      const sideCount = Math.max(2, Math.round(Math.cbrt(total)));
      const wrappedIndex = index % (sideCount * sideCount * sideCount);
      const step = extent / (sideCount - 1);
      const halfSide = (sideCount - 1) / 2;
      const zIndex = Math.floor(wrappedIndex / (sideCount * sideCount));
      const yIndex = Math.floor((wrappedIndex - zIndex * sideCount * sideCount) / sideCount);
      const jitterAmount = jitterFrac * step;
      return [
        (wrappedIndex % sideCount - halfSide) * step +
          (hashRandom(index, 71) - 0.5) * 2 * jitterAmount,
        (yIndex - halfSide) * step + (hashRandom(index, 73) - 0.5) * 2 * jitterAmount,
        (zIndex - halfSide) * step + (hashRandom(index, 79) - 0.5) * 2 * jitterAmount,
        0,
      ];
    };
  })(),
};

const getTextureDimensions = (count) => {
  const safeCount = Math.max(1, Math.floor(count));
  const texW = Math.max(1, Math.ceil(Math.sqrt(safeCount)));
  const texH = Math.max(1, Math.ceil(safeCount / texW));
  return { texW, texH };
};

function createShapeDataTexture(generator, count) {
  const { texW, texH } = getTextureDimensions(count);
  const data = new Float32Array(texW * texH * 4);

  for (let index = 0; index < count; index++) {
    const [x, y, z, w] = generator(index, count);
    const offset = index * 4;
    data[offset] = x;
    data[offset + 1] = y;
    data[offset + 2] = z;
    data[offset + 3] = w;
  }

  const texture = new THREE.DataTexture(
    data,
    texW,
    texH,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const FULLSCREEN_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const POSITION_SIM_FRAG = `
  precision highp float;
  precision highp sampler2D;

  uniform sampler2D uPositions;
  uniform sampler2D uFromState;
  uniform sampler2D uToState;
  uniform float uProgress;
  uniform float uTime;
  uniform float uDt;
  uniform float uSpringK;
  uniform float uDrift;
  uniform float uDriftScale;
  uniform float uDriftSpeed;
  uniform float uWaveScale;
  uniform float uWaveSpeed;
  uniform float uWaveHeight;
  uniform float uInit;

  varying vec2 vUv;

  // --- 3D simplex noise (Ashima / Stefan Gustavson, MIT) ----------------
  vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute4(vec4 x) { return mod289v4(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise3(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289v3(i);
    vec4 p = permute4(permute4(permute4(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 g0 = vec3(a0.xy, h.x);
    vec3 g1 = vec3(a0.zw, h.y);
    vec3 g2 = vec3(a1.xy, h.z);
    vec3 g3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
    g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
  }

  vec3 snoiseVec3(vec3 x) {
    float s  = snoise3(x);
    float s1 = snoise3(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise3(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    return vec3(s, s1, s2);
  }

  vec3 curlNoise3(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);
    float x = (p_y1.z - p_y0.z) - (p_z1.y - p_z0.y);
    float y = (p_z1.x - p_z0.x) - (p_x1.z - p_x0.z);
    float z = (p_x1.y - p_x0.y) - (p_y1.x - p_y0.x);
    return vec3(x, y, z) / (2.0 * e);
  }

  void main() {
    vec4 fromData = texture2D(uFromState, vUv);
    vec4 toData = texture2D(uToState, vUv);

    if (uInit > 0.5) {
      gl_FragColor = vec4(fromData.rgb, 1.0);
      return;
    }

    vec3 pos = texture2D(uPositions, vUv).rgb;
    vec3 target = mix(fromData.rgb, toData.rgb, uProgress);
    float waveAmp = mix(fromData.a, toData.a, uProgress);

    vec3 qCrest = pos * uWaveScale * 0.55
      + vec3(uTime * 0.08, uTime * 0.06, -uTime * 0.07);
    float crestH = 0.0;
    if (waveAmp > 0.001) {
      float h = snoise3(qCrest + 31.7);
      crestH = max(0.0, h - 0.05) * 1.8;
    }

    float springAlpha = 1.0 - exp(-uSpringK * uDt);
    float r_pos = length(pos);
    vec3 outward = r_pos > 0.001 ? pos / r_pos : vec3(0.0, 1.0, 0.0);
    vec3 toTarget = target - pos;
    float effectiveTargetR = length(target) + crestH * waveAmp * uWaveHeight;
    float radialErr = effectiveTargetR - r_pos;
    vec3 radialSpring = outward * radialErr * springAlpha;
    vec3 tangentOffset = toTarget - dot(toTarget, outward) * outward;
    float tangentGate = mix(1.0, 0.18, smoothstep(0.05, 0.6, waveAmp));
    vec3 tangentSpring = tangentOffset * springAlpha * tangentGate;
    vec3 newPos = pos + radialSpring + tangentSpring;

    if (waveAmp > 0.001) {
      vec3 q = pos * uWaveScale
        + vec3(uTime * 0.6, uTime * 0.4, -uTime * 0.5) * uWaveSpeed;
      vec3 curl = curlNoise3(q);
      vec3 small = curlNoise3(q * 2.4 + 17.3) * 0.25;
      vec3 fullCurl = (curl + small) * 0.2;
      float radialPart = dot(fullCurl, outward);
      vec3 tangentFlow = fullCurl - radialPart * outward;
      float flowMod = mix(1.0, 0.3, clamp(crestH, 0.0, 1.0));
      vec3 motion = (tangentFlow + outward * radialPart * 0.05) * flowMod;
      newPos += motion * waveAmp * uDt * 1.2;
    }

    if (uDrift > 0.001) {
      vec3 qd = pos * uDriftScale + vec3(uTime * uDriftSpeed);
      newPos += curlNoise3(qd) * uDrift * uDt;
    }

    gl_FragColor = vec4(newPos, 1.0);
  }
`;

const VELOCITY_FIELD_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uField;
  uniform float uDecay;
  uniform float uDiffuse;
  uniform float uAdvect;
  uniform vec2 uTexel;
  uniform vec2 uPoint;
  uniform vec2 uVelocity;
  uniform float uRadius;
  uniform float uSplatActive;

  void main() {
    vec2 here = texture2D(uField, vUv).xy;
    vec2 srcUV = vUv - here * uAdvect * uTexel;
    vec4 c = texture2D(uField, srcUV);
    vec4 n = texture2D(uField, srcUV + vec2(0.0, uTexel.y));
    vec4 s = texture2D(uField, srcUV - vec2(0.0, uTexel.y));
    vec4 e = texture2D(uField, srcUV + vec2(uTexel.x, 0.0));
    vec4 w = texture2D(uField, srcUV - vec2(uTexel.x, 0.0));
    vec4 blurred = (c * 4.0 + n + s + e + w) * 0.125;
    vec4 v = mix(c, blurred, uDiffuse) * uDecay;
    if (uSplatActive > 0.5) {
      vec2 d = vUv - uPoint;
      float g = exp(-dot(d, d) / max(1e-6, uRadius * uRadius));
      v.xy += uVelocity * g;
    }
    gl_FragColor = v;
  }
`;

const DISPLACEMENT_SIM_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uStateTex;
  uniform sampler2D uHomeTex;
  uniform sampler2D uField;
  uniform mat4 uViewProjection;
  uniform float uDt;
  uniform float uDamping;
  uniform float uForce;
  uniform float uForceGate;
  uniform float uRespawnDist;
  uniform float uRespawnJitter;
  uniform float uFadeStart;
  uniform float uIdlePush;

  void main() {
    vec4 st = texture2D(uStateTex, vUv);
    vec2 disp = st.xy;
    vec2 vel = st.zw;
    vec3 home = texture2D(uHomeTex, vUv).xyz;
    vec2 worldXY = home.xy + disp;

    // Project current world position -> screen UV [0,1] to read the field.
    vec4 clip = uViewProjection * vec4(worldXY, home.z, 1.0);
    vec2 scrUV = (clip.xy / clip.w) * 0.5 + 0.5;

    vec2 force = vec2(0.0);
    if (scrUV.x > 0.0 && scrUV.x < 1.0 && scrUV.y > 0.0 && scrUV.y < 1.0) {
      vec2 raw = texture2D(uField, scrUV).xy;
      float gate = smoothstep(uForceGate, uForceGate * 2.0, length(raw));
      force = raw * uForce * gate;
    }

    // Clip the inward component (relative to the field centre = origin) so
    // the cursor can push particles outward / sideways but never inward.
    float wl = length(worldXY);
    if (wl > 1e-5) {
      vec2 outDir = worldXY / wl;
      float outComp = dot(force, outDir);
      vec2 tang = force - outDir * outComp;
      force = tang + outDir * max(0.0, outComp);
    }
    vel += force;

    // Recycle bias: any displaced particle gets a tiny outward nudge so it
    // coasts past the respawn threshold instead of stalling mid-flight.
    float dl = length(disp);
    float pushScale = smoothstep(uFadeStart, uFadeStart * 2.0, dl);
    if (pushScale > 0.0 && length(home.xy) > 1e-5) {
      vel += normalize(home.xy) * uIdlePush * pushScale;
    }

    vel *= uDamping;
    disp += vel * uDt;

    // Respawn home once displaced past the (jittered) threshold. By then
    // the render has already faded the particle to ~0, so the snap is
    // invisible and a fresh particle appears at home -> self-heal.
    float jitter = mix(1.0, 1.0 + uRespawnJitter,
      fract(sin(vUv.x * 12.9898 + vUv.y * 78.233) * 43758.5453));
    if (length(disp) > uRespawnDist * jitter) {
      disp = vec2(0.0);
      vel = vec2(0.0);
    }

    gl_FragColor = vec4(disp, vel);
  }
`;

const PARTICLE_VERT = `
  attribute vec2 aIndex;

  uniform sampler2D uPositions;
  uniform sampler2D uDispTex;
  uniform float uInteractive;
  uniform float uFadeStart;
  uniform float uFadeEnd;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  uniform float uContainerScale;

  varying float vMoveBoost;
  varying float vDispAlive;

  void main() {
    vec3 p = texture2D(uPositions, aIndex).xyz;

    // Cursor-drift displacement layer (rides on top of the morph
    // position). Fades by displacement so the recycle snap is invisible.
    float dispAlive = 1.0;
    if (uInteractive > 0.5) {
      vec2 disp = texture2D(uDispTex, aIndex).xy;
      p += vec3(disp, 0.0);
      dispAlive = 1.0 - smoothstep(uFadeStart, uFadeEnd, length(disp));
    }
    vDispAlive = dispAlive;
    vMoveBoost = 4.0 * uProgress * (1.0 - uProgress);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = uSizeScale * uContainerScale * uPixelRatio * (14.0 / -mv.z);
    size *= 1.0 + 0.12 * vMoveBoost;
    gl_PointSize = clamp(size, 0.0, 96.0);
  }
`;

const PARTICLE_FRAG = `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vMoveBoost;
  varying float vDispAlive;

  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float a = 1.0 - smoothstep(0.42, 0.5, length(d));
    float alpha = uOpacity * a * vDispAlive;
    if (alpha <= 0.001) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function rasterizeDigitPixels(digitText, canvasSize = 512, fontScale = 0.92) {
  if (typeof document === 'undefined') return [];

  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');

  const fontProbe = document.createElement('span');
  fontProbe.style.fontFamily = 'var(--font-mono)';
  document.body.appendChild(fontProbe);
  const computedFont = getComputedStyle(fontProbe).fontFamily;
  document.body.removeChild(fontProbe);

  const fontFamily =
    (computedFont && computedFont.trim()) ||
    'ui-monospace, SFMono-Regular, Menlo, monospace';

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.fillStyle = '#ffffff';

  const text = String(digitText);
  let fontSize = Math.round(canvasSize * fontScale);
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxWidth = canvasSize * 0.9;
  const measuredWidth = ctx.measureText(text).width;
  if (measuredWidth > maxWidth) {
    fontSize = Math.floor((maxWidth / measuredWidth) * fontSize);
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
  }

  ctx.fillText(text, canvasSize / 2, canvasSize * 0.57);

  const { data } = ctx.getImageData(0, 0, canvasSize, canvasSize);
  const points = [];
  for (let row = 0; row < canvasSize; row++) {
    for (let col = 0; col < canvasSize; col++) {
      if (data[(row * canvasSize + col) * 4 + 3] > 96) {
        points.push([(col / canvasSize) * 2 - 1, -((row / canvasSize) * 2 - 1)]);
      }
    }
  }
  return points;
}

function createDigitShapeGenerator(
  digitText,
  {
    extent = 1.4,
    jitter = 0.012,
    depth = 0.34,
    waveAmp = 0.35,
    fringeShare = 0.28,
    fringeAmpMultiplier = 2.6,
  } = {}
) {
  const pixels = rasterizeDigitPixels(digitText);
  return (index, total) => {
    if (pixels.length === 0) return [0, 0, 0, waveAmp];
    const step = pixels.length / total;
    const pixelIndex = Math.min(
      pixels.length - 1,
      Math.floor(index * step + hashRandom(index, 31) * step)
    );
    const point = pixels[pixelIndex];
    const jitterX = (hashRandom(index, 11) - 0.5) * 2 * jitter;
    const jitterY = (hashRandom(index, 13) - 0.5) * 2 * jitter;
    const zPos = (hashRandom(index, 17) - 0.5) * 2 * depth;
    const isFringe = hashRandom(index, 41) < fringeShare;
    return [
      (point[0] + jitterX) * extent,
      (point[1] + jitterY) * extent,
      zPos,
      isFringe ? waveAmp * fringeAmpMultiplier : waveAmp,
    ];
  };
}

function ScenePrecompiler() {
  const { gl, scene, camera } = useThree();
  const hasCompiledRef = useRef(false);

  useEffect(() => {
    if (hasCompiledRef.current) return;
    hasCompiledRef.current = true;

    const compileScene = () => {
      try {
        gl.compile(scene, camera);
      } catch {}
    };

    if (typeof requestIdleCallback === 'function') {
      const idleId = requestIdleCallback(compileScene, { timeout: 500 });
      return () => cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(compileScene, 0);
    return () => clearTimeout(timeoutId);
  }, [gl, scene, camera]);

  return null;
}

function ParticleSimulation({
  color,
  triggerRef,
  intensityRef,
  colorFromObjRef,
  colorToObjRef,
  digit,
  reduced,
  apiRef,
  count = 24000,
  pointSize = 0.38,
  waveSpeed = 1.3,
  interactive = false,
  trailDecay = 0.945,
  trailDiffuse = 0.12,
  trailAdvect = 0.25,
  splatRadius = 0.05,
  velocityScale = 6,
  forceStrength = 0.45,
  forceGate = 0.05,
  damping = 0.962,
  fadeStart = 0.05,
  fadeEnd = 0.32,
  respawnDist = 0.34,
  respawnJitter = 0.25,
  idlePush = 0.0028,
}) {
  const { gl, scene, camera, size } = useThree();
  const particleMaterialRef = useRef(null);
  const pointsRef = useRef(null);

  useEffect(() => {
    const { texW, texH } = getTextureDimensions(count);
    const simTargetOptions = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    };

    const posTargetA = new THREE.WebGLRenderTarget(texW, texH, simTargetOptions);
    const posTargetB = new THREE.WebGLRenderTarget(texW, texH, simTargetOptions);
    let currentPosTarget = posTargetA;
    let nextPosTarget = posTargetB;

    const shapeTextureCache = new Map();
    const getShapeTexture = (shapeKey) => {
      const cached = shapeTextureCache.get(shapeKey);
      if (cached) return cached;
      const generator = SHAPE_GENERATORS[shapeKey];
      if (!generator) return null;
      const texture = createShapeDataTexture(generator, count);
      shapeTextureCache.set(shapeKey, texture);
      return texture;
    };

    const sphereTexture = getShapeTexture('sphere');
    const gridTexture = getShapeTexture('grid');

    const digitTextureCache = new Map();
    const getDigitTexture = (digitValue) => {
      const cacheKey = `digit-${digitValue}`;
      const cached = digitTextureCache.get(cacheKey);
      if (cached) return cached;
      const texture = createShapeDataTexture(
        createDigitShapeGenerator(String(digitValue)),
        count
      );
      digitTextureCache.set(cacheKey, texture);
      return texture;
    };

    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const initialDigitTexture = digit != null ? getDigitTexture(digit) : null;

    const positionSimMaterial = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: POSITION_SIM_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPositions: { value: null },
        uFromState: { value: initialDigitTexture ?? sphereTexture },
        uToState: { value: initialDigitTexture ?? gridTexture },
        uProgress: { value: +!!initialDigitTexture },
        uTime: { value: 0 },
        uDt: { value: 1 / 60 },
        uSpringK: { value: 9 },
        uDrift: { value: 0.035 },
        uDriftScale: { value: 2.2 },
        uDriftSpeed: { value: 0.4 },
        uWaveScale: { value: 1 },
        uWaveSpeed: { value: waveSpeed },
        uWaveHeight: { value: 0.6 },
        uInit: { value: 0 },
      },
    });

    const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), positionSimMaterial);
    simScene.add(simQuad);

    positionSimMaterial.uniforms.uInit.value = 1;
    gl.setRenderTarget(posTargetA);
    gl.render(simScene, simCamera);
    gl.setRenderTarget(posTargetB);
    gl.render(simScene, simCamera);
    gl.setRenderTarget(null);
    positionSimMaterial.uniforms.uInit.value = 0;

    const uvIndices = new Float32Array(count * 2);
    for (let index = 0; index < count; index++) {
      uvIndices[index * 2] = ((index % texW) + 0.5) / texW;
      uvIndices[index * 2 + 1] = (Math.floor(index / texW) + 0.5) / texH;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    );
    particleGeometry.setAttribute('aIndex', new THREE.BufferAttribute(uvIndices, 2));
    particleGeometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(0, 0, 0),
      Infinity
    );

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uPositions: { value: currentPosTarget.texture },
        uDispTex: { value: null },
        uInteractive: { value: +!!interactive },
        uFadeStart: { value: fadeStart },
        uFadeEnd: { value: fadeEnd },
        uProgress: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uSizeScale: { value: pointSize },
        uContainerScale: { value: 1 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 0.55 },
      },
    });
    particleMaterialRef.current = particleMaterial;

    const pointsMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(pointsMesh);
    pointsRef.current = pointsMesh;

    const containerDiagonal = Math.sqrt(
      Math.max(1, size.width) * Math.max(1, size.height)
    );
    particleMaterial.uniforms.uContainerScale.value = Math.max(
      0.5,
      Math.min(2.2, containerDiagonal / Math.sqrt(350000))
    );

    const hasIntensityRef = !!intensityRef;
    const isDigitMode = digit != null;

    let fieldTargetA = null;
    let fieldTargetB = null;
    let dispTargetA = null;
    let dispTargetB = null;
    let fieldMaterial = null;
    let displacementMaterial = null;
    let interactiveScene = null;
    let interactiveQuad = null;
    let handlePointerMove = null;
    let handlePointerLeave = null;

    const pointerState = {
      uvX: 0.5,
      uvY: 0.5,
      prevX: -1,
      prevY: -1,
      velX: 0,
      velY: 0,
      moved: false,
    };

    const viewProjectionMatrix = new THREE.Matrix4();
    let scrollProgress = 0;
    let previewProgress = 0;
    let previewTween = null;

    apiRef.current.setPreview = (enabled) => {
      if (previewTween) {
        previewTween.kill();
      }
      if (reduced) {
        previewProgress = +!!enabled;
        previewTween = null;
        return;
      }
      const proxy = { v: previewProgress };
      previewTween = gsap.to(proxy, {
        v: +!!enabled,
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          previewProgress = proxy.v;
        },
        onComplete: () => {
          previewTween = null;
        },
      });
    };

    let currentDigit = digit ?? null;
    let digitMorphTween = null;

    apiRef.current.morphToDigit = (nextDigit) => {
      if (nextDigit == null) return;
      const toTexture = getDigitTexture(nextDigit);
      if (currentDigit === nextDigit) {
        positionSimMaterial.uniforms.uFromState.value = toTexture;
        positionSimMaterial.uniforms.uToState.value = toTexture;
        positionSimMaterial.uniforms.uProgress.value = 1;
        return;
      }
      if (digitMorphTween) {
        digitMorphTween.kill();
      }
      const fromTexture = getDigitTexture(currentDigit ?? nextDigit);
      positionSimMaterial.uniforms.uFromState.value = fromTexture;
      positionSimMaterial.uniforms.uToState.value = toTexture;
      positionSimMaterial.uniforms.uProgress.value = 0;

      digitMorphTween = gsap.to(positionSimMaterial.uniforms.uProgress, {
        value: 1,
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: () => {
          positionSimMaterial.uniforms.uFromState.value = toTexture;
          positionSimMaterial.uniforms.uProgress.value = 1;
          currentDigit = nextDigit;
          digitMorphTween = null;
        },
      });
    };

    apiRef.current._readScrollAndApply = (elapsedTime, dt) => {
      if (hasIntensityRef) {
        const clampedIntensity = Math.max(0, Math.min(1, intensityRef.current || 0));
        if (isDigitMode) {
          particleMaterial.uniforms.uProgress.value =
            positionSimMaterial.uniforms.uProgress.value;
        } else {
          positionSimMaterial.uniforms.uProgress.value = 0;
          particleMaterial.uniforms.uProgress.value = 0;
        }
        positionSimMaterial.uniforms.uWaveHeight.value = 0.45;
        positionSimMaterial.uniforms.uDrift.value = 0.018;
        positionSimMaterial.uniforms.uWaveSpeed.value = 0.85;
        particleMaterial.uniforms.uOpacity.value = 0.55;
        particleMaterial.uniforms.uSizeScale.value = 0.36;
        particleMaterial.uniforms.uColor.value.lerpColors(
          colorFromObjRef.current,
          colorToObjRef.current,
          clampedIntensity
        );
      } else {
        const combinedProgress = scrollProgress + (1 - scrollProgress) * previewProgress;
        positionSimMaterial.uniforms.uProgress.value = combinedProgress;
        particleMaterial.uniforms.uProgress.value = combinedProgress;
      }

      positionSimMaterial.uniforms.uTime.value = elapsedTime;
      positionSimMaterial.uniforms.uDt.value = dt;
      positionSimMaterial.uniforms.uPositions.value = currentPosTarget.texture;

      gl.setRenderTarget(nextPosTarget);
      gl.render(simScene, simCamera);
      gl.setRenderTarget(null);

      const swappedPos = currentPosTarget;
      currentPosTarget = nextPosTarget;
      nextPosTarget = swappedPos;
      particleMaterial.uniforms.uPositions.value = currentPosTarget.texture;

      if (interactive && fieldTargetA) {
        fieldMaterial.uniforms.uField.value = fieldTargetA.texture;
        fieldMaterial.uniforms.uSplatActive.value = +!!pointerState.moved;
        fieldMaterial.uniforms.uPoint.value.set(pointerState.uvX, pointerState.uvY);
        fieldMaterial.uniforms.uVelocity.value.set(pointerState.velX, pointerState.velY);
        pointerState.moved = false;

        interactiveQuad.material = fieldMaterial;
        gl.setRenderTarget(fieldTargetB);
        gl.render(interactiveScene, simCamera);
        gl.setRenderTarget(null);

        const swappedField = fieldTargetA;
        fieldTargetA = fieldTargetB;
        fieldTargetB = swappedField;

        viewProjectionMatrix.multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse
        );
        displacementMaterial.uniforms.uStateTex.value = dispTargetA.texture;
        displacementMaterial.uniforms.uHomeTex.value = currentPosTarget.texture;
        displacementMaterial.uniforms.uField.value = fieldTargetA.texture;
        displacementMaterial.uniforms.uDt.value = dt;

        interactiveQuad.material = displacementMaterial;
        gl.setRenderTarget(dispTargetB);
        gl.render(interactiveScene, simCamera);
        gl.setRenderTarget(null);

        const swappedDisp = dispTargetA;
        dispTargetA = dispTargetB;
        dispTargetB = swappedDisp;
        particleMaterial.uniforms.uDispTex.value = dispTargetA.texture;
      }
    };

    apiRef.current.digitMode = isDigitMode;

    const scrollTriggerInstance = hasIntensityRef
      ? null
      : ScrollTrigger.create({
          trigger: triggerRef?.current || gl.domElement.parentElement,
          start: 'top 10%',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            scrollProgress = self.progress;
          },
        });

    if (interactive) {
      const fieldTargetOptions = {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        depthBuffer: false,
        stencilBuffer: false,
        generateMipmaps: false,
      };

      fieldTargetA = new THREE.WebGLRenderTarget(256, 256, fieldTargetOptions);
      fieldTargetB = new THREE.WebGLRenderTarget(256, 256, fieldTargetOptions);
      dispTargetA = new THREE.WebGLRenderTarget(texW, texH, simTargetOptions);
      dispTargetB = new THREE.WebGLRenderTarget(texW, texH, simTargetOptions);

      for (const target of [fieldTargetA, fieldTargetB, dispTargetA, dispTargetB]) {
        gl.setRenderTarget(target);
        gl.clearColor();
      }
      gl.setRenderTarget(null);

      fieldMaterial = new THREE.ShaderMaterial({
        vertexShader: FULLSCREEN_VERT,
        fragmentShader: VELOCITY_FIELD_FRAG,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uField: { value: null },
          uDecay: { value: trailDecay },
          uDiffuse: { value: trailDiffuse },
          uAdvect: { value: trailAdvect },
          uTexel: { value: new THREE.Vector2(1 / 256, 1 / 256) },
          uPoint: { value: new THREE.Vector2(0.5, 0.5) },
          uVelocity: { value: new THREE.Vector2(0, 0) },
          uRadius: { value: splatRadius },
          uSplatActive: { value: 0 },
        },
      });

      displacementMaterial = new THREE.ShaderMaterial({
        vertexShader: FULLSCREEN_VERT,
        fragmentShader: DISPLACEMENT_SIM_FRAG,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uStateTex: { value: null },
          uHomeTex: { value: null },
          uField: { value: null },
          uViewProjection: { value: viewProjectionMatrix },
          uDt: { value: 1 / 60 },
          uDamping: { value: damping },
          uForce: { value: forceStrength },
          uForceGate: { value: forceGate },
          uRespawnDist: { value: respawnDist },
          uRespawnJitter: { value: respawnJitter },
          uFadeStart: { value: fadeStart },
          uIdlePush: { value: idlePush },
        },
      });

      interactiveScene = new THREE.Scene();
      interactiveQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fieldMaterial);
      interactiveScene.add(interactiveQuad);

      handlePointerMove = (event) => {
        const rect = gl.domElement.getBoundingClientRect();
        const uvX = (event.clientX - rect.left) / Math.max(1, rect.width);
        const uvY = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);

        if (pointerState.prevX < 0) {
          pointerState.prevX = uvX;
          pointerState.prevY = uvY;
        }

        pointerState.velX = (uvX - pointerState.prevX) * velocityScale;
        pointerState.velY = (uvY - pointerState.prevY) * velocityScale;
        pointerState.prevX = uvX;
        pointerState.prevY = uvY;
        pointerState.uvX = uvX;
        pointerState.uvY = uvY;
        pointerState.moved = true;
      };

      handlePointerLeave = () => {
        pointerState.prevX = -1;
        pointerState.moved = false;
      };

      gl.domElement.addEventListener('pointermove', handlePointerMove);
      gl.domElement.addEventListener('pointerleave', handlePointerLeave);
    }

    return () => {
      if (previewTween) previewTween.kill();
      if (digitMorphTween) digitMorphTween.kill();
      if (scrollTriggerInstance) scrollTriggerInstance.kill();

      if (interactive) {
        if (handlePointerMove) {
          gl.domElement.removeEventListener('pointermove', handlePointerMove);
        }
        if (handlePointerLeave) {
          gl.domElement.removeEventListener('pointerleave', handlePointerLeave);
        }
        fieldTargetA?.dispose();
        fieldTargetB?.dispose();
        dispTargetA?.dispose();
        dispTargetB?.dispose();
        fieldMaterial?.dispose();
        displacementMaterial?.dispose();
        interactiveQuad?.geometry.dispose();
      }

      scene.remove(pointsMesh);
      for (const texture of shapeTextureCache.values()) {
        texture.dispose();
      }
      for (const texture of digitTextureCache.values()) {
        texture.dispose();
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      positionSimMaterial.dispose();
      simQuad.geometry.dispose();
      posTargetA.dispose();
      posTargetB.dispose();

      apiRef.current.setPreview = () => {};
      apiRef.current.morphToDigit = () => {};
      apiRef.current._readScrollAndApply = null;
      apiRef.current.digitMode = false;
      pointsRef.current = null;
      particleMaterialRef.current = null;
    };
  }, [
    gl,
    scene,
    color,
    triggerRef,
    intensityRef,
    colorFromObjRef,
    colorToObjRef,
    reduced,
    apiRef,
    count,
    pointSize,
    waveSpeed,
    camera,
    interactive,
    trailDecay,
    trailDiffuse,
    trailAdvect,
    splatRadius,
    velocityScale,
    forceStrength,
    forceGate,
    damping,
    fadeStart,
    fadeEnd,
    respawnDist,
    respawnJitter,
    idlePush,
  ]);

  useEffect(() => {
    if (!particleMaterialRef.current) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    particleMaterialRef.current.uniforms.uPixelRatio.value = pixelRatio;

    const containerDiagonal = Math.sqrt(
      Math.max(1, size.width) * Math.max(1, size.height)
    );
    particleMaterialRef.current.uniforms.uContainerScale.value = Math.max(
      0.5,
      Math.min(2.2, containerDiagonal / Math.sqrt(350000))
    );
  }, [size.width, size.height]);

  const rotationYRef = useRef(0);

  useFrame((state, delta) => {
    const stepSimulation = apiRef.current._readScrollAndApply;
    if (!stepSimulation) return;

    const nowSeconds = performance.now() / 1000;
    const clampedDelta = Math.min(0.05, Math.max(0.001, delta));
    stepSimulation(nowSeconds, clampedDelta);

    if (pointsRef.current && !apiRef.current.digitMode) {
      rotationYRef.current += clampedDelta * 0.11;
      pointsRef.current.rotation.y = rotationYRef.current;
    }
  });

  const hasIntensityRef = !!intensityRef;

  if (digit != null) {
    return null;
  }

  return (
    <OrbitControls
      enableZoom={false}
      enablePan={!hasIntensityRef}
      enableDamping={true}
      dampingFactor={0.12}
      rotateSpeed={0.6}
    />
  );
}

// NOTE: module id: 567028
const ParticleMorphCanvas = forwardRef(function ParticleMorphCanvas(
  {
    className = '',
    color = '#0a0a0a',
    triggerRef = null,
    intensityRef = null,
    colorFrom = '#888888',
    colorTo = '#eeeeee',
    digit = null,
    count = 24000,
    pointSize = 0.38,
    waveSpeed = 1.3,
    interactive = false,
    trailDecay = 0.945,
    trailDiffuse = 0.12,
    trailAdvect = 0.25,
    splatRadius = 0.05,
    velocityScale = 6,
    forceStrength = 0.45,
    forceGate = 0.05,
    damping = 0.962,
    fadeStart = 0.05,
    fadeEnd = 0.32,
    respawnDist = 0.34,
    respawnJitter = 0.25,
    idlePush = 0.0028,
    cameraZ = 4,
  },
  ref
) {
  const containerRef = useRef(null);
  const apiRef = useRef({
    setPreview: () => {},
    morphToDigit: () => {},
    _readScrollAndApply: null,
    digitMode: false,
  });
  const colorFromObjRef = useRef(null);
  const colorToObjRef = useRef(null);

  if (!colorFromObjRef.current) {
    colorFromObjRef.current = new THREE.Color(colorFrom);
  }
  if (!colorToObjRef.current) {
    colorToObjRef.current = new THREE.Color(colorTo);
  }

  useEffect(() => {
    colorFromObjRef.current.set(colorFrom);
  }, [colorFrom]);

  useEffect(() => {
    colorToObjRef.current.set(colorTo);
  }, [colorTo]);

  useImperativeHandle(
    ref,
    () => ({
      setPreview: (enabled) => apiRef.current.setPreview(enabled),
    }),
    []
  );

  useEffect(() => {
    if (digit != null) {
      apiRef.current.morphToDigit?.(digit);
    }
  }, [digit]);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const isDesktop = useBreakpoint('lg');
  const isWebGLSupported = useWebGLSupport();
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
      { rootMargin: '300px 0px 300px 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (isDesktop && isWebGLSupported) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <Canvas
          className="absolute inset-0 block h-full w-full"
          dpr={[1, 1.5]}
          frameloop={isInView ? 'always' : 'never'}
          gl={{
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{
            position: [0, 0, cameraZ],
            fov: 50,
            near: 0.1,
            far: 100,
          }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0, 0);
            gl.domElement.addEventListener('webglcontextlost', (event) =>
              event.preventDefault()
            );
          }}
        >
          <ScenePrecompiler />
          <ParticleSimulation
            color={color}
            triggerRef={triggerRef}
            intensityRef={intensityRef}
            colorFromObjRef={colorFromObjRef}
            colorToObjRef={colorToObjRef}
            digit={digit}
            reduced={prefersReducedMotion}
            apiRef={apiRef}
            count={count}
            pointSize={pointSize}
            waveSpeed={waveSpeed}
            interactive={interactive}
            trailDecay={trailDecay}
            trailDiffuse={trailDiffuse}
            trailAdvect={trailAdvect}
            splatRadius={splatRadius}
            velocityScale={velocityScale}
            forceStrength={forceStrength}
            forceGate={forceGate}
            damping={damping}
            fadeStart={fadeStart}
            fadeEnd={fadeEnd}
            respawnDist={respawnDist}
            respawnJitter={respawnJitter}
            idlePush={idlePush}
          />
        </Canvas>
      </div>
    );
  }

  return <div ref={containerRef} className={`relative ${className}`} />;
});

export default ParticleMorphCanvas;