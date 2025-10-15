import Phaser from 'phaser';
import { AIM_ASSIST_BEACON_BONUS } from '../config/constants';

export interface AnchorCandidate {
  point: Phaser.Math.Vector2;
  type: 'surface' | 'beacon';
  score: number;
}

export interface AnchorScannerConfig {
  scene: Phaser.Scene;
  surfaceAnchors?: Phaser.Math.Vector2[];
  beaconZones?: Phaser.GameObjects.Zone[];
}

export class AnchorScanner {
  private readonly scene: Phaser.Scene;
  private surfaceAnchors: Phaser.Math.Vector2[];
  private beaconZones: Phaser.GameObjects.Zone[];

  constructor(config: AnchorScannerConfig) {
    this.scene = config.scene;
    this.surfaceAnchors = config.surfaceAnchors ?? [];
    this.beaconZones = config.beaconZones ?? [];
  }

  updateSurfaceAnchors(points: Phaser.Math.Vector2[]): void {
    this.surfaceAnchors = points;
  }

  updateBeaconZones(zones: Phaser.GameObjects.Zone[]): void {
    this.beaconZones = zones;
  }

  getSurfaceAnchors(): Phaser.Math.Vector2[] {
    return this.surfaceAnchors.map((anchor) => anchor.clone());
  }

  getBeaconZones(): Phaser.GameObjects.Zone[] {
    return this.beaconZones;
  }

  findBestAnchor(origin: Phaser.Math.Vector2, aimDirection: Phaser.Math.Vector2, coneDegrees: number): AnchorCandidate | null {
    const candidates: AnchorCandidate[] = [];
    const halfCone = coneDegrees * 0.5;
    const aimAngle = Phaser.Math.RadToDeg(aimDirection.angle());

    for (const point of this.surfaceAnchors) {
      const angleDiff = Phaser.Math.Angle.ShortestBetween(aimAngle, Phaser.Math.RadToDeg(point.clone().subtract(origin).angle()));
      if (Math.abs(angleDiff) <= halfCone) {
        candidates.push({
          point: point.clone(),
          type: 'surface',
          score: halfCone - Math.abs(angleDiff),
        });
      }
    }

    for (const beacon of this.beaconZones) {
      const beaconPoint = new Phaser.Math.Vector2(beacon.x, beacon.y);
      const angleDiff = Phaser.Math.Angle.ShortestBetween(aimAngle, Phaser.Math.RadToDeg(beaconPoint.clone().subtract(origin).angle()));
      if (Math.abs(angleDiff) <= halfCone) {
        candidates.push({
          point: beaconPoint,
          type: 'beacon',
          score: halfCone - Math.abs(angleDiff) + AIM_ASSIST_BEACON_BONUS,
        });
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }

  static getConeDegrees(baseDegrees: number, bonus: number, aimingAtBeacon: boolean): number {
    return aimingAtBeacon ? baseDegrees + bonus : baseDegrees;
  }
}
