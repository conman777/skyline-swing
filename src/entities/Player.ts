import Phaser from 'phaser';
import {
  PLAYER_AIR_CONTROL,
  PLAYER_COYOTE_TIME,
  PLAYER_JUMP_BUFFER,
  PLAYER_JUMP_VELOCITY,
  PLAYER_RUN_SPEED,
} from '../config/constants';

export interface PlayerConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  coyoteTimeMs?: number;
  jumpBufferMs?: number;
}

export class Player {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keyA: Phaser.Input.Keyboard.Key;
  private readonly keyD: Phaser.Input.Keyboard.Key;
  private readonly keyS: Phaser.Input.Keyboard.Key;

  private jumpKey: Phaser.Input.Keyboard.Key;

  private isGrounded = false;
  private lastGroundedAt = 0;
  private lastJumpPressedAt = 0;
  private airControlModifier = 1;
  private coyoteTimeMs: number;
  private jumpBufferMs: number;

  constructor(config: PlayerConfig) {
    const { scene, x, y } = config;

    this.coyoteTimeMs = config.coyoteTimeMs ?? PLAYER_COYOTE_TIME;
    this.jumpBufferMs = config.jumpBufferMs ?? PLAYER_JUMP_BUFFER;

    this.sprite = scene.physics.add.sprite(x, y, 'runner');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(10);
    this.sprite.setSize(18, 44).setOffset(7, 4);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setMaxVelocity(PLAYER_RUN_SPEED * 1.6, 1400);
    this.sprite.setDragX(1200);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.jumpKey = this.cursors.space!
      || scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    scene.events.on(Phaser.Scenes.Events.UPDATE, this.handleUpdate, this);
  }

  get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  destroy(): void {
    this.sprite.scene.events.off(Phaser.Scenes.Events.UPDATE, this.handleUpdate, this);
    this.sprite.destroy();
  }

  setGravity(y: number): void {
    this.sprite.body.setGravityY(y);
  }

  setAirControlModifier(multiplier: number): void {
    this.airControlModifier = Phaser.Math.Clamp(multiplier, 0, 1);
  }

  setCoyoteTime(ms: number): void {
    this.coyoteTimeMs = Phaser.Math.Clamp(ms, 0, 400);
  }

  setJumpBuffer(ms: number): void {
    this.jumpBufferMs = Phaser.Math.Clamp(ms, 0, 400);
  }

  markGrounded(isGrounded: boolean): void {
    if (isGrounded) {
      // Landing: record timestamp for coyote time
      if (!this.isGrounded) {
        this.lastGroundedAt = this.sprite.scene.time.now;
      }
      this.isGrounded = true;
    } else {
      // Leaving ground: always respect the parameter
      // The collision system is the source of truth
      this.isGrounded = false;
    }
  }

  pressedCancel(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keyS);
  }

  applyAssistSettings(settings: { coyoteTimeMs: number; jumpBufferMs: number }): void {
    this.setCoyoteTime(settings.coyoteTimeMs);
    this.setJumpBuffer(settings.jumpBufferMs);
  }

  toggleAirControl(isTethered: boolean): void {
    this.setAirControlModifier(isTethered ? 0.3 : 1);
  }

  private handleUpdate(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    this.markGrounded(body.blocked.down);
    this.handleMovement(body);
    this.handleJump(body);
  }

  private handleMovement(body: Phaser.Physics.Arcade.Body): void {
    const left = this.cursors.left?.isDown || this.keyA.isDown;
    const right = this.cursors.right?.isDown || this.keyD.isDown;

    if (left && !right) {
      body.setAccelerationX(this.getAcceleration(-1));
      this.sprite.setFlipX(true);
    } else if (right && !left) {
      body.setAccelerationX(this.getAcceleration(1));
      this.sprite.setFlipX(false);
    } else {
      body.setAccelerationX(0);
      if (this.isGrounded) {
        body.setVelocityX(body.velocity.x * 0.82);
      }
    }
  }

  private handleJump(body: Phaser.Physics.Arcade.Body): void {
    const now = this.sprite.scene.time.now;
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
      this.lastJumpPressedAt = now;
    }

    const canJump =
      (this.isGrounded || now - this.lastGroundedAt <= this.coyoteTimeMs) &&
      now - this.lastJumpPressedAt <= this.jumpBufferMs;

    if (canJump) {
      body.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.isGrounded = false;
      this.lastJumpPressedAt = 0;
      this.lastGroundedAt = 0;
    }
  }

  private getAcceleration(direction: number): number {
    const multiplier = this.isGrounded ? 1 : PLAYER_AIR_CONTROL * this.airControlModifier;
    return direction * PLAYER_RUN_SPEED * 8 * multiplier;
  }
}
