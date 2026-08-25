/**
 * Validates a humanoid .glb against everything the studio needs.
 *
 *   npm run check-model                     # checks public/models/human.glb
 *   npm run check-model -- path/to/file.glb
 *
 * Run this BEFORE committing to a model — buying or spending an evening on a
 * character that turns out to be unrigged is the expensive failure here, and
 * it is invisible until you try to pose it.
 */
import fs from 'fs';
import path from 'path';
import { POSE_JOINTS, resolveBoneMap, normalizeBoneName } from '../src/components/3d/rigJoints';

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;

interface Gltf {
  asset?: { generator?: string; version?: string };
  nodes?: { name?: string; mesh?: number }[];
  meshes?: unknown[];
  skins?: { joints?: number[] }[];
  animations?: unknown[];
  images?: { uri?: string; bufferView?: number }[];
  materials?: unknown[];
}

function readGlbJson(file: string): Gltf {
  const buf = fs.readFileSync(file);
  if (buf.length < 12 || buf.readUInt32LE(0) !== GLB_MAGIC) {
    throw new Error(
      'Not a binary .glb. If this is a .gltf (JSON) or .fbx, convert it to .glb first — see docs/MODEL-SETUP.md.'
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

const target = process.argv[2] ?? 'public/models/human.glb';
const abs = path.resolve(target);

if (!fs.existsSync(abs)) {
  console.error(`\n  No file at ${target}\n`);
  console.error('  Save a rigged humanoid .glb there, then run this again.');
  console.error('  Step-by-step instructions: docs/MODEL-SETUP.md\n');
  process.exit(1);
}

const sizeMb = fs.statSync(abs).size / (1024 * 1024);
let gltf: Gltf;
try {
  gltf = readGlbJson(abs);
} catch (err) {
  console.error(`\n  FAIL  ${(err as Error).message}\n`);
  process.exit(1);
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

// 1. Rigged? A skin is what makes the mesh follow the bones. Without one the
//    model is a statue no matter how many bone-shaped nodes it contains.
if ((gltf.skins ?? []).length === 0) {
  problems.push(
    'NOT RIGGED — no skin found. The mesh will not deform, so it cannot be posed.\n' +
      '        This is the single most common reason a "realistic human" model is unusable.\n' +
      '        Fix: run it through the Mixamo auto-rigger (see docs/MODEL-SETUP.md).'
  );
}

// 2. The ten joints poseParameters drives, plus the hips.
const { boneMap, missing } = resolveBoneMap(names);
const required = POSE_JOINTS.length + 1;
const found = required - missing.length;

console.log(`\n  Joint resolution  ${found}/${required}`);
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

// 3. Naming convention, for a clearer diagnosis than "missing".
const mixamoNamed = names.filter((n) => /^mixamorig[:_]/i.test(n)).length;
const plainNamed = names.filter((n) =>
  ['Hips', 'Spine', 'LeftArm', 'LeftUpLeg'].includes(normalizeBoneName(n))
).length;
if (mixamoNamed > 0) console.log(`\n  Naming        Mixamo (${mixamoNamed} prefixed bones)`);
else if (plainNamed > 0) console.log('\n  Naming        Mixamo-style, unprefixed');
else if (names.length > 0) console.log('\n  Naming        unrecognised convention');

// 4. Practical delivery checks.
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
  warnings.push(
    `Contains ${(gltf.animations ?? []).length} animation clip(s). Harmless — the studio poses\n` +
      '        the bones directly and ignores them — but they add file size.'
  );
}

console.log('');
if (warnings.length > 0) {
  for (const w of warnings) console.log(`  WARN  ${w}`);
  console.log('');
}

if (problems.length > 0) {
  for (const p of problems) console.log(`  FAIL  ${p}`);
  console.log('\n  This model will NOT work yet. The studio would log the reason and');
  console.log('  keep the built-in figure.\n');
  process.exit(1);
}

console.log('  PASS — this model will load and pose correctly.');
console.log(`  Save it as public/models/human.glb and reload the app.\n`);
