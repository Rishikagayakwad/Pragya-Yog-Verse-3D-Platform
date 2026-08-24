import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { HumanRigResult } from './detailedHumanModel';
import { MODEL_TARGET_HEIGHT } from '../../config/model';
import {
  POSE_JOINTS,
  resolveBoneMap,
  type PoseJoint,
} from './rigJoints';

/**
 * Loads a rigged humanoid GLB and adapts it to the same {@link HumanRigResult}
 * shape the procedural model produces, so the studio's posing and layer code
 * works identically whichever rig is in use.
 *
 * The adapter deliberately does not care which model it is given. It resolves
 * bones by name, records their bind rotations, and exposes them under the ten
 * canonical joint slots.
 */

export class HumanoidRigError extends Error {
  constructor(
    message: string,
    readonly missingJoints: string[] = []
  ) {
    super(message);
    this.name = 'HumanoidRigError';
  }
}

/** Scales the model to MODEL_TARGET_HEIGHT and stands its feet on y = 0. */
function normalizeToStudioScale(model: THREE.Group): void {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  // Height is the meaningful dimension — a T-posed figure is wider than tall,
  // so scaling by the largest axis would leave it noticeably short.
  if (size.y > 0) {
    const scale = MODEL_TARGET_HEIGHT / size.y;
    model.scale.setScalar(scale);
  }

  const scaled = new THREE.Box3().setFromObject(model);
  model.position.y -= scaled.min.y;
}

/**
 * Rotates `bone` so the segment running to `childBone` points along
 * `targetDirection` in world space, then writes the result back as a local
 * rotation.
 *
 * World rotation is `parentWorld * local`. To land on `q * oldWorld` the local
 * rotation must become `inverse(parentWorld) * q * parentWorld * oldLocal`.
 */
function aimSegment(
  bone: THREE.Object3D,
  childBone: THREE.Object3D,
  targetDirection: THREE.Vector3,
  root: THREE.Object3D
): void {
  root.updateMatrixWorld(true);

  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  bone.getWorldPosition(from);
  childBone.getWorldPosition(to);

  const current = to.sub(from);
  if (current.lengthSq() < 1e-10) return; // Coincident joints — nothing to aim.
  current.normalize();

  const delta = new THREE.Quaternion().setFromUnitVectors(current, targetDirection);

  const parentWorld = new THREE.Quaternion();
  (bone.parent ?? root).getWorldQuaternion(parentWorld);

  bone.quaternion.copy(
    parentWorld.clone().invert().multiply(delta).multiply(parentWorld).multiply(bone.quaternion)
  );

  root.updateMatrixWorld(true);
}

/**
 * Brings a loaded rig into the neutral stance poseParameters are authored
 * against: standing with the arms hanging down at the sides (Tadasana).
 *
 * This matters because rigged humanoids are almost always exported in a T-pose,
 * arms horizontal. The authored angles treat arms-down as zero — Warrior II
 * raises an arm with `leftArm: [0, 0, 1.57]` — so applying them straight to a
 * T-pose would point the arm at the ceiling.
 *
 * The correction is measured from the model's own bone positions rather than
 * hardcoded, so it works for T-pose, A-pose, or anything between.
 */
function calibrateToNeutralStance(
  bodyParts: { [key: string]: THREE.Object3D },
  root: THREE.Object3D
): void {
  const down = new THREE.Vector3(0, -1, 0);

  // Slight outward splay so the arms clear the hips, matching how the
  // procedural rig rests rather than clipping straight through the body.
  const leftRest = new THREE.Vector3(-0.18, -1, 0).normalize();
  const rightRest = new THREE.Vector3(0.18, -1, 0).normalize();

  const segments: [string, string, THREE.Vector3][] = [
    ['leftShoulder', 'leftElbow', leftRest],
    ['rightShoulder', 'rightElbow', rightRest],
    ['leftHip', 'leftKnee', down],
    ['rightHip', 'rightKnee', down],
  ];

  for (const [parentSlot, childSlot, direction] of segments) {
    const parent = bodyParts[parentSlot];
    const child = bodyParts[childSlot];
    if (parent && child) aimSegment(parent, child, direction, root);
  }
}

