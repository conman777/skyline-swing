import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private cityParallax!: Phaser.GameObjects.TileSprite;

  constructor() {
    super('MainMenuScene');
  }

  preload(): void {
    this.createParallaxTexture();
  }

  create(): void {
    const { width, height } = this.scale;

    this.cityParallax = this.add
      .tileSprite(0, height, width * 2, height, 'skyline-parallax')
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setAlpha(0.7);

    this.add
      .text(width / 2, height * 0.25, 'Skyline Swing', {
        fontFamily: 'PressStart2P, monospace',
        fontSize: '32px',
        color: '#f8f9ff',
        stroke: '#12131e',
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0.5);

    const buttons = [
      { label: 'Play', scene: 'GameScene' },
      { label: 'Settings', scene: 'SettingsScene' },
      { label: 'Controls', scene: 'ControlsScene' },
    ];

    buttons.forEach((btn, index) => {
      const button = this.add
        .text(width / 2, height * 0.45 + index * 60, btn.label, {
          fontFamily: 'PressStart2P, monospace',
          fontSize: '18px',
          color: '#b9c1ff',
          stroke: '#12131e',
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true });

      button.on('pointerover', () => button.setColor('#ffffff'));
      button.on('pointerout', () => button.setColor('#b9c1ff'));
      button.on('pointerup', () => {
        this.cameras.main.fadeOut(200, 0, 0, 0, (_camera, progress) => {
          if (progress === 1) {
            this.scene.start(btn.scene);
          }
        });
      });

      if (btn.scene === 'SettingsScene') {
        this.add
          .text(width / 2, height * 0.45 + index * 60 + 26, 'Audio · Controls · Accessibility', {
            fontFamily: 'PressStart2P, monospace',
            fontSize: '10px',
            color: '#6b73a6',
          })
          .setOrigin(0.5, 0);
      }

      if (btn.scene === 'ControlsScene') {
        this.add
          .text(width / 2, height * 0.45 + index * 60 + 26, 'Keys, mouse, web tips', {
            fontFamily: 'PressStart2P, monospace',
            fontSize: '10px',
            color: '#6b73a6',
          })
          .setOrigin(0.5, 0);
      }
    });

    this.add
      .text(width - 24, height - 24, 'Version 0.1.0', {
        fontFamily: 'PressStart2P, monospace',
        fontSize: '10px',
        color: '#6b73a6',
      })
      .setOrigin(1, 1);
  }

  update(_time: number, delta: number): void {
    if (this.cityParallax) {
      this.cityParallax.tilePositionX += delta * 0.012;
    }
  }

  private createParallaxTexture(): void {
    if (this.textures.exists('skyline-parallax')) return;

    const width = 512;
    const height = 256;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });

    gfx.fillStyle(0x101423, 1);
    gfx.fillRect(0, 0, width, height);

    for (let i = 0; i < 40; i += 1) {
      const buildingWidth = Phaser.Math.Between(30, 80);
      const buildingHeight = Phaser.Math.Between(60, 180);
      const x = Phaser.Math.Between(0, width - buildingWidth);
      const y = height - buildingHeight;
      gfx.fillStyle(0x1e2138, 1);
      gfx.fillRect(x, y, buildingWidth, buildingHeight);
      gfx.lineStyle(2, 0x272a45, 1);
      gfx.strokeRect(x, y, buildingWidth, buildingHeight);
    }

    gfx.generateTexture('skyline-parallax', width, height);
    gfx.destroy();
  }
}
