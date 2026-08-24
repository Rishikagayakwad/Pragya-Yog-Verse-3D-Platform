/**
 * Which 3D human the studio renders.
 *
 * Set HUMAN_MODEL_URL to a rigged humanoid .glb and the studio will load it
 * instead of the procedural fallback. Two ways to supply one:
 *
 *   1. Drop the file in `public/models/` and set this to '/models/your-file.glb'
 *   2. Point it at a hosted URL (e.g. a Ready Player Me avatar URL)
 *
 * Or override at build time without touching this file:
 *   VITE_HUMAN_MODEL_URL=/models/your-file.glb
 *
 * Requirements for the model:
 *   - rigged, with a standard humanoid skeleton (Mixamo naming — `Hips`,
 *     `Spine`, `LeftUpLeg`, `LeftForeArm`, … with or without a `mixamorig:`
 *     prefix). Ready Player Me and Mixamo exports both satisfy this.
 *   - all ten joints in POSE_JOINTS present, plus `Hips`. The loader reports
 *     what it could not resolve and falls back rather than rendering a model
 *     that silently refuses to pose.
 *
 * Leave it null to keep the procedural model.
 */
const envUrl = import.meta.env?.VITE_HUMAN_MODEL_URL as string | undefined;

export const HUMAN_MODEL_URL: string | null = envUrl?.trim() ? envUrl.trim() : null;

/**
 * Target height in world units (metres) that any loaded model is scaled to.
 * The studio's camera framing, platform, and the chakra/muscle marker
 * coordinates in the asana data all assume a figure about this tall.
 */
export const MODEL_TARGET_HEIGHT = 1.75;
