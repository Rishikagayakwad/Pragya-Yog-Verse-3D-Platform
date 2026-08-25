import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { HumanRigResult } from './detailedHumanModel';
import { MODEL_TARGET_HEIGHT } from '../../config/model';
import {
  POSE_JOINTS,
  POSE_JOINT_CHILD,
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
 * against: standing with every limb hanging straight down (Tadasana).
 *
 * This matters because rigged humanoids are almost always exported in a T-pose,
 * arms horizontal. The authored angles treat arms-down as zero — Warrior II
 * raises an arm with `leftArm: [0, 0, 1.57]` — so applying them straight to a
 * T-pose would point the arm at the ceiling.
 *
 * Limbs are aimed at exactly straight down, matching the procedural rig's rest
 * exactly. The slight outward splay a standing body has is not baked in here;
 * the data supplies it (Tadasana carries `leftArm: [0, 0, 0.15]`). Baking it in
 * instead skews the reference frame and every pose inherits the error.
 */
function calibrateToNeutralStance(
  bodyParts: { [key: string]: THREE.Object3D },
  root: THREE.Object3D
): void {
  const down = new THREE.Vector3(0, -1, 0);

  for (const [parentSlot, childSlot] of Object.entries(POSE_JOINT_CHILD)) {
    const parent = bodyParts[parentSlot];
    const child = childSlot ? bodyParts[childSlot] : undefined;
    if (parent && child) aimSegment(parent, child, down, root);
  }
}

/**
 * Orthonormal basis with `y` along the limb and `zHint` resolving the twist.
 */
function limbBasis(y: THREE.Vector3, zHint: THREE.Vector3): THREE.Quaternion {
  const yAxis = y.clone().normalize();
  let zAxis = zHint.clone().sub(yAxis.clone().multiplyScalar(zHint.dot(yAxis)));
  if (zAxis.lengthSq() < 1e-8) {
    zAxis = new THREE.Vector3(1, 0, 0).sub(yAxis.clone().multiplyScalar(yAxis.x));
  }
  zAxis.normalize();
  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
  );
}

/**
 * Per joint, the change of basis taking the studio's canonical axes into that
 * bone's parent frame.
 *
 * Authored angles are written against the procedural rig, whose bones are
 * axis-aligned: a limb rests along -Y and a +Z rotation swings it sideways.
 * A Mixamo arm bone does not share those axes, so applying `leftArm:
 * [0, 0, 1.57]` to it raw swings the arm *forward* instead of out to the side —
 * measured on a real rig as [0.26, -0.03, 0.96] where it should be
 * [0.99, 0.00, -0.12].
 *
 * Conjugating the authored rotation by this basis expresses it in the bone's
 * own frame, which brings both rigs back into agreement.
 */
function computePoseBasis(
  bodyParts: { [key: string]: THREE.Object3D },
  root: THREE.Object3D
): { [key: string]: THREE.Quaternion } {
  root.updateMatrixWorld(true);

  const canonical = limbBasis(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1));
  const poseBasis: { [key: string]: THREE.Quaternion } = {};

  for (const slot of POSE_JOINTS) {
    const bone = bodyParts[slot];
    const childSlot = POSE_JOINT_CHILD[slot];
    const child = childSlot ? bodyParts[childSlot] : undefined;

    // Spine and head have no limb axis to measure, so they keep canonical axes.
    if (!bone || !child) {
      poseBasis[slot] = new THREE.Quaternion();
      continue;
    }

    // Limb direction and model-forward, both in this bone's PARENT frame —
    // local rotations are relative to the parent, so that is where the
    // authored angle has to make sense.
    const limbInParent = child.position.clone().applyQuaternion(bone.quaternion).normalize();

    const parentWorld = new THREE.Quaternion();
    (bone.parent ?? root).getWorldQuaternion(parentWorld);
    const forwardInParent = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(parentWorld.clone().invert())
      .normalize();

    poseBasis[slot] = limbBasis(limbInParent, forwardInParent).multiply(
      canonical.clone().invert()
    );
  }

  return poseBasis;
}

/**
 * Builds visible bone geometry from the model's own skeleton.
 *
 * A loaded character is a single skinned mesh — it has no separable skeleton to
 * switch on, which left the Skeleton layer dead on anything but the procedural
 * figure. The bone hierarchy is right there in the rig though, so this draws it:
 * one tapered spindle per bone-to-child segment, plus a bead at each joint.
 *
 * Each spindle is parented to its bone, so it tracks the pose for free. That
 * means they cannot also live under a single group, hence the flat list — the
 * studio toggles their visibility individually.
 */
function buildSkeletonFromBones(root: THREE.Object3D): THREE.Object3D[] {
  const boneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    roughness: 0.3,
    metalness: 0.05,
    emissive: 0xe5e7eb,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.95,
    // Drawn over the body, which is faded to translucent in bone view.
    depthWrite: false,
  });

  const parts: THREE.Object3D[] = [];
  const bones: THREE.Object3D[] = [];
  root.traverse((child) => {
    if ((child as THREE.Bone).isBone) bones.push(child);
  });

  const axis = new THREE.Vector3(0, 1, 0);

  // Thickness follows bone length — a fixed radius turns finger bones into
  // clubs, since segments here range from about 2cm to 44cm.
  const thicknessFor = (length: number) => Math.min(0.028, Math.max(0.007, length * 0.085));

  for (const bone of bones) {
    const boneChildren = bone.children.filter((c) => (c as THREE.Bone).isBone);
    const longest = boneChildren.reduce((max, c) => Math.max(max, c.position.length()), 0);

    const joint = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(0.008, thicknessFor(longest) * 0.75), 10, 10),
      boneMaterial
    );
    bone.add(joint);
    parts.push(joint);

    for (const child of boneChildren) {
      const offset = child.position;
      const length = offset.length();
      // Skip near-coincident helper bones; a spindle there is just z-fighting.
      if (length < 0.02) continue;

      // An octahedron reads as a bone at a glance and costs 8 triangles.
      const radius = thicknessFor(length);
      const spindle = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), boneMaterial);
      spindle.scale.set(radius, length / 2, radius);
      spindle.position.copy(offset).multiplyScalar(0.5);
      spindle.quaternion.setFromUnitVectors(axis, offset.clone().normalize());

      bone.add(spindle);
      parts.push(spindle);
    }
  }

  for (const part of parts) part.visible = false;
  return parts;
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

  const poseBasis = computePoseBasis(bodyParts, model);

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
    poseBasis,
    muscleMeshes: {},
    heatmapMeshes: {},
    skeletonGroup: new THREE.Group(),
    skeletonParts: buildSkeletonFromBones(model),
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
