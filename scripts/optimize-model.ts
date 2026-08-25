/**
 * Shrinks a .glb for the web by downscaling its textures.
 *
 *   npm run optimize-model -- model.glb
 *   npm run optimize-model -- model.glb --out public/models/human.glb --max 1024
 *
 * Character models are almost always texture-bound, not geometry-bound. A
 * stock Mixamo download arrives with 4096x4096 maps: 40 MB of file, of which
 * roughly 39 MB is images. At the size the figure occupies on screen, 1024 is
 * indistinguishable — the same model drops to about 6 MB.
 *
 * Uses jimp rather than sharp deliberately. sharp is a native libvips binding,
 * and a broken or mismatched libvips build makes the usual tooling fail with
 * "colourspace: parameter space not set" — which is exactly what happened on
 * the machine this was written for. jimp is pure JavaScript and simply works.
 */
import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { Jimp } from 'jimp';
import { checkModel } from './lib/checkModel';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

if (!input) {
  console.error('\n  usage: npm run optimize-model -- <model.glb> [--out FILE] [--max 1024]\n');
  process.exit(1);
}

const src = path.resolve(input);
if (!fs.existsSync(src)) {
  console.error(`\n  No file at ${input}\n`);
  process.exit(1);
}

const max = Number(flag('max') ?? 1024);
const dest = path.resolve(flag('out') ?? src.replace(/\.glb$/i, '.optimized.glb'));
fs.mkdirSync(path.dirname(dest), { recursive: true });

const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`;

async function main() {
  const before = fs.statSync(src).size;
  console.log(`\n  ${path.basename(src)} — ${mb(before)}\n`);

  const io = new NodeIO();
  const doc = await io.read(src);

  let touched = 0;
  for (const texture of doc.getRoot().listTextures()) {
    const bytes = texture.getImage();
    if (!bytes) continue;

    const mime = texture.getMimeType();
    const image = await Jimp.read(Buffer.from(bytes));
    const { width, height } = image.bitmap;

    if (Math.max(width, height) <= max) {
      console.log(`    keep    ${texture.getName() || 'texture'}  ${width}x${height}`);
      continue;
    }

    const scale = max / Math.max(width, height);
    image.resize({ w: Math.round(width * scale), h: Math.round(height * scale) });

    // Keep PNG as PNG. Converting to JPEG would drop the alpha channel, and
    // hair and other BLEND materials depend on it.
    const encoded = await image.getBuffer(mime === 'image/jpeg' ? 'image/jpeg' : 'image/png');

    console.log(
      `    resize  ${texture.getName() || 'texture'}  ${width}x${height} -> ` +
        `${image.bitmap.width}x${image.bitmap.height}   ${mb(bytes.length)} -> ${mb(encoded.length)}`
    );
    texture.setImage(new Uint8Array(encoded));
    touched++;
  }

  await io.write(dest, doc);
  const after = fs.statSync(dest).size;

  console.log(
    `\n  ${touched} texture(s) resized — ${mb(before)} -> ${mb(after)} ` +
      `(${Math.round((1 - after / before) * 100)}% smaller)`
  );

  console.log('\n  Validating...');
  const ok = checkModel(dest);
  if (ok && path.resolve(dest) !== path.resolve('public/models/human.glb')) {
    console.log(`  To use it:  cp "${dest}" public/models/human.glb\n`);
  }
  process.exit(ok ? 0 : 1);
}

main().catch((err: Error) => {
  console.error('\n  Optimisation failed:', err.message ?? err, '\n');
  process.exit(1);
});
