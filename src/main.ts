import "./styles/tokens.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CHAPTERS, OVERVIEW_CAMERA } from "./scene/chapters";
import { createAegeanWater } from "./scene/water";
import { buildAegeanWorld } from "./scene/world";
import { AegeanSoundscape } from "./scene/audio";

const canvas = document.getElementById("aegean-canvas") as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error("Missing #aegean-canvas element.");
}

// 1. Renderer Setup (High-DPI, ACES Filmic Tone Mapping, 4K Soft Shadows)
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 2. Scene, Sky Gradient Dome & Atmospheric Horizon Fog
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x4b87bd);
scene.fog = new THREE.FogExp2(0x8bb6d8, 0.0028);

const skyGeo = new THREE.SphereGeometry(240, 32, 24);
const skyUniforms = {
  uZenithColor: { value: new THREE.Color(0x2d6da8) },
  uHorizonColor: { value: new THREE.Color(0x9bc2de) },
  uSunWarmth: { value: 0.15 },
};
const skyMat = new THREE.ShaderMaterial({
  uniforms: skyUniforms,
  side: THREE.BackSide,
  depthWrite: false,
  vertexShader: /* glsl */ `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uZenithColor;
    uniform vec3 uHorizonColor;
    uniform float uSunWarmth;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition).y;
      float t = pow(clamp(h, 0.0, 1.0), 0.52);
      vec3 col = mix(uHorizonColor, uZenithColor, t);
      col += vec3(0.18, 0.09, 0.02) * uSunWarmth * (1.0 - t);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});
const skyDome = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyDome);

// 3. Camera & OrbitControls
const camera = new THREE.PerspectiveCamera(
  CHAPTERS[0].fov,
  window.innerWidth / window.innerHeight,
  0.15,
  400,
);
camera.position.set(...CHAPTERS[0].cameraPos);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(...CHAPTERS[0].lookAt);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.485;
controls.minDistance = 1.2;
controls.maxDistance = 65;
controls.update();

// 4. Mediterranean Lighting (Crisp Directional Sunlight + Sky/Sea Hemisphere Fill)
const hemiLight = new THREE.HemisphereLight(0xdbeeff, 0x8fb8ad, 0.88);
hemiLight.position.set(0, 40, 0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff8ea, 2.55);
sunLight.position.set(22, 34, -14);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 2;
sunLight.shadow.camera.far = 95;
const shadowBound = 24;
sunLight.shadow.camera.left = -shadowBound;
sunLight.shadow.camera.right = shadowBound;
sunLight.shadow.camera.top = shadowBound;
sunLight.shadow.camera.bottom = -shadowBound;
sunLight.shadow.bias = -0.00035;
sunLight.shadow.normalBias = 0.018;
scene.add(sunLight);

// Subtle bounce light from whitewashed Cycladic walls & Aegean sea surface
const bounceLight = new THREE.DirectionalLight(0x9be2dc, 0.62);
bounceLight.position.set(-18, 12, -24);
scene.add(bounceLight);

// 5. Build Aegean Water & 3D Cycladic Village World
const waterSystem = createAegeanWater();
scene.add(waterSystem.seabedMesh);
scene.add(waterSystem.mesh);

const worldHandles = buildAegeanWorld(scene);
const soundscape = new AegeanSoundscape();

// 6. Camera Interpolation & Chapter State Management
let activeChapterIndex = 0;
let isOverviewMode = false;
let isTransitioning = false;
let transitionProgress = 1;
const transitionDuration = 1.55;

const camStartPos = new THREE.Vector3();
const camEndPos = new THREE.Vector3(...CHAPTERS[0].cameraPos);
const targetStartPos = new THREE.Vector3();
const targetEndPos = new THREE.Vector3(...CHAPTERS[0].lookAt);
let fovStart = CHAPTERS[0].fov;
let fovEnd = CHAPTERS[0].fov;

// Cancel camera transition if user manually grabs canvas to orbit
renderer.domElement.addEventListener("pointerdown", () => {
  isTransitioning = false;
});
renderer.domElement.addEventListener(
  "wheel",
  () => {
    isTransitioning = false;
  },
  { passive: true },
);

// UI Elements
const editorialContainer = document.querySelector(".hud-editorial") as HTMLElement;
const kickerEl = document.getElementById("chapter-kicker") as HTMLElement;
const titleEl = document.getElementById("chapter-title") as HTMLElement;
const subtitleEl = document.getElementById("chapter-subtitle") as HTMLElement;
const dockButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".dock-item"));
const overviewBtn = document.getElementById("btn-overview") as HTMLButtonElement;
const menuBtn = document.getElementById("btn-menu") as HTMLButtonElement;
const atmospherePanel = document.getElementById("atmosphere-panel") as HTMLElement;
const soundBtn = document.getElementById("btn-sound") as HTMLButtonElement;
const soundLabel = document.getElementById("sound-label") as HTMLElement;
const autoTourBtn = document.getElementById("btn-autotour") as HTMLButtonElement;

const sliderSun = document.getElementById("slider-sun") as HTMLInputElement;
const valSun = document.getElementById("val-sun") as HTMLElement;
const sliderBreeze = document.getElementById("slider-breeze") as HTMLInputElement;
const valBreeze = document.getElementById("val-breeze") as HTMLElement;
const sliderWater = document.getElementById("slider-water") as HTMLInputElement;
const valWater = document.getElementById("val-water") as HTMLElement;

function startCameraTransition(
  nextPos: [number, number, number],
  nextTarget: [number, number, number],
  nextFov: number,
): void {
  camStartPos.copy(camera.position);
  camEndPos.set(...nextPos);
  targetStartPos.copy(controls.target);
  targetEndPos.set(...nextTarget);
  fovStart = camera.fov;
  fovEnd = nextFov;
  transitionProgress = 0;
  isTransitioning = true;
}

function selectChapter(index: number, instant = false): void {
  const clamped = ((index % CHAPTERS.length) + CHAPTERS.length) % CHAPTERS.length;
  activeChapterIndex = clamped;
  isOverviewMode = false;
  overviewBtn.setAttribute("aria-pressed", "false");

  const spec = CHAPTERS[clamped];
  dockButtons.forEach((btn, i) => {
    btn.classList.toggle("is-active", i === clamped);
  });

  editorialContainer.classList.add("is-switching");
  window.setTimeout(() => {
    kickerEl.textContent = spec.kicker;
    titleEl.innerHTML = `<span>${spec.titleLines[0]}</span><span>${spec.titleLines[1]}</span>`;
    subtitleEl.textContent = spec.subtitle;
    editorialContainer.classList.remove("is-switching");
  }, instant ? 0 : 160);

  if (instant) {
    camera.position.set(...spec.cameraPos);
    controls.target.set(...spec.lookAt);
    camera.fov = spec.fov;
    camera.updateProjectionMatrix();
    controls.update();
    isTransitioning = false;
  } else {
    startCameraTransition(spec.cameraPos, spec.lookAt, spec.fov);
  }
}

function toggleOverview(forceState?: boolean): void {
  const nextState = forceState !== undefined ? forceState : !isOverviewMode;
  isOverviewMode = nextState;
  overviewBtn.setAttribute("aria-pressed", String(isOverviewMode));

  if (isOverviewMode) {
    startCameraTransition(
      OVERVIEW_CAMERA.cameraPos,
      OVERVIEW_CAMERA.lookAt,
      OVERVIEW_CAMERA.fov,
    );
  } else {
    const spec = CHAPTERS[activeChapterIndex];
    startCameraTransition(spec.cameraPos, spec.lookAt, spec.fov);
  }
}

dockButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const idx = Number(btn.dataset.chapter ?? "0");
    selectChapter(idx);
  });
});

overviewBtn.addEventListener("click", () => {
  toggleOverview();
});

menuBtn.addEventListener("click", () => {
  const isHidden = atmospherePanel.hasAttribute("hidden");
  if (isHidden) {
    atmospherePanel.removeAttribute("hidden");
    menuBtn.setAttribute("aria-expanded", "true");
  } else {
    atmospherePanel.setAttribute("hidden", "");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

// Keyboard shortcuts (1-5 chapters, Left/Right arrows, O for overview)
window.addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "5") {
    selectChapter(Number(e.key) - 1);
  } else if (e.key === "ArrowRight") {
    selectChapter(activeChapterIndex + 1);
  } else if (e.key === "ArrowLeft") {
    selectChapter(activeChapterIndex - 1);
  } else if (e.key.toLowerCase() === "o") {
    toggleOverview();
  }
});

// Atmosphere Controls State
let sunNormalized = 0.62;
let breezeNormalized = 0.48;
let waterClarity = 0.92;
const sunDirection = new THREE.Vector3();

function updateSunPosition(norm: number): void {
  sunNormalized = norm;
  // Interpolate from crisp morning (0) -> high afternoon (0.6) -> warm golden hour (1.0)
  const elevation = THREE.MathUtils.lerp(0.68, 0.34, Math.abs(norm - 0.5) * 1.4);
  const azimuth = THREE.MathUtils.lerp(-0.85, 1.15, norm);
  const radius = 42;
  sunLight.position.set(
    Math.sin(azimuth) * radius,
    elevation * radius,
    Math.cos(azimuth) * radius * 0.72,
  );
  sunDirection.copy(sunLight.position).normalize();

  const goldenFactor = Math.max(0, (norm - 0.65) / 0.35);
  sunLight.color.setRGB(1.0, 0.97 - goldenFactor * 0.12, 0.91 - goldenFactor * 0.24);
  skyUniforms.uSunWarmth.value = 0.12 + goldenFactor * 0.55;

  if (norm < 0.35) {
    valSun.textContent = "Morning";
  } else if (norm < 0.75) {
    valSun.textContent = "Afternoon";
  } else {
    valSun.textContent = "Golden Hour";
  }
}

updateSunPosition(sunNormalized);

sliderSun.addEventListener("input", () => {
  updateSunPosition(Number(sliderSun.value) / 100);
});

sliderBreeze.addEventListener("input", () => {
  breezeNormalized = Number(sliderBreeze.value) / 100;
  soundscape.setBreezeIntensity(breezeNormalized);
  if (breezeNormalized < 0.35) {
    valBreeze.textContent = "Calm";
  } else if (breezeNormalized < 0.7) {
    valBreeze.textContent = "Gentle";
  } else {
    valBreeze.textContent = "Brisk Meltemi";
  }
});

sliderWater.addEventListener("input", () => {
  waterClarity = Number(sliderWater.value) / 100;
  valWater.textContent = `${Math.round(waterClarity * 100)}%`;
});

soundBtn.addEventListener("click", () => {
  const active = soundscape.toggle();
  soundBtn.setAttribute("aria-pressed", String(active));
  soundLabel.textContent = active ? "Sea Audio On" : "Sea Audio Off";
});

let autoTourTimer: number | null = null;
autoTourBtn.addEventListener("click", () => {
  if (autoTourTimer !== null) {
    clearInterval(autoTourTimer);
    autoTourTimer = null;
    autoTourBtn.setAttribute("aria-pressed", "false");
    autoTourBtn.textContent = "Auto-Cycle Chapters";
  } else {
    autoTourBtn.setAttribute("aria-pressed", "true");
    autoTourBtn.textContent = "Stop Auto-Cycle";
    selectChapter((activeChapterIndex + 1) % CHAPTERS.length);
    autoTourTimer = window.setInterval(() => {
      if (activeChapterIndex === CHAPTERS.length - 1 && !isOverviewMode) {
        toggleOverview(true);
      } else {
        selectChapter((activeChapterIndex + 1) % CHAPTERS.length);
      }
    }, 4800);
  }
});

// Support initial URL parameters (?chapter=1..5 or ?view=overview)
const params = new URLSearchParams(window.location.search);
const initChapterParam = params.get("chapter");
const initViewParam = params.get("view");
if (initViewParam === "overview") {
  selectChapter(4, true);
  toggleOverview(true);
  camera.position.set(...OVERVIEW_CAMERA.cameraPos);
  controls.target.set(...OVERVIEW_CAMERA.lookAt);
  controls.update();
  isTransitioning = false;
} else if (initChapterParam) {
  const idx = Number(initChapterParam) - 1;
  if (!Number.isNaN(idx)) {
    selectChapter(idx, true);
  }
} else {
  selectChapter(0, true);
}

// Resize Handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Smooth Ease-In-Out Quintic
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 7. Render Loop
const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.getElapsedTime();

  if (isTransitioning) {
    transitionProgress = Math.min(1, transitionProgress + delta / transitionDuration);
    const eased = easeInOutCubic(transitionProgress);

    camera.position.lerpVectors(camStartPos, camEndPos, eased);
    controls.target.lerpVectors(targetStartPos, targetEndPos, eased);
    camera.fov = THREE.MathUtils.lerp(fovStart, fovEnd, eased);
    camera.updateProjectionMatrix();

    if (transitionProgress >= 1) {
      isTransitioning = false;
    }
  }

  controls.update();
  waterSystem.update(elapsed, breezeNormalized, waterClarity, sunDirection);
  worldHandles.update(elapsed, breezeNormalized);

  renderer.render(scene, camera);
}

animate();

