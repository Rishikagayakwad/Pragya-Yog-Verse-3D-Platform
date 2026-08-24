import type { VercelRequest, VercelResponse } from '@vercel/node';
import { askYogaTeacher } from '../../lib/aiTeacher';

/**
 * POST /api/ai/ask
 *
 * Vercel Function backing the AI Yoga Teacher. Vercel deploys this project as
 * a static Vite build, so server.ts never runs in production — this file is
 * what actually serves the endpoint on the deployed site.
 *
 * Uses the Node.js (request, response) signature rather than the newer `fetch`
 * Web Standard export. Both are documented, but the fetch form returned
 * FUNCTION_INVOCATION_FAILED on this project's builder while the code itself
 * ran correctly when bundled and invoked locally — so the runtime here is not
 * calling that convention. The (req, res) form is supported everywhere.
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
