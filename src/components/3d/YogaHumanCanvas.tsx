import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { Asana, VisualLayerType } from '../../types';
import { createDetailedHumanModel, HumanRigResult } from './detailedHumanModel';
import { HUMAN_MODEL_URL, modelIsAvailable } from '../../config/model';
import { createDataLayers, type DataLayers } from './dataLayers';

export interface YogaHumanCanvasProps {
  asana?: Asana;
  currentStepIndex?: number;
  scrubberProgress?: number; // 0 to 100
  showAnatomyOverlay?: boolean;
  showSkeleton?: boolean;
  showAlignmentGrid?: boolean;
  showProps?: boolean;
  /**
   * Semantic layer selector driven by the Studio's side tab. When provided it
   * is the source of truth for what the viewer shows, and takes precedence
   * over viewMode / showAnatomyOverlay / showSkeleton.
   */
  activeLayer?: VisualLayerType;
  viewMode?: 'camera' | 'bone' | 'muscle';
  selectedMuscleId?: string | null;
  /** Highlights one chakra in the spinal column when the chakra layer is on. */
  selectedChakraId?: string | null;
  cameraViewPreset?: '360' | 'orbit' | 'front' | 'side' | 'back' | 'top';
  zoomLevel?: number;
  isDark?: boolean;
  className?: string;
  onCameraMove?: () => void;
}

/**
 * Number of guided-practice steps over which the model eases out of the rig's
 * rest state (which is Tadasana) and into the asana's authored pose. The Studio
 * opens on step index 2, so its default view is the fully established posture.
 */
const ENTRY_STEPS = 2;

/** How far the ribcage widens at the top of an inhale. */
const BREATH_EXPANSION = 0.06;

interface BreathState {
  bodyParts: { [key: string]: THREE.Object3D };
  breathPhases: { phase: string; duration: number }[] | null;
  breathPhaseIndex: number;
  breathElapsed: number;
}

/**
 * Walks the asana's authored breath cycle and expands the ribcage accordingly.
 *
 * The four phases come straight from breathPattern.phases, so a pose with
 * kumbhaka holds visibly pauses at full and empty rather than breathing evenly.
 * Expansion is deliberately small — the torso's children include the arms, and
 * anything larger reads as the whole upper body inflating.
 */
function advanceBreath(state: BreathState, delta: number): void {
  const torso = state.bodyParts.torso;
  if (!torso) return;

  const phases = state.breathPhases;

  if (!phases || phases.length === 0) {
    // Settle back to neutral rather than snapping when the layer is switched off.
    torso.scale.lerp(NEUTRAL_SCALE, 0.08);
    return;
  }

  state.breathElapsed += delta;

  let current = phases[state.breathPhaseIndex % phases.length];
  if (state.breathElapsed >= current.duration) {
    state.breathElapsed -= current.duration;
    state.breathPhaseIndex = (state.breathPhaseIndex + 1) % phases.length;
    current = phases[state.breathPhaseIndex];
  }

  const through = current.duration > 0 ? state.breathElapsed / current.duration : 0;

  let fullness: number;
  switch (current.phase) {
    case 'Inhale':
      fullness = through;
      break;
    case 'Internal Retention':
      fullness = 1;
      break;
    case 'Exhale':
      fullness = 1 - through;
      break;
    default: // External Retention — lungs empty.
      fullness = 0;
  }

  // Ease so the turnarounds at full and empty feel like breath, not a sawtooth.
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * fullness);
  const widen = 1 + eased * BREATH_EXPANSION;

  torso.scale.set(widen, 1 + eased * BREATH_EXPANSION * 0.4, widen);
}

const NEUTRAL_SCALE = new THREE.Vector3(1, 1, 1);

