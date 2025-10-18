import Phaser from 'phaser';
import { PlatformDefinition } from './SegmentGenerator';

interface PlatformManagerConfig {
  scene: Phaser.Scene;
}

interface PlatformInstance {
  rect: Phaser.GameObjects.Rectangle;
  definition: PlatformDefinition;
  crumbleTimer?: Phaser.Time.TimerEvent;
  isCrumbled: boolean;
}

export class PlatformManager {
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.StaticGroup;
  private readonly platforms: PlatformInstance[] = [];

  constructor(config: PlatformManagerConfig) {
    this.scene = config.scene;
    this.group = this.scene.physics.add.staticGroup();
  }

  buildPlatforms(platforms: PlatformDefinition[], offsetX: number): void {
    platforms.forEach((platform) => {
      const x = offsetX + platform.x + platform.width / 2;
      const y = platform.y;
      const isCrumble = platform.type === 'crumble';
      const color = isCrumble ? 0xf9a66c : 0x526072;
      const rect = this.scene.add.rectangle(x, y, platform.width, platform.height, color, 1);
      rect.setOrigin(0.5, 1);
      rect.setData('platformType', platform.type ?? 'ground');
      this.group.add(rect);
      this.platforms.push({ rect, definition: platform, isCrumbled: false });
    });
  }

  get collider(): Phaser.Physics.Arcade.StaticGroup {
    return this.group;
  }

  prune(leftBound: number): void {
    for (let i = this.platforms.length - 1; i >= 0; i -= 1) {
      const { rect } = this.platforms[i];
      if (rect.x + rect.width / 2 < leftBound - 128) {
        const body = rect.body as Phaser.Physics.Arcade.StaticBody;
        body.destroy();
        rect.destroy();
        this.platforms.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.platforms.forEach((instance) => {
      instance.crumbleTimer?.remove(false);
      instance.rect.destroy();
    });
    this.group.clear(true, true);
    this.platforms.length = 0;
  }

  handlePlayerContact(rect: Phaser.GameObjects.GameObject): void {
    const instance = this.platforms.find((platform) => platform.rect === rect);
    if (!instance || instance.isCrumbled) return;

    if (instance.definition.type === 'crumble' && !instance.crumbleTimer) {
      instance.crumbleTimer = this.scene.time.delayedCall(800, () => {
        const body = instance.rect.body as Phaser.Physics.Arcade.StaticBody;
        body.destroy();
        this.group.remove(instance.rect, true, true);
        instance.isCrumbled = true;
      });
    }
  }

  getBoundingBoxes(): Phaser.Geom.Rectangle[] {
    return this.platforms
      .filter((platform) => !platform.isCrumbled)
      .map((platform) => new Phaser.Geom.Rectangle(
        platform.rect.getTopLeft().x,
        platform.rect.getTopLeft().y,
        platform.definition.width,
        platform.definition.height,
      ));
  }
}
