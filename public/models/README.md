# Drop the 3D human here

Save a rigged humanoid model as **`human.glb`** in this folder. The studio
picks it up automatically on the next reload and the procedural fallback
figure disappears — no code change needed.

```
public/models/human.glb
```

To use a different filename or a hosted URL instead, set:

```bash
VITE_HUMAN_MODEL_URL=/models/my-model.glb
```

## What the model must have

| Requirement | Why |
| --- | --- |
| **Rigged**, standard humanoid skeleton | The studio poses it joint by joint from each asana's `poseParameters`. An unrigged mesh cannot be posed at all. |
| **Mixamo bone naming** — `Hips`, `Spine`, `LeftUpLeg`, `LeftForeArm`, … (a `mixamorig:` prefix is fine) | How the loader finds the joints. Ready Player Me, Mixamo, and most marketplace character rigs already use it. |
| All ten joints present, plus `Hips` | Anything missing is reported in the console and the fallback is kept, rather than rendering a model that silently refuses to pose. |
| **`.glb`** (single file, textures embedded) | `.gltf` + loose textures needs extra path wiring. `.fbx` and `.blend` are not loadable in the browser — convert first. |
| Exported in **T-pose or A-pose** | The loader measures the limbs and calibrates to the arms-down neutral the asana data is authored against. |

Height and ground placement are handled for you — the model is scaled to 1.75m
and its feet are stood on the mat automatically.

## Where to get one

> Full walkthrough with exact sites, settings and licensing caveats:
> [../../docs/MODEL-SETUP.md](../../docs/MODEL-SETUP.md)
> Validate any file with `npm run check-model`.

- **Ready Player Me** — free, browser-based, gives a `.glb` URL in a couple of
  minutes. Correct rig out of the box. Stylised-realistic, and clothed.
- **Mixamo** (Adobe account, free) — upload or pick a character, download as
  `.fbx`, convert to `.glb` in Blender. This is where the bone naming comes from.
- **Sketchfab / CGTrader / TurboSquid** — search for a *rigged* female or male
  character in athletic wear. Filter by "rigged" and check the skeleton before
  buying; plenty of realistic models are static sculpts and are useless here.
- **DAZ Studio** (Genesis figures) — closest to a photoreal yoga render, but
  needs exporting and usually retargeting to Mixamo bone names.

## Converting FBX to GLB

In Blender: `File → Import → FBX`, then `File → Export → glTF 2.0 (.glb)`.
Keep "Include → Selected Objects" off so the armature is exported with the mesh.
