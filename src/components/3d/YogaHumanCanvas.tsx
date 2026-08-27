import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import type { Asana, VisualLayerType, MuscleActivation, BoneInfo } from '../../types';
import { createDetailedHumanModel, HumanRigResult } from './detailedHumanModel';
import { HUMAN_MODEL_URL, modelIsAvailable, resolveAvailableModelUrl } from '../../config/model';
import { createDataLayers, type DataLayers } from './dataLayers';
import { Anatomy3DOverlay, ScreenPin } from './Anatomy3DOverlay';
import { ALL_BONES } from '../../data/asanas';
import type { StudioViewMode } from '../studio/TopModeSwitcher';

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
  viewMode?: StudioViewMode;
  selectedMuscleId?: string | null;
  /** Highlights one chakra in the spinal column when the chakra layer is on. */
  selectedChakraId?: string | null;
  selectedBoneId?: string | null;
  selectedPin?: ScreenPin | null;
  onSelectPin?: (pin: ScreenPin | null) => void;
  cameraViewPreset?: '360' | 'orbit' | 'front' | 'side' | 'back' | 'top' | 'upper' | 'lower' | 'skeleton' | 'muscle';
  zoomLevel?: number;
  isDark?: boolean;
  isPanning?: boolean;
  isAutoRotating?: boolean;
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

// Scratch objects reused by the render loop, so posing allocates nothing.
const authoredQuat = new THREE.Quaternion();
const basisInverse = new THREE.Quaternion();
const targetQuat = new THREE.Quaternion();
const restQuat = new THREE.Quaternion();

/**
 * Turns an authored angle into the rotation a specific bone should hold.
 *
 * Two corrections are folded in:
 *   poseBasis conjugation — re-expresses the rotation in the bone's own frame.
 *     Without it a Mixamo arm bone reads `leftArm: [0, 0, 1.57]` as "swing
 *     forward" instead of "swing out to the side".
 *   rest composition — the procedural rig rests at zero, a loaded GLB rests in
 *     its calibrated stance.
 *
 * Writes into `out` and returns it, so callers can slerp toward it or snap to it.
 */
