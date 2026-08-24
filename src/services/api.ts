// The asana dataset ships with the bundle, so components import ASANAS
// directly rather than round-tripping through /api/asanas. Only the AI
// endpoint genuinely needs the server, because the API key lives there.

export interface TeacherAnswer {
  answer: string;
  suggestedQuestions?: string[];
  /**
   * True when the text is canned guidance rather than a generated answer —
   * either the endpoint was unreachable or the server degraded the reply.
   * The UI surfaces this so stock advice is never passed off as real coaching.
   */
  degraded: boolean;
}

export async function askAIYogaTeacher(
  question: string,
  asanaSlug?: string
): Promise<TeacherAnswer> {
  try {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, asanaSlug }),
    });

    if (!res.ok) {
      throw new Error(`AI endpoint returned ${res.status}`);
    }

    const data = await res.json();
    if (typeof data?.answer !== 'string' || data.answer.trim() === '') {
      throw new Error('AI endpoint returned no answer');
    }

    // The server reports its own degraded state; trust it, defaulting to
    // "genuine" only when the field is explicitly false.
    return {
      answer: data.answer,
      suggestedQuestions: data.suggestedQuestions,
      degraded: data.degraded === true,
    };
  } catch (err) {
    console.error('AI consultation error', err);
    return {
      answer:
        'In yoga practice, always anchor your awareness in steady diaphragmatic breath (Pranayama). Respect your body’s unique anatomical proportions, soften unnecessary tension, and honor steady presence over forceful exertion.',
      suggestedQuestions: [
        'How can I modify this pose for tight hamstrings?',
        'What is the key breath cue for transitions?',
        'Which muscles stabilize this posture?',
      ],
      degraded: true,
    };
  }
}
