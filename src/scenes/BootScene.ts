import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.createCursorTexture('cursor-idle', 0xa0a6b7);
    this.createCursorTexture('cursor-surface', 0x70f3ff);
    this.createCursorTexture('cursor-beacon', 0xff86ff);
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }

  private createCursorTexture(key: string, color: number): void {
    if (this.textures.exists(key)) return;

    const size = 16;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, size, size);
    gfx.lineStyle(2, 0xffffff, 0.9);
    gfx.strokeRect(0, 0, size, size);

    gfx.generateTexture(key, size, size);
    gfx.destroy();
  }
}
