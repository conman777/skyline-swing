import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.createRunnerTexture();
  }

  create(): void {
    this.scene.start('GameScene');
  }

  private createRunnerTexture(): void {
    const key = 'runner';
    if (this.textures.exists(key)) return;

    const width = 32;
    const height = 48;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(0x22263c, 1);
    gfx.fillRoundedRect(0, 0, width, height, 6);
    gfx.lineStyle(2, 0x8ae0ff, 1);
    gfx.strokeRoundedRect(2, 2, width - 4, height - 4, 4);
    gfx.fillStyle(0xfff07a, 1);
    gfx.fillRect(10, 12, 12, 10);

    gfx.generateTexture(key, width, height);
    gfx.destroy();
  }
}
