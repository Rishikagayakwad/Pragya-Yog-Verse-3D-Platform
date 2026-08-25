/**
 * The joint contract shared by every rig the studio can render.
 *
 * Asana.poseParameters is authored against these ten slots. Any rig — the
 * procedural fallback or a loaded humanoid GLB — must expose an Object3D for
 * each one, so the posing code never needs to know which is in use.
 */
export const POSE_JOINTS = [
  'torso',
  'head',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
] as const;

export type PoseJoint = (typeof POSE_JOINTS)[number];

/**
 * Bone names to look for, per slot, in priority order.
 *
 * Rigged humanoids overwhelmingly use Mixamo naming — Ready Player Me, Mixamo
 * itself, and most marketplace models all follow it — usually behind a
 * `mixamorig:` prefix that {@link normalizeBoneName} strips.
 *
 * Note the arm slots resolve to `LeftArm`/`RightArm` (the upper arm) before
 * `LeftShoulder`/`RightShoulder`, which in this convention is the clavicle.
 * Rotating the clavicle instead of the upper arm barely moves the limb, so the
 * order matters.
 */
export const JOINT_BONE_CANDIDATES: Record<PoseJoint | 'root', string[]> = {
  root: ['Hips', 'Pelvis', 'Root'],
  torso: ['Spine2', 'Spine1', 'Spine', 'Chest', 'UpperChest'],
  head: ['Head', 'Neck'],
  leftShoulder: ['LeftArm', 'LeftUpperArm', 'LeftShoulder', 'Left_arm'],
  rightShoulder: ['RightArm', 'RightUpperArm', 'RightShoulder', 'Right_arm'],
  leftElbow: ['LeftForeArm', 'LeftLowerArm', 'LeftElbow'],
  rightElbow: ['RightForeArm', 'RightLowerArm', 'RightElbow'],
  leftHip: ['LeftUpLeg', 'LeftUpperLeg', 'LeftThigh'],
  rightHip: ['RightUpLeg', 'RightUpperLeg', 'RightThigh'],
  leftKnee: ['LeftLeg', 'LeftLowerLeg', 'LeftShin', 'LeftKnee'],
  rightKnee: ['RightLeg', 'RightLowerLeg', 'RightShin', 'RightKnee'],
};

/**
 * The joint each limb segment points at, used to measure a bone's actual
 * direction. Only limbs are listed: the spine and head have no single
 * unambiguous "next joint" to aim along.
 */
export const POSE_JOINT_CHILD: Partial<Record<PoseJoint, PoseJoint>> = {
  leftShoulder: 'leftElbow',
  rightShoulder: 'rightElbow',
  leftHip: 'leftKnee',
  rightHip: 'rightKnee',
};

/** Strips rig-tool prefixes so `mixamorig:LeftUpLeg` matches `LeftUpLeg`. */
export function normalizeBoneName(name: string): string {
  return name.replace(/^mixamorig[:_]?/i, '').replace(/^Armature\|/, '');
}

/**
 * Resolves each slot to a bone name present in `boneNames`.
 * Returns the slots it could not fill so callers can report a bad rig rather
 * than silently rendering a model that refuses to pose.
 */
export function resolveBoneMap(boneNames: string[]): {
  boneMap: Partial<Record<PoseJoint | 'root', string>>;
  missing: (PoseJoint | 'root')[];
} {
  const byNormalized = new Map<string, string>();
  for (const raw of boneNames) {
    const key = normalizeBoneName(raw).toLowerCase();
    // First match wins; skeletons sometimes carry duplicate helper nodes.
    if (!byNormalized.has(key)) byNormalized.set(key, raw);
  }

  const boneMap: Partial<Record<PoseJoint | 'root', string>> = {};
  const missing: (PoseJoint | 'root')[] = [];

  for (const [slot, candidates] of Object.entries(JOINT_BONE_CANDIDATES) as [
    PoseJoint | 'root',
    string[],
  ][]) {
    const hit = candidates
      .map((c) => byNormalized.get(c.toLowerCase()))
      .find((n): n is string => Boolean(n));
    if (hit) boneMap[slot] = hit;
    else missing.push(slot);
  }

  return { boneMap, missing };
}
