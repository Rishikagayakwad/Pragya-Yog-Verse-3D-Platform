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

export interface MuscleActivation {
  id: string;
  name: string;
  latinName: string;
  role: 'primary' | 'secondary' | 'stabilizer';
  percentage: number;
  position3D: [number, number, number]; // [x, y, z] on 3D humanoid
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

export interface AsanaStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  instruction: string;
  breathCue: 'Inhale' | 'Exhale' | 'Hold' | 'Natural';
  durationSeconds: number;
  drishti: string; // Gaze point
  alignmentTips: string[];
  commonMistake: string;
  modification: string;
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  highlightedMuscles: string[];
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