export const YogaHumanCanvas: React.FC<YogaHumanCanvasProps> = ({
  asana,
  currentStepIndex = 2, // Step 3/6 default (Warrior II)
  scrubberProgress = 40,
  showAnatomyOverlay = true,
  showSkeleton = true,
  showAlignmentGrid = true,
  showProps = false,
  activeLayer,
  viewMode = 'camera',
  selectedMuscleId,
  selectedChakraId,
  cameraViewPreset = 'orbit',
  zoomLevel = 1.0,
  isDark = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Always holds the latest rebuild fn, so the async GLB swap inside the
  // mount-once init effect can trigger a rebuild without a stale closure.
  const rebuildLayersRef = useRef<() => void>(() => {});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    humanGroup: THREE.Group;
    bodyParts: { [key: string]: THREE.Object3D };
    restRotations: { [key: string]: THREE.Euler };
    muscleMeshes: { [key: string]: THREE.Mesh };
    heatmapMeshes: { [key: string]: THREE.Mesh };
    skeletonGroup: THREE.Group;
    skinMeshes: THREE.Mesh[];
    clothingMeshes: THREE.Mesh[];
    alignmentGridGroup: THREE.Group;
    verticalPlumbLine: THREE.Line;
    horizontalArmAxis: THREE.Line;
    platformMesh: THREE.Mesh;
    matMesh: THREE.Mesh;
    propBlockMesh: THREE.Mesh;
    targetRotation: { x: number; y: number };
    currentRotation: { x: number; y: number };
    targetCameraPos: THREE.Vector3;
    currentCameraPos: THREE.Vector3;
    isDragging: boolean;
    isPanning: boolean;
    previousMousePosition: { x: number; y: number };
    targetJoints: { [key: string]: THREE.Euler };
    currentJoints: { [key: string]: THREE.Euler };
    targetElevation: number;
    currentElevation: number;
    basePositionY: number;
    targetPoseRotationY: number;
    currentPoseRotationY: number;
    dataLayers: DataLayers | null;
    breathPhases: { phase: string; duration: number }[] | null;
    breathPhaseIndex: number;
    breathElapsed: number;
  } | null>(null);

  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 700;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e12);

    // 2. Camera (Cinematic 40° FOV, angled slightly to capture model, platform, and studio)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0.65, 1.25, 3.4);

    // 3. Renderer with high PBR fidelity
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // 4. Studio Environment Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.4);
    scene.add(ambientLight);

    // Main Sun Key Light (coming through window from top right)
    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.6);
    sunLight.position.set(4.5, 5.5, 3.8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.camera.left = -3;
    sunLight.shadow.camera.right = 3;
    sunLight.shadow.camera.top = 3;
    sunLight.shadow.camera.bottom = -3;
    scene.add(sunLight);

    // Soft Blue-Cyan Sky Fill Light
    const skyFill = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    skyFill.position.set(-4.5, 3.2, 2.0);
    scene.add(skyFill);

    // Golden Rim Light (accents anatomy contours)
    const goldRim = new THREE.DirectionalLight(0xd4af37, 2.2);
    goldRim.position.set(-3.2, 4.0, -3.5);
    scene.add(goldRim);

    // Soft Warm Studio Floor Bounce Light
    const bounceLight = new THREE.PointLight(0xffedd5, 1.1, 10);
    bounceLight.position.set(0, 0.2, 1.5);
    scene.add(bounceLight);

    // 5. Studio Hardwood Floor
    function createWoodTexture(): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Warm natural honey-oak planks
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 512; i += 64) {
          ctx.strokeStyle = '#4a2e14';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(512, i);
          ctx.stroke();

          // Subtle wood grains
          ctx.fillStyle = i % 128 === 0 ? '#7a4e29' : '#5e3a1b';
          ctx.fillRect(0, i + 2, 512, 60);
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      return tex;
    }

    const studioFloorMat = new THREE.MeshStandardMaterial({
      color: 0x5a381e,
      map: createWoodTexture(),
      roughness: 0.45,
      metalness: 0.05,
    });
    const studioFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), studioFloorMat);
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.position.y = -0.01;
    studioFloor.receiveShadow = true;
    scene.add(studioFloor);

    // Studio Background Wall with Large Floor-to-Ceiling Windows
    const studioWall = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 9),
      new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.9 })
    );
    studioWall.position.set(0, 4.4, -6.5);
    scene.add(studioWall);

    // Panoramic Window Daylight Glow & Mountain Vista Backdrop
    function createSkylineTexture(): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 256);
        skyGrad.addColorStop(0, '#bae6fd');
        skyGrad.addColorStop(0.5, '#e0f2fe');
        skyGrad.addColorStop(1, '#fef3c7');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 512, 256);

        // Mountain Silhouettes
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(0, 180);
        ctx.lineTo(80, 110);
        ctx.lineTo(160, 160);
        ctx.lineTo(260, 90);
        ctx.lineTo(380, 170);
        ctx.lineTo(480, 120);
        ctx.lineTo(512, 180);
        ctx.lineTo(512, 256);
        ctx.lineTo(0, 256);
        ctx.fill();

        // Lush green trees
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(0, 200);
        ctx.lineTo(120, 160);
        ctx.lineTo(300, 210);
        ctx.lineTo(440, 170);
        ctx.lineTo(512, 210);
        ctx.lineTo(512, 256);
        ctx.lineTo(0, 256);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    }

    const windowBackdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 5.5),
      new THREE.MeshBasicMaterial({ map: createSkylineTexture() })
    );
    windowBackdrop.position.set(0, 3.2, -6.3);
    scene.add(windowBackdrop);

    // Window Black Mullions Frame
    const windowFrame = new THREE.Group();
    windowFrame.position.set(0, 3.2, -6.2);
    for (let x of [-4, -2, 0, 2, 4]) {
      const mullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 5.5, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x1e2229 })
      );
      mullion.position.set(x, 0, 0);
      windowFrame.add(mullion);
    }
    const horizontalMullion = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.06, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1e2229 })
    );
    horizontalMullion.position.set(0, 0, 0);
    windowFrame.add(horizontalMullion);
    scene.add(windowFrame);

    // 6. ASANA 3D PLATFORM - Dedicated Raised Wooden Analysis Stage
    const platformWidth = 2.5;
    const platformDepth = 1.7;
    const platformHeight = 0.12;

    // Platform Wood Texture
    function createPlatformWoodTexture(): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#422814';
        ctx.fillRect(0, 0, 512, 512);

        // Rich polished grain
        for (let i = 0; i < 512; i += 4) {
          ctx.strokeStyle = i % 16 === 0 ? '#2e1b0c' : '#4d3019';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(512, i + Math.sin(i * 0.02) * 8);
          ctx.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }

    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x3d2311,
      map: createPlatformWoodTexture(),
      roughness: 0.35,
      metalness: 0.1,
    });

    const platformMesh = new THREE.Mesh(
      new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth),
      platformMat
    );
    platformMesh.position.set(0, platformHeight / 2, 0);
    platformMesh.castShadow = true;
    platformMesh.receiveShadow = true;
    scene.add(platformMesh);

    // Gold Bevel Edge Trim on Platform
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x997a15,
      emissiveIntensity: 0.3,
    });
    const platformTrim = new THREE.Mesh(
      new THREE.BoxGeometry(platformWidth + 0.015, 0.012, platformDepth + 0.015),
      goldTrimMat
    );
    platformTrim.position.set(0, platformHeight, 0);
    scene.add(platformTrim);

    // Front Face Engraved Branding: ASANA 3D PLATFORM
    function createBrandingTexture(): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 512, 128);

        // Golden geometric folded logo
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(130, 85);
        ctx.lineTo(155, 35);
        ctx.lineTo(180, 85);
        ctx.lineTo(142, 60);
        ctx.lineTo(168, 60);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 34px "Outfit", "Inter", sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText('ASANA', 200, 62);

        ctx.fillStyle = '#e5c158';
        ctx.font = '500 18px "Inter", sans-serif';
        ctx.letterSpacing = '6px';
        ctx.fillText('3D PLATFORM', 200, 90);
      }
      return new THREE.CanvasTexture(canvas);
    }

    const brandingMat = new THREE.MeshBasicMaterial({
      map: createBrandingTexture(),
      transparent: true,
      side: THREE.DoubleSide,
    });
    const brandingSign = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.08), brandingMat);
    brandingSign.position.set(0, platformHeight / 2, platformDepth / 2 + 0.002);
    scene.add(brandingSign);

    // 7. Dark Yoga Mat on top of the Platform
    const matWidth = 1.95;
    const matDepth = 0.76;
    const matHeight = 0.008;

    const matMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      roughness: 0.88,
      metalness: 0.05,
    });
    const matMesh = new THREE.Mesh(new THREE.BoxGeometry(matWidth, matHeight, matDepth), matMat);
    matMesh.position.set(0, platformHeight + matHeight / 2, 0);
    matMesh.receiveShadow = true;
    scene.add(matMesh);

    // 8. 3D BIOMECHANICAL ALIGNMENT GRID & LASER AXES
    const alignmentGridGroup = new THREE.Group();
    alignmentGridGroup.position.set(0, platformHeight + matHeight + 0.001, 0);
    scene.add(alignmentGridGroup);

    // Mat Gold Grid Laser Lines
    const gridLineMat = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.75,
      linewidth: 2,
    });

    // Longitudinal center plumb line
    const centerLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-matWidth / 2 + 0.08, 0, 0),
      new THREE.Vector3(matWidth / 2 - 0.08, 0, 0),
    ]);
    alignmentGridGroup.add(new THREE.Line(centerLineGeom, gridLineMat));

    // Lateral cross axis
    const crossLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -matDepth / 2 + 0.05),
      new THREE.Vector3(0, 0, matDepth / 2 - 0.05),
    ]);
    alignmentGridGroup.add(new THREE.Line(crossLineGeom, gridLineMat));

    // Stance width calibration lines (45° angle markers for Warrior II foot tracking)
    for (let offset of [-0.65, -0.35, 0.35, 0.65]) {
      const markGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(offset, 0, -0.22),
        new THREE.Vector3(offset, 0, 0.22),
      ]);
      alignmentGridGroup.add(new THREE.Line(markGeom, gridLineMat));
    }

    // Concentric Center Balance Rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const centerRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.188, 36), ringMat);
    centerRing.rotation.x = -Math.PI / 2;
    alignmentGridGroup.add(centerRing);

    // Vertical 3D Laser Plumb Line (Passes through head, spine, pelvis to ground)
    const vertPlumbGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 2.1, 0),
    ]);
    const vertPlumbMat = new THREE.LineBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.85,
    });
    const verticalPlumbLine = new THREE.Line(vertPlumbGeom, vertPlumbMat);
    alignmentGridGroup.add(verticalPlumbLine);

    // Horizontal 3D Laser Arm Axis (Spans Warrior II outstretched arms)
    const horizArmGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.15, 1.42, 0),
      new THREE.Vector3(1.15, 1.42, 0),
    ]);
    const horizArmMat = new THREE.LineBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.85,
    });
    const horizontalArmAxis = new THREE.Line(horizArmGeom, horizArmMat);
    alignmentGridGroup.add(horizontalArmAxis);

    // 9. Interactive Yoga Prop Block
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0xb48a56, // Natural cork
      roughness: 0.75,
      metalness: 0.05,
    });
    const propBlockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.08), blockMat);
    propBlockMesh.position.set(0.48, platformHeight + matHeight + 0.11, 0.22);
    propBlockMesh.castShadow = true;
    propBlockMesh.receiveShadow = true;
    propBlockMesh.visible = false;
    scene.add(propBlockMesh);

    // 10. Anatomical Human Rig Model
    const humanRig: HumanRigResult = createDetailedHumanModel();
    const humanGroup = humanRig.humanGroup;
    humanGroup.position.set(0, platformHeight + matHeight, 0);
    scene.add(humanGroup);

    // Store references
    threeRef.current = {
      scene,
      camera,
      renderer,
      humanGroup,
      bodyParts: humanRig.bodyParts,
      restRotations: humanRig.restRotations,
      muscleMeshes: humanRig.muscleMeshes,
      heatmapMeshes: humanRig.heatmapMeshes,
      skeletonGroup: humanRig.skeletonGroup,
      skinMeshes: humanRig.skinMeshes,
      clothingMeshes: humanRig.clothingMeshes,
      alignmentGridGroup,
      verticalPlumbLine,
      horizontalArmAxis,
      platformMesh,
      matMesh,
      propBlockMesh,
      targetRotation: { x: 0, y: 0.15 },
      currentRotation: { x: 0, y: 0.15 },
      targetCameraPos: new THREE.Vector3(0.65, 1.25, 3.4),
      currentCameraPos: new THREE.Vector3(0.65, 1.25, 3.4),
      isDragging: false,
      isPanning: false,
      previousMousePosition: { x: 0, y: 0 },
      targetJoints: {},
      currentJoints: {},
      targetElevation: 0,
      currentElevation: 0,
      basePositionY: platformHeight + matHeight,
      targetPoseRotationY: 0,
      currentPoseRotationY: 0,
      dataLayers: null,
      breathPhases: null,
      breathPhaseIndex: 0,
      breathElapsed: 0,
    };

    // 10b. Upgrade to the configured humanoid GLB, if there is one.
    //
    // The procedural rig above is already on screen, so this is a progressive
    // swap rather than a loading gate: the studio is usable immediately and
    // simply gets a better body when the download finishes. Any failure —
    // missing file, unrecognisable skeleton — leaves the fallback in place,
    // because a posable rough model beats an empty stage.
    let cancelled = false;

    {
      const modelUrl = HUMAN_MODEL_URL;

      // Probe first, so a project with no model never downloads the loader
      // chunk and never sees a spurious parse error from the SPA fallback.
      modelIsAvailable(modelUrl)
        .then((available) => {
          if (cancelled) return null;
          if (!available) {
            console.info(
              `[YogaHumanCanvas] No model at ${modelUrl} — using the procedural figure. ` +
                `Drop a rigged humanoid .glb there to replace it.`
            );
            return null;
          }
          // Imported lazily so GLTFLoader is code-split out of the main bundle.
          return import('./humanoidRig').then(({ loadHumanoidRig }) => loadHumanoidRig(modelUrl));
        })
        .then((loaded) => {
          const state = threeRef.current;
          if (cancelled || !state || !loaded) return;

          state.scene.remove(state.humanGroup);
          loaded.humanGroup.position.copy(state.humanGroup.position);

          state.humanGroup = loaded.humanGroup;
          state.bodyParts = loaded.bodyParts;
          state.restRotations = loaded.restRotations;
          state.heatmapMeshes = loaded.heatmapMeshes;
          state.skeletonGroup = loaded.skeletonGroup;
          state.skinMeshes = loaded.skinMeshes;
          state.clothingMeshes = loaded.clothingMeshes;

          state.scene.add(loaded.humanGroup);

          // Markers were parented to the old rig's bones, so rebuild them
          // against the new skeleton.
          rebuildLayersRef.current();
          // targetJoints survives the swap, so the animate loop eases the new
          // body into the pose already selected without re-running anything.
        })
        .catch((err) => {
          console.warn(
            `[YogaHumanCanvas] Keeping the procedural model — ${HUMAN_MODEL_URL} did not load.`,
            err
          );
        });
    }

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !threeRef.current) return;
      const w = containerRef.current.clientWidth || 900;
      const h = containerRef.current.clientHeight || 700;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 11. Render Loop
    let animId: number;
    let clock = new THREE.Clock();
    let elapsed = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const state = threeRef.current;
      if (!state) return;

      const delta = clock.getDelta();

      // Smooth Rotation Damping
      state.currentRotation.x += (state.targetRotation.x - state.currentRotation.x) * 0.08;
      state.currentRotation.y += (state.targetRotation.y - state.currentRotation.y) * 0.08;
      // The pose's own yaw and elevation ride on top of whatever the user has
      // dragged to, so orbiting keeps working while the posture stays oriented.
      state.currentPoseRotationY +=
        (state.targetPoseRotationY - state.currentPoseRotationY) * 0.08;
      state.currentElevation += (state.targetElevation - state.currentElevation) * 0.08;

      state.humanGroup.rotation.y = state.currentRotation.y + state.currentPoseRotationY;
      state.humanGroup.rotation.x = state.currentRotation.x;
      state.humanGroup.position.y = state.basePositionY + state.currentElevation;

      // Smooth Camera Damping
      state.currentCameraPos.lerp(state.targetCameraPos, 0.07);
      state.camera.position.copy(state.currentCameraPos);
      state.camera.lookAt(0, 0.88, 0);

      // Smooth Joint Interpolation.
      //
      // Authored angles are a delta from the rig's neutral stance, not absolute
      // rotations. The procedural rig rests at zero so the two are the same
      // there, but a loaded GLB rests in its bind pose — adding it is what lets
      // one set of poseParameters drive either rig.
      Object.entries(state.targetJoints).forEach(([partName, targetEuler]) => {
        const part = state.bodyParts[partName];
        if (!part) return;

        const rest = state.restRotations[partName];
        const targetX = (rest?.x ?? 0) + targetEuler.x;
        const targetY = (rest?.y ?? 0) + targetEuler.y;
        const targetZ = (rest?.z ?? 0) + targetEuler.z;

        part.rotation.x += (targetX - part.rotation.x) * 0.1;
        part.rotation.y += (targetY - part.rotation.y) * 0.1;
        part.rotation.z += (targetZ - part.rotation.z) * 0.1;
      });

      elapsed += delta;
      state.dataLayers?.update(elapsed);
      advanceBreath(state, delta);

      state.renderer.render(state.scene, state.camera);
    };

    animate();

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  // Update Visual Layers (Anatomy Heatmap, Skeleton, Alignment Grid, Props, ViewMode)
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    // activeLayer wins when supplied; the booleans remain a lower-level fallback.
    const effectiveViewMode: 'camera' | 'bone' | 'muscle' = activeLayer
      ? activeLayer === 'muscles'
        ? 'muscle'
        : activeLayer === 'skeleton'
          ? 'bone'
          : 'camera'
      : viewMode;

    const isMuscleMode = activeLayer
      ? activeLayer === 'muscles'
      : viewMode === 'muscle' || showAnatomyOverlay;
    const isBoneMode = activeLayer
      ? activeLayer === 'skeleton'
      : viewMode === 'bone' || showSkeleton;

    // 1. Muscle Heatmaps (Glowing Thighs, Glutes, Deltoids, Core)
    Object.values(state.heatmapMeshes).forEach((mesh) => {
      mesh.visible = isMuscleMode;
    });

    // 2. 3D Skeleton (Pelvic bowl, spine vertebrae, ribcage, bones)
    state.skeletonGroup.visible = isBoneMode;

    // 3. Alignment Grid & Laser Axes
    state.alignmentGridGroup.visible = showAlignmentGrid;
    state.verticalPlumbLine.visible = showAlignmentGrid;
    state.horizontalArmAxis.visible = showAlignmentGrid;

    // 4. Props
    state.propBlockMesh.visible = showProps;

    // 5. Skin Transparency Adjustment
    state.skinMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (effectiveViewMode === 'bone') {
        mat.opacity = 0.22;
        mat.transparent = true;
      } else if (effectiveViewMode === 'muscle') {
        mat.opacity = 0.55;
        mat.transparent = true;
      } else if (isBoneMode && isMuscleMode) {
        mat.opacity = 0.72;
        mat.transparent = true;
      } else if (isBoneMode) {
        mat.opacity = 0.45;
        mat.transparent = true;
      } else {
        mat.opacity = 1.0;
        mat.transparent = false;
      }
    });
  }, [showAnatomyOverlay, showSkeleton, showAlignmentGrid, showProps, viewMode, activeLayer]);

  // Drive the rig from the selected asana's authored pose parameters.
  //
  // Asana.poseParameters describes the finished posture as joint rotations, in
  // the same convention the rig uses. The mapping from data field to rig joint:
  //
  //   torsoAngle / headAngle       -> torso / head
  //   leftArm / rightArm           -> {left,right}Shoulder
  //   leftForearm / rightForearm   -> {left,right}Elbow
  //   leftLeg / rightLeg           -> {left,right}Hip
  //   leftShin / rightShin         -> {left,right}Knee
  //
  // The rig's rest state (every joint at zero) is Tadasana, so scaling the
  // authored angles by an entry factor eases the model from standing into the
  // posture across the opening steps, then holds it for the remaining ones.
  const applyAsanaPose = useCallback((target: Asana | undefined, stepIdx: number) => {
    const state = threeRef.current;
    if (!state) return;

    const pose = target?.poseParameters;
    if (!pose) {
      state.targetJoints = {};
      state.targetElevation = 0;
      state.targetPoseRotationY = 0;
      return;
    }

    // 0 while still standing, 1 once the posture is fully established.
    const entry = ENTRY_STEPS > 0 ? Math.min(1, Math.max(0, stepIdx / ENTRY_STEPS)) : 1;
    const eased = (angles: [number, number, number]) =>
      new THREE.Euler(angles[0] * entry, angles[1] * entry, angles[2] * entry);

    state.targetJoints = {
      torso: eased(pose.torsoAngle),
      head: eased(pose.headAngle),
      leftShoulder: eased(pose.leftArm),
      rightShoulder: eased(pose.rightArm),
      leftElbow: eased(pose.leftForearm),
      rightElbow: eased(pose.rightForearm),
      leftHip: eased(pose.leftLeg),
      rightHip: eased(pose.rightLeg),
      leftKnee: eased(pose.leftShin),
      rightKnee: eased(pose.rightShin),
    };

    state.targetElevation = pose.elevation * entry;
    state.targetPoseRotationY = pose.rotationY * entry;
  }, []);

  useEffect(() => {
    applyAsanaPose(asana, currentStepIndex);
  }, [asana, currentStepIndex, applyAsanaPose]);

  // --- Data-driven overlay layers ----------------------------------------

  // Markers are parented to specific bones, so they must be rebuilt whenever
  // the asana changes (different muscles) or the rig is swapped (different
  // bones). The GLB loader reaches this through rebuildLayersRef.
  const rebuildDataLayers = useCallback(() => {
    const state = threeRef.current;
    if (!state) return;

    state.dataLayers?.dispose();
    state.dataLayers = createDataLayers(
      asana,
      state.bodyParts,
      state.restRotations,
      state.humanGroup
    );
  }, [asana]);

  useEffect(() => {
    rebuildLayersRef.current = rebuildDataLayers;
  }, [rebuildDataLayers]);

  useEffect(() => {
    rebuildDataLayers();
    return () => {
      const state = threeRef.current;
      state?.dataLayers?.dispose();
      if (state) state.dataLayers = null;
    };
  }, [rebuildDataLayers]);

  // Declared after the rebuild effect so it runs second and re-applies the
  // current selection to freshly built markers.
  useEffect(() => {
    const layers = threeRef.current?.dataLayers;
    if (!layers) return;

    layers.setChakrasVisible(activeLayer === 'chakras');
    layers.setMusclesVisible(activeLayer === 'muscles');
    layers.setSelectedChakra(selectedChakraId);
    layers.setSelectedMuscle(selectedMuscleId);
  }, [activeLayer, selectedChakraId, selectedMuscleId, asana]);

  // Breath runs only while its layer is showing, and restarts on each change so
  // it always begins on the inhale rather than mid-cycle.
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    const phases = asana?.breathPattern?.phases;
    state.breathPhases =
      activeLayer === 'breath' && phases && phases.length > 0
        ? phases.map((p) => ({ phase: p.phase, duration: Math.max(0.5, p.duration) }))
        : null;
    state.breathPhaseIndex = 0;
    state.breathElapsed = 0;
  }, [activeLayer, asana]);

  // Camera Presets & Zoom
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    const baseDistance = 3.4 / Math.max(0.4, Math.min(2.5, zoomLevel));

    if (cameraViewPreset === 'front') {
      state.targetCameraPos.set(0, 1.1, baseDistance);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraViewPreset === 'side') {
      state.targetCameraPos.set(baseDistance, 1.1, 0.05);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraViewPreset === 'back') {
      state.targetCameraPos.set(0, 1.1, -baseDistance);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraViewPreset === 'top') {
      state.targetCameraPos.set(0.05, baseDistance * 1.2, 0.1);
      state.targetRotation = { x: 0, y: 0 };
    } else {
      // 360 / Default angled view (matches reference image)
      state.targetCameraPos.set(0.65, 1.25, baseDistance);
    }
  }, [cameraViewPreset, zoomLevel]);

  // Mouse Interaction (Orbit 360°, Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    const state = threeRef.current;
    if (!state) return;
    state.isDragging = true;
    state.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const state = threeRef.current;
    if (!state || !state.isDragging) return;

    const deltaX = e.clientX - state.previousMousePosition.x;
    const deltaY = e.clientY - state.previousMousePosition.y;

    state.targetRotation.y += deltaX * 0.008;
    state.targetRotation.x = Math.max(-0.45, Math.min(0.45, state.targetRotation.x + deltaY * 0.006));

    state.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    const state = threeRef.current;
    if (state) state.isDragging = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
