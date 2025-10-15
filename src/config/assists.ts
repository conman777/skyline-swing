export interface AssistSettings {
  aimAssistConeDegrees: number;
  aimAssistBeaconBonus: number;
  coyoteTimeMs: number;
  jumpBufferMs: number;
  reduceMotion: boolean;
}

export const defaultAssistSettings: AssistSettings = {
  aimAssistConeDegrees: 15,
  aimAssistBeaconBonus: 8,
  coyoteTimeMs: 120,
  jumpBufferMs: 100,
  reduceMotion: false,
};
