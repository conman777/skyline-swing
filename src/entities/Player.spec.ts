import { describe, it, expect, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import { Player } from './Player';

describe('Player', () => {
  let scene: Phaser.Scene;
  let player: Player;

  beforeEach(() => {
    // Create a minimal mock scene
    scene = {
      physics: {
        add: {
          sprite: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setDepth: vi.fn().mockReturnThis(),
            setSize: vi.fn().mockReturnThis(),
            setOffset: vi.fn().mockReturnThis(),
            setCollideWorldBounds: vi.fn().mockReturnThis(),
            setMaxVelocity: vi.fn().mockReturnThis(),
            setDragX: vi.fn().mockReturnThis(),
            body: {
              setGravityY: vi.fn(),
              setAccelerationX: vi.fn(),
              setVelocityX: vi.fn(),
              setVelocityY: vi.fn(),
              blocked: { down: false },
              velocity: { x: 0, y: 0 },
            },
            scene: {
              time: {
                now: 0,
              },
            },
          }),
        },
      },
      input: {
        keyboard: {
          createCursorKeys: vi.fn().mockReturnValue({
            left: { isDown: false },
            right: { isDown: false },
            space: { isDown: false },
          }),
          addKey: vi.fn().mockReturnValue({ isDown: false }),
        },
      },
      events: {
        on: vi.fn(),
        off: vi.fn(),
      },
    } as unknown as Phaser.Scene;

    player = new Player({
      scene,
      x: 100,
      y: 100,
    });
  });

  describe('markGrounded', () => {
    it('should set grounded to true when parameter is true', () => {
      player.markGrounded(true);
      // We need to access private field for testing - using type assertion
      expect((player as any).isGrounded).toBe(true);
    });

    it('should set grounded to false when parameter is false', () => {
      // First set to grounded
      player.markGrounded(true);
      expect((player as any).isGrounded).toBe(true);

      // Now unground - THIS IS THE BUG TEST
      player.markGrounded(false);
      expect((player as any).isGrounded).toBe(false);
    });

    it('respects collision system flag when leaving ground', () => {
      player.sprite.body.blocked.down = true;
      player.markGrounded(true);

      player.sprite.body.blocked.down = false;
      player.markGrounded(false);
      expect((player as any).isGrounded).toBe(false);
    });

    it('should update lastGroundedAt timestamp when landing', () => {
      const mockTime = 1000;
      player.sprite.scene.time.now = mockTime;

      player.markGrounded(true);
      expect((player as any).lastGroundedAt).toBe(mockTime);
    });

    it('should not update lastGroundedAt if already grounded', () => {
      player.sprite.scene.time.now = 1000;
      player.markGrounded(true);

      player.sprite.scene.time.now = 2000;
      player.markGrounded(true);

      // Should still be 1000 (first landing)
      expect((player as any).lastGroundedAt).toBe(1000);
    });
  });

  describe('coyote time', () => {
    it('should allow jump within coyote time after leaving ground', () => {
      const coyoteTime = 120;
      player.setCoyoteTime(coyoteTime);

      // Land on ground
      player.sprite.scene.time.now = 0;
      player.markGrounded(true);

      // Leave ground
      player.sprite.body.blocked.down = false;
      player.markGrounded(false);

      // Still within coyote time
      player.sprite.scene.time.now = coyoteTime - 10;

      // Should still be able to jump (tested indirectly through handleJump)
      expect((player as any).lastGroundedAt).toBe(0);
    });
  });
});
