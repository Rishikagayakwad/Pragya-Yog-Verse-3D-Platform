# Getting a realistic 3D human into the studio

The studio ships with a code-generated figure. It poses correctly and carries
the anatomy overlays, but it will never look like a real person. To replace it
you need one file:

```
public/models/human.glb
```

Save a rigged humanoid there and the app uses it on the next reload. No code
change. This document is the whole process.

---

## Before anything else: the rule that decides everything

**The model must be RIGGED.** A rig is an internal skeleton with skin weights,
so the mesh bends when a bone rotates.

This matters more than looks. The studio poses the body joint by joint from each
asana's data. An unrigged model — however photorealistic — is a statue. It
cannot be bent into Warrior II, and no amount of work on our side changes that.

Most "realistic human" models sold online are **unrigged sculpts**. This is the
single most common and most expensive mistake here: you spend an evening or
$40 on something beautiful that cannot be used at all.

Two more requirements:

| Requirement | Why |
| --- | --- |
| **Mixamo bone naming** — `Hips`, `Spine`, `LeftUpLeg`, `LeftForeArm`… (a `mixamorig:` prefix is fine) | How the loader finds the joints. It needs ten, plus the hips. |
| **`.glb`**, single file, textures embedded | `.gltf` with loose textures, `.fbx`, and `.blend` cannot be loaded by a browser as-is. |

---

## Check any model in ten seconds

Before you buy, and after every export:

```bash
npm run check-model                        # checks public/models/human.glb
npm run check-model -- ~/Downloads/foo.glb # or any path
```

It reports whether the file is rigged, which of the eleven joints it resolved,
the naming convention, file size, and whether textures are embedded. It tells
you what is wrong and how to fix it. **Trust this over any product page.**

A passing model looks like:

```
  Joint resolution  11/11
  Naming        Mixamo (67 prefixed bones)
  PASS — this model will load and pose correctly.
```

---

## Route 1 — Ready Player Me (fastest, free, ~5 minutes)

Best for getting *something real* on screen today.

1. Go to **https://readyplayer.me**
2. Click **Create Avatar** → choose **Full Body**
3. Build it from a photo or pick a preset; choose body type and outfit
4. Finish — you get a URL like `https://models.readyplayer.me/<id>.glb`
5. Open that URL in your browser. It downloads the `.glb`
6. Rename it `human.glb`, put it in `public/models/`
7. `npm run check-model`, then reload the app

**Expect:** a clean, stylised-realistic clothed avatar. Correctly rigged with
Mixamo naming, so it works immediately. Not photoreal, but a real human figure.

---

## Route 2 — Mixamo (free, ~15 minutes, better bodies)

1. Go to **https://www.mixamo.com** and sign in (free Adobe account)
2. Open the **Characters** tab and pick one — several are realistic adults
3. Click **Download**
   - Format: **FBX Binary (.fbx)**
   - Pose: **T-pose**
