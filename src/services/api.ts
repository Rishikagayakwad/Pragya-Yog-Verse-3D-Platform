// The asana dataset ships with the bundle, so components import ASANAS
// directly rather than round-tripping through /api/asanas. Only the AI
// endpoint genuinely needs the server, because the API key lives there.

export async function askAIYogaTeacher(
  question: string,
  asanaSlug?: string
): Promise<{ answer: string; suggestedQuestions?: string[] }> {
  try {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, asanaSlug }),
    });

    if (!res.ok) throw new Error('AI consultation failed');
    return await res.json();
  } catch (err) {
    console.error('AI consultation error', err);
    return {
      answer:
        'In yoga practice, always anchor your awareness in steady diaphragmatic breath (Pranayama). Respect your body’s unique anatomical proportions, soften unnecessary tension, and honor steady presence over forceful exertion.',
      suggestedQuestions: [
        'How can I modify this pose for tight hamstrings?',
        'What is the key breath cue for transitions?',
        'Which muscles stabilize this posture?'
      ],
    };
  }
}
