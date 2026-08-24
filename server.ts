import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { ASANAS } from './src/data/asanas';
import { askYogaTeacher } from './lib/aiTeacher';

dotenv.config();

// Local development server only.
//
// Production is a static Vite build on Vercel, which never runs this file — the
// deployed /api/ai/ask is served by the Vercel Function in api/ai/ask.ts. Both
// share lib/aiTeacher.ts so local and production answer identically.

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
// Serve static assets from /public folder (images, icons, etc.)
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

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

// 4. AI Yoga Teacher — delegates to the same module api/ai/ask.ts uses, so a
// question answered locally and one answered in production take the same path.
app.post('/api/ai/ask', async (req, res) => {
  const { question, asanaSlug } = req.body ?? {};

  if (typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'Question is required' });
  }

  const reply = await askYogaTeacher(
    question,
    typeof asanaSlug === 'string' ? asanaSlug : undefined
  );

  res.json(reply);
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