4. Convert it: `npm run convert-model -- <file.fbx>` (see [Converting to GLB](#converting-to-glb))
5. `npm run check-model`, then save to `public/models/human.glb`

**Expect:** game-quality realistic characters. Rigging is guaranteed correct —
Mixamo *is* where the bone naming convention comes from.

---

## Route 3 — MakeHuman → Mixamo (free, ~1–2 hours, most control)

The best free route to something close to your reference image.

1. Download **MakeHuman** from **http://www.makehumancommunity.org** (free, open source)
2. In MakeHuman:
   - **Modelling** tab — set gender, age, muscle, proportions
   - **Geometries → Clothes** — add a sports top and shorts
   - **Materials** — pick a skin
   - **Files → Export** → **FBX** (or OBJ)
   - Do *not* bother with MakeHuman's own skeleton; Mixamo redoes it
3. Go to **https://www.mixamo.com** → **Upload Character**, give it your export
4. Mixamo auto-rigs it. Place the markers it asks for (chin, wrists, elbows,
   knees, groin) and let it process
5. **Download** → FBX Binary, T-pose
6. Convert to `.glb`, run `npm run check-model`, save it

**Why route through Mixamo:** its auto-rigger outputs exactly the bone names the
loader expects. Rig anywhere else and you may be renaming bones by hand.

---

## Route 4 — Buy one (~$20–80, fastest route to photoreal)

This is how you get your reference image's quality.

Where: **https://www.cgtrader.com**, **https://www.turbosquid.com**,
**https://sketchfab.com/store**

Search for: `rigged female character glb`, `yoga woman rigged`, `athletic female rigged`

**Filter by "Rigged" and then verify it anyway.** Before buying, check the
product page for:

- the word **rigged** *and* **skinned** (skinned is the part that matters)
- a **bone/skeleton screenshot**, not just renders
- **glTF/GLB** in the format list — otherwise you convert
- the skeleton named as Mixamo/Humanoid, or a "Mixamo compatible" note

If it is rigged but with the wrong bone names, upload it to Mixamo's
auto-rigger to re-rig it, or rename the bones in Blender.

### Licence — check this before you buy

The `.glb` sits in `public/` and is served to every visitor, which counts as
**redistribution**. Many marketplace licences forbid that even when you have
paid for the model.

- **Safe:** CC0, CC-BY (credit the author), or a licence explicitly permitting
  use in web/interactive applications
- **Check carefully:** standard "Royalty Free" licences — some allow use in an
  app only when the model is not extractable, which a `.glb` always is
- **A known problem:** DAZ3D Genesis figures. Visually they are the closest
  match to your reference, but the standard DAZ EULA restricts redistributing
  the mesh, and a public `.glb` almost certainly breaches it. Do not ship one
  without reading their licence.

---

## Converting to GLB

Mixamo, MakeHuman and most marketplaces hand you an `.fbx`. The browser cannot
load that, so it has to become a `.glb`.

### Option A — one command (no Blender)

```bash
npm run convert-model -- ~/Downloads/character.fbx
```

That converts it, prints the file size, and immediately validates the result —
rigged or not, which joints resolved, textures embedded. If it passes:

```bash
npm run convert-model -- ~/Downloads/character.fbx --out public/models/human.glb
```

It uses Meta's FBX2glTF under the hood, which preserves the skeleton and skin
weights. That matters: naive online FBX converters routinely drop the rig, and
you only find out when the model refuses to pose.

> Installed as a dev dependency (~35 MB, three platform binaries). If it is
> missing: `npm install --save-dev fbx2gltf`

### Option B — Blender (fallback for unusual or very old FBX files)

Free from **https://www.blender.org/download/**

1. Open Blender, delete the default cube (select it, press `X`)
2. **File → Import → FBX (.fbx)** and choose your file
3. **Check the armature came in** — you should see a bone hierarchy in the
   Outliner panel, top right. If there are no bones, the model is not rigged
   and no export will fix that.
4. **File → Export → glTF 2.0 (.glb/.gltf)**
5. In the export panel on the right:
   - **Format: glTF Binary (.glb)** ← this is what embeds the textures
   - **Include → Limit to Selected Objects: OFF** (so the armature exports too)
   - **Data → Mesh → Apply Modifiers: ON**
   - **Data → Armature → Export Deformation Bones Only: ON** (smaller file)
6. Export, then `npm run check-model -- <your file>`

---

## Keeping it small

Every visitor downloads this file, so size is a real cost.

```bash
npm run optimize-model -- model.glb --out public/models/human.glb
```

Character models are texture-bound, not geometry-bound. A stock Mixamo download
arrives with 4096×4096 maps — about 40 MB of file, of which roughly 39 MB is
images. At the size the figure occupies on screen, 1024 is indistinguishable:

```
Ch02_1001_Normal.png   4096x4096 -> 1024x1024   19.2 MB -> 1.4 MB
Ch02_1001_Diffuse.png  4096x4096 -> 1024x1024   13.8 MB -> 1.3 MB
Ch02_1002_Diffuse.png  2048x2048 -> 1024x1024    3.7 MB -> 1.0 MB

39.9 MB -> 6.4 MB  (84% smaller)
```

Pass `--max 2048` if you want more detail at the cost of size. The output is
validated automatically.

PNG textures stay PNG — converting them to JPEG would drop the alpha channel,
and hair and other `BLEND` materials need it.

> Uses jimp rather than sharp on purpose. `npx gltf-transform resize` is the
> usual advice, but it depends on native libvips, and a mismatched build fails
> with `colourspace: parameter space not set`. jimp is pure JavaScript, so this
> works regardless.

---

## Bonus: deriving poses from animation

If your model comes with animation clips — a mocap yoga pack, a Mixamo
animation, a pose an artist keyed — you can read real joint angles out of it
instead of hand-authoring them:

```bash
npm run extract-pose -- model.glb --list
npm run extract-pose -- model.glb --clip "Warrior II" --time 2.5
```

It prints a `poseParameters` block ready to paste into `src/data/asanas.ts`.

This matters because the poses currently in the data are hand-estimated angles,
which does not scale to a real asana library and is why some of them started out
anatomically off. Angles sampled from a performance are simply correct.

Note it needs an **animation**, not a model frozen in a pose. A static sculpt in
Trikonasana has that shape baked into its mesh, not its bones, so there is
nothing to read.

## Once it passes

```bash
cp your-model.glb public/models/human.glb
npm run check-model
npm run dev
```

The studio loads it, scales it to 1.75m, stands its feet on the mat, rotates it
out of T-pose into the neutral stance the asana data assumes, and poses it.

### One known gap

A loaded character is a single skinned mesh, so it has no separable muscle or
skeleton geometry. Two of the four **VISUAL LAYERS** switches — Anatomy Overlay
and Skeleton — have nothing to show on it, while Alignment Grid, Prop Toggle,
and the chakra and muscle markers all work.

Closing that means generating the skeleton from the model's own bones and
promoting the muscle markers into full heat zones. Worth doing once a real model
is in place, since both depend on its proportions.
