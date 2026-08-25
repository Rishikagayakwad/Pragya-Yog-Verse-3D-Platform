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
import { checkModel } from './lib/checkModel';

const target = process.argv[2] ?? 'public/models/human.glb';
process.exit(checkModel(target) ? 0 : 1);
