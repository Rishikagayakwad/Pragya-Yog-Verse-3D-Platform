# Pragya Yog Verse

A 3D yoga learning platform. Search an asana and study it in an interactive
studio: a posable 3D human, 360° rotation, step-by-step guidance, Sanskrit name
and meaning, benefits and contraindications, chakra and muscle-activation data,
breath work, voice guidance, and an AI teacher.

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run lint         # tsc --noEmit — typechecks everything, including api/
npm run build        # client bundle + dist/server.cjs
```

### AI teacher

Copy `.env.example` to `.env` and set `GEMINI_API_KEY`. Without it the endpoint
still responds, but flags itself as `degraded` and returns canned guidance —
the UI labels those answers rather than passing them off as real coaching.

## The 3D model

The studio ships with a **procedural fallback** — a figure built from primitives
in `detailedHumanModel.ts`. It poses correctly but reads as a mannequin.

To use a realistic human, drop a rigged humanoid `.glb` into `public/models/`
and point `src/config/model.ts` at it, or set the env var:

```bash
VITE_HUMAN_MODEL_URL=/models/your-model.glb
```

The model must have a standard humanoid skeleton using Mixamo bone naming
(`Hips`, `Spine`, `LeftUpLeg`, `LeftForeArm`, … with or without a `mixamorig:`
prefix). Ready Player Me and Mixamo exports both qualify. The loader resolves
ten joints plus the hips; if any are missing it logs what it could not find and
keeps the procedural model rather than rendering something that won't pose.

Loading is progressive: the fallback appears immediately and is swapped out when
the download finishes, so the studio is never blocked on it. `GLTFLoader` is
code-split, so projects on the fallback never download it.

Rigs are usually exported in a T-pose, but `poseParameters` are authored against
an arms-down neutral. The loader measures each limb's direction from the model's
own bone positions and rotates it into that neutral before recording rest, so one
set of authored angles reads correctly on any humanoid.

## Deployment

Deployed on Vercel; pushing to `main` redeploys automatically.

Vercel serves this as a static Vite build, so `server.ts` — the local dev
server — never runs in production. The live `/api/ai/ask` is the Vercel Function
in `api/ai/ask.ts`; both share `lib/aiTeacher.ts` so they can't drift.

> **Gotcha:** `package.json` sets `"type": "module"` and Vercel compiles each
> `api/` file rather than bundling it, so **relative imports in the `api/` chain
> must carry a `.js` extension** (`'../../lib/aiTeacher.js'`). Without it the
> function dies at load with `FUNCTION_INVOCATION_FAILED`. Bundling locally
> hides this, because bundlers inline the import.

Set `GEMINI_API_KEY` in the Vercel project's environment variables for the AI
teacher to work in production.
