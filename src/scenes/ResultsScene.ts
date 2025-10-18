import Phaser from 'phaser';

interface ResultsData {
  distance: number;
  duration: number;
  topSpeed: number;
  longestChain: number;
  closestNearMiss: number;
  score: number;
  nearMisses: number;
  beaconHits: number;
  multiplier: number;
  hazardsCleared: number;
  pickupsUsed: number;
  runSeed: string;
  reason: string;
}

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('ResultsScene');
  }

  create(data: ResultsData): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x0b0e1a, 0.85).setOrigin(0);

    this.add.text(width / 2, 80, 'Run Over', this.headerStyle()).setOrigin(0.5);

    const stats = [
      `Distance: ${data.distance.toFixed(1)} m`,
      `Duration: ${data.duration.toFixed(1)} s`,
      `Top Speed: ${data.topSpeed.toFixed(0)} px/s`,
      `Score: ${data.score.toFixed(0)} (×${data.multiplier.toFixed(2)})`,
      `Longest Swing Chain: ${data.longestChain}`,
      `Closest Near-Miss: ${data.closestNearMiss.toFixed(2)} m`,
      `Near-Misses Recorded: ${data.nearMisses}`,
      `Beacon Bonuses: ${data.beaconHits}`,
      `Hazards Cleared: ${data.hazardsCleared}`,
      `Pickups Used: ${data.pickupsUsed}`,
      `Reason: ${data.reason}`,
      `Seed: ${data.runSeed}`,
    ];

    stats.forEach((line, index) => {
      this.add
        .text(width / 2, 150 + index * 34, line, {
          fontFamily: 'PressStart2P, monospace',
          fontSize: '12px',
          color: '#f2f3ff',
          stroke: '#12131e',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
    });

    const actions = [
      { label: 'Play Again', handler: () => this.scene.start('GameScene') },
      { label: 'Main Menu', handler: () => this.scene.start('MainMenuScene') },
    ];

    actions.forEach((action, index) => {
      const button = this.add
        .text(width / 2 - 100 + index * 200, height - 120, action.label, this.buttonStyle())
        .setOrigin(0.5);
      button.setInteractive({ useHandCursor: true }).on('pointerup', action.handler);
    });

    const copySeed = this.add.text(width / 2, height - 60, 'Copy Seed', this.valueStyle()).setOrigin(0.5);
    copySeed.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      navigator.clipboard?.writeText(data.runSeed);
      copySeed.setText('Seed Copied!');
      this.time.delayedCall(1500, () => copySeed.setText('Copy Seed'));
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

  private valueStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'PressStart2P, monospace',
      fontSize: '12px',
      color: '#b9c1ff',
      stroke: '#12131e',
      strokeThickness: 3,
    };
  }
}
