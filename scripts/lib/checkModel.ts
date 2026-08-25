/**
 * Validates a humanoid .glb against everything the studio needs, and prints a
 * report. Shared by `npm run check-model` and `npm run convert-model`, so a
 * freshly converted file is held to exactly the same standard.
 */
import fs from 'fs';
import path from 'path';
import { POSE_JOINTS, resolveBoneMap, normalizeBoneName } from '../../src/components/3d/rigJoints';

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;

interface Gltf {
  asset?: { generator?: string; version?: string };
  nodes?: { name?: string; mesh?: number }[];
  meshes?: unknown[];
  skins?: { joints?: number[] }[];
  animations?: { name?: string }[];
  images?: { uri?: string; bufferView?: number }[];
}

function readGlbJson(file: string): Gltf {
  const buf = fs.readFileSync(file);
  if (buf.length < 12 || buf.readUInt32LE(0) !== GLB_MAGIC) {
    throw new Error(
      'Not a binary .glb. If this is a .gltf (JSON) or .fbx, convert it first — run `npm run convert-model -- <file.fbx>`.'
    );
  }
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    if (type === CHUNK_JSON) {
      return JSON.parse(buf.subarray(offset + 8, offset + 8 + length).toString('utf8'));
    }
    offset += 8 + length + ((4 - (length % 4)) % 4);
  }
  throw new Error('No JSON chunk found — the file looks corrupt.');
}

/** Prints the report. Returns true when the model is usable as-is. */
export function checkModel(target: string): boolean {
  const abs = path.resolve(target);

  if (!fs.existsSync(abs)) {
    console.error(`\n  No file at ${target}\n`);
    console.error('  Save a rigged humanoid .glb there, then run this again.');
    console.error('  Step-by-step instructions: docs/MODEL-SETUP.md\n');
    return false;
  }

  const sizeMb = fs.statSync(abs).size / (1024 * 1024);
  let gltf: Gltf;
  try {
    gltf = readGlbJson(abs);
  } catch (err) {
    console.error(`\n  FAIL  ${(err as Error).message}\n`);
    return false;
  }

  const nodes = gltf.nodes ?? [];
  const names = nodes.map((n) => n.name).filter((n): n is string => Boolean(n));

  console.log(`\n  ${path.basename(abs)}`);
  console.log(`  ${'-'.repeat(58)}`);
  console.log(`  size          ${sizeMb.toFixed(1)} MB`);
  console.log(`  generator     ${gltf.asset?.generator ?? 'unknown'}`);
  console.log(`  nodes         ${nodes.length}`);
  console.log(`  meshes        ${(gltf.meshes ?? []).length}`);
  console.log(`  skins         ${(gltf.skins ?? []).length}`);
  console.log(`  animations    ${(gltf.animations ?? []).length}`);

  const problems: string[] = [];
  const warnings: string[] = [];

  // Rigged? A skin is what makes the mesh follow the bones. Without one the
  // model is a statue no matter how many bone-shaped nodes it contains.
  if ((gltf.skins ?? []).length === 0) {
    problems.push(
      'NOT RIGGED — no skin found. The mesh will not deform, so it cannot be posed.\n' +
        '        This is the most common reason a "realistic human" model is unusable.\n' +
        '        Fix: run it through the Mixamo auto-rigger (see docs/MODEL-SETUP.md).'
    );
  }

  const { boneMap, missing } = resolveBoneMap(names);
  const required = POSE_JOINTS.length + 1;

  console.log(`\n  Joint resolution  ${required - missing.length}/${required}`);
  for (const slot of ['root', ...POSE_JOINTS] as const) {
    const hit = (boneMap as Record<string, string | undefined>)[slot];
    console.log(`    ${hit ? 'ok  ' : 'MISS'}  ${slot.padEnd(15)} ${hit ?? '(not found)'}`);
  }

  if (missing.length > 0) {
    problems.push(
      `MISSING JOINTS: ${missing.join(', ')}\n` +
        '        The rig does not use recognised bone names. Either re-rig it with\n' +
        '        Mixamo, or rename the bones in Blender to the Mixamo convention.'
    );
  }

  const mixamoNamed = names.filter((n) => /^mixamorig[:_]/i.test(n)).length;
  const plainNamed = names.filter((n) =>
    ['Hips', 'Spine', 'LeftArm', 'LeftUpLeg'].includes(normalizeBoneName(n))
  ).length;
  if (mixamoNamed > 0) console.log(`\n  Naming        Mixamo (${mixamoNamed} prefixed bones)`);
  else if (plainNamed > 0) console.log('\n  Naming        Mixamo-style, unprefixed');
  else if (names.length > 0) console.log('\n  Naming        unrecognised convention');

  if (sizeMb > 15) {
    warnings.push(
      `${sizeMb.toFixed(1)} MB is heavy for a web page — every visitor downloads it.\n` +
        '        Compress with: npx gltf-transform optimize in.glb out.glb'
    );
  }
  const externalImages = (gltf.images ?? []).filter((i) => i.uri && !i.uri.startsWith('data:'));
  if (externalImages.length > 0) {
    problems.push(
      `${externalImages.length} texture(s) reference external files. A .glb must embed\n` +
        '        everything. Re-export as glTF Binary (.glb), not glTF Separate.'
    );
  }
  if ((gltf.animations ?? []).length > 0) {
    const named = (gltf.animations ?? []).map((a) => a.name).filter(Boolean).slice(0, 4);
    warnings.push(
      `Contains ${(gltf.animations ?? []).length} animation clip(s)${named.length ? ': ' + named.join(', ') : ''}.\n` +
        '        Useful — `npm run extract-pose` can read real joint angles out of them.'
    );
  }

  console.log('');
  for (const w of warnings) console.log(`  WARN  ${w}`);
  if (warnings.length > 0) console.log('');

  if (problems.length > 0) {
    for (const p of problems) console.log(`  FAIL  ${p}`);
    console.log('\n  This model will NOT work yet. The studio would log the reason and');
    console.log('  keep the built-in figure.\n');
    return false;
  }

  console.log('  PASS — this model will load and pose correctly.');
  console.log('  Save it as public/models/human.glb and reload the app.\n');
  return true;
}
