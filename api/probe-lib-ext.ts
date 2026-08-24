import type { VercelRequest, VercelResponse } from '@vercel/node';
// Same import as probe-lib, but with an explicit .js extension.
import { TINY } from '../lib/tiny.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ probe: 'lib-ext', value: TINY });
}
