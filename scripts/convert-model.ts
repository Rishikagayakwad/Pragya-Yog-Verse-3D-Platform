/**
 * Converts an .fbx (what Mixamo, MakeHuman and most marketplaces hand you)
 * into the .glb the studio loads — then validates the result.
 *
 *   npm run convert-model -- character.fbx
 *   npm run convert-model -- character.fbx --out public/models/human.glb
 *
 * This exists so you don't have to install Blender just to change a container
 * format. It wraps Meta's FBX2glTF, which preserves the skeleton and skin
 * weights — the parts that actually matter and that naive online converters
 * routinely drop.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { checkModel } from './lib/checkModel';

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const outFlag = (() => {
  const i = args.indexOf('--out');
  return i >= 0 ? args[i + 1] : undefined;
})();

if (!input) {
  console.error('\n  usage: npm run convert-model -- <file.fbx> [--out public/models/human.glb]\n');
  process.exit(1);
}

const src = path.resolve(input);
if (!fs.existsSync(src)) {
  console.error(`\n  No file at ${input}\n`);
  process.exit(1);
}
if (!/\.fbx$/i.test(src)) {
  console.error(`\n  Expected a .fbx file. Got: ${path.basename(src)}`);
  console.error('  If it is already .glb, just run: npm run check-model -- ' + input + '\n');
  process.exit(1);
}

const dest = path.resolve(outFlag ?? src.replace(/\.fbx$/i, '.glb'));
fs.mkdirSync(path.dirname(dest), { recursive: true });

let convert: (src: string, dest: string, opts?: string[]) => Promise<string>;
try {
  convert = require('fbx2gltf');
} catch {
  console.error('\n  The converter is not installed. Run:\n');
  console.error('    npm install --save-dev fbx2gltf\n');
  process.exit(1);
}

console.log(`\n  Converting ${path.basename(src)} -> ${path.basename(dest)} ...`);

convert(src, dest, ['--binary', '--keep-attribute', 'position', '--keep-attribute', 'normal', '--keep-attribute', 'uv0'])
  .then((written) => {
    const mb = fs.statSync(written).size / (1024 * 1024);
    console.log(`  Done — ${path.basename(written)} (${mb.toFixed(1)} MB)`);
    console.log('\n  Validating...');
    const ok = checkModel(written);
    if (ok && path.resolve(written) !== path.resolve('public/models/human.glb')) {
      console.log(`  To use it:  cp "${written}" public/models/human.glb\n`);
    }
    process.exit(ok ? 0 : 1);
  })
  .catch((err: Error) => {
    console.error('\n  Conversion failed.\n');
    console.error(String(err.message ?? err).split('\n').map((l) => '    ' + l).join('\n'));
    console.error('\n  If the FBX is very old or unusual, fall back to Blender —');
    console.error('  see the "Converting to GLB" section of docs/MODEL-SETUP.md\n');
    process.exit(1);
  });
