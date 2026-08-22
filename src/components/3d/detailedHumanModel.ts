import * as THREE from 'three';

// Generates an ultra-detailed procedural organic human mesh hierarchy
// with muscle contours, realistic joints, smooth blending, anatomical landmarks,
// and PBR skin/muscle/fascia/bone shaders.

export interface HumanRigResult {
  humanGroup: THREE.Group;
  bodyParts: { [key: string]: THREE.Object3D };
  muscleMeshes: { [key: string]: THREE.Mesh };
  skinMeshes: THREE.Mesh[];
  clothingMeshes: THREE.Mesh[];
  materials: {
    skin: THREE.MeshStandardMaterial;
    muscle: THREE.MeshStandardMaterial;
    muscleActive: THREE.MeshStandardMaterial;
    tendon: THREE.MeshStandardMaterial;
    bone: THREE.MeshStandardMaterial;
    shorts: THREE.MeshStandardMaterial;
    hair: THREE.MeshStandardMaterial;
    eyes: THREE.MeshStandardMaterial;
  };
}

export function createDetailedHumanModel(): HumanRigResult {
  const humanGroup = new THREE.Group();
  const bodyParts: { [key: string]: THREE.Object3D } = {};
  const muscleMeshes: { [key: string]: THREE.Mesh } = {};
  const skinMeshes: THREE.Mesh[] = [];
  const clothingMeshes: THREE.Mesh[] = [];

  // 1. Procedural Muscle, Fabric & Skin Textures for realistic Subsurface / Striation & Weave look
  function createMuscleStriationTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#8b2216';
      ctx.fillRect(0, 0, 512, 512);

      // Draw subtle muscle fiber striations
      ctx.strokeStyle = '#a83220';
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

  function createFabricTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Yoga Tree Pose athletic navy / teal palette
      ctx.fillStyle = '#10223b';
      ctx.fillRect(0, 0, 256, 256);

      // Micro weave pattern
      ctx.fillStyle = '#173050';
      for (let x = 0; x < 256; x += 4) {
        for (let y = 0; y < 256; y += 4) {
          if ((x + y) % 8 === 0) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }

      // Subtle teal athletic stitch lines
      ctx.strokeStyle = '#1b4b5a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 128);
      ctx.lineTo(256, 128);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  const muscleTexture = typeof document !== 'undefined' ? createMuscleStriationTexture() : null;
  const fabricTexture = typeof document !== 'undefined' ? createFabricTexture() : null;

  // 2. High-Grade PBR Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdfc2a8,
    roughness: 0.42,
    metalness: 0.04,
    bumpScale: 0.015,
  });

  const muscleMat = new THREE.MeshStandardMaterial({
    color: 0x96281b,
    map: muscleTexture,
    roughness: 0.38,
    metalness: 0.12,
    emissive: 0x220502,
    emissiveIntensity: 0.25,
  });

  const muscleActiveMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    roughness: 0.2,
    metalness: 0.4,
    emissive: 0x00a3cc,
    emissiveIntensity: 0.9,
  });

  const tendonMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.22,
    metalness: 0.15,
  });

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  });

  const shortsMat = new THREE.MeshStandardMaterial({
    color: 0x12243d,
    map: fabricTexture,
    roughness: 0.8,
    metalness: 0.08,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x1e1713,
    roughness: 0.85,
    metalness: 0.05,
  });

  const eyesMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.1,
    metalness: 0.9,
  });

  // Helper function to create tapered, organic anatomical segments
  function createOrganicCapsule(
    radiusTop: number,
    radiusBottom: number,
    height: number,
    material: THREE.Material,
    scaleX = 1,
    scaleZ = 1
  ): THREE.Mesh {
    const geom = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 28, 6);
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

  // Athletic compression shorts / pelvis core
  const pelvisMesh = createOrganicCapsule(0.175, 0.145, 0.19, shortsMat, 1.15, 0.92);
  pelvis.add(pelvisMesh);
  skinMeshes.push(pelvisMesh);
  clothingMeshes.push(pelvisMesh);

  // Sacrum / Glute base plate
  const sacrumMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 20), shortsMat);
  sacrumMesh.scale.set(1.1, 0.8, 0.85);
  sacrumMesh.position.set(0, -0.02, -0.05);
  pelvis.add(sacrumMesh);
  clothingMeshes.push(sacrumMesh);

  // --- B. TORSO & SPINE ---
  const torso = new THREE.Group();
  torso.position.set(0, 0.09, 0);
  pelvis.add(torso);
  bodyParts.torso = torso;

  // Lumbar waist / Abdomen
  const abdomenMesh = createOrganicCapsule(0.16, 0.155, 0.22, skinMat, 1.1, 0.88);
  abdomenMesh.position.set(0, 0.11, 0);
  torso.add(abdomenMesh);
  skinMeshes.push(abdomenMesh);
  muscleMeshes['core-posture'] = abdomenMesh;
  muscleMeshes['psoas-rectus-stretch'] = abdomenMesh;

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

  // Ribcage / Upper Torso
  const ribcageMesh = createOrganicCapsule(0.22, 0.165, 0.28, skinMat, 1.18, 0.88);
  ribcageMesh.position.set(0, 0.14, 0);
  chest.add(ribcageMesh);
  skinMeshes.push(ribcageMesh);

  // Sculpted Pectoralis Major Muscle Plates (Left & Right)
  const pecGeom = new THREE.BoxGeometry(0.135, 0.12, 0.055);
  pecGeom.computeVertexNormals();

  const pecLeft = new THREE.Mesh(pecGeom, muscleMat.clone());
  pecLeft.position.set(0.088, 0.17, 0.13);
  pecLeft.rotation.set(-0.08, 0.12, -0.16);
  pecLeft.name = 'pectoralis';
  pecLeft.castShadow = true;
  chest.add(pecLeft);
  muscleMeshes['pectoralis'] = pecLeft;

  const pecRight = new THREE.Mesh(pecGeom, muscleMat.clone());
  pecRight.position.set(-0.088, 0.17, 0.13);
  pecRight.rotation.set(-0.08, -0.12, 0.16);
  pecRight.name = 'pectoralis-right';
  pecRight.castShadow = true;
  chest.add(pecRight);
  muscleMeshes['pectoralis-right'] = pecRight;

  // Clavicle Collarbones (Left & Right)
  for (let side = -1; side <= 1; side += 2) {
    const clavicle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12),
      tendonMat
    );
    clavicle.position.set(side * 0.09, 0.26, 0.09);
    clavicle.rotation.z = -side * 0.18;
    clavicle.rotation.y = side * 0.25;
    chest.add(clavicle);
  }

  // Latissimus Dorsi & Trapezius Wings (Upper Back)
  for (let side = -1; side <= 1; side += 2) {
    const latGeom = new THREE.BoxGeometry(0.08, 0.26, 0.04);
    const lat = new THREE.Mesh(latGeom, muscleMat.clone());
    lat.position.set(side * 0.145, 0.16, -0.09);
    lat.rotation.set(0.1, -side * 0.1, side * 0.22);
    lat.castShadow = true;
    chest.add(lat);
    muscleMeshes[`lat-${side}`] = lat;
    if (side === 1) muscleMeshes['rhomboids-delts'] = lat;
  }

  // --- D. NECK & HEAD ---
  const neck = new THREE.Group();
  neck.position.set(0, 0.28, 0);
  chest.add(neck);
  bodyParts.neck = neck;

  // Sternocleidomastoid neck muscles
  const neckMesh = createOrganicCapsule(0.068, 0.082, 0.12, skinMat, 0.95, 1.05);
  neckMesh.position.set(0, 0.06, 0.01);
  neck.add(neckMesh);
  skinMeshes.push(neckMesh);

  // Sternocleidomastoid bands
  for (let side = -1; side <= 1; side += 2) {
    const scm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.016, 0.11, 12),
      muscleMat.clone()
    );
    scm.position.set(side * 0.035, 0.06, 0.05);
    scm.rotation.z = -side * 0.22;
    scm.rotation.x = -0.15;
    neck.add(scm);
  }

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

  // Sculpted Modern Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.118, 24, 24), hairMat);
  hair.scale.set(0.88, 1.1, 1.04);
  hair.position.set(0, 0.13, -0.01);
  head.add(hair);

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
    if (side === 1) muscleMeshes['serratus-anterior'] = deltoid;

    // Upper Arm (Biceps & Triceps)
    const upperArm = new THREE.Group();
    shoulder.add(upperArm);
    bodyParts[`${sideKey}UpperArm`] = upperArm;

    const bicepMesh = createOrganicCapsule(0.065, 0.052, 0.27, skinMat, 1.0, 0.95);
    bicepMesh.position.set(0, -0.135, 0);
    upperArm.add(bicepMesh);
    skinMeshes.push(bicepMesh);

    // Biceps Brachii Belly (Front)
    const bicepBelly = new THREE.Mesh(
      new THREE.SphereGeometry(0.048, 16, 16),
      muscleMat.clone()
    );
    bicepBelly.scale.set(0.85, 1.5, 0.9);
    bicepBelly.position.set(0, -0.12, 0.035);
    upperArm.add(bicepBelly);
    muscleMeshes[`bicep-${sideKey}`] = bicepBelly;

    // Triceps Brachii Horse-shoe (Back)
    const tricepBelly = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 16, 16),
      muscleMat.clone()
    );
    tricepBelly.scale.set(0.9, 1.6, 0.85);
    tricepBelly.position.set(0, -0.13, -0.032);
    upperArm.add(tricepBelly);
    muscleMeshes[`tricep-${sideKey}`] = tricepBelly;

    // Elbow Joint
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.27, 0);
    upperArm.add(elbow);
    bodyParts[`${sideKey}Elbow`] = elbow;

    // Forearm with Brachioradialis taper
    const forearmMesh = createOrganicCapsule(0.055, 0.038, 0.26, skinMat, 1.05, 0.9);
    forearmMesh.position.set(0, -0.13, 0);
    elbow.add(forearmMesh);
    skinMeshes.push(forearmMesh);
    muscleMeshes[`triceps-brachii${sideSuffix}`] = forearmMesh;

    // Wrist & Hand
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.11, 0.075), skinMat);
    hand.position.set(0, -0.31, 0);
    hand.castShadow = true;
    elbow.add(hand);
    skinMeshes.push(hand);

    // Thumb
    const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.045, 0.02), skinMat);
    thumb.position.set(side * 0.028, -0.28, 0.02);
    thumb.rotation.z = -side * 0.4;
    elbow.add(thumb);
    skinMeshes.push(thumb);
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

    // Gluteus Maximus Sculpted Muscle
    const gluteGeom = new THREE.SphereGeometry(0.11, 20, 20);
    gluteGeom.scale(1.05, 1.15, 1.25);
    const glute = new THREE.Mesh(gluteGeom, muscleMat.clone());
    glute.position.set(0, 0.02, -0.065);
    glute.name = `gluteus-maximus${sideSuffix}`;
    glute.castShadow = true;
    hip.add(glute);
    muscleMeshes[`gluteus-maximus${sideSuffix}`] = glute;
    if (side === 1) {
      muscleMeshes['gluteus-hamstrings-bow'] = glute;
      muscleMeshes['hip-abductors-standing'] = glute;
      muscleMeshes['hip-flexors-glutes-release'] = glute;
    }

    // Thigh Group (Quadriceps & Hamstrings)
    const thigh = new THREE.Group();
    hip.add(thigh);
    bodyParts[`${sideKey}Thigh`] = thigh;

    const thighMesh = createOrganicCapsule(0.096, 0.068, 0.42, skinMat, 1.05, 1.0);
    thighMesh.position.set(0, -0.21, 0);
    thigh.add(thighMesh);
    skinMeshes.push(thighMesh);

    // Rectus Femoris & Vastus Lateralis (Quadricep front sweep)
    const quadFront = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088, 0.065, 0.38, 18),
      muscleMat.clone()
    );
    quadFront.position.set(0, -0.2, 0.022);
    quadFront.name = side === 1 ? 'quadriceps-front' : 'hamstrings-back';
    thigh.add(quadFront);
    muscleMeshes[quadFront.name] = quadFront;
    if (side === 1) {
      muscleMeshes['quads-adductors'] = quadFront;
      muscleMeshes['hamstrings-chain'] = quadFront;
    } else {
      muscleMeshes['hip-rotators-lifted'] = quadFront;
    }

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

    const patella = new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 14), tendonMat);
    patella.position.set(0, 0, 0.06);
    patella.scale.set(1, 1.2, 0.6);
    knee.add(patella);

    // Calf & Lower Leg (Gastrocnemius Twin Bellies & Soleus)
    const calfMesh = createOrganicCapsule(0.075, 0.046, 0.42, skinMat, 1.0, 1.15);
    calfMesh.position.set(0, -0.21, 0);
    knee.add(calfMesh);
    skinMeshes.push(calfMesh);
    if (side === 1) {
      muscleMeshes['gastrocnemius-soleus'] = calfMesh;
      muscleMeshes['peroneals-ankle'] = calfMesh;
      muscleMeshes['tibialis-anterior'] = calfMesh;
    }

    // Gastrocnemius Calf Bulbs (Posterior)
    for (let cSide = -1; cSide <= 1; cSide += 2) {
      const calfBulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.044, 16, 16),
        muscleMat.clone()
      );
      calfBulb.scale.set(0.85, 1.6, 0.85);
      calfBulb.position.set(cSide * 0.022, -0.15, -0.042);
      knee.add(calfBulb);
    }

    // Achilles Tendon
    const achilles = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.016, 0.16, 12),
      tendonMat
    );
    achilles.position.set(0, -0.32, -0.04);
    knee.add(achilles);

    // Anatomical Foot & Arch
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.058, 0.21), skinMat);
    foot.position.set(0, -0.42, 0.065);
    foot.castShadow = true;
    knee.add(foot);
    skinMeshes.push(foot);
  }

  return {
    humanGroup,
    bodyParts,
    muscleMeshes,
    skinMeshes,
    clothingMeshes,
    materials: {
      skin: skinMat,
      muscle: muscleMat,
      muscleActive: muscleActiveMat,
      tendon: tendonMat,
      bone: boneMat,
      shorts: shortsMat,
      hair: hairMat,
      eyes: eyesMat,
    },
  };
}
