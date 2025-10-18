import Phaser from 'phaser';
import {
  WEB_MIN_LENGTH,
  WEB_MAX_LENGTH,
  WEB_REEL_SPEED,
  WEB_PULL_STRENGTH,
  WEB_DAMPING,
  WEB_ACCELERATION_CAP,
  WEB_TENSION_BREAK_FORCE,
  WEB_TANGENTIAL_SPEED_LIMIT,
} from '../config/constants';

export interface WebConfig {
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
  solids: Phaser.Tilemaps.TilemapLayer | Phaser.Physics.Arcade.StaticGroup | Phaser.GameObjects.GameObject[];
}

export class Web {
  private readonly scene: Phaser.Scene;
  private readonly player: Phaser.Physics.Arcade.Sprite;
  private readonly ropeGraphics: Phaser.GameObjects.Graphics;
  private readonly guideGraphics: Phaser.GameObjects.Graphics;
  private readonly tetherLine: Phaser.Geom.Line = new Phaser.Geom.Line();

  private anchorPoint: Phaser.Math.Vector2 | null = null;
  private minLength = WEB_MIN_LENGTH;
  private maxLength = WEB_MAX_LENGTH;
  private currentLength = WEB_MAX_LENGTH * 0.75;
  private isAttached = false;
  private tension = 0;

  private reelInput = 0;
  private guideVisible = false;

  constructor(config: WebConfig) {
    const { scene, player } = config;
    this.scene = scene;
    this.player = player;

    this.ropeGraphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x4ee2ec } });
    this.guideGraphics = scene.add.graphics({ lineStyle: { width: 1, color: 0xffffff, alpha: 0.35 } });
    this.ropeGraphics.setDepth(5);
    this.guideGraphics.setDepth(4);

    scene.events.on(Phaser.Scenes.Events.UPDATE, this.handleUpdate, this);
  }

  destroy(): void {
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.handleUpdate, this);
    this.ropeGraphics.destroy();
    this.guideGraphics.destroy();
  }

  setReelInput(direction: number): void {
    this.reelInput = Phaser.Math.Clamp(direction, -1, 1);
  }

  showGuideLine(origin: Phaser.Math.Vector2, target: Phaser.Math.Vector2, color: number): void {
    this.guideVisible = true;
    this.guideGraphics.clear();
    this.guideGraphics.lineStyle(1, color, 0.5);
    this.guideGraphics.beginPath();
    this.guideGraphics.moveTo(origin.x, origin.y);
    this.guideGraphics.lineTo(target.x, target.y);
    this.guideGraphics.strokePath();
  }

  hideGuideLine(): void {
    this.guideVisible = false;
    this.guideGraphics.clear();
  }

  attachTo(point: Phaser.Math.Vector2): void {
    this.anchorPoint = point.clone();
    this.isAttached = true;
    this.currentLength = Phaser.Math.Clamp(
      Phaser.Math.Distance.Between(point.x, point.y, this.player.x, this.player.y),
      this.minLength,
      this.maxLength,
    );
  }

  detach(_reason: 'manual' | 'break'): void {
    if (!this.isAttached) return;
    this.isAttached = false;
    this.anchorPoint = null;
    this.ropeGraphics.clear();
    this.hideGuideLine();
  }

  get isTethered(): boolean {
    return this.isAttached && !!this.anchorPoint;
  }

  get tensionValue(): number {
    return this.tension;
  }

  get anchorPosition(): Phaser.Math.Vector2 | null {
    return this.anchorPoint ? this.anchorPoint.clone() : null;
  }

  private handleUpdate(_time: number, delta: number): void {
    if (!this.isAttached || !this.anchorPoint) {
      this.tension = 0;
      if (!this.guideVisible) {
        this.ropeGraphics.clear();
      }
      return;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y);
    const distance = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, this.anchorPoint.x, this.anchorPoint.y);
    const dt = Math.max(delta / 1000, 1 / 1200);

    if (this.reelInput !== 0) {
      this.currentLength = Phaser.Math.Clamp(
        this.currentLength + this.reelInput * WEB_REEL_SPEED * (delta / 1000),
        this.minLength,
        this.maxLength,
      );
    }

    if (distance > this.currentLength) {
      const dir = this.anchorPoint.clone().subtract(playerPos).normalize();
      const extension = distance - this.currentLength;
      const acceleration = Phaser.Math.Clamp(extension * WEB_PULL_STRENGTH, -WEB_ACCELERATION_CAP, WEB_ACCELERATION_CAP);
      const velocityDelta = dir.scale(acceleration * dt);
      body.velocity.add(velocityDelta);

      const dampingFactor = Phaser.Math.Clamp(1 - WEB_DAMPING * dt, 0.1, 1);
      body.velocity.scale(dampingFactor);

      this.tension = Math.abs(acceleration);
      const tangentialVelocity = this.calculateTangentialVelocity(body.velocity, dir);

      if (this.tension > WEB_TENSION_BREAK_FORCE || tangentialVelocity > WEB_TANGENTIAL_SPEED_LIMIT) {
        this.detach('break');
        return;
      }
    } else {
      this.tension = 0;
    }

    Phaser.Geom.Line.SetToAngle(
      this.tetherLine,
      playerPos.x,
      playerPos.y,
      Phaser.Math.Angle.Between(playerPos.x, playerPos.y, this.anchorPoint.x, this.anchorPoint.y),
      this.currentLength,
    );

    this.ropeGraphics.clear();
    this.ropeGraphics.lineStyle(2, 0x62ffe2, Phaser.Math.Clamp(this.tension / WEB_TENSION_BREAK_FORCE, 0.3, 0.95));
    this.ropeGraphics.beginPath();
    this.ropeGraphics.moveTo(playerPos.x, playerPos.y);
    this.ropeGraphics.lineTo(this.anchorPoint.x, this.anchorPoint.y);
    this.ropeGraphics.strokePath();
  }

  private calculateTangentialVelocity(velocity: Phaser.Math.Vector2, direction: Phaser.Math.Vector2): number {
    const tangent = new Phaser.Math.Vector2(-direction.y, direction.x);
    return Math.abs(tangent.dot(velocity));
  }

  setLengthBounds(min: number, max: number): void {
    this.minLength = Phaser.Math.Clamp(min, WEB_MIN_LENGTH * 0.5, WEB_MIN_LENGTH * 2);
    this.maxLength = Phaser.Math.Clamp(max, WEB_MAX_LENGTH, WEB_MAX_LENGTH * 1.8);
    this.currentLength = Phaser.Math.Clamp(this.currentLength, this.minLength, this.maxLength);
  }
}
