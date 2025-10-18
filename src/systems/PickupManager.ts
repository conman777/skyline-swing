import Phaser from 'phaser';
import { Pickup } from '../entities/Pickup';
import { PickupDefinition } from './SegmentGenerator';

interface PickupManagerConfig {
  scene: Phaser.Scene;
}

interface PickupInstance {
  pickup: Pickup;
}

export class PickupManager {
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.Group;
  private readonly pickups: PickupInstance[] = [];

  constructor(config: PickupManagerConfig) {
    this.scene = config.scene;
    this.group = this.scene.physics.add.group({ allowGravity: false, immovable: true });
  }

  get collider(): Phaser.Physics.Arcade.Group {
    return this.group;
  }

  spawnPickups(definitions: PickupDefinition[] | undefined, offsetX: number): void {
    if (!definitions) return;

    definitions.forEach((definition) => {
      const pickup = new Pickup({
        scene: this.scene,
        x: offsetX + definition.x,
        y: definition.y,
        type: definition.type,
      });
      this.group.add(pickup.sprite);
      this.pickups.push({ pickup });
    });
  }

  handleCollected(sprite: Phaser.GameObjects.GameObject): Pickup | null {
    const index = this.pickups.findIndex((instance) => instance.pickup.sprite === sprite);
    if (index === -1) {
      return null;
    }
    const [instance] = this.pickups.splice(index, 1);
    this.group.remove(instance.pickup.sprite, true, true);
    instance.pickup.destroy();
    return instance.pickup;
  }

  prune(leftBound: number): void {
    for (let i = this.pickups.length - 1; i >= 0; i -= 1) {
      const instance = this.pickups[i];
      const sprite = instance.pickup.sprite;
      if (sprite.x < leftBound - 128) {
        sprite.destroy();
        this.pickups.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.pickups.forEach((instance) => instance.pickup.destroy());
    this.pickups.length = 0;
    this.group.clear(true, true);
  }
}
