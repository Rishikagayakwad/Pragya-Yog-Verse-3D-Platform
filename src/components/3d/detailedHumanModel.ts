import * as THREE from 'three';
import { MODEL_TARGET_HEIGHT } from '../../config/model';

// Generates an ultra-detailed procedural organic human mesh hierarchy
// with muscle contours, realistic joints, smooth blending, anatomical landmarks,
// full skeletal overlay rig, biomechanical muscle engagement heatmaps,
// and PBR skin/muscle/fascia/bone shaders.

export interface HumanRigResult {
  humanGroup: THREE.Group;
  bodyParts: { [key: string]: THREE.Object3D };
  /**
   * Each joint's neutral rotation. Poses are applied as `rest + authored
   * angles`, which is what lets one set of poseParameters drive both this
   * procedural rig (rest is all zeros) and a loaded GLB (rest is its bind pose).
   */
  restRotations: { [key: string]: THREE.Euler };
  /**
   * Change of basis from the studio canonical axes into each bone's parent
   * frame. Identity here — this rig is built axis-aligned, which is the
   * convention poseParameters are authored against.
   */
  poseBasis: { [key: string]: THREE.Quaternion };
  muscleMeshes: { [key: string]: THREE.Mesh };
  heatmapMeshes: { [key: string]: THREE.Mesh };
  skeletonGroup: THREE.Group;
  skinMeshes: THREE.Mesh[];
  clothingMeshes: THREE.Mesh[];
  materials: {
    skin: THREE.MeshStandardMaterial;
    muscle: THREE.MeshStandardMaterial;
    muscleActive: THREE.MeshStandardMaterial;
    heatmap: THREE.MeshStandardMaterial;
    tendon: THREE.MeshStandardMaterial;
    bone: THREE.MeshStandardMaterial;
    clothing: THREE.MeshStandardMaterial;
    hair: THREE.MeshStandardMaterial;
    eyes: THREE.MeshStandardMaterial;
  };
}

