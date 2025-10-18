import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Web } from '../entities/Web';
import { PlatformManager } from './PlatformManager';
import { HazardManager } from './HazardManager';
import { PickupManager } from './PickupManager';
import { Pickup } from '../entities/Pickup';

interface CollisionManagerConfig {
  scene: Phaser.Scene;
  player: Player;
  web: Web;
  platformManager: PlatformManager;
  hazardManager: HazardManager;
  pickupManager: PickupManager;
  onPlayerHitHazard: (hazardType: string) => void;
  onPickupCollected: (pickup: Pickup) => void;
}

export class CollisionManager {
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly web: Web;
  private readonly platformManager: PlatformManager;
  private readonly hazardManager: HazardManager;
  private readonly pickupManager: PickupManager;
  private readonly onPlayerHitHazard: (hazardType: string) => void;
  private readonly onPickupCollected: (pickup: Pickup) => void;

  private platformCollider?: Phaser.Physics.Arcade.Collider;
  private hazardOverlap?: Phaser.Physics.Arcade.Collider;
  private projectileOverlap?: Phaser.Physics.Arcade.Collider;
  private pickupOverlap?: Phaser.Physics.Arcade.Collider;

  constructor(config: CollisionManagerConfig) {
    this.scene = config.scene;
    this.player = config.player;
    this.web = config.web;
    this.platformManager = config.platformManager;
    this.hazardManager = config.hazardManager;
    this.pickupManager = config.pickupManager;
    this.onPlayerHitHazard = config.onPlayerHitHazard;
    this.onPickupCollected = config.onPickupCollected;

    this.registerColliders();
  }

  update(): void {
    this.checkWebAgainstHazards();
  }

  destroy(): void {
    this.platformCollider?.destroy();
    this.hazardOverlap?.destroy();
    this.projectileOverlap?.destroy();
    this.pickupOverlap?.destroy();
  }

  private registerColliders(): void {
    const playerBody = this.player.sprite;

    this.platformCollider = this.scene.physics.add.collider(
      playerBody,
      this.platformManager.collider,
      (_player, platform) => {
        if (platform) {
          this.platformManager.handlePlayerContact(platform);
        }
      },
      undefined,
      this,
    );

    this.hazardOverlap = this.scene.physics.add.overlap(
      playerBody,
      this.hazardManager.activeHazards,
      (_player, hazard) => this.handleHazardOverlap(hazard),
      undefined,
      this,
    );

    this.projectileOverlap = this.scene.physics.add.overlap(
      playerBody,
      this.hazardManager.projectiles,
      (_player, projectile) => this.handleHazardOverlap(projectile),
      undefined,
      this,
    );

    this.pickupOverlap = this.scene.physics.add.overlap(
      playerBody,
      this.pickupManager.collider,
      (_player, pickupSprite) => {
        const pickup = this.pickupManager.handleCollected(pickupSprite);
        if (pickup) {
          this.onPickupCollected(pickup);
        }
      },
      undefined,
      this,
    );
  }

  private handleHazardOverlap(hazardObject: Phaser.GameObjects.GameObject): void {
    const hazardType = (hazardObject.getData?.('hazard') as string) ?? 'hazard';
    const activeState = hazardObject.getData?.('active');
    if (typeof activeState === 'boolean' && !activeState) {
      return;
    }
    if (hazardType === 'wind') {
      const body = this.player.body;
      const strength = Number(hazardObject.getData?.('strength')) || Number((hazardObject.getData?.('data') as any)?.strength) || 0.4;
      const direction = ((hazardObject.getData?.('direction') as string) || 'up').toLowerCase();
      const velocity = strength * 200;
      switch (direction) {
        case 'left':
          body.setVelocityX(Math.min(body.velocity.x, -velocity));
          break;
        case 'right':
          body.setVelocityX(Math.max(body.velocity.x, velocity));
          break;
        case 'down':
          body.setVelocityY(Math.max(body.velocity.y, velocity));
          break;
        default:
          body.setVelocityY(Math.min(body.velocity.y, -velocity));
          break;
      }
      return;
    }

    this.onPlayerHitHazard(hazardType);
  }

  private checkWebAgainstHazards(): void {
    if (!this.web.isTethered || !this.web.anchorPosition) return;

    const playerPos = new Phaser.Math.Vector2(this.player.sprite.x, this.player.sprite.y);
    const anchor = this.web.anchorPosition;
    const tether = new Phaser.Geom.Line(playerPos.x, playerPos.y, anchor.x, anchor.y);
    const bodies = this.hazardManager.getHazardBodies();

    for (const body of bodies) {
      const bounds = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);
      const hazardObject = body.gameObject as Phaser.GameObjects.GameObject;
      const isActive = hazardObject?.getData?.('active');
      if (typeof isActive === 'boolean' && !isActive) {
        continue;
      }
      if (Phaser.Geom.Intersects.LineToRectangle(tether, bounds)) {
        this.web.detach('break');
        break;
      }
    }
  }
}
