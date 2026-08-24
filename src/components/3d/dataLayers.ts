import * as THREE from 'three';
import type { Asana } from '../../types';
import { ALL_CHAKRAS } from '../../data/asanas';

/**
 * The chakra and muscle-activation overlays, built from the asana's own data.
 *
 * Both are rendered as emissive markers rather than as anatomy baked into the
 * mesh, which is what lets them work identically on the procedural rig and on
 * a loaded character whose muscles are painted into a single skinned mesh.
 *
 * Markers are parented to the nearest joint, so they travel with the body as
 * it moves through a pose instead of hanging in space where the figure used to
 * be. Offsets are measured with the rig held in its neutral stance — see
 * {@link attachAtNeutral}.
 */

export interface DataLayers {
  setChakrasVisible(visible: boolean): void;
  setMusclesVisible(visible: boolean): void;
  setSelectedChakra(chakraId: string | null | undefined): void;
  setSelectedMuscle(muscleId: string | null | undefined): void;
  /** Drives the pulse. Called every frame with seconds since start. */
  update(elapsed: number): void;
  dispose(): void;
}

interface Marker {
  id: string;
  core: THREE.Mesh;
  glow: THREE.Mesh;
  /** Emphasis at rest: dim for inactive, bright for ones this asana engages. */
  baseIntensity: number;
  /** How fast it breathes; primary muscles and active chakras pulse harder. */
  pulseRate: number;
  selected: boolean;
}

const MUSCLE_ROLE_COLORS: Record<string, number> = {
  primary: 0xff3b00,
  secondary: 0xff9500,
  stabilizer: 0x3aa0ff,
};

/**
 * Parents `marker` to whichever joint is closest to `modelPosition`, keeping it
 * visually in the same place.
 *
 * The rig is briefly forced into its neutral stance first. The authored
 * coordinates describe a standing figure, so measuring the offset while the
 * body is mid-pose would bake the pose into the offset and the marker would
 * drift further away the more extreme the asana.
 */
function attachAtNeutral(
  marker: THREE.Object3D,
  modelPosition: THREE.Vector3,
  bodyParts: { [key: string]: THREE.Object3D },
  restRotations: { [key: string]: THREE.Euler },
  humanGroup: THREE.Group,
  preferredJoint?: string
): void {
  // Dedupe by object identity, not by name: the GLB rig exposes `pelvis` as an
  // alias of `root` (same Object3D), while the procedural rig has a genuine
  // pelvis joint that is a valid attachment point in its own right.
  const seenJoints = new Set<THREE.Object3D>();
  const joints = Object.entries(bodyParts).filter(([, joint]) => {
    if (seenJoints.has(joint)) return false;
    seenJoints.add(joint);
    return true;
  });
  if (joints.length === 0) {
    humanGroup.add(marker);
    marker.position.copy(modelPosition);
    return;
  }

  // Hold the rig at rest while we measure.
  const saved = new Map<string, THREE.Euler>();
  for (const [name, joint] of joints) {
    saved.set(name, joint.rotation.clone());
    const rest = restRotations[name];
    if (rest) joint.rotation.copy(rest);
  }
  humanGroup.updateMatrixWorld(true);

  const targetWorld = humanGroup.localToWorld(modelPosition.clone());

  // An explicit hint wins. Nearest-joint is only a fallback, and it is wrong
  // for torso muscles: with the arms at rest the lats sit closer to the elbow
  // than to the spine, so they would ride the arm instead of the ribcage.
  let closest = preferredJoint ? bodyParts[preferredJoint] : undefined;

  if (!closest) {
    closest = joints[0][1];
    let closestDistance = Infinity;
    const jointWorld = new THREE.Vector3();

    for (const [, joint] of joints) {
      joint.getWorldPosition(jointWorld);
      const distance = jointWorld.distanceTo(targetWorld);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = joint;
      }
    }
  }

  closest.add(marker);
  marker.position.copy(closest.worldToLocal(targetWorld.clone()));

  // Undo the counter-scaling a parent joint imposes, so markers stay round.
  const scale = new THREE.Vector3();
  closest.getWorldScale(scale);
  if (scale.x > 1e-6 && scale.y > 1e-6 && scale.z > 1e-6) {
    marker.scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z);
  }

  // Restore whatever pose the rig was actually in.
  for (const [name, joint] of joints) {
    const previous = saved.get(name);
    if (previous) joint.rotation.copy(previous);
  }
  humanGroup.updateMatrixWorld(true);
}

