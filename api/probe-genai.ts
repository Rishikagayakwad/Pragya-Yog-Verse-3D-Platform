import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// TEMPORARY DIAGNOSTIC — isolates whether importing @google/genai crashes init.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ probe: 'genai', ok: typeof GoogleGenAI === 'function' });
}
