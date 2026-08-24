import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INSIDE } from './_shared';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ probe: 'inside', value: INSIDE });
}