function makeMarker(color: number, coreRadius: number, glowRadius: number): {
  core: THREE.Mesh;
  glow: THREE.Mesh;
  group: THREE.Group;
} {
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(coreRadius, 20, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
  );

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(glowRadius, 20, 20),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    })
  );

  group.add(core, glow);
  return { core, glow, group };
}

export function createDataLayers(
  asana: Asana | undefined,
  bodyParts: { [key: string]: THREE.Object3D },
  restRotations: { [key: string]: THREE.Euler },
  humanGroup: THREE.Group
): DataLayers {
  const chakraMarkers: Marker[] = [];
  const muscleMarkers: Marker[] = [];
  const roots: THREE.Object3D[] = [];

  // --- Chakras: all seven, with the ones this asana engages brought forward ---
  const engagedChakraIds = new Set((asana?.chakras ?? []).map((c) => c.id));

  for (const chakra of ALL_CHAKRAS) {
    const engaged = engagedChakraIds.has(chakra.id);
    const color = new THREE.Color(chakra.color).getHex();
    const { core, glow, group } = makeMarker(color, engaged ? 0.032 : 0.022, engaged ? 0.075 : 0.05);

    group.visible = false;
    attachAtNeutral(
      group,
      new THREE.Vector3(...chakra.position3D),
      bodyParts,
      restRotations,
      humanGroup
    );
    roots.push(group);

    chakraMarkers.push({
      id: chakra.id,
      core,
      glow,
      // Chakras this asana does not activate stay as faint anchors, so the
      // column still reads as a whole without competing for attention.
      baseIntensity: engaged ? 1 : 0.3,
      pulseRate: engaged ? 1.6 : 0.6,
      selected: false,
    });
  }

  // --- Muscle activation: size and colour carry role and engagement level ---
  for (const muscle of asana?.muscles ?? []) {
    const color = MUSCLE_ROLE_COLORS[muscle.role] ?? MUSCLE_ROLE_COLORS.secondary;
    const engagement = Math.max(0, Math.min(100, muscle.percentage)) / 100;
    const coreRadius = 0.035 + engagement * 0.03;

    const { core, glow, group } = makeMarker(color, coreRadius, coreRadius * 2.1);

    group.visible = false;
    attachAtNeutral(
      group,
      new THREE.Vector3(...muscle.position3D),
      bodyParts,
      restRotations,
      humanGroup,
      muscle.attachTo
    );
    roots.push(group);

    muscleMarkers.push({
      id: muscle.id,
      core,
      glow,
      baseIntensity: 0.45 + engagement * 0.55,
      // Harder-working muscles visibly pulse faster.
      pulseRate: 1.1 + engagement * 1.4,
      selected: false,
    });
  }

  let chakrasVisible = false;
  let musclesVisible = false;

  const applyVisibility = () => {
    for (const m of chakraMarkers) m.core.parent!.visible = chakrasVisible;
    for (const m of muscleMarkers) m.core.parent!.visible = musclesVisible;
  };

  const setSelected = (markers: Marker[], id: string | null | undefined) => {
    for (const m of markers) m.selected = Boolean(id) && m.id === id;
  };

  return {
    setChakrasVisible(visible) {
      chakrasVisible = visible;
      applyVisibility();
    },
    setMusclesVisible(visible) {
      musclesVisible = visible;
      applyVisibility();
    },
    setSelectedChakra(id) {
      setSelected(chakraMarkers, id);
    },
    setSelectedMuscle(id) {
      setSelected(muscleMarkers, id);
    },
    update(elapsed) {
      for (const m of [...chakraMarkers, ...muscleMarkers]) {
        if (!m.core.parent?.visible) continue;

        const wave = 0.5 + 0.5 * Math.sin(elapsed * m.pulseRate * Math.PI);
        const emphasis = m.selected ? 1 : m.baseIntensity;

        const coreMat = m.core.material as THREE.MeshBasicMaterial;
        const glowMat = m.glow.material as THREE.MeshBasicMaterial;

        coreMat.opacity = 0.45 * emphasis + 0.5 * emphasis * wave;
        glowMat.opacity = 0.1 * emphasis + 0.28 * emphasis * wave;

        // Selected markers swell as well as brighten, so the one being read
        // about is unmistakable even behind the body.
        const swell = m.selected ? 1.15 + 0.18 * wave : 1;
        m.glow.scale.setScalar(swell);
      }
    },
    dispose() {
      for (const root of roots) {
        root.parent?.remove(root);
        root.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const material = mesh.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) material.forEach((mat) => mat.dispose());
          else material.dispose();
        });
      }
      roots.length = 0;
      chakraMarkers.length = 0;
      muscleMarkers.length = 0;
    },
  };
}
