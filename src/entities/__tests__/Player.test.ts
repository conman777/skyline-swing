import { describe, expect, it, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import { Player } from '../Player';

function createMockScene() {
  const events = new Phaser.Events.EventEmitter();
  const cursors = { left: { isDown: false }, right: { isDown: false }, space: { isDown: false } } as any;
  const keyStub = { isDown: false } as any;

  const scene: any = {
    events,
    time: { now: 0, addEvent: vi.fn(), delayedCall: vi.fn() },
    physics: {
      add: {
        sprite: vi.fn(() => {
          const sprite: any = {
            setOrigin: vi.fn().mockReturnThis(),
            setDepth: vi.fn().mockReturnThis(),
            setSize: vi.fn().mockReturnThis(),
            setOffset: vi.fn().mockReturnThis(),
            setCollideWorldBounds: vi.fn().mockReturnThis(),
            setMaxVelocity: vi.fn().mockReturnThis(),
            setDragX: vi.fn().mockReturnThis(),
            setData: vi.fn(),
            setFlipX: vi.fn(),
            x: 0,
            y: 0,
          };
          sprite.scene = scene;
          sprite.body = {
            setGravityY: vi.fn(),
            setAccelerationX: vi.fn(),
            setVelocityX: vi.fn(),
            setVelocityY: vi.fn(),
            velocity: new Phaser.Math.Vector2(),
            blocked: { down: false },
          };
          return sprite;
        }),
      },
    },
    input: {
      keyboard: {
        createCursorKeys: vi.fn(() => cursors),
        addKey: vi.fn(() => keyStub),
      },
    },
  };

  return scene as Phaser.Scene;
}

describe('Player grounding logic', () => {
  let scene: Phaser.Scene;

  beforeEach(() => {
    scene = createMockScene();
  });

  it('records landing time only once per landing', () => {
    const player = new Player({ scene, x: 0, y: 0 });
    const internal = player as unknown as { lastGroundedAt: number; isGrounded: boolean };

    scene.time.now = 1200;
    player.markGrounded(true);
    expect(internal.isGrounded).toBe(true);
    expect(internal.lastGroundedAt).toBe(1200);

    scene.time.now = 1500;
    player.markGrounded(true);
    expect(internal.lastGroundedAt).toBe(1200);

    player.markGrounded(false);
    expect(internal.isGrounded).toBe(false);
  });

  it('restores extra jump when double jump enabled and grounded', () => {
    const player = new Player({ scene, x: 0, y: 0 });
    const internal = player as unknown as { extraJumpAllowed: boolean; extraJumpAvailable: boolean };

    player.enableDoubleJump(true);
    player.markGrounded(true);
    expect(internal.extraJumpAllowed).toBe(true);
    expect(internal.extraJumpAvailable).toBe(true);

    player.markGrounded(false);
    expect(internal.extraJumpAvailable).toBe(true);
  });
});
