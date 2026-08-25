/**
 * Derives poseParameters from an animation clip inside a rigged .glb.
 *
 *   npm run extract-pose -- model.glb --list
 *   npm run extract-pose -- model.glb --clip "Warrior II" --time 2.5
 *
 * Why: poseParameters are currently hand-authored angles, which is guesswork
 * that does not scale past a handful of asanas. If you can get a rigged
 * character performing (or holding) a posture — a mocap yoga pack, a Mixamo
 * animation, a pose an artist keyed — this reads the real joint angles out of
 * it and prints a block ready to paste into src/data/asanas.ts.
 *
 * The numbers are emitted as deltas from the same calibrated neutral stance
 * humanoidRig.ts establishes at load, and combined the same way the canvas
 * combines them (component-wise on Euler angles), so what you paste is what
 * you get.
 */
import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { POSE_JOINTS, resolveBoneMap, type PoseJoint } from '../src/components/3d/rigJoints';

/** poseParameters field name for each rig joint, in the data file's order. */
const FIELD_FOR_JOINT: Record<PoseJoint, string> = {
  torso: 'torsoAngle',
  head: 'headAngle',
  leftShoulder: 'leftArm',
  rightShoulder: 'rightArm',
  leftElbow: 'leftForearm',
  rightElbow: 'rightForearm',
  leftHip: 'leftLeg',
  rightHip: 'rightLeg',
  leftKnee: 'leftShin',
  rightKnee: 'rightShin',
};

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const wantsList = args.includes('--list');

if (!file) {
  console.error('\n  usage: npm run extract-pose -- <model.glb> [--list] [--clip NAME] [--time SECONDS]\n');
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`\n  No file at ${file}\n`);
  process.exit(1);
}

const buf = fs.readFileSync(path.resolve(file));
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

new GLTFLoader().parse(
  arrayBuffer,
  '',
  (gltf) => {
    const clips = gltf.animations ?? [];

    if (wantsList || clips.length === 0) {
      console.log(`\n  ${path.basename(file)} — ${clips.length} animation clip(s)`);
      if (clips.length === 0) {
        console.log('\n  No animations in this file. Extraction needs a clip that holds the');
        console.log('  posture. A static model in a pose cannot be read this way — its pose');
        console.log('  is baked into the mesh, not the bones.\n');
        process.exit(1);
      }
      for (const c of clips) console.log(`    "${c.name}"  ${c.duration.toFixed(2)}s`);
      console.log('\n  Pick one:  --clip "<name>" --time <seconds>\n');
      return;
    }

    const clipName = flag('clip');
    const clip = clipName ? clips.find((c) => c.name === clipName) : clips[0];
    if (!clip) {
      console.error(`\n  No clip named "${clipName}". Run with --list to see the options.\n`);
      process.exit(1);
    }
    const time = Number(flag('time') ?? clip.duration / 2);

    const model = gltf.scene;
    const nodes = new Map<string, THREE.Object3D>();
    model.traverse((c) => {
      if (c.name) nodes.set(c.name, c);
    });

    const { boneMap, missing } = resolveBoneMap([...nodes.keys()]);
    if (missing.length > 0) {
      console.error(`\n  This rig is missing joints: ${missing.join(', ')}`);
      console.error('  Run: npm run check-model -- ' + file + '\n');
      process.exit(1);
    }
    const jointOf = (slot: PoseJoint | 'root') =>
      nodes.get((boneMap as Record<string, string>)[slot])!;

    // 1. Calibrate to the neutral stance, exactly as humanoidRig does, and
    //    record it. Authored angles are deltas from this, not absolutes.
    const aim = (bone: THREE.Object3D, child: THREE.Object3D, target: THREE.Vector3) => {
      model.updateMatrixWorld(true);
      const from = new THREE.Vector3();
      const to = new THREE.Vector3();
      bone.getWorldPosition(from);
      child.getWorldPosition(to);
      const current = to.sub(from);
      if (current.lengthSq() < 1e-10) return;
      current.normalize();
      const delta = new THREE.Quaternion().setFromUnitVectors(current, target);
      const parentWorld = new THREE.Quaternion();
      (bone.parent ?? model).getWorldQuaternion(parentWorld);
      bone.quaternion.copy(
        parentWorld.clone().invert().multiply(delta).multiply(parentWorld).multiply(bone.quaternion)
      );
      model.updateMatrixWorld(true);
    };

    const down = new THREE.Vector3(0, -1, 0);
    aim(jointOf('leftShoulder'), jointOf('leftElbow'), new THREE.Vector3(-0.18, -1, 0).normalize());
    aim(jointOf('rightShoulder'), jointOf('rightElbow'), new THREE.Vector3(0.18, -1, 0).normalize());
    aim(jointOf('leftHip'), jointOf('leftKnee'), down);
    aim(jointOf('rightHip'), jointOf('rightKnee'), down);

    const neutral = new Map<string, THREE.Euler>();
    for (const slot of POSE_JOINTS) neutral.set(slot, jointOf(slot).rotation.clone());
    const neutralHipsY = (() => {
      const v = new THREE.Vector3();
      jointOf('root').getWorldPosition(v);
      return v.y;
    })();

    // 2. Drive the clip to the requested moment.
    const mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(clip);
    action.play();
    mixer.setTime(time);
    model.updateMatrixWorld(true);

    // 3. Difference, component-wise on Euler angles — matching how the canvas
    //    applies them (rest + authored), so the round trip is faithful.
    const round = (n: number) => Math.round(n * 100) / 100;
    const lines: string[] = [];
    for (const slot of POSE_JOINTS) {
      const now = jointOf(slot).rotation;
      const rest = neutral.get(slot)!;
      const d: [number, number, number] = [
        round(now.x - rest.x),
        round(now.y - rest.y),
        round(now.z - rest.z),
      ];
      lines.push(`      ${FIELD_FOR_JOINT[slot]}: [${d[0]}, ${d[1]}, ${d[2]}],`);
    }

    const hipsNow = new THREE.Vector3();
    jointOf('root').getWorldPosition(hipsNow);
    const elevation = round(hipsNow.y - neutralHipsY);
    const rotationY = round(jointOf('root').rotation.y);

    console.log(`\n  ${path.basename(file)} — clip "${clip.name}" at ${time.toFixed(2)}s\n`);
    console.log('    poseParameters: {');
    for (const l of lines) console.log(l);
    console.log(`      elevation: ${elevation},`);
    console.log(`      rotationY: ${rotationY}`);
    console.log('    },\n');
    console.log('  Paste into the asana in src/data/asanas.ts, then reload.');
    if (elevation > 0) {
      console.log('  NOTE: positive elevation lifts the figure off the mat — the rig has no');
      console.log('  foot IK. Set it to 0 or negative unless the posture is genuinely airborne.');
    }
    console.log('');
  },
  (err) => {
    console.error('\n  Could not parse the model:', err);
    process.exit(1);
  }
);