export function createDetailedHumanModel(): HumanRigResult {
  const humanGroup = new THREE.Group();
  const bodyParts: { [key: string]: THREE.Object3D } = {};
  const muscleMeshes: { [key: string]: THREE.Mesh } = {};
  const heatmapMeshes: { [key: string]: THREE.Mesh } = {};
  const skinMeshes: THREE.Mesh[] = [];
  const clothingMeshes: THREE.Mesh[] = [];
  const skeletonGroup = new THREE.Group();
  humanGroup.add(skeletonGroup);

  // 1. Procedural Muscle, Fabric & Heatmap Textures
  function createMuscleStriationTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#8b2216';
      ctx.fillRect(0, 0, 512, 512);

      // Draw subtle muscle fiber striations
      ctx.strokeStyle = '#d94b28';
      ctx.lineWidth = 2;
      for (let i = 0; i < 512; i += 6) {
        ctx.beginPath();
        ctx.moveTo(0, i + Math.sin(i * 0.05) * 4);
        ctx.lineTo(512, i + Math.sin(i * 0.05 + 1) * 4);
        ctx.stroke();
      }

      ctx.strokeStyle = '#5a1208';
      ctx.lineWidth = 1.5;
      for (let i = 3; i < 512; i += 12) {
        ctx.beginPath();
        ctx.moveTo(0, i + Math.cos(i * 0.05) * 5);
        ctx.lineTo(512, i + Math.cos(i * 0.05 + 2) * 5);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);
    return tex;
  }

  function createHeatmapTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0, '#ff3b00');
      grad.addColorStop(0.4, '#ff8c00');
      grad.addColorStop(0.7, '#ffd700');
      grad.addColorStop(1, '#ff3300');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      // Add energy grain
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 150; i++) {
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 8);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createFabricTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Modern matte black athletic yoga apparel
      ctx.fillStyle = '#141416';
      ctx.fillRect(0, 0, 256, 256);

      // Micro weave pattern
      ctx.fillStyle = '#1e1e24';
      for (let x = 0; x < 256; x += 4) {
        for (let y = 0; y < 256; y += 4) {
          if ((x + y) % 8 === 0) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }

      // Subtle gold stitching line
      ctx.strokeStyle = '#c59b27';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 250);
      ctx.lineTo(256, 250);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  const muscleTexture = typeof document !== 'undefined' ? createMuscleStriationTexture() : null;
  const heatmapTexture = typeof document !== 'undefined' ? createHeatmapTexture() : null;
  const fabricTexture = typeof document !== 'undefined' ? createFabricTexture() : null;

  // 2. High-Grade PBR Materials
  // Skin is matte and entirely non-metallic; the previous 0.38/0.04 gave the
  // figure a plastic sheen that read as a mannequin under the studio lights.
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe0b48f,
    roughness: 0.68,
    metalness: 0.0,
    bumpScale: 0.015,
  });

  const muscleMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    map: muscleTexture,
    roughness: 0.35,
    metalness: 0.15,
    emissive: 0x3b0707,
    emissiveIntensity: 0.3,
  });

  const heatmapMat = new THREE.MeshStandardMaterial({
    color: 0xff6b00,
    map: heatmapTexture,
    roughness: 0.25,
    metalness: 0.3,
    emissive: 0xff3700,
    emissiveIntensity: 1.4,
    transparent: true,
    opacity: 0.92,
  });

  const muscleActiveMat = new THREE.MeshStandardMaterial({
    color: 0xffa500,
    roughness: 0.2,
    metalness: 0.4,
    emissive: 0xff6600,
    emissiveIntensity: 1.2,
  });

  const tendonMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.22,
    metalness: 0.15,
  });

  // Skeletal ivory bone material with smooth translucency
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0.92,
    emissive: 0xe5e7eb,
    emissiveIntensity: 0.2,
  });

  // Fabric and hair are dielectric — any metalness makes them look wet.
  const clothingMat = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    map: fabricTexture,
    roughness: 0.92,
    metalness: 0.0,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x2b1d14,
    roughness: 0.82,
    metalness: 0.0,
  });

  const eyesMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.1,
    metalness: 0.9,
  });

  // Helper function to create tapered, organic anatomical segments
  /**
   * A limb segment as a smooth surface of revolution rather than a cylinder.
   *
   * Cylinders are what made this figure read as a robot: they taper linearly
   * and end in flat open discs, so every joint showed a hard rim. This lofts a
   * profile instead —
   *
   *   - a muscle belly, thickest around the middle, rather than a straight cone
   *   - domed ends that tuck into the joint spheres instead of cutting off flat
   *   - enough radial and profile segments that the silhouette reads as a curve
   *
   * Same signature as the cylinder version it replaces, so every call site is
   * unchanged.
   */
  function createOrganicCapsule(
    radiusTop: number,
    radiusBottom: number,
    height: number,
    material: THREE.Material,
    scaleX = 1,
    scaleZ = 1,
    bulge = 0.09
  ): THREE.Mesh {
    const PROFILE_STEPS = 26;
    const CAP = 0.14; // share of the length spent rounding each end
    const END_RADIUS = 0.62; // ends keep this much width, so joints stay filled

    const profile: THREE.Vector2[] = [];

    for (let i = 0; i <= PROFILE_STEPS; i++) {
      const t = i / PROFILE_STEPS; // 0 at the bottom, 1 at the top
      const y = -height / 2 + t * height;

      // Linear taper from one end to the other, plus a belly through the middle.
      const taper = radiusBottom + (radiusTop - radiusBottom) * t;
      let radius = taper * (1 + bulge * Math.sin(Math.PI * t));

      // Ease the last stretch at each end down to END_RADIUS along a quarter
      // sine, which domes it instead of chamfering it.
      const easeEnd = (distance: number) =>
        END_RADIUS + (1 - END_RADIUS) * Math.sin((distance / CAP) * (Math.PI / 2));

      if (t < CAP) radius *= easeEnd(t);
      else if (t > 1 - CAP) radius *= easeEnd(1 - t);

      profile.push(new THREE.Vector2(Math.max(radius, 0.004), y));
    }

    const geom = new THREE.LatheGeometry(profile, 32);
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, material);
    mesh.scale.set(scaleX, 1, scaleZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // --- A. PELVIS & ROOT (Origin at 0.94m height) ---
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 0.94, 0);
  humanGroup.add(pelvis);
  bodyParts.pelvis = pelvis;

  // Athletic compression yoga shorts / pelvis core
  const pelvisMesh = createOrganicCapsule(0.175, 0.145, 0.19, clothingMat, 1.15, 0.92);
  pelvis.add(pelvisMesh);
  skinMeshes.push(pelvisMesh);
  clothingMeshes.push(pelvisMesh);

  // Sacrum / Glute base plate
  const sacrumMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 20), clothingMat);
  sacrumMesh.scale.set(1.1, 0.8, 0.85);
  sacrumMesh.position.set(0, -0.02, -0.05);
  pelvis.add(sacrumMesh);
  clothingMeshes.push(sacrumMesh);

  // --- SKELETON: PELVIC BOWL & SACRUM ---
  const pelvicBoneGroup = new THREE.Group();
  pelvicBoneGroup.position.set(0, 0.02, 0);

  // Iliac Crest Wings (Left & Right)
  for (let side of [-1, 1]) {
    const iliumWing = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.025, 12, 24, Math.PI * 0.9),
      boneMat
    );
    iliumWing.position.set(side * 0.085, 0.04, -0.01);
    iliumWing.rotation.set(0.3, side * 0.4, side * 0.2);
    pelvicBoneGroup.add(iliumWing);

    // Ischial tuberosities
    const ischium = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), boneMat);
    ischium.position.set(side * 0.065, -0.07, -0.04);
    pelvicBoneGroup.add(ischium);
  }

  // Pubic symphysis front arch
  const pubicArch = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 12), boneMat);
  pubicArch.rotation.z = Math.PI / 2;
  pubicArch.position.set(0, -0.06, 0.08);
  pelvicBoneGroup.add(pubicArch);

  pelvis.add(pelvicBoneGroup);
  skeletonGroup.add(pelvicBoneGroup);

  // --- B. TORSO & SPINE ---
  const torso = new THREE.Group();
  torso.position.set(0, 0.09, 0);
  pelvis.add(torso);
  bodyParts.torso = torso;

  // Lumbar waist / Abdomen (Skin)
  const abdomenMesh = createOrganicCapsule(0.16, 0.155, 0.22, skinMat, 1.1, 0.88);
  abdomenMesh.position.set(0, 0.11, 0);
  torso.add(abdomenMesh);
  skinMeshes.push(abdomenMesh);
  muscleMeshes['core-posture'] = abdomenMesh;
  muscleMeshes['psoas-rectus-stretch'] = abdomenMesh;

  // --- SKELETON: VERTEBRAL COLUMN (LUMBAR & THORACIC SPINE) ---
  const spineGroup = new THREE.Group();
  for (let v = 0; v < 14; v++) {
    const vert = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.026, 0.028, 14),
      boneMat
    );
    // Natural lordotic & kyphotic spinal curve
    const curveZ = Math.sin((v / 14) * Math.PI) * 0.025 - 0.04;
    vert.position.set(0, 0.04 + v * 0.038, curveZ);
    vert.rotation.x = Math.sin((v / 14) * Math.PI) * 0.12;

    // Transverse processes
    const process = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.012, 0.018), boneMat);
    process.position.set(0, 0, -0.01);
    vert.add(process);

    spineGroup.add(vert);
  }
  torso.add(spineGroup);
  skeletonGroup.add(spineGroup);

  // Sculpted 6-Pack & Oblique Muscle Plates
  for (let row = 0; row < 3; row++) {
    for (let side = -1; side <= 1; side += 2) {
      const absPlateGeom = new THREE.SphereGeometry(0.042, 16, 16);
      absPlateGeom.scale(1.1, 0.75, 0.4);
      const absPlate = new THREE.Mesh(absPlateGeom, muscleMat.clone());
      absPlate.position.set(side * 0.045, 0.055 + row * 0.062, 0.135 - row * 0.01);
      absPlate.name = 'psoas-rectus-stretch';
      absPlate.castShadow = true;
      torso.add(absPlate);
      muscleMeshes[`abs-${row}-${side}`] = absPlate;
    }
  }

  // External Obliques (flanks)
  for (let side = -1; side <= 1; side += 2) {
    const obliqueGeom = new THREE.CylinderGeometry(0.04, 0.035, 0.18, 16);
    obliqueGeom.scale(0.8, 1, 0.9);
    const oblique = new THREE.Mesh(obliqueGeom, muscleMat.clone());
    oblique.position.set(side * 0.15, 0.11, 0.02);
    oblique.rotation.z = -side * 0.25;
    torso.add(oblique);
    muscleMeshes[`oblique-${side}`] = oblique;
  }

  // Erector Spinae Muscle Columns (Posterior back spine)
  for (let side = -1; side <= 1; side += 2) {
    const erectorGeom = new THREE.CylinderGeometry(0.038, 0.032, 0.46, 16);
    const erector = new THREE.Mesh(erectorGeom, muscleMat.clone());
    erector.position.set(side * 0.055, 0.14, -0.12);
    erector.name = side === 1 ? 'erector-spinae' : 'erector-spinae-right';
    torso.add(erector);
    muscleMeshes[erector.name] = erector;
    if (side === 1) muscleMeshes['erector-spinae-bow'] = erector;
  }

  // --- C. CHEST & THORACIC CAGE ---
  const chest = new THREE.Group();
  chest.position.set(0, 0.22, 0);
  torso.add(chest);
  bodyParts.chest = chest;

  // Yoga Sports Bra / Top
  const sportsBra = createOrganicCapsule(0.225, 0.175, 0.22, clothingMat, 1.19, 0.92);
  sportsBra.position.set(0, 0.12, 0);
  chest.add(sportsBra);
  clothingMeshes.push(sportsBra);
  skinMeshes.push(sportsBra);

  // --- SKELETON: RIBCAGE & STERNUM ---
  const ribcageGroup = new THREE.Group();
  ribcageGroup.position.set(0, 0.12, 0);

  // Sternum breastbone
  const sternum = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.18, 0.018), boneMat);
  sternum.position.set(0, 0.04, 0.12);
  ribcageGroup.add(sternum);

  // 6 Rib pairs
  for (let r = 0; r < 6; r++) {
    const ribTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.125 + r * 0.012, 0.009, 8, 24, Math.PI * 1.6),
      boneMat
    );
    ribTorus.rotation.x = Math.PI / 2 + 0.15;
    ribTorus.rotation.z = Math.PI * 0.2;
    ribTorus.position.set(0, 0.12 - r * 0.032, -0.01);
    ribcageGroup.add(ribTorus);
  }
  chest.add(ribcageGroup);
  skeletonGroup.add(ribcageGroup);

  // Clavicle Collarbones (Left & Right)
  for (let side = -1; side <= 1; side += 2) {
    const clavicle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12),
      boneMat
    );
    clavicle.position.set(side * 0.09, 0.26, 0.09);
    clavicle.rotation.z = -side * 0.18;
    clavicle.rotation.y = side * 0.25;
    chest.add(clavicle);
    skeletonGroup.add(clavicle);
  }

  // --- D. NECK & HEAD ---
  const neck = new THREE.Group();
  neck.position.set(0, 0.28, 0);
  chest.add(neck);
  bodyParts.neck = neck;

  // Neck Skin
  const neckMesh = createOrganicCapsule(0.068, 0.082, 0.12, skinMat, 0.95, 1.05);
  neckMesh.position.set(0, 0.06, 0.01);
  neck.add(neckMesh);
  skinMeshes.push(neckMesh);

  // Cervical Spine Vertebrae
  const cervicalSpine = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.11, 10), boneMat);
  cervicalSpine.position.set(0, 0.06, -0.02);
  neck.add(cervicalSpine);
  skeletonGroup.add(cervicalSpine);

  const head = new THREE.Group();
  head.position.set(0, 0.12, 0);
  neck.add(head);
  bodyParts.head = head;

  // Realistic Sculpted Cranium / Head
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.115, 28, 28), skinMat);
  cranium.scale.set(0.85, 1.15, 1.02);
  cranium.position.set(0, 0.105, 0.02);
  cranium.castShadow = true;
  head.add(cranium);
  skinMeshes.push(cranium);

  // Defined Jawline & Chin
  const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.09, 16), skinMat);
  jaw.scale.set(0.9, 1, 1.1);
  jaw.position.set(0, 0.04, 0.06);
  jaw.rotation.x = 0.35;
  head.add(jaw);
  skinMeshes.push(jaw);

  // Nose Bridge
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.045, 12), skinMat);
  nose.position.set(0, 0.105, 0.135);
  nose.rotation.x = Math.PI / 2 + 0.2;
  head.add(nose);
  skinMeshes.push(nose);

  // Eyes (Left & Right)
  for (let side = -1; side <= 1; side += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), eyesMat);
    eye.position.set(side * 0.038, 0.12, 0.112);
    head.add(eye);
  }

  // Sculpted Modern Yogi Hair Bun
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.118, 24, 24), hairMat);
  hair.scale.set(0.88, 1.1, 1.04);
  hair.position.set(0, 0.13, -0.01);
  head.add(hair);

  // Top Knot Hair Bun
  const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.065, 18, 18), hairMat);
  hairBun.position.set(0, 0.24, -0.04);
  hairBun.scale.set(1.0, 0.85, 0.95);
  head.add(hairBun);

  // --- E. ARMS (LEFT & RIGHT) ---
  for (let side of [1, -1]) {
    const sideKey = side === 1 ? 'left' : 'right';
    const sideSuffix = side === 1 ? '' : '-right';

    // Shoulder & Deltoid Cap
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.25, 0.22, 0);
    chest.add(shoulder);
    bodyParts[`${sideKey}Shoulder`] = shoulder;

    // 3-Headed Deltoid Muscle Bulb
    const deltoidGeom = new THREE.SphereGeometry(0.088, 20, 20);
    deltoidGeom.scale(1.0, 1.25, 1.05);
    const deltoid = new THREE.Mesh(deltoidGeom, muscleMat.clone());
    deltoid.name = `deltoids${sideSuffix}`;
    deltoid.castShadow = true;
    shoulder.add(deltoid);
    muscleMeshes[`deltoids${sideSuffix}`] = deltoid;

    // Deltoid Heatmap Overlay
    const deltoidHeat = new THREE.Mesh(deltoidGeom.clone(), heatmapMat.clone());
    deltoidHeat.scale.set(1.02, 1.27, 1.07);
    shoulder.add(deltoidHeat);
    heatmapMeshes[`deltoids-heat${sideSuffix}`] = deltoidHeat;

    // Shoulder Joint Bone Sphere
    const shoulderBone = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), boneMat);
    shoulder.add(shoulderBone);
    skeletonGroup.add(shoulderBone);

    // Upper Arm (Biceps & Triceps)
    const upperArm = new THREE.Group();
    shoulder.add(upperArm);
    bodyParts[`${sideKey}UpperArm`] = upperArm;

    const bicepMesh = createOrganicCapsule(0.065, 0.052, 0.27, skinMat, 1.0, 0.95);
    bicepMesh.position.set(0, -0.135, 0);
    upperArm.add(bicepMesh);
    skinMeshes.push(bicepMesh);

    // Humerus Bone
    const humerus = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.018, 0.25, 12),
      boneMat
    );
    humerus.position.set(0, -0.135, 0);
    upperArm.add(humerus);
    skeletonGroup.add(humerus);

    // Elbow Joint
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.27, 0);
    upperArm.add(elbow);
    bodyParts[`${sideKey}Elbow`] = elbow;

    // Elbow Joint Bone
    const elbowBone = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), boneMat);
    elbow.add(elbowBone);
    skeletonGroup.add(elbowBone);

    // Forearm
    const forearmMesh = createOrganicCapsule(0.055, 0.038, 0.26, skinMat, 1.05, 0.9);
    forearmMesh.position.set(0, -0.13, 0);
    elbow.add(forearmMesh);
    skinMeshes.push(forearmMesh);

    // Radius & Ulna Forearm Bones
    const radiusBone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.013, 0.24, 10),
      boneMat
    );
    radiusBone.position.set(0.012, -0.13, 0);
    elbow.add(radiusBone);
    skeletonGroup.add(radiusBone);

    // Wrist & Hand
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.11, 0.075), skinMat);
    hand.position.set(0, -0.31, 0);
    hand.castShadow = true;
    elbow.add(hand);
    skinMeshes.push(hand);

    // Fingers Extended
    const fingers = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.07, 0.065), skinMat);
    fingers.position.set(0, -0.38, 0);
    elbow.add(fingers);
    skinMeshes.push(fingers);
  }

  // --- F. LEGS (LEFT & RIGHT) ---
  for (let side of [1, -1]) {
    const sideKey = side === 1 ? 'left' : 'right';
    const sideSuffix = side === 1 ? '' : '-right';

    // Hip & Gluteus Maximus
    const hip = new THREE.Group();
    hip.position.set(side * 0.13, -0.06, 0);
    pelvis.add(hip);
    bodyParts[`${sideKey}Hip`] = hip;

    // Femoral Head Bone Sphere
    const femoralHead = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 14), boneMat);
    femoralHead.position.set(0, 0, 0);
    hip.add(femoralHead);
    skeletonGroup.add(femoralHead);

    // Gluteus Maximus Sculpted Muscle
    const gluteGeom = new THREE.SphereGeometry(0.11, 20, 20);
    gluteGeom.scale(1.05, 1.15, 1.25);
    const glute = new THREE.Mesh(gluteGeom, muscleMat.clone());
    glute.position.set(0, 0.02, -0.065);
    glute.name = `gluteus-maximus${sideSuffix}`;
    glute.castShadow = true;
    hip.add(glute);
    muscleMeshes[`gluteus-maximus${sideSuffix}`] = glute;

    // Glute Heatmap Overlay
    const gluteHeat = new THREE.Mesh(gluteGeom.clone(), heatmapMat.clone());
    gluteHeat.position.set(0, 0.02, -0.065);
    gluteHeat.scale.set(1.06, 1.16, 1.26);
    hip.add(gluteHeat);
    heatmapMeshes[`glute-heat${sideSuffix}`] = gluteHeat;

    // Thigh Group (Quadriceps & Hamstrings)
    const thigh = new THREE.Group();
    hip.add(thigh);
    bodyParts[`${sideKey}Thigh`] = thigh;

    // Thigh Skin
    const thighMesh = createOrganicCapsule(0.096, 0.068, 0.42, skinMat, 1.05, 1.0);
    thighMesh.position.set(0, -0.21, 0);
    thigh.add(thighMesh);
    skinMeshes.push(thighMesh);

    // Femur Bone (Thigh bone)
    const femur = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.026, 0.38, 14),
      boneMat
    );
    femur.position.set(0, -0.21, 0);
    thigh.add(femur);
    skeletonGroup.add(femur);

    // Rectus Femoris & Vastus Lateralis (Quadricep front sweep)
    const quadFront = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088, 0.065, 0.38, 18),
      muscleMat.clone()
    );
    quadFront.position.set(0, -0.2, 0.022);
    quadFront.name = side === 1 ? 'quadriceps-front' : 'hamstrings-back';
    thigh.add(quadFront);
    muscleMeshes[quadFront.name] = quadFront;

    // BIOMECHANICAL HEATMAP: Quadriceps Glowing Engagement
    // Exactly matches the reference image glowing red/orange quads
    const quadHeat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.092, 0.069, 0.38, 18),
      heatmapMat.clone()
    );
    quadHeat.position.set(0, -0.2, 0.024);
    thigh.add(quadHeat);
    heatmapMeshes[`quad-heat${sideSuffix}`] = quadHeat;

    // Vastus Medialis (Teardrop above knee)
    const vastusMedialis = new THREE.Mesh(
      new THREE.SphereGeometry(0.046, 16, 16),
      muscleMat.clone()
    );
    vastusMedialis.scale.set(0.8, 1.35, 0.85);
    vastusMedialis.position.set(-side * 0.038, -0.32, 0.042);
    thigh.add(vastusMedialis);

    // Knee Joint & Patella
    const knee = new THREE.Group();
    knee.position.set(0, -0.42, 0);
    thigh.add(knee);
    bodyParts[`${sideKey}Knee`] = knee;

    // Knee Bone Joint & Patella
    const kneeJointBone = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 14), boneMat);
    knee.add(kneeJointBone);
    skeletonGroup.add(kneeJointBone);

    const patella = new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 14), boneMat);
    patella.position.set(0, 0, 0.06);
    patella.scale.set(1, 1.2, 0.6);
    knee.add(patella);
    skeletonGroup.add(patella);

    // Calf & Lower Leg
    const calfMesh = createOrganicCapsule(0.075, 0.046, 0.42, skinMat, 1.0, 1.15);
    calfMesh.position.set(0, -0.21, 0);
    knee.add(calfMesh);
    skinMeshes.push(calfMesh);

    // Tibia & Fibula Shin Bones
    const tibia = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 0.38, 12),
      boneMat
    );
    tibia.position.set(0, -0.21, 0.015);
    knee.add(tibia);
    skeletonGroup.add(tibia);

    // Calf Muscle Heatmap
    const calfHeat = new THREE.Mesh(
      new THREE.SphereGeometry(0.048, 16, 16),
      heatmapMat.clone()
    );
    calfHeat.scale.set(0.9, 1.7, 0.9);
    calfHeat.position.set(0, -0.16, -0.038);
    knee.add(calfHeat);
    heatmapMeshes[`calf-heat${sideSuffix}`] = calfHeat;

    // Anatomical Foot & Grounded Sole
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.058, 0.22), skinMat);
    foot.position.set(0, -0.42, 0.065);
    foot.castShadow = true;
    knee.add(foot);
    skinMeshes.push(foot);

    // Foot Bones (Tarsals & Metatarsals)
    const footBone = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.028, 0.18), boneMat);
    footBone.position.set(0, -0.42, 0.065);
    knee.add(footBone);
    skeletonGroup.add(footBone);
  }

  // Normalise to the same contract loadHumanoidRig() guarantees: a figure
  // MODEL_TARGET_HEIGHT tall with its feet at y = 0.
  //
  // The parts were authored around a pelvis at y = 0.94 and drifted — assembled
  // raw, this rig stands 2.38m with its feet at y = -0.434, so it sank through
  // the platform, and every chakra and muscle coordinate (authored against a
  // 1.75m body) landed on the wrong part of it.
  //
  // The transform goes on an inner group rather than on humanGroup, so
  // humanGroup's local space stays the normalised space the asana data is
  // written in.
  const body = new THREE.Group();
  while (humanGroup.children.length > 0) {
    body.add(humanGroup.children[0]);
  }
  humanGroup.add(body);

  body.updateMatrixWorld(true);
  const rawBounds = new THREE.Box3().setFromObject(body);
  const rawSize = new THREE.Vector3();
  rawBounds.getSize(rawSize);

  if (rawSize.y > 0) {
    body.scale.setScalar(MODEL_TARGET_HEIGHT / rawSize.y);
    body.updateMatrixWorld(true);
    const scaledBounds = new THREE.Box3().setFromObject(body);
    body.position.y -= scaledBounds.min.y;
    body.updateMatrixWorld(true);
  }

  // Rest rotation of every joint, so posing can be expressed as a delta from
  // the rig's neutral stance. This rig is authored at zero, but a loaded GLB
  // carries real bind-pose rotations, and both go through the same code path.
  const restRotations: { [key: string]: THREE.Euler } = {};
  const poseBasis: { [key: string]: THREE.Quaternion } = {};
  for (const [name, part] of Object.entries(bodyParts)) {
    restRotations[name] = part.rotation.clone();
    poseBasis[name] = new THREE.Quaternion();
  }

  return {
    humanGroup,
    bodyParts,
    restRotations,
    poseBasis,
    muscleMeshes,
    heatmapMeshes,
    skeletonGroup,
    skinMeshes,
    clothingMeshes,
    materials: {
      skin: skinMat,
      muscle: muscleMat,
      muscleActive: muscleActiveMat,
      heatmap: heatmapMat,
      tendon: tendonMat,
      bone: boneMat,
      clothing: clothingMat,
      hair: hairMat,
      eyes: eyesMat,
    },
  };
}
