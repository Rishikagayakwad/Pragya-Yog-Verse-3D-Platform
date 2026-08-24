/**
 * Which 3D human the studio renders.
 *
 * Drop a rigged humanoid .glb at `public/models/human.glb` and it is picked up
 * automatically — no code change. The procedural model is only a fallback for
 * when that file is absent, and disappears the moment it exists.
 *
 * To load from somewhere else (a hosted URL, a differently named file):
 *   VITE_HUMAN_MODEL_URL=/models/my-model.glb
 *
 * Requirements for the model:
 *   - rigged, with a standard humanoid skeleton (Mixamo naming — `Hips`,
 *     `Spine`, `LeftUpLeg`, `LeftForeArm`, … with or without a `mixamorig:`
 *     prefix). Ready Player Me, Mixamo, and most marketplace character rigs
 *     satisfy this.
 *   - all ten joints in POSE_JOINTS present, plus `Hips`. The loader reports
 *     anything it cannot resolve and keeps the fallback rather than rendering
 *     a model that silently refuses to pose.
 *   - exported in a T-pose or A-pose; the loader measures the limbs and
 *     calibrates to the neutral stance the asana data is authored against.
 */
const DEFAULT_MODEL_PATH = '/models/human.glb';

const envUrl = import.meta.env?.VITE_HUMAN_MODEL_URL as string | undefined;

export const HUMAN_MODEL_URL: string = envUrl?.trim() ? envUrl.trim() : DEFAULT_MODEL_PATH;

/**
 * Target height in world units (metres) that any loaded model is scaled to.
 * The studio's camera framing, the platform, and the chakra/muscle marker
 * coordinates in the asana data all assume a figure about this tall.
 */
export const MODEL_TARGET_HEIGHT = 1.75;

/**
 * Cheap existence probe, run before the loader chunk is even downloaded.
 *
 * Without it, a missing model means GLTFLoader receives the dev server's SPA
 * fallback — index.html — and dies with a parse error that reads like a broken
 * model rather than an absent one.
 */
export async function modelIsAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return false;

    // Vite answers unknown paths with index.html; Vercel does the same for an
    // SPA. Either way that is a miss, not a model.
    const contentType = response.headers.get('content-type') ?? '';
    return !contentType.includes('text/html');
  } catch {
    return false;
  }
}
