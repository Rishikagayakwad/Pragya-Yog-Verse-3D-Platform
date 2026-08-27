import type { Asana, AsanaStep, MuscleActivation, BoneInfo, ChakraInfo, PoseJointAngles } from '../types';
import { ASANAS, ALL_CHAKRAS, ALL_BONES } from '../data/asanas';

export interface DatabaseSchema {
  asanas: Asana[];
  bones: BoneInfo[];
  chakras: ChakraInfo[];
}

/**
 * Service providing normalized data queries for the 3D Yoga Studio.
 * Pre-seeds full relational datasets for Asanas, Step Sequences,
 * Kinematic Rig Parameters, Musculoskeletal Activations, and Breath Patterns.
 */
class AsanaDatabaseService {
  private asanaCache: Map<string, Asana> = new Map();
  private boneCache: Map<string, BoneInfo> = new Map();
  private chakraCache: Map<string, ChakraInfo> = new Map();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    ASANAS.forEach((asana) => {
      this.asanaCache.set(asana.id, asana);
      this.asanaCache.set(asana.slug, asana);
    });

    ALL_BONES.forEach((bone) => {
      this.boneCache.set(bone.id, bone);
    });

    ALL_CHAKRAS.forEach((chakra) => {
      this.chakraCache.set(chakra.id, chakra);
    });
  }

  public async getAllAsanas(): Promise<Asana[]> {
    return Array.from(new Set(this.asanaCache.values()));
  }

  public async getAsanaById(idOrSlug: string): Promise<Asana | null> {
    return this.asanaCache.get(idOrSlug) || null;
  }

  public async getAsanaSteps(asanaId: string): Promise<AsanaStep[]> {
    const asana = this.asanaCache.get(asanaId);
    return asana?.steps || [];
  }

  public async getAsanaMuscles(asanaId: string): Promise<MuscleActivation[]> {
    const asana = this.asanaCache.get(asanaId);
    return asana?.muscles || [];
  }

  public async getAsanaBones(asanaId: string): Promise<BoneInfo[]> {
    const asana = this.asanaCache.get(asanaId);
    if (!asana) return [];
    
    // Aggregate bones referenced across steps
    const boneIds = new Set<string>();
    asana.steps?.forEach((step) => {
      step.highlightedBones?.forEach((id) => boneIds.add(id));
    });

    return Array.from(boneIds)
      .map((id) => this.boneCache.get(id))
      .filter((b): b is BoneInfo => Boolean(b));
  }

  public async getAllBones(): Promise<BoneInfo[]> {
    return Array.from(this.boneCache.values());
  }

  public async getAllChakras(): Promise<ChakraInfo[]> {
    return Array.from(this.chakraCache.values());
  }

  public async searchAsanas(query: string): Promise<Asana[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllAsanas();

    return (await this.getAllAsanas()).filter(
      (a) =>
        a.englishName.toLowerCase().includes(q) ||
        a.sanskritName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.difficulty.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q)
    );
  }
}

export const asanaDatabase = new AsanaDatabaseService();
