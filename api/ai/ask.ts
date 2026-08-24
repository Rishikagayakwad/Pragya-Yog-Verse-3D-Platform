import type { VercelRequest, VercelResponse } from '@vercel/node';
import { askYogaTeacher } from '../../lib/aiTeacher.js';

/**
 * POST /api/ai/ask
 *
 * Vercel Function backing the AI Yoga Teacher. Vercel deploys this project as
 * a static Vite build, so server.ts never runs in production — this file is
 * what actually serves the endpoint on the deployed site.
 *
 * Note the `.js` extension on the relative import below — it is required, not
 * cosmetic. package.json sets "type": "module" and Vercel compiles each api/
 * file rather than bundling it, so relative imports become real Node ESM
 * specifiers, and ESM refuses to resolve extensionless paths. Without it the
 * function dies at module load with FUNCTION_INVOCATION_FAILED. Any new
 * relative import in this file or its chain needs the same treatment.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body: unknown;
  try {
    // Vercel exposes req.body as a getter that throws on malformed JSON.
    body = req.body;
  } catch {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }

  const { question, asanaSlug } = (body ?? {}) as {
    question?: unknown;
    asanaSlug?: unknown;
  };

  if (typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'Question is required' });
  }

  const reply = await askYogaTeacher(
    question,
    typeof asanaSlug === 'string' ? asanaSlug : undefined
  );

  // Always 200 with usable content. Returning an error status here would make
  // the client discard the body and substitute its own canned text, which is
  // exactly the silent-failure path this endpoint replaced.
  return res.status(200).json(reply);
}
