import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ASANAS } from './src/data/asanas';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
// Serve static assets from /public folder (images, icons, etc.)
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check & Cloud Run deployment probes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});
app.get('/_ah/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 2. Get All Asanas
app.get('/api/asanas', (req, res) => {
  const { category, difficulty, movement, search } = req.query;
  let list = [...ASANAS];

  if (category && category !== 'All') {
    list = list.filter((a) => a.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (difficulty && difficulty !== 'All') {
    list = list.filter((a) => a.difficulty.toLowerCase() === (difficulty as string).toLowerCase());
  }

  if (movement && movement !== 'All') {
    list = list.filter((a) => a.movementTypes.some((m) => m.toLowerCase() === (movement as string).toLowerCase()));
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase();
    list = list.filter(
      (a) =>
        a.englishName.toLowerCase().includes(q) ||
        a.sanskritName.toLowerCase().includes(q) ||
        a.meaning.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ asanas: list, total: list.length });
});

// 3. Get Single Asana by Slug
app.get('/api/asanas/:slug', (req, res) => {
  const { slug } = req.params;
  const asana = ASANAS.find((a) => a.slug === slug || a.id === slug);
  if (!asana) {
    return res.status(404).json({ error: 'Asana not found' });
  }
  res.json({ asana });
});

// 4. AI Yoga Teacher Question Endpoint (Gemini 3.7 Flash)
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, asanaSlug } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const currentAsana = ASANAS.find((a) => a.slug === asanaSlug);

    const asanaContext = currentAsana
      ? `
Current Asana Context:
- Sanskrit Name: ${currentAsana.sanskritName} (${currentAsana.sanskritScript})
- English Name: ${currentAsana.englishName}
- Category: ${currentAsana.category} | Difficulty: ${currentAsana.difficulty}
- Meaning & History: ${currentAsana.meaning}
- Drishti (Gaze Point): ${currentAsana.drishti}
- Primary Activated Muscles: ${currentAsana.muscles.map((m) => `${m.name} (${m.percentage}%)`).join(', ')}
- Associated Chakras: ${currentAsana.chakras.map((c) => `${c.sanskritName} (${c.bijaMantra})`).join(', ')}
- Breath Pattern: ${currentAsana.breathPattern.name} (${currentAsana.breathPattern.ratio})
- Key Benefits: ${currentAsana.benefits.join('; ')}
- Contraindications: ${currentAsana.contraindications.join('; ')}
- Steps Overview: ${currentAsana.steps.map((s) => `Step ${s.stepNumber}: ${s.title} - ${s.instruction}`).join(' | ')}
`
      : 'General Yoga Asana & Anatomy Question.';

    const systemInstruction = `
You are the 3D Asana Master Yoga AI Teacher and Senior Anatomical Biomechanist.
Your goal is to guide students with deep, somatic wisdom, precise anatomical knowledge, classical Sanskrit terminology, breath synchronicity, and heartfelt encouragement.

Rules:
1. Always be supportive, clear, and grounded in authentic yogic science and kinesiology.
2. If asked about anatomy, reference specific muscles, joint mechanics, or energetic chakras.
3. If asked about alignment or pain, provide safe anatomical modifications and always clarify that your guidance is educational and does not substitute individual medical diagnosis.
4. Keep answers engaging and concise (2-4 well-crafted paragraphs or scannable bullet points).
5. Suggest 2-3 short follow-up questions the user might want to explore.
`;

    const ai = getGeminiClient();

    if (!ai) {
      // Graceful fallback if API key is not configured yet
      return res.json({
        answer: `As your 3D Asana Teacher, in ${currentAsana?.englishName || 'this pose'}, focus on finding the harmony between sthira (stability) and sukha (ease). Ground through your foundational contact points while lengthening through the crown of your head. Breathe with smooth, steady Ujjayi resonance.`,
        suggestedQuestions: [
          'What are the primary muscles working in this pose?',
          'How do I modify this if I have tight hips or shoulders?',
          'What is the recommended breath ratio for this asana?'
        ]
      });
    }

    const prompt = `
${asanaContext}

Student's Question:
"${question}"

Provide an insightful, inspiring, and biomechanically accurate response. Include 3 suggested follow-up questions at the end formatted as a JSON array or clear lines.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Breathe deeply and find stillness within your center.';

    // Provide intelligent suggested questions
    const suggestedQuestions = [
      `How does ${currentAsana?.englishName || 'this pose'} affect my nervous system?`,
      `What is the best way to transition into this safely?`,
      `Which chakra is most stimulated here?`
    ];

    res.json({
      answer: replyText,
      suggestedQuestions,
    });
  } catch (error: unknown) {
    console.error('Error generating AI answer:', error);
    res.status(500).json({
      error: 'Failed to consult AI Yoga Teacher',
      answer: 'Let your breath be your anchor. Reconnect to your physical foundation, align your spine with gentle awareness, and breathe into any areas of tension.',
      suggestedQuestions: [
        'How should I breathe during this asana?',
        'What are common alignment mistakes to avoid?'
      ]
    });
  }
});

// Vite Middleware integration for dev and production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`3D Asana Server running on port ${PORT}`);
  });
}

startServer();
