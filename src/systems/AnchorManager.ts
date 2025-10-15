import Phaser from 'phaser';
import { GeneratedSegment } from './SegmentGenerator';

interface AnchorManagerConfig {
  scene: Phaser.Scene;
  debug?: boolean;
}

interface AnchorsResult {
  surfacePoints: Phaser.Math.Vector2[];
  beaconZones: Phaser.GameObjects.Zone[];
}

export class AnchorManager {
  private readonly scene: Phaser.Scene;
  private readonly debug: boolean;
  private surfaceGraphics: Phaser.GameObjects.Graphics | null = null;
  private readonly surfacePoints: Phaser.Math.Vector2[] = [];
  private readonly beaconZones: Phaser.GameObjects.Zone[] = [];

  constructor(config: AnchorManagerConfig) {
    this.scene = config.scene;
    this.debug = config.debug ?? false;
  }

  get surfaces(): Phaser.Math.Vector2[] {
    return this.surfacePoints.map((point) => point.clone());
  }

  get beacons(): Phaser.GameObjects.Zone[] {
    return this.beaconZones;
  }

  appendSegments(segments: GeneratedSegment[]): AnchorsResult {
    segments.forEach((segment) => {
      segment.definition.anchors.forEach((anchor) => {
        const worldX = segment.worldX + anchor.x;
        const worldY = anchor.y;
        if (anchor.kind === 'beacon') {
          const zone = this.scene.add.zone(worldX, worldY, 24, 24);
          zone.setDataEnabled();
          zone.setData('type', 'beacon');
          this.beaconZones.push(zone);
        } else {
          this.surfacePoints.push(new Phaser.Math.Vector2(worldX, worldY));
        }
      });
    });

    if (this.debug) {
      this.drawDebugAnchors();
    }

    return this.snapshotAnchors();
  }

  clear(): void {
    if (this.surfaceGraphics) {
      this.surfaceGraphics.destroy();
      this.surfaceGraphics = null;
    }

    this.surfacePoints.length = 0;
    this.beaconZones.forEach((zone) => zone.destroy());
    this.beaconZones.length = 0;
  }

  prune(leftBound: number): void {
    for (let i = this.surfacePoints.length - 1; i >= 0; i -= 1) {
      if (this.surfacePoints[i].x < leftBound - 128) {
        this.surfacePoints.splice(i, 1);
      }
    }

    for (let i = this.beaconZones.length - 1; i >= 0; i -= 1) {
      if (this.beaconZones[i].x < leftBound - 128) {
        this.beaconZones[i].destroy();
        this.beaconZones.splice(i, 1);
      }
    }

    if (this.debug) {
      this.drawDebugAnchors();
    }

    return this.snapshotAnchors();
  }

  private drawDebugAnchors(): void {
    if (!this.surfaceGraphics) {
      this.surfaceGraphics = this.scene.add.graphics().setDepth(200);
    }
    this.surfaceGraphics.clear();
    this.surfacePoints.forEach((point) => {
      this.surfaceGraphics?.fillStyle(0x3ef2ff, 0.6);
      this.surfaceGraphics?.fillCircle(point.x, point.y, 5);
    });
    this.beaconZones.forEach((beacon) => {
      this.surfaceGraphics?.lineStyle(2, 0xff86ff, 0.8);
      this.surfaceGraphics?.strokeCircle(beacon.x, beacon.y, 8);
    });
  }

  private snapshotAnchors(): AnchorsResult {
    return {
      surfacePoints: this.surfaces,
      beaconZones: [...this.beaconZones],
    };
  }
}
