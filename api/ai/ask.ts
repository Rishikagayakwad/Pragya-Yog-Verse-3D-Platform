import { askYogaTeacher } from '../../lib/aiTeacher';

/**
 * POST /api/ai/ask
 *
 * Vercel Function backing the AI Yoga Teacher. Vercel deploys this project as
 * a static Vite build, so server.ts never runs in production — this file is
 * what actually serves the endpoint on the deployed site.
 *
 * Non-Next.js projects use the web-standard fetch handler signature.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405, headers: { Allow: 'POST' } }
      );
    }

    let question: unknown;
    let asanaSlug: unknown;

    try {
      const body = await request.json();
      question = body?.question;
      asanaSlug = body?.asanaSlug;
    } catch {
      return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 });
    }

    if (typeof question !== 'string' || question.trim() === '') {
      return Response.json({ error: 'Question is required' }, { status: 400 });
    }

    const reply = await askYogaTeacher(
      question,
      typeof asanaSlug === 'string' ? asanaSlug : undefined
    );

    // Always 200 with usable content. Returning an error status here would make
    // the client discard the body and substitute its own canned text, which is
    // exactly the silent-failure path this endpoint replaced.
    return Response.json(reply);
  },
};
