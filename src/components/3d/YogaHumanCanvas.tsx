import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Asana } from '../../types';
import { createDetailedHumanModel, HumanRigResult } from './detailedHumanModel';

export interface YogaHumanCanvasProps {
  asana?: Asana;
  currentStepIndex?: number;
  scrubberProgress?: number; // 0 to 100
  showAnatomyOverlay?: boolean;
  showSkeleton?: boolean;
  showAlignmentGrid?: boolean;
  showProps?: boolean;
  viewMode?: 'camera' | 'bone' | 'muscle';
  selectedMuscleId?: string | null;
  cameraPreset?: '360' | 'orbit' | 'front' | 'side' | 'back' | 'top';
  zoomLevel?: number;
  isDark?: boolean;
  className?: string;
  onCameraMove?: () => void;
}

export const YogaHumanCanvas: React.FC<YogaHumanCanvasProps> = ({
  asana,
  currentStepIndex = 2, // Step 3/6 default (Warrior II)
  scrubberProgress = 40,
  showAnatomyOverlay = true,
  showSkeleton = true,
  showAlignmentGrid = true,
  showProps = false,
  viewMode = 'camera',
  selectedMuscleId,
  cameraPreset = 'orbit',
  zoomLevel = 1.0,
  isDark = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    humanGroup: THREE.Group;
    bodyParts: { [key: string]: THREE.Object3D };
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
    };

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

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const state = threeRef.current;
      if (!state) return;

      const delta = clock.getDelta();

      // Smooth Rotation Damping
      state.currentRotation.x += (state.targetRotation.x - state.currentRotation.x) * 0.08;
      state.currentRotation.y += (state.targetRotation.y - state.currentRotation.y) * 0.08;
      state.humanGroup.rotation.y = state.currentRotation.y;
      state.humanGroup.rotation.x = state.currentRotation.x;

      // Smooth Camera Damping
      state.currentCameraPos.lerp(state.targetCameraPos, 0.07);
      state.camera.position.copy(state.currentCameraPos);
      state.camera.lookAt(0, 0.88, 0);

      // Smooth Joint Interpolation
      Object.entries(state.targetJoints).forEach(([partName, targetEuler]) => {
        const part = state.bodyParts[partName];
        if (part) {
          part.rotation.x += (targetEuler.x - part.rotation.x) * 0.1;
          part.rotation.y += (targetEuler.y - part.rotation.y) * 0.1;
          part.rotation.z += (targetEuler.z - part.rotation.z) * 0.1;
        }
      });

      state.renderer.render(state.scene, state.camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  // Update Visual Layers (Anatomy Heatmap, Skeleton, Alignment Grid, Props, ViewMode)
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    const isMuscleMode = viewMode === 'muscle' || showAnatomyOverlay;
    const isBoneMode = viewMode === 'bone' || showSkeleton;

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
      if (viewMode === 'bone') {
        mat.opacity = 0.22;
        mat.transparent = true;
      } else if (viewMode === 'muscle') {
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
  }, [showAnatomyOverlay, showSkeleton, showAlignmentGrid, showProps, viewMode]);

  // Apply Pose Parameters (Warrior II, Steps 1-6)
  const applyWarriorPose = useCallback((progress: number, stepIdx: number) => {
    const state = threeRef.current;
    if (!state) return;

    // Step 0: Tadasana (Standing straight)
    // Step 1: Wide Stance
    // Step 2: Warrior II (90° bent front knee, horizontal arms, head turned)
    // Step 3: Reverse Warrior (Back arm to rear thigh, front arm swept overhead)
    // Step 4: Return to Warrior II
    // Step 5: Completion

    if (stepIdx === 0) {
      // Mountain Pose
      state.targetJoints = {
        torso: new THREE.Euler(0, 0, 0),
        head: new THREE.Euler(0, 0, 0),
        leftShoulder: new THREE.Euler(0, 0, -0.15),
        rightShoulder: new THREE.Euler(0, 0, 0.15),
        leftElbow: new THREE.Euler(0, 0, 0),
        rightElbow: new THREE.Euler(0, 0, 0),
        leftHip: new THREE.Euler(0, 0, 0.05),
        rightHip: new THREE.Euler(0, 0, -0.05),
        leftKnee: new THREE.Euler(0, 0, 0),
        rightKnee: new THREE.Euler(0, 0, 0),
      };
    } else if (stepIdx === 3) {
      // Reverse Warrior
      state.targetJoints = {
        torso: new THREE.Euler(0, 0.2, 0.35),
        head: new THREE.Euler(-0.25, 0.6, 0.1),
        leftShoulder: new THREE.Euler(0, 0, 2.6), // Front arm overhead
        rightShoulder: new THREE.Euler(0, 0, -0.4), // Rear arm along back thigh
        leftElbow: new THREE.Euler(0, 0, -0.1),
        rightElbow: new THREE.Euler(0, 0, 0),
        leftHip: new THREE.Euler(0.2, 0.3, 1.2), // Front knee bent deep
        rightHip: new THREE.Euler(-0.15, -0.2, -0.85), // Rear leg extended
        leftKnee: new THREE.Euler(-1.45, 0, 0),
        rightKnee: new THREE.Euler(-0.08, 0, 0),
      };
    } else {
      // Step 2 (Warrior II default / reference image pose)
      state.targetJoints = {
        torso: new THREE.Euler(0, 0.12, 0),
        head: new THREE.Euler(0, 1.35, 0), // Head turned gazing over front fingertips
        leftShoulder: new THREE.Euler(0, 0, 1.57), // Left arm extended horizontal parallel to floor
        rightShoulder: new THREE.Euler(0, 0, -1.57), // Right arm extended horizontal back
        leftElbow: new THREE.Euler(0, 0, 0),
        rightElbow: new THREE.Euler(0, 0, 0),
        leftHip: new THREE.Euler(0.25, 0.45, 1.15), // Front hip deeply opened & abducted
        rightHip: new THREE.Euler(-0.18, -0.25, -0.92), // Rear hip grounded
        leftKnee: new THREE.Euler(-1.52, 0, 0), // Front knee bent 90° tracking over ankle
        rightKnee: new THREE.Euler(-0.06, 0, 0), // Rear knee straight
      };
    }
  }, []);

  useEffect(() => {
    applyWarriorPose(scrubberProgress, currentStepIndex);
  }, [scrubberProgress, currentStepIndex, applyWarriorPose]);

  // Camera Presets & Zoom
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    const baseDistance = 3.4 / Math.max(0.4, Math.min(2.5, zoomLevel));

    if (cameraPreset === 'front') {
      state.targetCameraPos.set(0, 1.1, baseDistance);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraPreset === 'side') {
      state.targetCameraPos.set(baseDistance, 1.1, 0.05);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraPreset === 'back') {
      state.targetCameraPos.set(0, 1.1, -baseDistance);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraPreset === 'top') {
      state.targetCameraPos.set(0.05, baseDistance * 1.2, 0.1);
      state.targetRotation = { x: 0, y: 0 };
    } else {
      // 360 / Default angled view (matches reference image)
      state.targetCameraPos.set(0.65, 1.25, baseDistance);
    }
  }, [cameraPreset, zoomLevel]);

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
