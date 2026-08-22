import { Asana, AIChatMessage } from '../types';

export async function fetchAsanas(params?: {
  category?: string;
  difficulty?: string;
  movement?: string;
  search?: string;
}): Promise<Asana[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.difficulty && params.difficulty !== 'All') query.set('difficulty', params.difficulty);
    if (params?.movement && params.movement !== 'All') query.set('movement', params.movement);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/asanas?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch asanas');
    const data = await res.json();
    return data.asanas || [];
  } catch (err) {
    console.error('Error loading asanas from API, falling back to local dataset', err);
    const { ASANAS } = await import('../data/asanas');
    return ASANAS;
  }
}

export async function fetchAsanaBySlug(slug: string): Promise<Asana | null> {
  try {
    const res = await fetch(`/api/asanas/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch asana');
    const data = await res.json();
    return data.asana || null;
  } catch (err) {
    console.error('Error loading asana by slug', err);
    const { ASANAS } = await import('../data/asanas');
    return ASANAS.find((a) => a.slug === slug || a.id === slug) || null;
  }
}

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
