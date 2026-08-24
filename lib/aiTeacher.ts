import { GoogleGenAI } from '@google/genai';
import { ASANAS } from '../src/data/asanas.js';

/**
 * Shared AI Yoga Teacher logic.
 *
 * This lives outside src/ so both callers can use one implementation:
 *   - api/ai/ask.ts  -> the Vercel Function that serves production
 *   - server.ts      -> the local Express dev server
 *
 * Production runs on Vercel, which only serves dist/ statically and never
 * executes server.ts, so the Function is the one that actually matters. Keeping
 * the logic here means the two can't drift apart.
 */

export interface TeacherReply {
  answer: string;
  suggestedQuestions: string[];
  /** True when the answer is canned rather than genuinely generated. */
  degraded: boolean;
  /** Why it was degraded — surfaced for logging, not shown to users verbatim. */
  degradedReason?: 'missing-api-key' | 'generation-failed';
}

const GEMINI_MODEL = 'gemini-3.7-flash';

const SYSTEM_INSTRUCTION = `
You are the Pragya Yog Verse Master Yoga AI Teacher and Senior Anatomical Biomechanist.
Your goal is to guide students with deep, somatic wisdom, precise anatomical knowledge, classical Sanskrit terminology, breath synchronicity, and heartfelt encouragement.

Rules:
1. Always be supportive, clear, and grounded in authentic yogic science and kinesiology.
2. If asked about anatomy, reference specific muscles, joint mechanics, or energetic chakras.
3. If asked about alignment or pain, provide safe anatomical modifications and always clarify that your guidance is educational and does not substitute individual medical diagnosis.
4. Keep answers engaging and concise (2-4 well-crafted paragraphs or scannable bullet points).
5. Suggest 2-3 short follow-up questions the user might want to explore.
`;

let cachedClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return cachedClient;
}

function buildAsanaContext(slug?: string): string {
  const asana = slug ? ASANAS.find((a) => a.slug === slug || a.id === slug) : undefined;
  if (!asana) return 'General Yoga Asana & Anatomy Question.';

  return `
Current Asana Context:
- Sanskrit Name: ${asana.sanskritName} (${asana.sanskritScript})
- English Name: ${asana.englishName}
- Category: ${asana.category} | Difficulty: ${asana.difficulty}
- Meaning & History: ${asana.meaning}
- Drishti (Gaze Point): ${asana.drishti}
- Primary Activated Muscles: ${asana.muscles.map((m) => `${m.name} (${m.percentage}%)`).join(', ')}
- Associated Chakras: ${asana.chakras.map((c) => `${c.sanskritName} (${c.bijaMantra})`).join(', ')}
- Breath Pattern: ${asana.breathPattern.name} (${asana.breathPattern.ratio})
- Key Benefits: ${asana.benefits.join('; ')}
- Contraindications: ${asana.contraindications.join('; ')}
- Steps Overview: ${asana.steps.map((s) => `Step ${s.stepNumber}: ${s.title} - ${s.instruction}`).join(' | ')}
`;
}

function followUpQuestions(slug?: string): string[] {
  const asana = slug ? ASANAS.find((a) => a.slug === slug || a.id === slug) : undefined;
  const name = asana?.englishName || 'this pose';
  return [
    `How does ${name} affect my nervous system?`,
    'What is the best way to transition into this safely?',
    'Which chakra is most stimulated here?',
  ];
}

function fallbackReply(
  slug: string | undefined,
  reason: NonNullable<TeacherReply['degradedReason']>
): TeacherReply {
  const asana = slug ? ASANAS.find((a) => a.slug === slug || a.id === slug) : undefined;
  const name = asana?.englishName || 'this pose';
  return {
    answer:
      `As your Pragya Yog Verse teacher, in ${name}, focus on finding the harmony between ` +
      `sthira (stability) and sukha (ease). Ground through your foundational contact points ` +
      `while lengthening through the crown of your head. Breathe with smooth, steady Ujjayi resonance.`,
    suggestedQuestions: [
      'What are the primary muscles working in this pose?',
      'How do I modify this if I have tight hips or shoulders?',
      'What is the recommended breath ratio for this asana?',
    ],
    degraded: true,
    degradedReason: reason,
  };
}

/**
 * Answers a student's question. Never throws and never returns an empty answer:
 * on a missing key or a generation failure it degrades to canned guidance and
 * says so via `degraded`, so the caller can be honest about it rather than
 * passing off a stock paragraph as a real answer.
 */
export async function askYogaTeacher(question: string, asanaSlug?: string): Promise<TeacherReply> {
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('[aiTeacher] GEMINI_API_KEY is not set — returning canned guidance.');
    return fallbackReply(asanaSlug, 'missing-api-key');
  }

  const prompt = `
${buildAsanaContext(asanaSlug)}

Student's Question:
"${question}"

Provide an insightful, inspiring, and biomechanically accurate response.
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 },
    });

    const answer = response.text?.trim();
    if (!answer) return fallbackReply(asanaSlug, 'generation-failed');

    return { answer, suggestedQuestions: followUpQuestions(asanaSlug), degraded: false };
  } catch (error) {
    console.error('[aiTeacher] generateContent failed:', error);
    return fallbackReply(asanaSlug, 'generation-failed');
  }
}
