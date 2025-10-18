import Phaser from 'phaser';

interface HUDOverlayConfig {
  scene: Phaser.Scene;
}

export class HUDOverlay {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;

  private readonly distanceText: Phaser.GameObjects.Text;
  private readonly multiplierText: Phaser.GameObjects.Text;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly speedText: Phaser.GameObjects.Text;
  private readonly speedBar: Phaser.GameObjects.Rectangle;
  private readonly pauseButton: Phaser.GameObjects.Text;
  private readonly seedLabel: Phaser.GameObjects.Text;
  private readonly pickupText: Phaser.GameObjects.Text;
  private readonly pickupBar: Phaser.GameObjects.Rectangle;
  private readonly hazardToast: Phaser.GameObjects.Text;

  constructor(config: HUDOverlayConfig) {
    this.scene = config.scene;
    this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    this.distanceText = this.createLabel(24, 24, 'Distance: 0 m');
    this.multiplierText = this.createLabel(24, 56, 'Multiplier: ×1.00');
    this.scoreText = this.createLabel(24, 88, 'Score: 0');

    this.seedLabel = this.createLabel(this.scene.scale.width - 24, 24, 'Seed: ------');
    this.seedLabel.setOrigin(1, 0);

    this.pauseButton = this.createButton(this.scene.scale.width - 24, 56, 'Pause');
    this.pauseButton.setOrigin(1, 0);
    this.pauseButton.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      this.scene.scene.launch('PauseOverlay');
      this.scene.scene.pause();
    });

    this.speedText = this.createLabel(this.scene.scale.width - 24, this.scene.scale.height - 64, 'Speed: 0');
    this.speedText.setOrigin(1, 0);
    this.speedBar = this.scene.add.rectangle(
      this.scene.scale.width - 24,
      this.scene.scale.height - 32,
      160,
      12,
      0x68e0ff,
      0.8,
    );
    this.speedBar.setOrigin(1, 0.5).setScrollFactor(0).setDepth(100);

    this.pickupText = this.createLabel(24, this.scene.scale.height - 84, 'Pickup: None');
    this.pickupBar = this.scene.add.rectangle(24, this.scene.scale.height - 52, 160, 12, 0xfff278, 0.9);
    this.pickupBar.setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.pickupBar.scaleX = 0;

    this.hazardToast = this.scene.add
      .text(this.scene.scale.width / 2, 24, '', {
        fontFamily: 'PressStart2P, monospace',
        fontSize: '14px',
        color: '#ffcd6b',
        stroke: '#12131e',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.container.add([
      this.distanceText,
      this.multiplierText,
      this.scoreText,
      this.seedLabel,
      this.pauseButton,
      this.speedText,
      this.pickupText,
    ]);
  }

  setDistance(distance: number): void {
    this.distanceText.setText(`Distance: ${distance.toFixed(1)} m`);
  }

  setMultiplier(multiplier: number): void {
    this.multiplierText.setText(`Multiplier: ×${multiplier.toFixed(2)}`);
  }

  setScore(score: number): void {
    this.scoreText.setText(`Score: ${score.toFixed(0)}`);
  }

  setSpeed(speed: number, ratio: number): void {
    this.speedText.setText(`Speed: ${speed.toFixed(0)}`);
    this.speedBar.scaleX = Phaser.Math.Clamp(ratio, 0, 1);
  }

  setSeed(seed: string): void {
    this.seedLabel.setText(`Seed: ${seed}`);
  }

  setPickup(name: string, colour = 0xfff278): void {
    this.pickupText.setText(`Pickup: ${name}`);
    this.pickupBar.setFillStyle(colour, 0.9);
  }

  setPickupProgress(value: number): void {
    this.pickupBar.scaleX = Phaser.Math.Clamp(value, 0, 1);
  }

  showHazardToast(message: string): void {
    this.hazardToast.setText(message);
    this.hazardToast.setAlpha(1);
    this.scene.tweens.killTweensOf(this.hazardToast);
    this.scene.tweens.add({
      targets: this.hazardToast,
      alpha: 0,
      duration: 1800,
      delay: 1400,
      ease: 'Quad.easeOut',
    });
  }

  private createLabel(x: number, y: number, text: string): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, text, {
        fontFamily: 'PressStart2P, monospace',
        fontSize: '12px',
        color: '#f8f9ff',
        stroke: '#12131e',
        strokeThickness: 4,
      })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100);
  }

  private createButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
    const button = this.scene.add
      .text(x, y, label, {
        fontFamily: 'PressStart2P, monospace',
        fontSize: '12px',
        color: '#f8f9ff',
        stroke: '#12131e',
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);
    button.on('pointerover', () => button.setColor('#ffe8a9'));
    button.on('pointerout', () => button.setColor('#f8f9ff'));
    return button;
  }
}