function poseQuaternionFor(
  out: THREE.Quaternion,
  authored: THREE.Euler,
  basis: THREE.Quaternion | undefined,
  rest: THREE.Euler | undefined
): THREE.Quaternion {
  authoredQuat.setFromEuler(authored);

  if (basis) {
    basisInverse.copy(basis).invert();
    out.copy(basis).multiply(authoredQuat).multiply(basisInverse);
  } else {
    out.copy(authoredQuat);
  }

  if (rest) out.multiply(restQuat.setFromEuler(rest));
  return out;
}

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
  selectedBoneId,
  selectedPin,
  onSelectPin,
  cameraViewPreset = '360',
  zoomLevel = 1.0,
  isDark = true,
  isPanning = false,
  isAutoRotating = false,
  className = '',
  onCameraMove,
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
    poseBasis: { [key: string]: THREE.Quaternion };
    muscleMeshes: { [key: string]: THREE.Mesh };
    heatmapMeshes: { [key: string]: THREE.Mesh };
    skeletonGroup: THREE.Group;
    skeletonParts: THREE.Object3D[];
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

  const propsRef = useRef({
    asana,
    currentStepIndex,
    viewMode,
    showAnatomyOverlay,
    showSkeleton,
    activeLayer,
    isAutoRotating,
  });

  useEffect(() => {
    propsRef.current = {
      asana,
      currentStepIndex,
      viewMode,
      showAnatomyOverlay,
      showSkeleton,
      activeLayer,
      isAutoRotating,
    };
  }, [asana, currentStepIndex, viewMode, showAnatomyOverlay, showSkeleton, activeLayer, isAutoRotating]);

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

    // Front Face Engraved Branding: PRAGYA 3d verse
    function createBrandingTexture(): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 512, 128);

        // Golden geometric folded triangle logo
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(80, 85);
        ctx.lineTo(105, 35);
        ctx.lineTo(130, 85);
        ctx.lineTo(92, 60);
        ctx.lineTo(118, 60);
        ctx.stroke();

        // Text: PRAGYA in capital
        ctx.fillStyle = '#d4af37';
        ctx.font = '900 32px "Cinzel", "Outfit", sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('PRAGYA', 150, 58);

        // Subtitle: 3d verse in small
        ctx.fillStyle = '#e5c158';
        ctx.font = 'bold 15px "Plus Jakarta Sans", monospace';
        ctx.letterSpacing = '4px';
        ctx.fillText('3d verse', 150, 86);
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
      poseBasis: humanRig.poseBasis,
      muscleMeshes: humanRig.muscleMeshes,
      heatmapMeshes: humanRig.heatmapMeshes,
      skeletonGroup: humanRig.skeletonGroup,
      skeletonParts: humanRig.skeletonParts,
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
      resolveAvailableModelUrl()
        .then((modelUrl) => {
          if (cancelled || !modelUrl) {
            console.info(
              `[YogaHumanCanvas] No 3D model found — using the high-detail procedural figure.`
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
          state.poseBasis = loaded.poseBasis;
          state.heatmapMeshes = loaded.heatmapMeshes;
          state.skeletonGroup = loaded.skeletonGroup;
          state.skeletonParts = loaded.skeletonParts;
          state.skinMeshes = loaded.skinMeshes;
          state.clothingMeshes = loaded.clothingMeshes;

          state.scene.add(loaded.humanGroup);

          // Snap the new body straight into the pose already selected
          Object.entries(state.targetJoints).forEach(([partName, targetEuler]) => {
            const part = state.bodyParts[partName];
            if (!part) return;
            part.quaternion.copy(
              poseQuaternionFor(
                targetQuat,
                targetEuler,
                state.poseBasis[partName],
                state.restRotations[partName]
              )
            );
          });
          state.currentElevation = state.targetElevation;
          state.currentPoseRotationY = state.targetPoseRotationY;
          state.humanGroup.updateMatrixWorld(true);

          // Markers were parented to the old rig's bones, so rebuild them
          // against the new skeleton.
          rebuildLayersRef.current();
        })
        .catch((err) => {
          console.warn(
            `[YogaHumanCanvas] Keeping the procedural model — GLB model did not load.`,
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
      // Authored angles are a delta from the rig's neutral stance, expressed in
      // the studio's canonical axes. Two corrections turn that into a rotation
      // for whichever rig is loaded:
      //
      //   poseBasis conjugation — re-expresses the rotation in the bone's own
      //     frame. Without it, a Mixamo arm bone takes `leftArm: [0, 0, 1.57]`
      //     and swings the arm forward instead of out to the side.
      //   rest composition — the procedural rig rests at zero, a GLB rests in
      //     its calibrated stance.
      //
      // Slerp rather than per-component Euler lerp, so a joint takes the short
      // way round instead of unwinding through a strange intermediate pose.
      Object.entries(state.targetJoints).forEach(([partName, targetEuler]) => {
        const part = state.bodyParts[partName];
        if (!part) return;

        poseQuaternionFor(
          targetQuat,
          targetEuler,
          state.poseBasis[partName],
          state.restRotations[partName]
        );

        part.quaternion.slerp(targetQuat, 0.1);
      });

      elapsed += delta;
      state.dataLayers?.update(elapsed);
      advanceBreath(state, delta);

      // Auto-rotation when active
      if (propsRef.current.isAutoRotating) {
        state.targetRotation.y += 0.003;
      }

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

  const [screenPins, setScreenPins] = useState<ScreenPin[]>([]);
  const [internalSelectedPin, setInternalSelectedPin] = useState<ScreenPin | null>(null);

  // Update Visual Layers (Anatomy Heatmap, Skeleton, Alignment Grid, Props, ViewMode)
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    const boneFocus = viewMode === 'bone';
    const muscleFocus = viewMode === 'muscle';

    // 1. Muscle heatmaps (procedural rig only — rendered directly on top of the solid body)
    Object.values(state.heatmapMeshes).forEach((mesh) => {
      mesh.visible = showAnatomyOverlay || muscleFocus;
    });

    // 2. 3D skeleton (luminous ivory bones rendered on the solid figure)
    const skeletonOn = showSkeleton || boneFocus;
    state.skeletonGroup.visible = skeletonOn;
    for (const part of state.skeletonParts) {
      part.visible = skeletonOn;
    }

    // 3. Alignment grid & laser axes
    state.alignmentGridGroup.visible = showAlignmentGrid;
    state.verticalPlumbLine.visible = showAlignmentGrid;
    state.horizontalArmAxis.visible = showAlignmentGrid;

    // 4. Props
    state.propBlockMesh.visible = showProps;

    // 5. Model remains solid and fully opaque at all times (matching reference image style)
    state.skinMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = 1.0;
      mat.transparent = false;
    });

    state.clothingMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = 1.0;
      mat.transparent = false;
    });
  }, [showAnatomyOverlay, showSkeleton, showAlignmentGrid, showProps, viewMode, activeLayer]);

  // Drive the rig from the selected asana's authored pose parameters with continuous scrubber support.
  const applyAsanaPose = useCallback(
    (target: Asana | undefined, stepIdx: number, progress?: number) => {
      const state = threeRef.current;
      if (!state) return;

      const steps = target?.steps;
      const totalSteps = steps?.length || 5;

      let effectiveStep = stepIdx;
      let fraction = 0;
      if (typeof progress === 'number') {
        const continuousIndex = (Math.max(0, Math.min(100, progress)) / 100) * (totalSteps - 1);
        effectiveStep = Math.floor(continuousIndex);
        fraction = continuousIndex - effectiveStep;
      } else {
        effectiveStep = Math.max(0, Math.min(totalSteps - 1, stepIdx));
        fraction = 0;
      }

      const currentStepObj = steps?.[effectiveStep];
      const nextStepObj = steps?.[Math.min(totalSteps - 1, effectiveStep + 1)];

      const lerpAngle = (a: [number, number, number], b: [number, number, number], f: number) =>
        new THREE.Euler(
          a[0] * (1 - f) + b[0] * f,
          a[1] * (1 - f) + b[1] * f,
          a[2] * (1 - f) + b[2] * f
        );

      if (currentStepObj?.stepPoseParameters && nextStepObj?.stepPoseParameters) {
        const p1 = currentStepObj.stepPoseParameters;
        const p2 = nextStepObj.stepPoseParameters;

        state.targetJoints = {
          torso: lerpAngle(p1.torsoAngle, p2.torsoAngle, fraction),
          head: lerpAngle(p1.headAngle, p2.headAngle, fraction),
          leftShoulder: lerpAngle(p1.leftArm, p2.leftArm, fraction),
          rightShoulder: lerpAngle(p1.rightArm, p2.rightArm, fraction),
          leftElbow: lerpAngle(p1.leftForearm, p2.leftForearm, fraction),
          rightElbow: lerpAngle(p1.rightForearm, p2.rightForearm, fraction),
          leftHip: lerpAngle(p1.leftLeg, p2.leftLeg, fraction),
          rightHip: lerpAngle(p1.rightLeg, p2.rightLeg, fraction),
          leftKnee: lerpAngle(p1.leftShin, p2.leftShin, fraction),
          rightKnee: lerpAngle(p1.rightShin, p2.rightShin, fraction),
        };

        state.targetElevation = p1.elevation * (1 - fraction) + p2.elevation * fraction;
        state.targetPoseRotationY = p1.rotationY * (1 - fraction) + p2.rotationY * fraction;
        return;
      }

      const pose = target?.poseParameters;
      if (!pose) {
        state.targetJoints = {};
        state.targetElevation = 0;
        state.targetPoseRotationY = 0;
        return;
      }

      // Smooth step-by-step interpolation across steps 0 to totalSteps - 1
      const normalizedT = totalSteps > 1
        ? (effectiveStep + fraction) / (totalSteps - 1)
        : 1;

      // Easing curve from setup (0) -> unfolding (0.35) -> deepening (0.75) -> full expression (1.0)
      const easeProgress = Math.sin((normalizedT * Math.PI) / 2);

      const easeAngle = (angles: [number, number, number]) =>
        new THREE.Euler(
          angles[0] * easeProgress,
          angles[1] * easeProgress,
          angles[2] * easeProgress
        );

      state.targetJoints = {
        torso: easeAngle(pose.torsoAngle),
        head: easeAngle(pose.headAngle),
        leftShoulder: easeAngle(pose.leftArm),
        rightShoulder: easeAngle(pose.rightArm),
        leftElbow: easeAngle(pose.leftForearm),
        rightElbow: easeAngle(pose.rightForearm),
        leftHip: easeAngle(pose.leftLeg),
        rightHip: easeAngle(pose.rightLeg),
        leftKnee: easeAngle(pose.leftShin),
        rightKnee: easeAngle(pose.rightShin),
      };

      state.targetElevation = pose.elevation * easeProgress;
      state.targetPoseRotationY = pose.rotationY * easeProgress;
    },
    []
  );

  useEffect(() => {
    applyAsanaPose(asana, currentStepIndex ?? 0, scrubberProgress);
  }, [asana, currentStepIndex, scrubberProgress, applyAsanaPose]);

  // --- Data-driven overlay layers ----------------------------------------

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

  useEffect(() => {
    const layers = threeRef.current?.dataLayers;
    if (!layers) return;

    layers.setChakrasVisible(activeLayer === 'chakras');
    const isMuscleMode = activeLayer === 'muscles' || showAnatomyOverlay || viewMode === 'muscle';
    layers.setMusclesVisible(isMuscleMode);
    layers.setSelectedChakra(selectedChakraId);
    layers.setSelectedMuscle(selectedMuscleId);
  }, [activeLayer, selectedChakraId, selectedMuscleId, asana, showAnatomyOverlay, viewMode]);

  // Breath cycle
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

    const baseDistance = 3.4 / Math.max(0.4, Math.min(2.5, zoomLevel ?? 1));

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
    } else if (cameraViewPreset === 'upper') {
      state.targetCameraPos.set(0.2, 1.4, baseDistance * 0.7);
      state.targetRotation = { x: 0, y: 0.1 };
    } else if (cameraViewPreset === 'lower') {
      state.targetCameraPos.set(0.2, 0.6, baseDistance * 0.75);
      state.targetRotation = { x: 0, y: 0.1 };
    } else if (cameraViewPreset === 'skeleton' || cameraViewPreset === 'muscle') {
      state.targetCameraPos.set(0.4, 1.15, baseDistance * 0.85);
      state.targetRotation = { x: 0, y: 0.15 };
    } else {
      // 360 / Default angled view
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

    if (isPanning) {
      state.humanGroup.position.x += deltaX * 0.003;
      state.humanGroup.position.y -= deltaY * 0.003;
    } else {
      state.targetRotation.y += deltaX * 0.008;
      state.targetRotation.x = Math.max(-0.45, Math.min(0.45, state.targetRotation.x + deltaY * 0.006));
    }

    state.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    const state = threeRef.current;
    if (state) state.isDragging = false;
  };

  const effectiveSelectedPin = selectedPin !== undefined ? selectedPin : internalSelectedPin;
  const handlePinSelect = (pin: ScreenPin | null) => {
    setInternalSelectedPin(pin);
    if (onSelectPin) {
      onSelectPin(pin);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden ${className || ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
