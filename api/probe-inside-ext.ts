import type { VercelRequest, VercelResponse } from '@vercel/node';
// Same import as probe-inside, but with an explicit .js extension as Node ESM requires.
import { INSIDE } from './_shared.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ probe: 'inside-ext', value: INSIDE });
}
