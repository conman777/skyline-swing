import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { ControlsScene } from './scenes/ControlsScene';
import { GameScene } from './scenes/GameScene';
import { PauseOverlay } from './scenes/PauseOverlay';
import { ResultsScene } from './scenes/ResultsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1b1f3b',
  parent: 'game-root',
  pixelArt: true,
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    SettingsScene,
    ControlsScene,
    GameScene,
    PauseOverlay,
    ResultsScene,
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

window.addEventListener('load', () => {
  // eslint-disable-next-line no-new
  new Phaser.Game(config);
});
