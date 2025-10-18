import Phaser from 'phaser';
import { PICKUP_DURATION_MS } from '../config/constants';
import { PickupType } from '../systems/SegmentGenerator';

const PICKUP_COLORS: Record<PickupType, number> = {
  longerWeb: 0x38bdf8,
  slowMo: 0xf97316,
  doubleJump: 0x22c55e,
  anchorMagnet: 0xfacc15,
};

export interface PickupConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  type: PickupType;
}

export class Pickup {
  public readonly sprite: Phaser.GameObjects.Rectangle;
  public readonly type: PickupType;
  public readonly colour: number;

  constructor(config: PickupConfig) {
    const { scene, x, y, type } = config;
    this.type = type;
    this.colour = PICKUP_COLORS[type];
    this.sprite = scene.add.rectangle(x, y, 26, 26, this.colour, 0.85);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setStrokeStyle(2, 0xffffff, 0.8);
    this.sprite.setData('pickup', type);
    scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  destroy(): void {
    this.sprite.destroy();
  }

  get durationMs(): number {
    return PICKUP_DURATION_MS[this.type];
  }
}
