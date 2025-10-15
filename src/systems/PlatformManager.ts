import Phaser from 'phaser';
import { PlatformDefinition } from './SegmentGenerator';

interface PlatformManagerConfig {
  scene: Phaser.Scene;
}

export class PlatformManager {
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.StaticGroup;
  private readonly rects: Phaser.GameObjects.Rectangle[] = [];

  constructor(config: PlatformManagerConfig) {
    this.scene = config.scene;
    this.group = this.scene.physics.add.staticGroup();
  }

  buildPlatforms(platforms: PlatformDefinition[], offsetX: number): void {
    platforms.forEach((platform) => {
      const x = offsetX + platform.x + platform.width / 2;
      const y = platform.y;
      const color = platform.type === 'crumble' ? 0xf9a66c : 0x526072;
      const rect = this.scene.add.rectangle(x, y, platform.width, platform.height, color, 1);
      rect.setOrigin(0.5, 1);
      this.group.add(rect);
      this.rects.push(rect);
    });
  }

  get collider(): Phaser.Physics.Arcade.StaticGroup {
    return this.group;
  }

  prune(leftBound: number): void {
    for (let i = this.rects.length - 1; i >= 0; i -= 1) {
      const rect = this.rects[i];
      if (rect.x + rect.width / 2 < leftBound - 128) {
        const body = rect.body as Phaser.Physics.Arcade.StaticBody;
        body.destroy();
        rect.destroy();
        this.rects.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.group.clear(true, true);
    this.rects.length = 0;
  }
}
