import { defaultAssistSettings, AssistSettings } from '../config/assists';

interface AudioSettings {
  master: number;
  music: number;
  sfx: number;
}

interface ControlBinding {
  action: string;
  primaryKey: string;
  secondaryKey?: string;
}

export interface SettingsState {
  assists: AssistSettings;
  audio: AudioSettings;
  controls: ControlBinding[];
  colorPalette: string;
  reduceMotion: boolean;
  tipSeen: boolean;
}

const STORAGE_KEY = 'skyline-swing:settings';

const defaultSettings: SettingsState = {
  assists: defaultAssistSettings,
  audio: {
    master: 1,
    music: 0.75,
    sfx: 0.85,
  },
  controls: [
    { action: 'moveLeft', primaryKey: 'A', secondaryKey: 'ArrowLeft' },
    { action: 'moveRight', primaryKey: 'D', secondaryKey: 'ArrowRight' },
    { action: 'jump', primaryKey: 'Space' },
    { action: 'shootWeb', primaryKey: 'MouseLeft' },
    { action: 'reelIn', primaryKey: 'Q', secondaryKey: 'WheelUp' },
    { action: 'reelOut', primaryKey: 'E', secondaryKey: 'WheelDown' },
    { action: 'cancelWeb', primaryKey: 'S' },
  ],
  colorPalette: 'Default Dusk',
  reduceMotion: false,
  tipSeen: false,
};

export class SettingsStore {
  private state: SettingsState = structuredClone(defaultSettings);

  constructor() {
    this.load();
  }

  get value(): SettingsState {
    return this.state;
  }

  update(partial: Partial<SettingsState>): void {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.save();
  }

  markTipSeen(): void {
    if (!this.state.tipSeen) {
      this.state.tipSeen = true;
      this.save();
    }
  }

  reset(): void {
    this.state = structuredClone(defaultSettings);
    this.save();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SettingsState;
      this.state = {
        ...defaultSettings,
        ...parsed,
        assists: {
          ...defaultSettings.assists,
          ...parsed.assists,
        },
        audio: {
          ...defaultSettings.audio,
          ...parsed.audio,
        },
        controls: parsed.controls ?? defaultSettings.controls,
      };
    } catch (error) {
      console.warn('Failed to load settings. Using defaults.', error);
      this.state = structuredClone(defaultSettings);
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save settings.', error);
    }
  }
}
