import Phaser from 'phaser';
import { SettingsStore } from '../systems/SettingsStore';

export class SettingsScene extends Phaser.Scene {
  private settings!: SettingsStore;

  constructor() {
    super('SettingsScene');
  }

  create(): void {
    this.settings = new SettingsStore();

    const { width, height } = this.scale;
    this.add.text(width / 2, 60, 'Settings', this.headerStyle()).setOrigin(0.5);

    this.buildAudioSection(width * 0.25, 140);
    this.buildControlsSection(width * 0.5, 140);
    this.buildAccessibilitySection(width * 0.75, 140);

    const back = this.add.text(width / 2, height - 80, 'Back', this.buttonStyle()).setOrigin(0.5);
    back.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      this.scene.start('MainMenuScene');
    });
  }

  private buildAudioSection(x: number, y: number): void {
    this.add.text(x, y, 'Audio', this.sectionStyle()).setOrigin(0.5, 0);
    this.createSlider(x, y + 40, 'Master', this.settings.value.audio.master, (v) => this.updateAudio('master', v));
    this.createSlider(x, y + 100, 'Music', this.settings.value.audio.music, (v) => this.updateAudio('music', v));
    this.createSlider(x, y + 160, 'SFX', this.settings.value.audio.sfx, (v) => this.updateAudio('sfx', v));
  }

  private buildControlsSection(x: number, y: number): void {
    this.add.text(x, y, 'Controls', this.sectionStyle()).setOrigin(0.5, 0);

    const bindings = this.settings.value.controls.slice(0, 4);
    bindings.forEach((binding, index) => {
      const label = this.add.text(x - 80, y + 50 + index * 40, binding.action, this.labelStyle()).setOrigin(1, 0.5);
      const value = this.add.text(x + 80, y + 50 + index * 40, binding.primaryKey, this.valueStyle()).setOrigin(0, 0.5);
      value.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        label.setText(`${binding.action} (press key)`);
        const listener = (event: KeyboardEvent) => {
          value.setText(event.key.toUpperCase());
          label.setText(binding.action);
          this.game.events.off('keydown', listener as never);
        };
        this.game.events.once('keydown', listener as never);
      });
    });
  }

  private buildAccessibilitySection(x: number, y: number): void {
    this.add.text(x, y, 'Accessibility', this.sectionStyle()).setOrigin(0.5, 0);

    const toggle = this.createToggle(x, y + 50, 'Aim Assist', this.settings.value.assists.aimAssistConeDegrees > 0, (v) => {
      this.settings.update({
        assists: {
          ...this.settings.value.assists,
          aimAssistConeDegrees: v ? 15 : 0,
        },
      });
    });
    toggle.setScale(0.9);

    const reduceMotion = this.createToggle(x, y + 110, 'Reduce Motion', this.settings.value.reduceMotion, (v) => {
      this.settings.update({ reduceMotion: v });
    });
    reduceMotion.setScale(0.9);

    const palette = this.add.text(x, y + 170, `Palette: ${this.settings.value.colorPalette}`, this.valueStyle()).setOrigin(0.5);
    palette.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      const next = this.cyclePalette(this.settings.value.colorPalette);
      this.settings.update({ colorPalette: next });
      palette.setText(`Palette: ${next}`);
    });
  }

  private createSlider(x: number, y: number, label: string, value: number, onChange: (value: number) => void): void {
    this.add.text(x, y - 18, label, this.labelStyle()).setOrigin(0.5, 1);
    const track = this.add.rectangle(x, y, 160, 8, 0x1b2240, 1).setOrigin(0.5);
    const handle = this.add.rectangle(x - 80 + value * 160, y, 12, 20, 0xfff07a, 1).setOrigin(0.5);
    handle.setInteractive({ useHandCursor: true, draggable: true });
    handle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      const clamped = Phaser.Math.Clamp(dragX, track.x - 80, track.x + 80);
      handle.x = clamped;
      onChange((clamped - (track.x - 80)) / 160);
    });
  }

  private createToggle(
    x: number,
    y: number,
    label: string,
    value: boolean,
    onChange: (value: boolean) => void,
  ) {
    this.add.text(x, y - 20, label, this.labelStyle()).setOrigin(0.5, 1);
    const box = this.add.rectangle(x, y, 32, 32, value ? 0x61ff89 : 0x1b2240, 1).setOrigin(0.5);
    box.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      const newValue = !value;
      onChange(newValue);
      box.setFillStyle(newValue ? 0x61ff89 : 0x1b2240, 1);
    });
    return box;
  }

  private updateAudio(key: 'master' | 'music' | 'sfx', value: number): void {
    this.settings.update({
      audio: {
        ...this.settings.value.audio,
        [key]: Phaser.Math.Clamp(value, 0, 1),
      },
    });
  }

  private cyclePalette(current: string): string {
    const palettes = ['Default Dusk', 'High Contrast', 'Protanopia', 'Deuteranopia'];
    const index = palettes.indexOf(current);
    return palettes[(index + 1) % palettes.length];
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

  private sectionStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'PressStart2P, monospace',
      fontSize: '16px',
      color: '#b9c1ff',
      stroke: '#12131e',
      strokeThickness: 4,
    };
  }

  private labelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'PressStart2P, monospace',
      fontSize: '12px',
      color: '#8f97bd',
    };
  }

  private valueStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'PressStart2P, monospace',
      fontSize: '12px',
      color: '#f8f9ff',
      stroke: '#12131e',
      strokeThickness: 3,
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
