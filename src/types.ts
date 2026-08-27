/**
 * Top-level pages. The product is "search an asana, land in the 3D studio",
 * so the Library is the front door and the Studio is where everything happens.
 */
export type AppView = 'library' | 'studio';

export type DifficultyLevel = 'Easy' | 'Intermediate' | 'Hard';

export type MovementType = 'Strength' | 'Mobility' | 'Balance' | 'Flexibility' | 'Restorative';

export type CategoryType = 
  | 'Standing'
  | 'Seated'
  | 'Balance'
  | 'Twist'
  | 'Backbend'
  | 'Forward Fold'
  | 'Inversion'
  | 'Restorative';

export type VisualLayerType = 'skin' | 'muscles' | 'skeleton' | 'chakras' | 'breath' | 'body-systems';

export type BodySystemType = 
  | 'musculoskeletal'
  | 'respiratory'
  | 'circulatory'
  | 'nervous'
  | 'digestive'
  | 'endocrine';

/**
 * The joints every rig exposes, procedural or loaded GLB. Must stay in sync
 * with POSE_JOINTS in components/3d/rigJoints.ts.
 */
export type RigJointSlot =
  | 'root'
  | 'torso'
  | 'head'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee';

export interface MuscleActivation {
  id: string;
  name: string;
  latinName: string;
  role: 'primary' | 'secondary' | 'stabilizer';
  percentage: number;
  /**
   * Where the muscle sits on a NEUTRAL standing figure — 1.75m tall, feet at
   * y = 0, facing +z, left side is +x. The marker is parented to a joint and
   * travels with it into the pose, so this is not where the muscle ends up in
   * the posture.
   */
  position3D: [number, number, number];
  /**
   * Which joint the marker rides. Without it the nearest joint is used, which
   * misplaces torso muscles: with the arms hanging down, the lats sit closer
   * to the elbow than to the spine, so they would fly up when the arm lifts.
   */
  attachTo?: RigJointSlot;
  description: string;
  biomechanics: string;
}

export interface ChakraInfo {
  id: string;
  sanskritName: string;
  englishName: string;
  location: string;
  position3D: [number, number, number]; // [x, y, z] along spinal axis
  color: string;
  element: string;
  bijaMantra: string;
  meaning: string;
  activationRole: string;
  frequency: number; // Hz for sound resonance
}

export interface BoneInfo {
  id: string;
  name: string;
  latinName: string;
  category: 'Spine' | 'Pelvis' | 'Lower Limb' | 'Upper Limb' | 'Thorax' | 'Skull';
  position3D: [number, number, number];
  attachTo?: RigJointSlot;
  description: string;
  alignmentCue: string;
}

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
export type LoopMode = 'asana' | 'step' | 'once';

export interface PoseJointAngles {
  torsoAngle: [number, number, number];
  headAngle: [number, number, number];
  leftArm: [number, number, number];
  rightArm: [number, number, number];
  leftForearm: [number, number, number];
  rightForearm: [number, number, number];
  leftLeg: [number, number, number];
  rightLeg: [number, number, number];
  leftShin: [number, number, number];
  rightShin: [number, number, number];
  elevation: number;
  rotationY: number;
}

export interface AsanaStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  instruction: string;
  breathCue: 'Inhale' | 'Exhale' | 'Hold' | 'Natural' | 'Internal Retention' | 'External Retention';
  durationSeconds: number;
  startTime?: number;
  endTime?: number;
  drishti: string; // Gaze point
  technique?: string;
  position?: string;
  alignmentTips: string[];
  commonMistake: string;
  modification: string;
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  highlightedMuscles: string[];
  highlightedBones?: string[];
  stepPoseParameters?: PoseJointAngles;
}

export interface BreathPhase {
  phase: 'Inhale' | 'Internal Retention' | 'Exhale' | 'External Retention';
  duration: number; // seconds
  instructions: string;
  diaphragmAction: string;
}

export interface BodySystemImpact {
  system: BodySystemType;
  name: string;
  iconName: string;
  physiologicalEffect: string;
  clinicalRelevance: string;
  color: string;
}

export interface Asana {
  id: string;
  slug: string;
  englishName: string;
  sanskritName: string;
  sanskritScript: string;
  pronunciation: string;
  meaning: string;
  category: CategoryType;
  difficulty: DifficultyLevel;
  movementTypes: MovementType[];
  featured: boolean;
  imageUrl?: string;
  shortDescription: string;
  fullDescription: string;
  historyAndSignificance: string;
  drishti: string;
  benefits: string[];
  contraindications: string[];
  muscles: MuscleActivation[];
  chakras: ChakraInfo[];
  steps: AsanaStep[];
  breathPattern: {
    name: string;
    ratio: string;
    description: string;
    phases: BreathPhase[];
  };
  bodySystems: BodySystemImpact[];
  poseParameters: {
    // 3D joint rotations for procedural articulated model
    torsoAngle: [number, number, number];
    headAngle: [number, number, number];
    leftArm: [number, number, number];
    rightArm: [number, number, number];
    leftForearm: [number, number, number];
    rightForearm: [number, number, number];
    leftLeg: [number, number, number];
    rightLeg: [number, number, number];
    leftShin: [number, number, number];
    rightShin: [number, number, number];
    elevation: number;
    rotationY: number;
  };
  tags: string[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sender?: 'user' | 'teacher';
  text?: string;
  timestamp: number;
  suggestedQuestions?: string[];
  /** Assistant messages only: the text is canned guidance, not a real answer. */
  degraded?: boolean;
}

export type ActiveStudioSection = 
  | 'overview'
  | 'chakra'
  | 'muscles'
  | 'steps'
  | 'drishti'
  | 'position'
  | 'benefits'
  | 'contraindications'
  | 'breath'
  | 'ai-teacher'
  | 'significance'
  | 'alignment'
  | 'instructions'
  | 'variations'
  | 'level-movement'
  | 'systems'
  | 'related'
  | 'voice-guide';
