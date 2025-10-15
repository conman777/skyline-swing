import Phaser from 'phaser';

export class ControlsScene extends Phaser.Scene {
  constructor() {
    super('ControlsScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.text(width / 2, 60, 'Controls', this.headerStyle()).setOrigin(0.5);

    const controls = [
      { action: 'Move Left', keys: 'A / ←' },
      { action: 'Move Right', keys: 'D / →' },
      { action: 'Jump', keys: 'Space' },
      { action: 'Shoot Web', keys: 'Mouse Left' },
      { action: 'Reel In', keys: 'Q / Mouse Wheel Up' },
      { action: 'Reel Out', keys: 'E / Mouse Wheel Down' },
      { action: 'Cancel Web', keys: 'S' },
      { action: 'Pause', keys: 'Esc / P' },
    ];

    controls.forEach((entry, index) => {
      this.add
        .text(width / 2, 140 + index * 40, `${entry.action}: ${entry.keys}`, {
          fontFamily: 'PressStart2P, monospace',
          fontSize: '14px',
          color: '#f2f3ff',
          stroke: '#12131e',
          strokeThickness: 3,
        })
        .setOrigin(0.5, 0.5);
    });

    const back = this.add.text(width / 2, height - 80, 'Back', this.buttonStyle()).setOrigin(0.5);
    back.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      this.scene.start('MainMenuScene');
    });
  }

  private headerStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'PressStart2P, monospace',
      fontSize: '28px',
      color: '#f8f9ff',
      stroke: '#12131e',
      strokeThickness: 6,
    };
  }

  private buttonStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'PressStart2P, monospace',
      fontSize: '16px',
      color: '#f8f9ff',
      stroke: '#12131e',
      strokeThickness: 4,
    };
  }
}
