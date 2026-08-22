import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Asana, VisualLayerType, MuscleActivation, BodySystemType, ChakraInfo } from '../../types';
import { createDetailedHumanModel, HumanRigResult } from './detailedHumanModel';
import { loadGLTFModel } from './gltfModelLoader';

interface YogaHumanCanvasProps {
  asana?: Asana;
  currentStepIndex?: number;
  activeLayer: VisualLayerType;
  selectedMuscleId?: string | null;
  onSelectMuscle?: (muscle: MuscleActivation | null) => void;
  selectedChakraId?: string | null;
  onSelectChakra?: (chakra: ChakraInfo | null) => void;
  activeBodySystem?: BodySystemType;
  isBreathingActive?: boolean;
  breathPhaseIndex?: number; // 0: inhale, 1: hold, 2: exhale, 3: suspend
  autoRotate?: boolean;
  isDark?: boolean;
  className?: string;
  scrollProgress?: number; // 0 to 1 for scroll-driven interpolation
  customPoseParams?: Asana['poseParameters'];
  allowManualControl?: boolean;
  showHUDPins?: boolean;
  showOrbitalTelemetry?: boolean;
  cameraViewPreset?: '360' | 'orbit' | 'front' | 'side' | 'back' | 'top' | 'sagittal' | 'coronal' | 'transverse' | 'spine';
  zoomLevel?: number;
  customModelSource?: string | File | null;
  onCameraMove?: () => void;
}

interface HUDPin {
  id: string;
  name: string;
  role: string;
  percentage: number;
  worldPos: THREE.Vector3;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export const YogaHumanCanvas: React.FC<YogaHumanCanvasProps> = ({
  asana,
  currentStepIndex = 0,
  activeLayer = 'skin',
  selectedMuscleId,
  onSelectMuscle,
  selectedChakraId,
  onSelectChakra,
  activeBodySystem = 'musculoskeletal',
  isBreathingActive = false,
  breathPhaseIndex = 0,
  autoRotate = false,
  isDark = false,
  className = '',
  scrollProgress,
  customPoseParams,
  allowManualControl = true,
  showHUDPins = true,
  showOrbitalTelemetry = false,
  cameraViewPreset = 'orbit',
  zoomLevel = 1.0,
  customModelSource,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const customModelGroupRef = useRef<THREE.Group | null>(null);
  
  // Three.js instance state
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    humanGroup: THREE.Group;
    bodyParts: { [key: string]: THREE.Object3D };
    muscleMeshes: { [key: string]: THREE.Mesh };
    skinMeshes: THREE.Mesh[];
    chakraMeshes: { [key: string]: THREE.Group };
    skeletonGroup: THREE.Group;
    breathMesh: THREE.Mesh;
    systemParticles: THREE.Points;
    cosmicParticles: THREE.Points;
    orbitalRingsGroup: THREE.Group;
    radarFloorGrid: THREE.Group;
    bioLinesGroup: THREE.Group;
    lights: {
      ambient: THREE.AmbientLight;
      directional: THREE.DirectionalLight;
      point: THREE.PointLight;
      rim: THREE.DirectionalLight;
      fill: THREE.DirectionalLight;
    };
    targetRotation: { x: number; y: number };
    currentRotation: { x: number; y: number };
    targetCameraPos: THREE.Vector3;
    currentCameraPos: THREE.Vector3;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
    targetJoints: { [key: string]: THREE.Euler };
    currentJoints: { [key: string]: THREE.Euler };
    targetElevation: number;
    currentElevation: number;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    activeAsanaId: string;
  } | null>(null);

  const [hudPins, setHudPins] = useState<HUDPin[]>([]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.95, 3.1);

    // 3. Renderer with high color fidelity
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
    renderer.toneMappingExposure = 1.15;

    // 4. Studio Lighting Rig (Cinematic Key, Soft Fill, Blue Rim, and Floor Bounce)
    const ambient = new THREE.AmbientLight(0xfff8f0, 1.3);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xfff2e6, 2.2);
    directional.position.set(3.5, 4.5, 3.5);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    directional.shadow.bias = -0.0004;
    scene.add(directional);

