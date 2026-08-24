import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ASANAS } from '../src/data/asanas';

// TEMPORARY DIAGNOSTIC — isolates whether importing src/data/asanas (which
// imports the types-only module src/types.ts) crashes init.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ probe: 'data', count: ASANAS.length });
}
