import Phaser from 'phaser';

export class PauseOverlay extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseOverlay', active: false });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x0b0e1a, 0.65).setOrigin(0);
    this.add.text(width / 2, height * 0.3, 'Paused', this.headerStyle()).setOrigin(0.5);

    const options = [
      { label: 'Resume', action: () => this.handleResume() },
      { label: 'Settings', action: () => this.scene.launch('SettingsScene') },
      { label: 'Restart Run', action: () => this.scene.get('GameScene').scene.restart() },
      { label: 'Main Menu', action: () => this.scene.start('MainMenuScene') },
    ];

    options.forEach((option, index) => {
      const button = this.add.text(width / 2, height * 0.45 + index * 60, option.label, this.buttonStyle()).setOrigin(0.5);
      button.setInteractive({ useHandCursor: true }).on('pointerup', option.action);
      button.on('pointerover', () => button.setColor('#ffffff'));
      button.on('pointerout', () => button.setColor('#f8f9ff'));
    });
  }

  private handleResume(): void {
    this.scene.stop();
    this.scene.resume('GameScene');
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
      fontSize: '18px',
      color: '#f8f9ff',
      stroke: '#12131e',
      strokeThickness: 4,
    };
  }
}