    const fill = new THREE.DirectionalLight(0x90cdf4, 0.9);
    fill.position.set(-3.5, 2.0, 2.0);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rim.position.set(-3, 3.5, -3.5);
    scene.add(rim);

    const point = new THREE.PointLight(0xd9ae29, 1.2, 8);
    point.position.set(0, 0.2, -1.5);
    scene.add(point);

    // 5. Anatomical Sculpted Human Rig Setup
    const humanRig: HumanRigResult = createDetailedHumanModel();
    const humanGroup = humanRig.humanGroup;
    scene.add(humanGroup);

    const bodyParts = humanRig.bodyParts;
    const muscleMeshes = humanRig.muscleMeshes;
    const skinMeshes = humanRig.skinMeshes;
    const chakraMeshes: { [key: string]: THREE.Group } = {};
    const skeletonGroup = new THREE.Group();
    humanGroup.add(skeletonGroup);

    const bioLinesGroup = new THREE.Group();
    humanGroup.add(bioLinesGroup);

    const boneMat = humanRig.materials.bone;
    const pelvis = bodyParts.pelvis as THREE.Group;
    const chest = bodyParts.chest as THREE.Group;

    // --- G. SKELETON / VERTEBRAL COLUMN ---
    const spineBone = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.68, 12), boneMat);
    spineBone.position.set(0, 0.36, -0.05);
    pelvis.add(spineBone);
    skeletonGroup.add(spineBone);

    // --- H. 7 CHAKRA ENERGY VORTICES ---
    const chakraDefs = [
      { id: 'muladhara', color: 0xe53e3e, y: 0.0, label: 'Muladhara (Root)' },
      { id: 'svadhisthana', color: 0xed8936, y: 0.16, label: 'Svadhisthana (Sacral)' },
      { id: 'manipura', color: 0xd9ae29, y: 0.32, label: 'Manipura (Solar)' },
      { id: 'anahata', color: 0x38a169, y: 0.48, label: 'Anahata (Heart)' },
      { id: 'vishuddha', color: 0x3182ce, y: 0.62, label: 'Vishuddha (Throat)' },
      { id: 'ajna', color: 0x553c9a, y: 0.74, label: 'Ajna (Third Eye)' },
      { id: 'sahasrara', color: 0x805ad5, y: 0.88, label: 'Sahasrara (Crown)' },
    ];

    chakraDefs.forEach((c) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(0, c.y, 0);

      // Core glowing energy sphere
      const orbMat = new THREE.MeshStandardMaterial({
        color: c.color,
        emissive: c.color,
        emissiveIntensity: 1.5,
        roughness: 0.15,
        metalness: 0.85,
      });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 20, 20), orbMat);
      cGroup.add(orb);

      // Orbiting Torus Ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: c.color,
        transparent: true,
        opacity: 0.7,
        wireframe: true,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 10, 28), ringMat);
      ring.rotation.x = Math.PI / 2;
      cGroup.add(ring);

      cGroup.name = c.id;
      cGroup.visible = false;
      pelvis.add(cGroup);
      chakraMeshes[c.id] = cGroup;
    });

    // --- I. BREATH VOLUME HALO ---
    const breathGeom = new THREE.SphereGeometry(0.42, 28, 28);
    const breathMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: true,
    });
    const breathMesh = new THREE.Mesh(breathGeom, breathMat);
    breathMesh.position.set(0, 0.18, 0);
    chest.add(breathMesh);

    // --- J. BODY SYSTEM PARTICLE FLOW ---
    const particleCount = 240;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 0.48;
      particlePositions[i * 3 + 1] = (Math.random() - 0.2) * 1.6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.38;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd9ae29,
      size: 0.03,
      transparent: true,
      opacity: 0.0,
    });
    const systemParticles = new THREE.Points(particleGeom, particleMat);
    humanGroup.add(systemParticles);

    // --- K. COSMIC PRANA STARDUST PARTICLES ---
    const cosmicCount = 380;
    const cosmicGeom = new THREE.BufferGeometry();
    const cosmicPos = new Float32Array(cosmicCount * 3);
    for (let i = 0; i < cosmicCount; i++) {
      cosmicPos[i * 3] = (Math.random() - 0.5) * 7.5;
      cosmicPos[i * 3 + 1] = (Math.random() - 0.3) * 6.5;
      cosmicPos[i * 3 + 2] = (Math.random() - 0.5) * 7.5;
    }
    cosmicGeom.setAttribute('position', new THREE.BufferAttribute(cosmicPos, 3));
    const cosmicMat = new THREE.PointsMaterial({
      color: 0xd9ae29,
      size: 0.024,
      transparent: true,
      opacity: 0.45,
    });
    const cosmicParticles = new THREE.Points(cosmicGeom, cosmicMat);
    scene.add(cosmicParticles);

    // --- L. ORBITAL TELEMETRY GIMBAL RINGS (Zajno Space-Station HUD) ---
    const orbitalRingsGroup = new THREE.Group();
    orbitalRingsGroup.position.set(0, 0.9, 0);
    scene.add(orbitalRingsGroup);

    // Ring 1: Equatorial Gold Orbit
    const ring1Geom = new THREE.RingGeometry(1.28, 1.295, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xd9ae29,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.38,
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 2;
    orbitalRingsGroup.add(ring1);

    // Ring 2: Tilted Orbital Axis (23.5° inclination)
    const ring2Geom = new THREE.TorusGeometry(1.48, 0.006, 8, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    orbitalRingsGroup.add(ring2);

    // Satellite Beacon on Tilted Orbit
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.5,
    });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), beaconMat);
    beacon.position.set(1.48, 0, 0);
    ring2.add(beacon);

    // Ring 3: Inner Vertical Meridian Ring
    const ring3Geom = new THREE.TorusGeometry(1.15, 0.004, 6, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xd9ae29,
      transparent: true,
      opacity: 0.22,
    });
    const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
    orbitalRingsGroup.add(ring3);

    // --- M. RADAR FLOOR GRID & CONCENTRIC RANGE RINGS ---
    const radarFloorGrid = new THREE.Group();
    radarFloorGrid.position.set(0, -0.015, 0);
    scene.add(radarFloorGrid);

    [0.5, 0.95, 1.45, 1.95].forEach((radius, idx) => {
      const circleGeom = new THREE.RingGeometry(radius, radius + 0.008, 48);
      const circleMat = new THREE.MeshBasicMaterial({
        color: idx === 1 ? 0xd9ae29 : 0x00381f,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: idx === 1 ? 0.35 : 0.18,
      });
      const circle = new THREE.Mesh(circleGeom, circleMat);
      circle.rotation.x = -Math.PI / 2;
      radarFloorGrid.add(circle);
    });

    // Radial Crosshair Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xd9ae29, transparent: true, opacity: 0.2 });
    const crossPoints = [
      new THREE.Vector3(-2.1, 0, 0), new THREE.Vector3(2.1, 0, 0),
      new THREE.Vector3(0, 0, -2.1), new THREE.Vector3(0, 0, 2.1),
    ];
    const crossGeom = new THREE.BufferGeometry().setFromPoints(crossPoints);
    const crossLines = new THREE.LineSegments(crossGeom, lineMat);
    radarFloorGrid.add(crossLines);

    // Floor Shadow Disc
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x001a0e,
      transparent: true,
      opacity: 0.3,
    });
    const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(0.85, 36), shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -0.02;
    scene.add(shadowDisc);

    // Save Instance References
    threeRef.current = {
      scene,
      camera,
      renderer,
      humanGroup,
      bodyParts,
      muscleMeshes,
      skinMeshes,
      chakraMeshes,
      skeletonGroup,
      breathMesh,
      systemParticles,
      cosmicParticles,
      orbitalRingsGroup,
      radarFloorGrid,
      bioLinesGroup,
      lights: { ambient, directional, point, rim, fill },
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      targetCameraPos: new THREE.Vector3(0, 0.95, 3.1),
      currentCameraPos: new THREE.Vector3(0, 0.95, 3.1),
      isDragging: false,
      previousMousePosition: { x: 0, y: 0 },
      targetJoints: {},
      currentJoints: {},
      targetElevation: 0,
      currentElevation: 0,
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      activeAsanaId: asana?.id || 'tadasana',
    };

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !threeRef.current) return;
      const w = containerRef.current.clientWidth || 600;
      const h = containerRef.current.clientHeight || 600;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 8. Animation & Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const state = threeRef.current;
      if (!state) return;

      const elapsedTime = clock.getElapsedTime();

      // Auto-Rotation
      if (autoRotate && !state.isDragging) {
        state.targetRotation.y += 0.007;
      }

      // Smooth Rotation Damping
      state.currentRotation.x += (state.targetRotation.x - state.currentRotation.x) * 0.08;
      state.currentRotation.y += (state.targetRotation.y - state.currentRotation.y) * 0.08;
      state.humanGroup.rotation.y = state.currentRotation.y;
      state.humanGroup.rotation.x = state.currentRotation.x;

      // Smooth Camera Damping
      state.currentCameraPos.lerp(state.targetCameraPos, 0.06);
      state.camera.position.copy(state.currentCameraPos);
      state.camera.lookAt(0, 0.85, 0);

      // Smooth Elevation Damping
      state.currentElevation += (state.targetElevation - state.currentElevation) * 0.08;
      state.humanGroup.position.y = state.currentElevation;

      // Animate Chakras
      Object.entries(state.chakraMeshes).forEach(([, group]) => {
        const cGroup = group as THREE.Group;
        if (cGroup && cGroup.visible) {
          const ring = cGroup.children[1] as THREE.Mesh;
          if (ring) {
            ring.rotation.z += 0.035;
            const pulse = 1 + Math.sin(elapsedTime * 3.5 + cGroup.position.y * 5) * 0.18;
            ring.scale.set(pulse, pulse, pulse);
          }
        }
      });

      // Animate Breath Halo
      if (isBreathingActive && state.breathMesh.material) {
        const mat = state.breathMesh.material as THREE.MeshStandardMaterial;
        const breathScale = 1.0 + Math.sin(elapsedTime * 1.6) * 0.28;
        state.breathMesh.scale.set(breathScale, breathScale * 1.12, breathScale);
        mat.opacity = 0.45 + Math.sin(elapsedTime * 1.6) * 0.35;
      }

      // Animate Particle Flows
      if (state.systemParticles.visible) {
        const posAttr = state.systemParticles.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;
        for (let i = 0; i < posArray.length; i += 3) {
          posArray[i + 1] += 0.005;
          if (posArray[i + 1] > 1.85) {
            posArray[i + 1] = 0.05;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Animate 3D Orbital Telemetry Rings (Zajno Space-Station aesthetic)
      if (state.orbitalRingsGroup) {
        state.orbitalRingsGroup.visible = showOrbitalTelemetry;
        state.orbitalRingsGroup.rotation.y = elapsedTime * 0.12;
        const tiltedRing = state.orbitalRingsGroup.children[1];
        if (tiltedRing) {
          tiltedRing.rotation.z = -elapsedTime * 0.18;
        }
      }

      // Animate Cosmic Stardust Drift
      if (state.cosmicParticles) {
        state.cosmicParticles.rotation.y = elapsedTime * 0.02;
        state.cosmicParticles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.04;
      }

      // Animate Radar Floor
      if (state.radarFloorGrid) {
        state.radarFloorGrid.visible = showOrbitalTelemetry;
      }

      // Smooth Joint Interpolation
      Object.entries(state.targetJoints).forEach(([partName, targetEuler]) => {
        const part = state.bodyParts[partName];
        const euler = targetEuler as THREE.Euler;
        if (part && euler) {
          part.rotation.x += (euler.x - part.rotation.x) * 0.085;
          part.rotation.y += (euler.y - part.rotation.y) * 0.085;
          part.rotation.z += (euler.z - part.rotation.z) * 0.085;
        }
      });

      // Project HUD 3D Pins to Screen Space
      if (containerRef.current && asana && asana.muscles && asana.muscles.length > 0) {
        const rect = containerRef.current.getBoundingClientRect();
        const updatedPins: HUDPin[] = [];

        asana.muscles.forEach((muscle) => {
          const worldV = new THREE.Vector3(
            muscle.position3D[0],
            muscle.position3D[1] + state.currentElevation,
            muscle.position3D[2]
          );
          // Apply humanGroup rotation
          worldV.applyEuler(new THREE.Euler(state.currentRotation.x, state.currentRotation.y, 0));

          const projected = worldV.clone().project(state.camera);
          const isFacingCamera = projected.z < 1.0;

          if (isFacingCamera) {
            const screenX = ((projected.x + 1) / 2) * rect.width;
            const screenY = ((-projected.y + 1) / 2) * rect.height;

            updatedPins.push({
              id: muscle.id,
              name: muscle.name,
              role: muscle.role,
              percentage: muscle.percentage,
              worldPos: worldV,
              screenX,
              screenY,
              visible: true,
            });
          }
        });

        setHudPins(updatedPins);
      }

      state.renderer.render(state.scene, state.camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update Theme Lighting
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;
    if (isDark) {
      state.lights.ambient.intensity = 1.1;
      state.lights.directional.color.setHex(0xffffff);
      state.lights.rim.color.setHex(0x38bdf8);
      state.lights.fill.color.setHex(0x1e3a8a);
    } else {
      state.lights.ambient.intensity = 1.35;
      state.lights.directional.color.setHex(0xfff7ed);
      state.lights.rim.color.setHex(0x0284c7);
      state.lights.fill.color.setHex(0xbae6fd);
    }
  }, [isDark]);

  // Update Layer Visualization
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    // 1. Chakras
    Object.values(state.chakraMeshes).forEach((group) => {
      const cGroup = group as THREE.Group;
      if (cGroup) cGroup.visible = activeLayer === 'chakras';
    });

    // 2. Breath Halo
    if (state.breathMesh.material) {
      const mat = state.breathMesh.material as THREE.MeshStandardMaterial;
      mat.opacity = activeLayer === 'breath' || isBreathingActive ? 0.5 : 0.0;
    }

    // 3. Body Systems Particles
    state.systemParticles.visible = activeLayer === 'body-systems';
    if (state.systemParticles.material) {
      const mat = state.systemParticles.material as THREE.PointsMaterial;
      mat.opacity = activeLayer === 'body-systems' ? 0.85 : 0.0;
      if (activeBodySystem === 'nervous') mat.color.setHex(0xfacc15);
      else if (activeBodySystem === 'circulatory') mat.color.setHex(0xef4444);
      else if (activeBodySystem === 'respiratory') mat.color.setHex(0x38bdf8);
      else mat.color.setHex(0x10b981);
    }

    // 4. Muscle Layer & Écorché Colors
    Object.entries(state.muscleMeshes).forEach(([meshKey, rawMesh]) => {
      const mesh = rawMesh as THREE.Mesh;
      if (!mesh || !mesh.material) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      const isSelected = selectedMuscleId && meshKey.includes(selectedMuscleId);
      const isMusclesLayer = activeLayer === 'muscles';

      if (isSelected) {
        mat.color.setHex(0x00e5ff); // Cyan active tension glow
        mat.emissive.setHex(0x0284c7);
        mat.emissiveIntensity = 1.0;
      } else if (isMusclesLayer) {
        mat.color.setHex(0x991b1b); // Rich deep red anatomical muscle tissue
        mat.emissive.setHex(0x450a0a);
        mat.emissiveIntensity = 0.35;
      } else {
        mat.color.setHex(0xdec0a5); // Match skin tone
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0.0;
      }
    });

    // 5. Skin Meshes Transparency when in muscle or skeleton mode
    state.skinMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (activeLayer === 'muscles') {
        mat.opacity = 0.75;
        mat.transparent = true;
      } else if (activeLayer === 'skeleton') {
        mat.opacity = 0.25;
        mat.transparent = true;
      } else {
        mat.opacity = 1.0;
        mat.transparent = false;
      }
    });
  }, [activeLayer, selectedMuscleId, activeBodySystem, isBreathingActive]);

  // Update Pose Parameters (Dhanurasana, Virabhadrasana, Tadasana, etc.)
  const applyPose = useCallback((params: Asana['poseParameters']) => {
    const state = threeRef.current;
    if (!state || !params) return;

    state.targetJoints = {
      torso: new THREE.Euler(...params.torsoAngle),
      head: new THREE.Euler(...params.headAngle),
      leftShoulder: new THREE.Euler(...params.leftArm),
      rightShoulder: new THREE.Euler(...params.rightArm),
      leftElbow: new THREE.Euler(...params.leftForearm),
      rightElbow: new THREE.Euler(...params.rightForearm),
      leftHip: new THREE.Euler(...params.leftLeg),
      rightHip: new THREE.Euler(...params.rightLeg),
      leftKnee: new THREE.Euler(...params.leftShin),
      rightKnee: new THREE.Euler(...params.rightShin),
    };

    state.targetElevation = params.elevation ?? 0;
    if (params.rotationY !== undefined && !state.isDragging) {
      state.targetRotation.y = params.rotationY;
    }
  }, []);

  useEffect(() => {
    if (customPoseParams) {
      applyPose(customPoseParams);
    } else if (asana?.poseParameters) {
      applyPose(asana.poseParameters);
    }
  }, [asana, customPoseParams, applyPose]);

  // Load Custom User-Provided 3D GLB/GLTF Model if present
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    if (!customModelSource) {
      // Revert to procedural anatomical human model
      if (customModelGroupRef.current) {
        state.scene.remove(customModelGroupRef.current);
        customModelGroupRef.current = null;
      }
      state.humanGroup.visible = true;
      return;
    }

    let isCancelled = false;
    loadGLTFModel(customModelSource)
      .then(({ scene: customModel }) => {
        if (isCancelled || !threeRef.current) return;
        const current = threeRef.current;

        // Hide default procedural group
        current.humanGroup.visible = false;

        // Clean up previous custom model if any
        if (customModelGroupRef.current) {
          current.scene.remove(customModelGroupRef.current);
        }

        customModelGroupRef.current = customModel;
        current.scene.add(customModel);
      })
      .catch((err) => {
        console.error('Failed to load custom 3D human model:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [customModelSource]);

  // Camera View Preset & Zoom Updates
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;
    const baseDistance = 3.1 / Math.max(0.4, Math.min(2.5, zoomLevel));

    if (cameraViewPreset === 'side' || cameraViewPreset === 'sagittal') {
      state.targetCameraPos.set(baseDistance, 0.95, 0.05);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraViewPreset === 'front' || cameraViewPreset === 'coronal') {
      state.targetCameraPos.set(0, 0.95, baseDistance);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraViewPreset === 'back') {
      state.targetCameraPos.set(0, 0.95, -baseDistance);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraViewPreset === 'top' || cameraViewPreset === 'transverse') {
      state.targetCameraPos.set(0.05, baseDistance * 1.1, 0.1);
      state.targetRotation = { x: 0, y: 0 };
    } else if (cameraViewPreset === 'spine') {
      state.targetCameraPos.set(-0.6, 1.15, -baseDistance * 0.85);
    } else {
      // 360 / default orbit angle
      state.targetCameraPos.set(0, 0.95, baseDistance);
    }
  }, [cameraViewPreset, zoomLevel]);

  // Step Camera Target Updates
  useEffect(() => {
    const state = threeRef.current;
    if (!state || !asana || !asana.steps) return;
    const currentStep = asana.steps[currentStepIndex];
    if (currentStep?.cameraPosition) {
      state.targetCameraPos.set(...currentStep.cameraPosition);
    }
  }, [asana, currentStepIndex]);

  // Mouse & Touch Drag Controls (360° Viewport)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!allowManualControl || !threeRef.current) return;
    threeRef.current.isDragging = true;
    threeRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = threeRef.current;
    if (!state || !state.isDragging || !allowManualControl) return;

    const deltaX = e.clientX - state.previousMousePosition.x;
    const deltaY = e.clientY - state.previousMousePosition.y;

    state.targetRotation.y += deltaX * 0.009;
    state.targetRotation.x = Math.max(-0.6, Math.min(0.6, state.targetRotation.x + deltaY * 0.009));

    state.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!threeRef.current) return;
    threeRef.current.isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Holographic 3D HUD Muscle Callout Pins with Leader Lines (matching uploaded kinesiology video!) */}
      {showHUDPins && activeLayer === 'muscles' && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {hudPins.map((pin, idx) => {
            const isSelected = selectedMuscleId === pin.id;
            // Alternate left/right offset for natural medical diagram spacing
            const isLeft = idx % 2 === 1;
            const lineLength = 32;

            return (
              <div
                key={pin.id}
                style={{
                  transform: `translate(${pin.screenX}px, ${pin.screenY}px)`,
                }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-75 group"
              >
                {/* Center Anatomical Target Point */}
                <div
                  onClick={() => {
                    if (onSelectMuscle && asana?.muscles) {
                      const m = asana.muscles.find((x) => x.id === pin.id) || null;
                      onSelectMuscle(m);
                    }
                  }}
                  className="relative flex items-center justify-center cursor-pointer"
                >
                  {/* Glowing Core Node */}
                  <div className={`w-2.5 h-2.5 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-[#00e5ff] border-white scale-125 shadow-[0_0_10px_#00e5ff]'
                      : 'bg-white/90 border-black/40 shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  }`} />
                  
                  {/* SVG Angled Leader Line */}
                  <svg
                    className={`absolute top-0 pointer-events-none overflow-visible ${
                      isLeft ? 'right-1' : 'left-1'
                    }`}
                    width={lineLength + 4}
                    height="20"
                    style={{
                      transform: isLeft ? 'translate(-100%, -50%)' : 'translate(0%, -50%)',
                    }}
                  >
                    <line
                      x1={isLeft ? lineLength : 0}
                      y1="10"
                      x2={isLeft ? 0 : lineLength}
                      y2="10"
                      stroke={isSelected ? '#00e5ff' : 'rgba(255, 255, 255, 0.75)'}
                      strokeWidth="1.2"
                      strokeDasharray={isSelected ? 'none' : '2,2'}
                    />
                  </svg>

                  {/* Leader Callout Label (Clean white medical text matching video) */}
                  <div
                    style={{
                      transform: isLeft
                        ? `translate(-${lineLength + 12}px, -50%)`
                        : `translate(${lineLength + 12}px, -50%)`,
                    }}
                    className={`absolute top-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-sans tracking-wide whitespace-nowrap shadow-xl backdrop-blur-md transition-all ${
                      isSelected
                        ? 'bg-[#00381f]/95 text-[#00e5ff] border border-[#00e5ff]/60 scale-105'
                        : 'bg-black/80 text-white border border-white/20 hover:border-white/60 hover:bg-black/95'
                    }`}
                  >
                    <span className="font-semibold">{pin.name}</span>
                    <span className="text-[9px] font-mono opacity-80 text-[#38bdf8]">
                      {pin.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
