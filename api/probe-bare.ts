import type { VercelRequest, VercelResponse } from '@vercel/node';

// TEMPORARY DIAGNOSTIC — no imports beyond types. Proves whether the api/
// directory produces working functions at all on this project.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ probe: 'bare', ok: true });
}
