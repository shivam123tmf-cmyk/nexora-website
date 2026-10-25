/**
 * Nexora WebGL scene — scroll-reactive AI core
 * Three.js + UnrealBloom for Ciao-Energy-class glow
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const isMobile = matchMedia('(max-width: 720px)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x050505, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.045);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0.15, 6.2);

/* ---------- Lights ---------- */
const key = new THREE.DirectionalLight(0xffffff, 1.35);
key.position.set(3.5, 4.5, 2.5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x22d3ee, 1.1);
rim.position.set(-4, 1.5, -2);
scene.add(rim);

const fill = new THREE.PointLight(0xc084fc, 28, 18, 2);
fill.position.set(0, -1.4, 1.2);
scene.add(fill);

const hemi = new THREE.HemisphereLight(0x1a1025, 0x050505, 0.55);
scene.add(hemi);

/* ---------- Core group ---------- */
const core = new THREE.Group();
scene.add(core);

const knotMat = new THREE.MeshPhysicalMaterial({
  color: 0x1a1228,
  metalness: 0.92,
  roughness: 0.18,
  emissive: 0x4c1d95,
  emissiveIntensity: 0.55,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  reflectivity: 1,
});

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.95, 0.28, isMobile ? 140 : 220, isMobile ? 16 : 28),
  knotMat
);
core.add(knot);

const wire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.55, 1),
  new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  })
);
core.add(wire);

const inner = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.42, 1),
  new THREE.MeshStandardMaterial({
    color: 0xe879f9,
    emissive: 0xc026d3,
    emissiveIntensity: 2.2,
    metalness: 0.4,
    roughness: 0.35,
  })
);
core.add(inner);

/* Orbital rings */
function makeRing(radius, color, tilt) {
  const geo = new THREE.TorusGeometry(radius, 0.008, 12, 120);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.55,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = tilt;
  return mesh;
}
const ringA = makeRing(2.05, 0xc084fc, Math.PI / 2.4);
const ringB = makeRing(2.35, 0x22d3ee, Math.PI / 1.7);
core.add(ringA, ringB);