function enhanceMaterial(material: THREE.Material): void {
  const standard = material as THREE.MeshStandardMaterial;
  if (standard.isMeshStandardMaterial) {
    // The studio lights hot; clamp the extremes so skin doesn't blow out.
    standard.roughness = Math.max(0.25, standard.roughness ?? 0.4);
    standard.metalness = Math.min(0.2, standard.metalness ?? 0.05);
    standard.needsUpdate = true;
  }
}

function loadGltf(url: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      (err) => reject(new HumanoidRigError(`Could not load model at ${url}: ${String(err)}`))
    );
  });
}

export async function loadHumanoidRig(url: string): Promise<HumanRigResult> {
  const model = await loadGltf(url);

  // Collect every named node — bones live in the scene graph, and some
  // exporters emit them as plain Object3D rather than THREE.Bone.
  const nodesByName = new Map<string, THREE.Object3D>();
  const skinMeshes: THREE.Mesh[] = [];

  model.traverse((child) => {
    if (child.name) nodesByName.set(child.name, child);

    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      skinMeshes.push(mesh);
      if (Array.isArray(mesh.material)) mesh.material.forEach(enhanceMaterial);
      else if (mesh.material) enhanceMaterial(mesh.material);
    }
  });

  const { boneMap, missing } = resolveBoneMap([...nodesByName.keys()]);

  if (missing.length > 0) {
    throw new HumanoidRigError(
      `Model at ${url} is missing ${missing.length} required joint(s): ${missing.join(', ')}. ` +
        `It needs a standard humanoid skeleton (Mixamo naming).`,
      missing
    );
  }

  normalizeToStudioScale(model);

  const bodyParts: { [key: string]: THREE.Object3D } = {};
  const restRotations: { [key: string]: THREE.Euler } = {};

  for (const slot of [...POSE_JOINTS, 'root'] as (PoseJoint | 'root')[]) {
    const boneName = boneMap[slot];
    if (!boneName) continue;
    bodyParts[slot] = nodesByName.get(boneName)!;
  }

  // Move the rig out of its export pose (usually a T-pose) and into the
  // arms-down neutral the asana data is authored against, THEN record that as
  // rest. Poses are applied as rest + authored angles, so this is what makes
  // one set of poseParameters read correctly on an arbitrary humanoid.
  calibrateToNeutralStance(bodyParts, model);

  for (const slot of Object.keys(bodyParts)) {
    restRotations[slot] = bodyParts[slot].rotation.clone();
  }

  // Keep `pelvis` as an alias so code written against the procedural rig's
  // naming still resolves.
  if (bodyParts.root) {
    bodyParts.pelvis = bodyParts.root;
    restRotations.pelvis = restRotations.root.clone();
  }

  const humanGroup = new THREE.Group();
  humanGroup.add(model);

  // A loaded character has no separable anatomy: its muscles and skeleton are
  // painted into one skinned mesh. Those layers are rendered as overlays built
  // from the asana data instead, which is why these come back empty rather
  // than throwing — the studio checks for emptiness and adapts.
  return {
    humanGroup,
    bodyParts,
    restRotations,
    muscleMeshes: {},
    heatmapMeshes: {},
    skeletonGroup: new THREE.Group(),
    skinMeshes,
    clothingMeshes: [],
    materials: {
      skin: new THREE.MeshStandardMaterial(),
      muscle: new THREE.MeshStandardMaterial(),
      muscleActive: new THREE.MeshStandardMaterial(),
      heatmap: new THREE.MeshStandardMaterial(),
      tendon: new THREE.MeshStandardMaterial(),
      bone: new THREE.MeshStandardMaterial(),
      clothing: new THREE.MeshStandardMaterial(),
      hair: new THREE.MeshStandardMaterial(),
      eyes: new THREE.MeshStandardMaterial(),
    },
  };
}
