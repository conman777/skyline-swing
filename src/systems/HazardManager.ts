import Phaser from 'phaser';
import { HazardDefinition } from './SegmentGenerator';

interface HazardManagerConfig {
  scene: Phaser.Scene;
}

export class HazardManager {
  private readonly scene: Phaser.Scene;
  private readonly hazards: Phaser.GameObjects.GameObject[] = [];

  constructor(config: HazardManagerConfig) {
    this.scene = config.scene;
  }

  spawnHazards(hazards: HazardDefinition[], offsetX: number): void {
    hazards.forEach((hazard) => {
      switch (hazard.type) {
        case 'spikes':
          this.createSpikes(hazard, offsetX);
          break;
        case 'wind':
          this.createWind(hazard, offsetX);
          break;
        default:
          this.createDebugHazard(hazard, offsetX);
      }
    });
  }

  prune(leftBound: number): void {
    for (let i = this.hazards.length - 1; i >= 0; i -= 1) {
      const obj = this.hazards[i] as Phaser.GameObjects.Rectangle;
      if (obj.x + obj.width / 2 < leftBound - 128) {
        obj.destroy();
        this.hazards.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.hazards.forEach((obj) => obj.destroy());
    this.hazards.length = 0;
  }

  private createSpikes(def: HazardDefinition, offsetX: number): void {
    const width = def.width ?? 64;
    const height = def.height ?? 24;
    const rect = this.scene.add.rectangle(offsetX + def.x + width / 2, def.y, width, height, 0xff5c5c, 1);
    rect.setOrigin(0.5, 1);
    this.scene.physics.add.existing(rect, true);
    rect.setData('hazard', 'spikes');
    this.hazards.push(rect);
  }

  private createWind(def: HazardDefinition, offsetX: number): void {
    const width = def.width ?? 120;
    const height = def.height ?? 180;
    const rect = this.scene.add.rectangle(offsetX + def.x + width / 2, def.y, width, height, 0x5cc8ff, 0.25);
    rect.setOrigin(0.5, 1);
    this.scene.physics.add.existing(rect, false);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setVelocity(0, -80);
    this.hazards.push(rect);
  }

  private createDebugHazard(def: HazardDefinition, offsetX: number): void {
    const width = def.width ?? 80;
    const height = def.height ?? 40;
    const rect = this.scene.add.rectangle(offsetX + def.x + width / 2, def.y, width, height, 0xffa64c, 0.5);
    rect.setOrigin(0.5, 1);
    this.hazards.push(rect);
  }
}