/* Particles */
const COUNT = isMobile ? 420 : 900;
const positions = new Float32Array(COUNT * 3);
const speeds = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  const r = 2.6 + Math.random() * 3.8;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
  positions[i * 3 + 2] = r * Math.cos(phi);
  speeds[i] = 0.15 + Math.random() * 0.55;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(
  pGeo,
  new THREE.PointsMaterial({
    color: 0xe9d5ff,
    size: isMobile ? 0.028 : 0.022,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
);
scene.add(particles);

/* Glow pedestal disc */
const pedGeo = new THREE.CircleGeometry(2.4, 64);
const pedMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uColor: { value: new THREE.Color(0xa855f7) },
    uTime: { value: 0 },
    uIntensity: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec2 p = vUv - 0.5;
      float d = length(p) * 2.0;
      float pulse = 0.85 + 0.15 * sin(uTime * 1.6);
      float glow = smoothstep(1.0, 0.05, d) * pulse * uIntensity;
      float ring = smoothstep(0.55, 0.42, d) * smoothstep(0.28, 0.42, d);
      vec3 col = uColor * (glow * 1.35 + ring * 0.9);
      gl_FragColor = vec4(col, glow * 0.95);
    }
  `,
});
const pedestal = new THREE.Mesh(pedGeo, pedMat);
pedestal.rotation.x = -Math.PI / 2;
pedestal.position.y = -1.75;
scene.add(pedestal);

/* Soft floor shadow plane */
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(3.2, 48),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.76;
scene.add(floor);

/* ---------- Post: bloom ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  isMobile ? 0.55 : 0.85,
  0.55,
  0.78
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------- Scroll state (driven by main.js) ---------- */
export const scrollState = {
  progress: 0, // 0..1 across stage
  chapter: 0,
};

const chapterLooks = [
  { rotY: 0.15, rotX: 0.1, scale: 1.0, camZ: 6.2, camY: 0.15, hue: 0xa855f7, bloom: 0.85, exp: 1.05 },
  { rotY: 1.2, rotX: 0.35, scale: 1.18, camZ: 5.1, camY: 0.05, hue: 0xc084fc, bloom: 1.0, exp: 1.12 },
  { rotY: 2.4, rotX: -0.2, scale: 1.35, camZ: 4.4, camY: -0.05, hue: 0x22d3ee, bloom: 1.15, exp: 1.18 },
  { rotY: 3.6, rotX: 0.45, scale: 1.12, camZ: 5.4, camY: 0.2, hue: 0xe879f9, bloom: 0.95, exp: 1.08 },
  { rotY: 4.8, rotX: 0.15, scale: 0.92, camZ: 6.8, camY: 0.35, hue: 0xa855f7, bloom: 0.7, exp: 0.98 },
];

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) {
  const a = new THREE.Color(c1);
  const b = new THREE.Color(c2);
  return a.lerp(b, t);
}

function sampleLook(p) {
  const max = chapterLooks.length - 1;
  const x = Math.min(Math.max(p, 0), 1) * max;
  const i = Math.floor(x);
  const t = x - i;
  const A = chapterLooks[i];
  const B = chapterLooks[Math.min(i + 1, max)];
  return {
    rotY: lerp(A.rotY, B.rotY, t),
    rotX: lerp(A.rotX, B.rotX, t),
    scale: lerp(A.scale, B.scale, t),
    camZ: lerp(A.camZ, B.camZ, t),
    camY: lerp(A.camY, B.camY, t),
    hue: lerpColor(A.hue, B.hue, t),
    bloom: lerp(A.bloom, B.bloom, t),
    exp: lerp(A.exp, B.exp, t),
  };
}

/* pointer parallax */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => {
  pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
  pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
});

addEventListener('resize', () => {
  const w = innerWidth;
  const h = innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.setSize(w, h);
});

const clock = new THREE.Clock();
let ready = false;

export function markReady() {
  ready = true;
}

function tick() {
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();
  const look = sampleLook(scrollState.progress);

  pointer.x += (pointer.tx - pointer.x) * 0.06;
  pointer.y += (pointer.ty - pointer.y) * 0.06;

  if (!reduceMotion) {
    knot.rotation.y = look.rotY + t * 0.18;
    knot.rotation.x = look.rotX + Math.sin(t * 0.35) * 0.08;
    wire.rotation.y = -t * 0.12;
    wire.rotation.z = t * 0.08;
    inner.rotation.y = t * 0.55;
    inner.rotation.x = t * 0.3;
    ringA.rotation.z = t * 0.25;
    ringB.rotation.z = -t * 0.18;
    particles.rotation.y = t * 0.04;
  }

  const s = look.scale;
  core.scale.setScalar(s);
  core.position.x = pointer.x * 0.35;
  core.position.y = pointer.y * -0.2;

  camera.position.z = look.camZ;
  camera.position.y = look.camY + pointer.y * -0.12;
  camera.position.x = pointer.x * 0.22;
  camera.lookAt(0, 0, 0);

  fill.color.copy(look.hue);
  pedMat.uniforms.uColor.value.copy(look.hue);
  pedMat.uniforms.uTime.value = t;
  pedMat.uniforms.uIntensity.value = 0.75 + look.bloom * 0.35;
  knotMat.emissive.copy(look.hue).multiplyScalar(0.55);
  bloom.strength = isMobile ? look.bloom * 0.7 : look.bloom;
  renderer.toneMappingExposure = look.exp;

  // drift particles gently
  const pos = pGeo.attributes.position.array;
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.00035;
  }
  pGeo.attributes.position.needsUpdate = true;

  if (ready || t > 0.3) composer.render();
}

tick();

/* expose for loader progress estimate */
export function getRenderer() { return renderer; }
