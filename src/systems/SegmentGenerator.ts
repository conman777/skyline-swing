import Phaser from 'phaser';

export type PlatformType = 'ground' | 'crumble';
export type HazardType =
  | 'spikes'
  | 'saw'
  | 'laser'
  | 'wind'
  | 'swing-gate'
  | 'electric'
  | 'turret';

export interface AnchorDefinition {
  x: number;
  y: number;
  kind?: 'surface' | 'beacon';
}

export interface PlatformDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: PlatformType;
}

export interface HazardDefinition {
  type: HazardType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  data?: Record<string, unknown>;
}

export interface SegmentDefinition {
  key: string;
  width: number;
  difficulty: number;
  anchors: AnchorDefinition[];
  platforms: PlatformDefinition[];
  hazards: HazardDefinition[];
}

export interface GeneratedSegment {
  definition: SegmentDefinition;
  worldX: number;
}

export interface SegmentGeneratorConfig {
  scene: Phaser.Scene;
  segments: SegmentDefinition[];
}

export class SegmentGenerator {
  private readonly scene: Phaser.Scene;
  private readonly segments: SegmentDefinition[];
  private cursorX = 0;
  private runSeed = 0;

  constructor(config: SegmentGeneratorConfig) {
    this.scene = config.scene;
    this.segments = config.segments;
    this.runSeed = Phaser.Math.RND.integerInRange(0, 999999);
  }

  get seed(): string {
    return this.runSeed.toString().padStart(6, '0');
  }

  get length(): number {
    return this.cursorX;
  }

  reset(): void {
    this.cursorX = 0;
  }

  nextSegment(difficulty: number): GeneratedSegment {
    const pool = this.segments.filter((segment) => segment.difficulty <= difficulty);
    const picked = Phaser.Utils.Array.GetRandom(pool.length > 0 ? pool : this.segments);
    const segment: GeneratedSegment = {
      definition: picked,
      worldX: this.cursorX,
    };
    this.cursorX += picked.width;
    return segment;
  }
}
